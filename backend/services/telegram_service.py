import os
import json
import uuid
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple, List
from dotenv import load_dotenv

load_dotenv()

from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID
from ..services.ai_service import parse_natural_language_task
from ..services.load_engine import calculate_workload

def get_bot_token() -> str:
    return os.getenv("TELEGRAM_BOT_TOKEN", "").strip()

def get_bot_username() -> str:
    return os.getenv("TELEGRAM_BOT_USERNAME", "Lumora_App_Bot").strip().lstrip("@")

def get_webhook_secret() -> str:
    return os.getenv("TELEGRAM_WEBHOOK_SECRET", "").strip()

def get_web_url() -> str:
    return os.getenv("LUMORA_WEB_URL", "https://lumora-autopilot.vercel.app").rstrip("/")

TELEGRAM_BOT_TOKEN = get_bot_token()
TELEGRAM_BOT_USERNAME = get_bot_username()
TELEGRAM_WEBHOOK_SECRET = get_webhook_secret()
LUMORA_WEB_URL = get_web_url()

TELEGRAM_API_BASE = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

# Helper to send Telegram API requests
async def call_telegram_api(method: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    token = get_bot_token()
    if not token:
        print("[Telegram Service] TELEGRAM_BOT_TOKEN is not configured.")
        return {"ok": False, "description": "TELEGRAM_BOT_TOKEN not configured"}

    url = f"https://api.telegram.org/bot{token}/{method}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            return resp.json()
    except Exception as e:
        print(f"[Telegram Service] API request error ({method}): {e}")
        return {"ok": False, "error": str(e)}

async def send_message(
    chat_id: int,
    text: str,
    reply_markup: Optional[Dict[str, Any]] = None,
    parse_mode: str = "HTML"
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return await call_telegram_api("sendMessage", payload)

async def answer_callback_query(callback_query_id: str, text: Optional[str] = None) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"callback_query_id": callback_query_id}
    if text:
        payload["text"] = text
    return await call_telegram_api("answerCallbackQuery", payload)

async def edit_message_text(
    chat_id: int,
    message_id: int,
    text: str,
    reply_markup: Optional[Dict[str, Any]] = None,
    parse_mode: str = "HTML"
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return await call_telegram_api("editMessageText", payload)

# ----------------- User Linking & State -----------------

async def get_lumora_user_for_telegram(telegram_user_id: int) -> Tuple[str, str, bool]:
    """
    Finds the Lumora user associated with a Telegram ID.
    Returns: (user_id, user_name, is_explicitly_linked)
    """
    db = await get_db()
    try:
        cur = await db.execute(
            """SELECT u.id, u.name 
               FROM telegram_accounts ta 
               JOIN users u ON ta.user_id = u.id 
               WHERE ta.telegram_user_id = ?""",
            (telegram_user_id,)
        )
        row = await cur.fetchone()
        if row:
            return row["id"], row["name"], True

        # Demo fallback: Default to Alex Chen for frictionless testing
        user_cur = await db.execute("SELECT name FROM users WHERE id = ?", (DEMO_USER_ID,))
        user_row = await user_cur.fetchone()
        demo_name = user_row["name"] if user_row else "Alex Chen"
        return DEMO_USER_ID, demo_name, False
    finally:
        await db.close()

async def link_telegram_account(code: str, telegram_user_id: int, telegram_username: Optional[str]) -> Tuple[bool, str]:
    clean_code = code.strip().upper()
    db = await get_db()
    try:
        cur = await db.execute(
            "SELECT user_id, expires_at FROM telegram_linking_codes WHERE code = ?",
            (clean_code,)
        )
        row = await cur.fetchone()
        if not row:
            return False, "Invalid or expired linking code. Please generate a new code from the Lumora web app."

        user_id = row["user_id"]
        # Check if expired
        try:
            expires_at = datetime.fromisoformat(row["expires_at"])
            if datetime.now() > expires_at:
                return False, "This linking code has expired. Please generate a fresh code from Lumora."
        except Exception:
            pass

        account_id = f"tg-acc-{uuid.uuid4().hex[:10]}"
        await db.execute(
            """INSERT OR REPLACE INTO telegram_accounts (id, user_id, telegram_user_id, telegram_username)
               VALUES (?, ?, ?, ?)""",
            (account_id, user_id, telegram_user_id, telegram_username)
        )
        # Delete used code
        await db.execute("DELETE FROM telegram_linking_codes WHERE code = ?", (clean_code,))
        await db.commit()

        # Fetch user name
        u_cur = await db.execute("SELECT name FROM users WHERE id = ?", (user_id,))
        u_row = await u_cur.fetchone()
        name = u_row["name"] if u_row else "User"
        return True, f"Successfully linked to Lumora account for <b>{name}</b>! 🎉"
    finally:
        await db.close()

async def get_user_state(telegram_user_id: int) -> Tuple[str, Dict[str, Any]]:
    db = await get_db()
    try:
        cur = await db.execute(
            "SELECT state, data FROM telegram_conversation_states WHERE telegram_user_id = ?",
            (telegram_user_id,)
        )
        row = await cur.fetchone()
        if not row:
            return "IDLE", {}
        data = json.loads(row["data"]) if row["data"] else {}
        return row["state"], data
    finally:
        await db.close()

async def set_user_state(telegram_user_id: int, state: str, data: Optional[Dict[str, Any]] = None):
    db = await get_db()
    try:
        data_str = json.dumps(data) if data else "{}"
        await db.execute(
            """INSERT OR REPLACE INTO telegram_conversation_states (telegram_user_id, state, data, updated_at)
               VALUES (?, ?, ?, CURRENT_TIMESTAMP)""",
            (telegram_user_id, state, data_str)
        )
        await db.commit()
    finally:
        await db.close()

async def clear_user_state(telegram_user_id: int):
    await set_user_state(telegram_user_id, "IDLE", {})

# ----------------- UI Builders & Handlers -----------------

def get_capacity_badge(score: int) -> str:
    if score < 40:
        return f"🟢 <b>{score}%</b> (Low load — Great space)"
    elif score < 70:
        return f"🟢 <b>{score}%</b> (Moderate load — Balanced equilibrium)"
    elif score < 85:
        return f"🟡 <b>{score}%</b> (High load — Review recommended)"
    else:
        return f"🔴 <b>{score}%</b> (Very high load — Overload risk)"

def build_progress_bar(progress: int) -> str:
    total_blocks = 8
    filled = int(round((progress / 100) * total_blocks))
    filled = max(0, min(total_blocks, filled))
    return "█" * filled + "░" * (total_blocks - filled)

async def handle_start_command(chat_id: int, telegram_user_id: int, arg: Optional[str] = None):
    # If user provided a linking code via deep link: /start LUMORA-XXXX
    if arg and arg.strip().upper().startswith("LUMORA-"):
        success, msg = await link_telegram_account(arg.strip().upper(), telegram_user_id, None)
        await send_message(chat_id, msg)
        if not success:
            return

    user_id, name, is_linked = await get_lumora_user_for_telegram(telegram_user_id)
    await clear_user_state(telegram_user_id)

    # Fetch capacity
    db = await get_db()
    try:
        task_cur = await db.execute("SELECT * FROM tasks WHERE user_id = ? AND status != 'completed'", (user_id,))
        task_rows = await task_cur.fetchall()
        tasks = [dict(r) for r in task_rows]

        checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1", (user_id,))
        checkin_row = await checkin_cur.fetchone()
        checkin = dict(checkin_row) if checkin_row else None

        workload = calculate_workload(tasks, checkin)
    finally:
        await db.close()

    time_greeting = "Good day"
    hr = datetime.now().hour
    if 5 <= hr < 12:
        time_greeting = "Good morning"
    elif 12 <= hr < 18:
        time_greeting = "Good afternoon"
    elif 18 <= hr <= 23:
        time_greeting = "Good evening"

    badge = get_capacity_badge(workload.capacity_score)
    link_notice = "" if is_linked else "<i>(Operating in Demo Mode as Alex Chen)</i>\n"

    text = (
        f"🌙 <b>LUMORA — Workload Autopilot</b>\n\n"
        f"{time_greeting}, <b>{name}</b>! 👋\n"
        f"{link_notice}\n"
        f"<b>Current Capacity:</b>\n"
        f"{badge}\n\n"
        f"💡 <i>{workload.explanation}</i>\n\n"
        f"What would you like to do?"
    )

    keyboard = {
        "inline_keyboard": [
            [
                {"text": "➕ Capture Task", "callback_data": "action_capture_task"},
                {"text": "📅 View Schedule", "callback_data": "action_view_schedule"}
            ],
            [
                {"text": "🌐 Open Lumora Web", "url": LUMORA_WEB_URL}
            ]
        ]
    }

    await send_message(chat_id, text, reply_markup=keyboard)

async def handle_capture_task_prompt(chat_id: int, telegram_user_id: int, is_edit: bool = False, message_id: Optional[int] = None):
    await set_user_state(telegram_user_id, "WAITING_FOR_TASK")
    
    text = (
        "✍️ <b>What's on your mind?</b>\n\n"
        "Just describe the commitment naturally. For example:\n"
        "• <i>\"Finish my FYP methodology by Thursday at 2pm, takes about 4 hours\"</i>\n"
        "• <i>\"Grocery shopping on Saturday morning ~1.5h\"</i>\n"
        "• <i>\"Gym workout tomorrow at 5pm for 1 hour\"</i>\n\n"
        "Type your task below, or send /cancel to return."
    )

    keyboard = {
        "inline_keyboard": [
            [{"text": "❌ Cancel", "callback_data": "action_cancel"}]
        ]
    }

    if is_edit and message_id:
        await edit_message_text(chat_id, message_id, text, reply_markup=keyboard)
    else:
        await send_message(chat_id, text, reply_markup=keyboard)

async def handle_natural_task_input(chat_id: int, telegram_user_id: int, text: str):
    user_id, name, _ = await get_lumora_user_for_telegram(telegram_user_id)
    
    # Send thinking indicator
    await send_message(chat_id, "🧠 <i>Understanding task & finding optimal clash-free slot...</i>")

    try:
        parsed = await parse_natural_language_task(text, user_id=user_id)
    except Exception as e:
        print(f"[Telegram Service] AI parsing error: {e}")
        await send_message(
            chat_id,
            "I couldn't quite understand that. Please try phrasing it with a title, day/time, or duration.\n\nExample: <i>'Study for math quiz tomorrow at 3pm for 2 hours'</i>"
        )
        return

    # Store parsed data in state for confirmation
    parsed_dict = parsed.dict()
    await set_user_state(telegram_user_id, "CONFIRMING_TASK", parsed_dict)

    cat_emojis = {
        "academic": "📚",
        "work": "💼",
        "physical": "🏋️",
        "social": "👥",
        "errand": "🛒"
    }
    emoji = cat_emojis.get(parsed.category.lower(), "📝")

    time_str = ""
    if parsed.start_time and parsed.end_time:
        time_str = f"\n🕒 <b>Time:</b> {parsed.start_time} – {parsed.end_time}"
    elif parsed.start_time:
        time_str = f"\n🕒 <b>Time:</b> {parsed.start_time}"

    date_str = parsed.scheduled_date or parsed.deadline or "Today"

    preview_text = (
        f"<b>I understood this as:</b>\n\n"
        f"{emoji} <b>Title:</b> {parsed.title}\n"
        f"📂 <b>Category:</b> {parsed.category.capitalize()}\n"
        f"📅 <b>Date:</b> {date_str}"
        f"{time_str}\n"
        f"⏱ <b>Duration:</b> ~{parsed.estimated_hours}h\n"
        f"🎯 <b>Priority:</b> {parsed.priority.capitalize()} priority\n\n"
        f"💡 <i>{parsed.raw_understanding}</i>\n\n"
        f"<b>Add this to your Lumora schedule?</b>"
    )

    keyboard = {
        "inline_keyboard": [
            [
                {"text": "✅ Add Task", "callback_data": "action_confirm_add"},
                {"text": "❌ Cancel", "callback_data": "action_cancel"}
            ]
        ]
    }

    await send_message(chat_id, preview_text, reply_markup=keyboard)

async def handle_confirm_add_task(chat_id: int, telegram_user_id: int, message_id: Optional[int] = None):
    state, task_data = await get_user_state(telegram_user_id)
    if not task_data or not task_data.get("title"):
        await send_message(chat_id, "No active task to add. Tap ➕ Capture Task to begin.")
        await clear_user_state(telegram_user_id)
        return

    user_id, name, _ = await get_lumora_user_for_telegram(telegram_user_id)
    db = await get_db()
    try:
        task_id = f"task-{uuid.uuid4().hex[:10]}"
        sched_date = task_data.get("scheduled_date") or datetime.now().strftime("%Y-%m-%d")
        start_time = task_data.get("start_time")
        end_time = task_data.get("end_time")

        await db.execute(
            """INSERT INTO tasks (
                id, user_id, title, category, priority, estimated_hours,
                deadline, status, energy_required, flexibility,
                scheduled_date, scheduled_start, scheduled_end, progress, is_protected
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, 0, 0)""",
            (
                task_id,
                user_id,
                task_data.get("title"),
                task_data.get("category", "academic"),
                task_data.get("priority", "medium"),
                float(task_data.get("estimated_hours", 2.0)),
                task_data.get("deadline"),
                task_data.get("energy_required", "medium"),
                task_data.get("flexibility", "medium"),
                sched_date,
                start_time,
                end_time
            )
        )
        await db.commit()

        # Recalculate capacity to check load impact
        task_cur = await db.execute("SELECT * FROM tasks WHERE user_id = ? AND status != 'completed'", (user_id,))
        task_rows = await task_cur.fetchall()
        tasks = [dict(r) for r in task_rows]

        checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1", (user_id,))
        checkin_row = await checkin_cur.fetchone()
        checkin = dict(checkin_row) if checkin_row else None

        workload = calculate_workload(tasks, checkin)
    finally:
        await db.close()

    await clear_user_state(telegram_user_id)

    title = task_data.get("title")
    hours = task_data.get("estimated_hours", 2.0)
    score = workload.capacity_score

    if score >= 70:
        # High or very high load warning
        warning_header = "🔴 <b>High Overload Alert</b>" if score >= 85 else "🟠 <b>Schedule Getting Heavy</b>"
        text = (
            f"✅ <b>Added to Lumora schedule!</b>\n\n"
            f"📝 <b>{title}</b> (~{hours}h)\n\n"
            f"{warning_header}\n"
            f"Current capacity is now {get_capacity_badge(score)}.\n\n"
            f"⚠️ <i>{workload.explanation}</i>\n\n"
            f"Lumora recommends reviewing your week to restore breathing room."
        )
        keyboard = {
            "inline_keyboard": [
                [{"text": "🌿 Review Rebalance Plan", "url": f"{LUMORA_WEB_URL}"}],
                [{"text": "📅 View Schedule", "callback_data": "action_view_schedule"}, {"text": "➕ Add Another", "callback_data": "action_capture_task"}]
            ]
        }
    else:
        text = (
            f"✅ <b>Added to your schedule!</b>\n\n"
            f"📝 <b>{title}</b> (~{hours}h)\n\n"
            f"<b>Current Capacity:</b>\n"
            f"{get_capacity_badge(score)}\n\n"
            f"🌿 <i>You're still in a healthy, sustainable equilibrium zone.</i>"
        )
        keyboard = {
            "inline_keyboard": [
                [{"text": "📅 View Schedule", "callback_data": "action_view_schedule"}, {"text": "➕ Add Another", "callback_data": "action_capture_task"}],
                [{"text": "🌐 Open Lumora Web", "url": LUMORA_WEB_URL}]
            ]
        }

    if message_id:
        await edit_message_text(chat_id, message_id, text, reply_markup=keyboard)
    else:
        await send_message(chat_id, text, reply_markup=keyboard)

async def handle_view_schedule(chat_id: int, telegram_user_id: int, message_id: Optional[int] = None):
    user_id, name, _ = await get_lumora_user_for_telegram(telegram_user_id)
    await clear_user_state(telegram_user_id)

    db = await get_db()
    try:
        # Fetch today's tasks
        today_str = datetime.now().strftime("%Y-%m-%d")
        cur = await db.execute(
            """SELECT * FROM tasks WHERE user_id = ? ORDER BY
               CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
               scheduled_date ASC""",
            (user_id,)
        )
        rows = await cur.fetchall()
        all_tasks = [dict(r) for r in rows]

        today_tasks = [t for t in all_tasks if t.get("scheduled_date") == today_str or t.get("deadline") in ["Today", today_str]]
        if len(today_tasks) < 3:
            pending_other = [t for t in all_tasks if t not in today_tasks and t.get("status") != "completed"]
            today_tasks.extend(pending_other[:(3 - len(today_tasks))])

        active_tasks = [t for t in all_tasks if t.get("status") != "completed"]

        checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1", (user_id,))
        checkin_row = await checkin_cur.fetchone()
        checkin = dict(checkin_row) if checkin_row else None

        workload = calculate_workload(active_tasks, checkin)
    finally:
        await db.close()

    today_formatted = datetime.now().strftime("%A, %d %B")

    cat_emojis = {
        "academic": "📚",
        "work": "💼",
        "physical": "🏋️",
        "social": "👥",
        "errand": "🛒"
    }

    schedule_lines = []
    rule_of_3 = today_tasks[:3]

    if not rule_of_3:
        schedule_lines.append("<i>Your schedule is clear today! Great window for restful recovery. 🌿</i>")
    else:
        for idx, t in enumerate(rule_of_3, 1):
            cat = t.get("category", "academic").lower()
            emoji = cat_emojis.get(cat, "📝")
            title = t.get("title")
            start = t.get("scheduled_start") or "Flexible"
            end = t.get("scheduled_end")
            time_display = f"{start} – {end}" if end else start
            progress = t.get("progress", 0)
            status = t.get("status")

            if status == "completed":
                status_str = "✅ Completed"
                bar = "[████████] 100%"
            else:
                bar = f"[{build_progress_bar(progress)}] {progress}%"
                status_str = f"⏱ ~{t.get('estimated_hours')}h"

            schedule_lines.append(
                f"<b>{idx}. {emoji} {title}</b>\n"
                f"   🕒 {time_display} • {status_str}\n"
                f"   <code>{bar}</code>"
            )

    # Calculate "Next Up" task
    next_up_text = ""
    pending_today = [t for t in rule_of_3 if t.get("status") != "completed"]
    if pending_today:
        next_task = pending_today[0]
        cat = next_task.get("category", "academic").lower()
        emoji = cat_emojis.get(cat, "📝")
        st = next_task.get("scheduled_start", "Soon")
        next_up_text = f"\n\n⏳ <b>Next Focus:</b> {emoji} <b>{next_task.get('title')}</b> ({st})"

    text = (
        f"🌙 <b>LUMORA — TODAY'S SCHEDULE</b>\n"
        f"📅 <i>{today_formatted}</i>\n\n"
        + "\n\n".join(schedule_lines) +
        f"{next_up_text}\n\n"
        f"────────────────────\n"
        f"<b>Capacity:</b> {get_capacity_badge(workload.capacity_score)}"
    )

    keyboard = {
        "inline_keyboard": [
            [
                {"text": "➕ Capture Task", "callback_data": "action_capture_task"},
                {"text": "🔄 Refresh", "callback_data": "action_view_schedule"}
            ],
            [
                {"text": "🌐 Open Full Schedule", "url": f"{LUMORA_WEB_URL}?view=tasks"}
            ]
        ]
    }

    if message_id:
        await edit_message_text(chat_id, message_id, text, reply_markup=keyboard)
    else:
        await send_message(chat_id, text, reply_markup=keyboard)

async def handle_cancel_command(chat_id: int, telegram_user_id: int, message_id: Optional[int] = None):
    await clear_user_state(telegram_user_id)
    text = "👌 <i>Operation cancelled. What would you like to do?</i>"
    keyboard = {
        "inline_keyboard": [
            [
                {"text": "➕ Capture Task", "callback_data": "action_capture_task"},
                {"text": "📅 View Schedule", "callback_data": "action_view_schedule"}
            ],
            [
                {"text": "🌐 Open Lumora Web", "url": LUMORA_WEB_URL}
            ]
        ]
    }
    if message_id:
        await edit_message_text(chat_id, message_id, text, reply_markup=keyboard)
    else:
        await send_message(chat_id, text, reply_markup=keyboard)

async def handle_help_command(chat_id: int):
    text = (
        "🌙 <b>LUMORA BOT HELP & COMMANDS</b>\n\n"
        "Lumora on Telegram is your lightweight pocket assistant:\n\n"
        "• /start — Open the Lumora main menu & capacity gauge\n"
        "• /add — Capture an unexpected task naturally\n"
        "• /schedule — View today's Rule of 3 schedule & next focus\n"
        "• /link <code>&lt;CODE&gt;</code> — Link your Lumora web account\n"
        "• /cancel — Cancel the active task capture\n"
        "• /help — Show this help message\n\n"
        "💡 <i>Tip: You can type natural phrases like \"FYP meeting tomorrow at 2pm for 1h\" anytime after tapping Capture Task!</i>"
    )
    keyboard = {
        "inline_keyboard": [
            [
                {"text": "➕ Capture Task", "callback_data": "action_capture_task"},
                {"text": "📅 View Schedule", "callback_data": "action_view_schedule"}
            ]
        ]
    }
    await send_message(chat_id, text, reply_markup=keyboard)

# ----------------- Main Dispatcher -----------------

async def process_telegram_update(update: Dict[str, Any]):
    # Handle callback queries (button clicks)
    if "callback_query" in update:
        cq = update["callback_query"]
        cq_id = cq["id"]
        from_user = cq["from"]
        telegram_user_id = from_user["id"]
        chat_id = cq["message"]["chat"]["id"]
        message_id = cq["message"]["message_id"]
        data = cq.get("data", "")

        await answer_callback_query(cq_id)

        if data == "action_capture_task":
            await handle_capture_task_prompt(chat_id, telegram_user_id, is_edit=True, message_id=message_id)
        elif data == "action_view_schedule":
            await handle_view_schedule(chat_id, telegram_user_id, message_id=message_id)
        elif data == "action_confirm_add":
            await handle_confirm_add_task(chat_id, telegram_user_id, message_id=message_id)
        elif data == "action_cancel":
            await handle_cancel_command(chat_id, telegram_user_id, message_id=message_id)
        return

    # Handle incoming messages
    if "message" in update:
        msg = update["message"]
        chat_id = msg["chat"]["id"]
        from_user = msg.get("from", {})
        telegram_user_id = from_user.get("id")
        text = msg.get("text", "").strip()

        if not text:
            return

        # Check commands
        if text.startswith("/start"):
            parts = text.split(maxsplit=1)
            arg = parts[1] if len(parts) > 1 else None
            await handle_start_command(chat_id, telegram_user_id, arg=arg)
            return

        if text.startswith("/link"):
            parts = text.split(maxsplit=1)
            if len(parts) > 1:
                success, response_msg = await link_telegram_account(parts[1], telegram_user_id, from_user.get("username"))
                await send_message(chat_id, response_msg)
            else:
                await send_message(
                    chat_id,
                    "Please provide your 6-character linking code.\nExample: <code>/link LUMORA-7X9K</code>\n\nGenerate your code from the Lumora Web App navbar!"
                )
            return

        if text == "/add" or text == "/capture":
            await handle_capture_task_prompt(chat_id, telegram_user_id)
            return

        if text == "/schedule" or text == "/today":
            await handle_view_schedule(chat_id, telegram_user_id)
            return

        if text == "/cancel":
            await handle_cancel_command(chat_id, telegram_user_id)
            return

        if text == "/help":
            await handle_help_command(chat_id)
            return

        # Check active state
        state, _ = await get_user_state(telegram_user_id)
        if state == "WAITING_FOR_TASK":
            await handle_natural_task_input(chat_id, telegram_user_id, text)
            return

        # Fallback: Treat as natural task capture directly!
        await handle_natural_task_input(chat_id, telegram_user_id, text)
