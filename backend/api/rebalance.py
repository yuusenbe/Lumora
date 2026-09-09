from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID, seed_demo_data, seed_overload_scenario
from ..services.rebalance_engine import generate_rebalance_plan
from ..services.load_engine import calculate_workload
from ..models.schemas import RebalancePlan

router = APIRouter(prefix="/rebalance", tags=["rebalance"])

def extract_user_id(authorization: Optional[str] = None) -> str:
    if authorization and "lumora-token-" in authorization:
        return authorization.replace("Bearer ", "").replace("lumora-token-", "").strip()
    return DEMO_USER_ID

@router.post("/simulate", response_model=RebalancePlan)
async def simulate_rebalance(authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        cur = await db.execute("SELECT * FROM tasks WHERE user_id = ?", (user_id,))
        task_rows = await cur.fetchall()
        tasks = [dict(r) for r in task_rows]

        checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1", (user_id,))
        checkin_row = await checkin_cur.fetchone()
        checkin = dict(checkin_row) if checkin_row else None

        return generate_rebalance_plan(tasks, checkin)
    finally:
        await db.close()

@router.post("/apply")
async def apply_rebalance(authorization: Optional[str] = Header(None)):
    """
    Applies the rebalancing plan to the student's actual schedule:
    - Moves flexible errands to Sunday
    - Shortens flexible workouts to focused 30m recovery sessions
    - Protects the primary academic task
    - Postpones non-critical social meetups
    """
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        sunday_date = (datetime.now() + timedelta(days=6)).strftime("%Y-%m-%d")

        # 1. Move errands to Sunday
        await db.execute(
            """UPDATE tasks SET scheduled_date = ?, scheduled_start = '10:30', scheduled_end = '12:00'
               WHERE user_id = ? AND category = 'errand' AND flexibility IN ('high', 'medium') AND status != 'completed'""",
            (sunday_date, user_id)
        )

        # 2. Reduce physical workouts
        await db.execute(
            """UPDATE tasks SET estimated_hours = 0.5
               WHERE user_id = ? AND category = 'physical' AND flexibility IN ('high', 'medium') AND status != 'completed'""",
            (user_id,)
        )

        # 3. Protect academic focus
        await db.execute(
            """UPDATE tasks SET is_protected = 1
               WHERE user_id = ? AND category = 'academic' AND priority = 'high' AND status != 'completed'""",
            (user_id,)
        )

        # 4. Postpone optional social meetups
        next_week_date = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")
        await db.execute(
            """UPDATE tasks SET scheduled_date = ?, status = 'postponed'
               WHERE user_id = ? AND category = 'social' AND flexibility IN ('high', 'medium') AND status != 'completed'""",
            (next_week_date, user_id)
        )

        # 5. Record that rebalance plan has been applied for this user
        await db.execute(
            """INSERT OR REPLACE INTO recommendations
               (id, user_id, type, title, message, priority, accepted, proposed_change)
               VALUES (?, ?, 'rebalance', 'AI Rebalance Plan', 'Breathing room restored', 'high', 1, 'applied')""",
            (f"rebalance-active-{user_id}", user_id)
        )

        await db.commit()

        # Recalculate new load with active tasks only
        cur = await db.execute("SELECT * FROM tasks WHERE user_id = ?", (user_id,))
        task_rows = await cur.fetchall()
        tasks = [dict(r) for r in task_rows]
        active_tasks = [t for t in tasks if t.get("status") not in ["completed", "postponed"]]

        checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1", (user_id,))
        checkin_row = await checkin_cur.fetchone()
        checkin = dict(checkin_row) if checkin_row else None

        new_workload = calculate_workload(active_tasks, checkin, recovery_credits=6.0)

        return {
            "success": True,
            "message": "Schedule rebalanced successfully. Breathing room restored.",
            "new_capacity": new_workload
        }
    finally:
        await db.close()

@router.post("/decline")
async def decline_rebalance():
    """Declines rebalance without modifying schedule. Non-judgmental & calm."""
    return {
        "success": True,
        "message": "Original schedule preserved. Remember you can always rebalance when you need space."
    }

@router.post("/demo/trigger-overload")
async def trigger_demo_overload():
    """Hackathon demo helper: adds the 4 overload tasks to simulate 91% capacity"""
    await seed_overload_scenario()
    return {"success": True, "message": "Demo overload scenario active (projected load ~91%)"}

@router.post("/demo/reset-baseline")
async def reset_demo_baseline():
    """Hackathon demo helper: resets Alex to Monday baseline (projected load ~68%)"""
    await seed_demo_data(force=True)
    return {"success": True, "message": "Demo reset to Monday baseline (~68%)"}
