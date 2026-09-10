from fastapi import APIRouter, Header
from typing import Optional, List
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID
from ..services.load_engine import calculate_workload
from ..services.recovery_engine import get_recovery_recommendations
from ..services.sanctuary_service import get_sanctuary_status
from ..models.schemas import RecoveryItem, SanctuaryStatus

router = APIRouter(prefix="/recovery", tags=["recovery"])

def extract_user_id(authorization: Optional[str] = None) -> str:
    if authorization and "lumora-token-" in authorization:
        return authorization.replace("Bearer ", "").replace("lumora-token-", "").strip()
    return DEMO_USER_ID

@router.get("/sanctuary", response_model=SanctuaryStatus)
async def get_sanctuary(authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        task_cur = await db.execute("SELECT * FROM tasks WHERE user_id = ? AND status != 'completed'", (user_id,))
        task_rows = await task_cur.fetchall()
        tasks = [dict(r) for r in task_rows]

        checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1", (user_id,))
        checkin_row = await checkin_cur.fetchone()
        checkin = dict(checkin_row) if checkin_row else None

        rec_cur = await db.execute("SELECT accepted FROM recommendations WHERE user_id = ? AND type = 'rebalance' AND accepted = 1", (user_id,))
        rec_row = await rec_cur.fetchone()
        is_rebalanced = bool(rec_row)

        workload = calculate_workload(tasks, checkin, recovery_credits=6.0 if is_rebalanced else 0.0)
        return get_sanctuary_status(workload.capacity_score, is_rebalanced=is_rebalanced)
    finally:
        await db.close()

@router.get("/recommendations", response_model=List[RecoveryItem])
async def recovery_recommendations(authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        task_cur = await db.execute("SELECT * FROM tasks WHERE user_id = ?", (user_id,))
        task_rows = await task_cur.fetchall()
        tasks = [dict(r) for r in task_rows]

        checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1", (user_id,))
        checkin_row = await checkin_cur.fetchone()
        checkin = dict(checkin_row) if checkin_row else None

        workload = calculate_workload(tasks, checkin)
        return get_recovery_recommendations(workload, checkin)
    finally:
        await db.close()

@router.post("/start")
async def start_recovery(item_id: str, authorization: Optional[str] = Header(None)):
    """User starts a recovery micro-session. Provides immediate calm positive reinforcement."""
    return {
        "success": True,
        "message": "Recovery session activated. Take your time — no rush, no guilt.",
        "duration_minutes": 25,
        "mode": "sanctuary",
        "growth_bonus": 15
    }

@router.post("/complete")
async def complete_recovery(item_id: Optional[str] = None, authorization: Optional[str] = Header(None)):
    """User completes a recovery session, awarding sanctuary equilibrium points."""
    return {
        "success": True,
        "message": "Restorative session completed. Your plant absorbed new sanctuary energy!",
        "growth_points": 25,
        "streak_safe": True
    }
