import uuid
from fastapi import APIRouter, Header, HTTPException
from typing import Optional, List
from datetime import datetime, timedelta
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID
from ..models.schemas import Checkin, CheckinCreate

router = APIRouter(prefix="/checkins", tags=["checkins"])

def extract_user_id(authorization: Optional[str] = None) -> str:
    if authorization and "lumora-token-" in authorization:
        return authorization.replace("Bearer ", "").replace("lumora-token-", "").strip()
    return DEMO_USER_ID

@router.post("")
async def create_checkin(data: CheckinCreate, authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        checkin_id = f"checkin-{uuid.uuid4().hex[:10]}"
        today = datetime.now().strftime("%Y-%m-%d")

        # Replace today's checkin if already logged
        await db.execute("DELETE FROM checkins WHERE user_id = ? AND date = ?", (user_id, today))

        await db.execute(
            """INSERT INTO checkins (
                id, user_id, date, stress, mood, mental_fatigue, physical_fatigue, sleep_hours, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                checkin_id,
                user_id,
                today,
                data.stress,
                data.mood,
                data.mental_fatigue,
                data.physical_fatigue,
                data.sleep_hours,
                data.notes
            )
        )
        await db.commit()

        cur = await db.execute("SELECT * FROM checkins WHERE id = ?", (checkin_id,))
        row = await cur.fetchone()
        return dict(row)
    finally:
        await db.close()

@router.get("/history")
async def get_checkin_history(authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        cur = await db.execute(
            "SELECT * FROM checkins WHERE user_id = ? ORDER BY date ASC LIMIT 14",
            (user_id,)
        )
        rows = await cur.fetchall()
        history = [dict(r) for r in rows]

        # If sparse, generate realistic past 6 days history for rich visualization
        if len(history) <= 1:
            base_date = datetime.now()
            mock_trend = [
                {"days_ago": 6, "stress": 2, "mood": 4, "mental_fatigue": 2, "physical_fatigue": 2, "sleep": 7.8},
                {"days_ago": 5, "stress": 3, "mood": 4, "mental_fatigue": 2, "physical_fatigue": 3, "sleep": 7.4},
                {"days_ago": 4, "stress": 3, "mood": 3, "mental_fatigue": 3, "physical_fatigue": 3, "sleep": 7.0},
                {"days_ago": 3, "stress": 4, "mood": 3, "mental_fatigue": 4, "physical_fatigue": 3, "sleep": 6.5},
                {"days_ago": 2, "stress": 4, "mood": 2, "mental_fatigue": 4, "physical_fatigue": 4, "sleep": 6.2},
                {"days_ago": 1, "stress": 4, "mood": 3, "mental_fatigue": 4, "physical_fatigue": 3, "sleep": 6.0},
            ]
            for m in mock_trend:
                d_str = (base_date - timedelta(days=m["days_ago"])).strftime("%Y-%m-%d")
                history.append({
                    "id": f"hist-{m['days_ago']}",
                    "user_id": user_id,
                    "date": d_str,
                    "stress": m["stress"],
                    "mood": m["mood"],
                    "mental_fatigue": m["mental_fatigue"],
                    "physical_fatigue": m["physical_fatigue"],
                    "sleep_hours": m["sleep"],
                    "notes": "Weekly workload trend point"
                })
            history.sort(key=lambda x: x["date"])

        return history
    finally:
        await db.close()

@router.get("/latest")
async def get_latest_checkin(authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        cur = await db.execute(
            "SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 1",
            (user_id,)
        )
        row = await cur.fetchone()
        return dict(row) if row else None
    finally:
        await db.close()
