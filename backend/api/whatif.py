from fastapi import APIRouter, Header
from typing import Optional
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID
from ..services.load_engine import calculate_workload
from ..services.ai_service import simulate_whatif
from ..models.schemas import WhatIfRequest, WhatIfResponse

router = APIRouter(prefix="/what-if", tags=["what-if"])

def extract_user_id(authorization: Optional[str] = None) -> str:
    if authorization and "lumora-token-" in authorization:
        return authorization.replace("Bearer ", "").replace("lumora-token-", "").strip()
    return DEMO_USER_ID

@router.post("/simulate", response_model=WhatIfResponse)
async def run_whatif_simulation(request: WhatIfRequest, authorization: Optional[str] = Header(None)):
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
        return await simulate_whatif(request.scenario, workload.capacity_score)
    finally:
        await db.close()
