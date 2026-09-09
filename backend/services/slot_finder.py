from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID
from ..models.schemas import RecommendedSlot

def time_to_minutes(t_str: Optional[str]) -> Optional[int]:
    if not t_str or ":" not in t_str:
        return None
    try:
        parts = t_str.strip().split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return None

def minutes_to_time(m: int) -> str:
    h = m // 60
    mins = m % 60
    return f"{h:02d}:{mins:02d}"

def format_day_name(date_str: str) -> str:
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%A, %b %d")
    except Exception:
        return date_str

def format_human_time(t_str: str) -> str:
    try:
        dt = datetime.strptime(t_str, "%H:%M")
        return dt.strftime("%I:%M %p").lstrip("0")
    except Exception:
        return t_str

async def find_optimal_slots(
    user_id: str = DEMO_USER_ID,
    estimated_hours: float = 1.5,
    deadline_date: Optional[str] = None,
    category: str = "errand",
    preferred_date: Optional[str] = None
) -> List[RecommendedSlot]:
    """
    Scans the student's existing scheduled tasks and finds candidate free time windows
    between today and the deadline date with zero conflicts and optimal capacity distribution.
    """
    db = await get_db()
    try:
        cur = await db.execute(
            """SELECT id, title, scheduled_date, scheduled_start, scheduled_end, estimated_hours, category, status
               FROM tasks WHERE user_id = ? AND status != 'completed'""",
            (user_id,)
        )
        task_rows = await cur.fetchall()
        tasks = [dict(r) for r in task_rows]
    finally:
        await db.close()

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")

    # If no deadline passed, default to Sunday of the active week
    if not deadline_date:
        days_to_sunday = (6 - now.weekday()) % 7
        if days_to_sunday == 0:
            days_to_sunday = 7
        deadline_date = (now + timedelta(days=days_to_sunday)).strftime("%Y-%m-%d")

    try:
        dl_dt = datetime.strptime(deadline_date, "%Y-%m-%d")
    except Exception:
        dl_dt = now + timedelta(days=6)
        deadline_date = dl_dt.strftime("%Y-%m-%d")

    req_mins = int(round(max(0.5, min(8.0, estimated_hours)) * 60))

    # Collect candidate dates from today up to deadline
    candidate_dates = []
    curr = now
    while curr.date() <= dl_dt.date():
        candidate_dates.append(curr.strftime("%Y-%m-%d"))
        curr += timedelta(days=1)

    if not candidate_dates:
        candidate_dates = [today_str]

    # Preferred start hours depending on category
    # Errands/Social/Creative: afternoons and mid-mornings
    preferred_check_minutes = [
        15 * 60,       # 15:00 (3:00 PM)
        15 * 60 + 30,  # 15:30 (3:30 PM)
        14 * 60,       # 14:00 (2:00 PM)
        10 * 60 + 30,  # 10:30 AM
        11 * 60,       # 11:00 AM
        16 * 60 + 30,  # 16:30 (4:30 PM)
        19 * 60,       # 19:00 (7:00 PM)
    ]

    scored_slots = []

    for d_str in candidate_dates:
        day_tasks = [t for t in tasks if t.get("scheduled_date") == d_str]
        day_hours = sum(float(t.get("estimated_hours", 1.0)) for t in day_tasks)

        # Collect busy intervals on this day in minutes
        busy_intervals = []
        for t in day_tasks:
            s_m = time_to_minutes(t.get("scheduled_start"))
            e_m = time_to_minutes(t.get("scheduled_end"))
            if s_m is not None and e_m is not None:
                busy_intervals.append((s_m, e_m))

        # Check candidate start times
        for start_m in preferred_check_minutes:
            end_m = start_m + req_mins

            # Must finish before 21:30
            if end_m > 21 * 60 + 30:
                continue

            # Check overlap with any busy interval
            overlap = False
            for (b_s, b_e) in busy_intervals:
                # If slot overlaps with busy interval
                if not (end_m <= b_s or start_m >= b_e):
                    overlap = True
                    break

            if not overlap:
                # Score this slot
                score = 100.0

                # Priority bonus if student specified preferred date
                if preferred_date and d_str == preferred_date:
                    score += 150.0

                # Buffer before deadline: 1-2 days before is ideal
                dt_obj = datetime.strptime(d_str, "%Y-%m-%d")
                days_before_dl = (dl_dt.date() - dt_obj.date()).days
                if days_before_dl == 2:
                    score += 30.0  # 48h buffer
                elif days_before_dl == 1:
                    score += 25.0  # 24h buffer
                elif days_before_dl > 2:
                    score += 15.0
                elif days_before_dl == 0:
                    score -= 10.0  # Deadline day itself: avoid cramming

                # Low load bonus: lighter day = more energy
                score += max(0.0, (7.0 - day_hours) * 8.0)

                # Afternoon slot bonus for errands / poster making
                if 14 * 60 <= start_m <= 17 * 60:
                    score += 15.0

                st_str = minutes_to_time(start_m)
                et_str = minutes_to_time(end_m)

                day_label = format_day_name(d_str)

                # Build explainable reasoning
                if days_before_dl >= 2:
                    buffer_txt = f"{days_before_dl * 24}h buffer before deadline"
                elif days_before_dl == 1:
                    buffer_txt = "24h safe buffer before Sunday"
                else:
                    buffer_txt = "Ahead of deadline"

                load_txt = "Light load day" if day_hours < 3.5 else "Clear open window"
                reason = f"0 schedule clashes • {load_txt} • {buffer_txt}"

                scored_slots.append({
                    "score": score,
                    "date": d_str,
                    "day_name": day_label,
                    "start_time": st_str,
                    "end_time": et_str,
                    "reason": reason,
                    "days_before": days_before_dl
                })

    # Sort descending by score
    scored_slots.sort(key=lambda x: x["score"], reverse=True)

    # Pick top distinct days so user has distinct alternatives
    chosen = []
    seen_dates = set()
    for s in scored_slots:
        if s["date"] not in seen_dates:
            seen_dates.add(s["date"])
            chosen.append(s)
        if len(chosen) >= 3:
            break

    # If only 1 day found, pick top slots on that day
    if len(chosen) < 2 and scored_slots:
        for s in scored_slots:
            if s not in chosen:
                chosen.append(s)
            if len(chosen) >= 2:
                break

    # Format into RecommendedSlot models
    res: List[RecommendedSlot] = []
    for idx, c in enumerate(chosen):
        res.append(RecommendedSlot(
            date=c["date"],
            day_name=c["day_name"],
            start_time=c["start_time"],
            end_time=c["end_time"],
            label=f"{c['day_name'].split(',')[0]} ({format_human_time(c['start_time'])} – {format_human_time(c['end_time'])})",
            reason=c["reason"],
            is_primary=(idx == 0)
        ))

    return res
