from fastapi import APIRouter, Header
from typing import Optional, Dict, Any, List
from datetime import datetime
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID
from ..services.load_engine import calculate_workload
from ..services.rebalance_engine import generate_rebalance_plan
from ..services.sanctuary_service import get_sanctuary_status
from ..models.schemas import WorkloadResponse

router = APIRouter(tags=["dashboard"])

def extract_user_id(authorization: Optional[str] = None) -> str:
    if authorization and "lumora-token-" in authorization:
        return authorization.replace("Bearer ", "").replace("lumora-token-", "").strip()
    return DEMO_USER_ID

@router.get("/dashboard")
async def get_dashboard(authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        # Fetch user
        user_cur = await db.execute("SELECT name FROM users WHERE id = ?", (user_id,))
        user_row = await user_cur.fetchone()
        user_name = user_row["name"] if user_row else "Alex"

        # Fetch pending and completed tasks
        task_cur = await db.execute(
            """SELECT * FROM tasks WHERE user_id = ? ORDER BY
               CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
               scheduled_date ASC""",
            (user_id,)
        )
        task_rows = await task_cur.fetchall()
        tasks = [dict(row) for row in task_rows]

        # Fetch latest check-in
        checkin_cur = await db.execute(
            "SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1",
            (user_id,)
        )
        checkin_row = await checkin_cur.fetchone()
        checkin = dict(checkin_row) if checkin_row else None

        # Check if rebalance plan has been applied for this user
        rec_cur = await db.execute(
            "SELECT accepted FROM recommendations WHERE user_id = ? AND type = 'rebalance' AND accepted = 1",
            (user_id,)
        )
        rec_row = await rec_cur.fetchone()
        is_rebalanced = bool(rec_row)
        recovery_credits = 6.0 if is_rebalanced else 0.0

        # Filter active tasks for current capacity calculation
        active_tasks = [
            t for t in tasks
            if t.get("status") not in ["completed", "postponed"]
        ]

        # Calculate explainable workload
        workload = calculate_workload(active_tasks, checkin, recovery_credits=recovery_credits)

        # Rule of 3 for Today
        today_str = datetime.now().strftime("%Y-%m-%d")
        today_tasks = [
            t for t in tasks
            if t.get("scheduled_date") == today_str or t.get("deadline") in ["Today", today_str]
        ]
        # If fewer than 3 today, pull next upcoming priority tasks to maintain guidance
        if len(today_tasks) < 3:
            pending_other = [t for t in tasks if t not in today_tasks and t.get("status") != "completed"]
            today_tasks.extend(pending_other[: (3 - len(today_tasks))])

        total_today_count = len([t for t in tasks if t.get("status") != "completed"])
        rule_of_three_tasks = today_tasks[:3]

        # Suggested Rebalancing Action
        suggested_action = None
        if is_rebalanced:
            suggested_action = {
                "headline": "Schedule Rebalanced & Protected",
                "detail": "Flexible errands moved to Sunday, workout duration optimized, and academic focus shielded.",
                "impact": f"Capacity safely normalized to {workload.capacity_score}% (Breathing room restored)",
                "is_applied": True
            }
        elif workload.capacity_score >= 70:
            plan = generate_rebalance_plan(tasks, checkin)
            if plan.recommendations:
                rec = plan.recommendations[0]
                suggested_action = {
                    "headline": rec.title,
                    "detail": rec.details,
                    "impact": f"Projected load drops from {plan.before_load}% to {plan.after_load}% (↓ {plan.load_reduction}%)",
                    "plan": plan.dict(),
                    "is_applied": False
                }

        sanctuary_data = get_sanctuary_status(workload.capacity_score, is_rebalanced=is_rebalanced)

        return {
            "student_name": user_name,
            "capacity": workload,
            "today_tasks": rule_of_three_tasks,
            "total_pending_count": total_today_count,
            "suggested_action": suggested_action,
            "latest_checkin": checkin,
            "sanctuary": sanctuary_data
        }
    finally:
        await db.close()
