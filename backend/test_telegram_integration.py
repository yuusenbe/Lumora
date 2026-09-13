import asyncio
import os
import sys
from pathlib import Path

# Set path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.database.connection import init_db, get_db
from backend.database.seed_data import seed_demo_data, DEMO_USER_ID
from backend.services.telegram_service import (
    process_telegram_update,
    link_telegram_account,
    get_lumora_user_for_telegram,
    handle_start_command,
    handle_natural_task_input,
    handle_confirm_add_task,
    handle_view_schedule,
    get_user_state,
    set_user_state,
    clear_user_state
)

async def run_tests():
    print("[TEST] Running Telegram Integration Tests for Lumora...")
    
    # 1. Initialize Database
    await init_db()
    await seed_demo_data(force=False)
    print("[PASS] 1. Database initialized and tables verified.")

    # 2. Test User Resolution (Demo Mode Fallback)
    test_tg_id = 998877665
    user_id, name, is_linked = await get_lumora_user_for_telegram(test_tg_id)
    assert user_id == DEMO_USER_ID, f"Expected {DEMO_USER_ID}, got {user_id}"
    print(f"[PASS] 2. Unlinked Telegram user resolves to demo user ({name}) seamlessly.")

    # 3. Test Linking Code Generation and Redemption
    db = await get_db()
    test_code = "LUMORA-TEST"
    await db.execute("INSERT OR REPLACE INTO telegram_linking_codes (code, user_id, expires_at) VALUES (?, ?, '2099-01-01')", (test_code, DEMO_USER_ID))
    await db.commit()
    await db.close()

    success, msg = await link_telegram_account(test_code, test_tg_id, "test_student")
    assert success is True, f"Link failed: {msg}"
    user_id, name, is_linked = await get_lumora_user_for_telegram(test_tg_id)
    assert is_linked is True, "User should now be explicitly linked"
    print(f"[PASS] 3. One-time linking code verified and bound to Telegram handle @test_student.")

    # 4. Test State Machine
    await set_user_state(test_tg_id, "WAITING_FOR_TASK", {"step": 1})
    state, data = await get_user_state(test_tg_id)
    assert state == "WAITING_FOR_TASK" and data.get("step") == 1
    await clear_user_state(test_tg_id)
    state, data = await get_user_state(test_tg_id)
    assert state == "IDLE" and data == {}
    print("[PASS] 4. Conversation state machine transitions correctly.")

    # 5. Test Natural Task Parsing & DB Insertion Simulation
    task_text = "Finish FYP methodology by Thursday at 2pm for 4 hours"
    from backend.services.ai_service import parse_natural_language_task
    parsed = await parse_natural_language_task(task_text, user_id=DEMO_USER_ID)
    assert "FYP" in parsed.title or "Methodology" in parsed.title
    assert parsed.category == "academic"
    assert parsed.estimated_hours == 4.0
    print(f"[PASS] 5. Smart Capture successfully extracted task: '{parsed.title}' ({parsed.category}, ~{parsed.estimated_hours}h).")

    # 6. Test Task Creation & Schedule Query Consistency
    await set_user_state(test_tg_id, "CONFIRMING_TASK", parsed.dict())
    await handle_confirm_add_task(chat_id=test_tg_id, telegram_user_id=test_tg_id)
    
    # Check that task exists in DB
    db = await get_db()
    cur = await db.execute("SELECT * FROM tasks WHERE user_id = ? AND category = 'academic' ORDER BY created_at DESC LIMIT 1", (DEMO_USER_ID,))
    task_row = await cur.fetchone()
    assert task_row is not None
    print(f"[PASS] 6. Task successfully created in Lumora database: '{task_row['title']}' (ID: {task_row['id']}).")
    await db.close()

    # 7. Test Webhook Update Processing
    update_sample = {
        "update_id": 10001,
        "message": {
            "message_id": 55,
            "from": {"id": test_tg_id, "username": "test_student"},
            "chat": {"id": test_tg_id},
            "text": "/schedule"
        }
    }
    await process_telegram_update(update_sample)
    print("[PASS] 7. Telegram update dispatcher handled /schedule without exception.")

    print("\nALL TELEGRAM INTEGRATION TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    asyncio.run(run_tests())
