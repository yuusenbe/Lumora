import uuid
from fastapi import APIRouter, Header, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timedelta
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID
from ..models.schemas import Task, TaskCreate, TaskUpdate, ParseTaskRequest, ParsedTaskResponse, RecommendedSlot, RecommendSlotsRequest
from ..services.ai_service import parse_natural_language_task, resolve_relative_date
from ..services.slot_finder import find_optimal_slots

router = APIRouter(tags=["tasks"])

def resolve_date(target: Optional[str]) -> str:
    now = datetime.now()
    if not target:
        return now.strftime("%Y-%m-%d")
    resolved = resolve_relative_date(target)
    if resolved:
        return resolved
    return now.strftime("%Y-%m-%d")

def extract_user_id(authorization: Optional[str] = None) -> str:
    if authorization and isinstance(authorization, str) and "lumora-token-" in authorization:
        return authorization.replace("Bearer ", "").replace("lumora-token-", "").strip()
    return DEMO_USER_ID

@router.get("/tasks")
async def get_tasks(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        query = "SELECT * FROM tasks WHERE user_id = ?"
        params = [user_id]
        if category:
            query += " AND category = ?"
            params.append(category)
        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, scheduled_date ASC"
        cur = await db.execute(query, tuple(params))
        rows = await cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["start_time"] = d.get("scheduled_start")
            d["end_time"] = d.get("scheduled_end")
            d["is_protected"] = bool(d.get("is_protected"))
            result.append(d)
        return result
    finally:
        await db.close()

@router.post("/tasks")
async def create_task(data: TaskCreate, authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        task_id = f"task-{uuid.uuid4().hex[:10]}"
        target_date = data.scheduled_date or data.deadline
        scheduled_date = resolve_date(target_date)
        start_val = data.start_time or data.scheduled_start
        end_val = data.end_time or data.scheduled_end

        await db.execute(
            """INSERT INTO tasks (
                id, user_id, title, category, priority, estimated_hours,
                deadline, status, energy_required, flexibility,
                scheduled_date, scheduled_start, scheduled_end, progress, is_protected
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)""",
            (
                task_id,
                user_id,
                data.title,
                data.category,
                data.priority,
                data.estimated_hours,
                data.deadline,
                data.energy_required,
                data.flexibility,
                scheduled_date,
                start_val,
                end_val,
                data.progress,
                1 if data.is_protected else 0
            )
        )
        await db.commit()

        cur = await db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = await cur.fetchone()
        d = dict(row)
        d["start_time"] = d.get("scheduled_start")
        d["end_time"] = d.get("scheduled_end")
        d["is_protected"] = bool(d.get("is_protected"))
        return d
    finally:
        await db.close()

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, data: TaskUpdate, authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        cur = await db.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
        existing = await cur.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Task not found")

        updates = []
        params = []
        handled_fields = set()
        for field, val in data.dict(exclude_unset=True).items():
            if field == "is_protected":
                updates.append("is_protected = ?")
                params.append(1 if val else 0)
            elif field in ["start_time", "scheduled_start"]:
                if "scheduled_start" not in handled_fields:
                    updates.append("scheduled_start = ?")
                    params.append(val)
                    handled_fields.add("scheduled_start")
            elif field in ["end_time", "scheduled_end"]:
                if "scheduled_end" not in handled_fields:
                    updates.append("scheduled_end = ?")
                    params.append(val)
                    handled_fields.add("scheduled_end")
            elif field in ["title", "category", "priority", "estimated_hours", "deadline", "energy_required", "flexibility", "scheduled_date", "progress", "status"]:
                updates.append(f"{field} = ?")
                params.append(val)

        if updates:
            params.extend([task_id, user_id])
            sql = f"UPDATE tasks SET {', '.join(updates)} WHERE id = ? AND user_id = ?"
            await db.execute(sql, tuple(params))
            await db.commit()

        cur = await db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = await cur.fetchone()
        d = dict(row)
        d["start_time"] = d.get("scheduled_start")
        d["end_time"] = d.get("scheduled_end")
        d["is_protected"] = bool(d.get("is_protected"))
        return d
    finally:
        await db.close()

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, authorization: Optional[str] = Header(None)):
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        await db.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
        await db.commit()
        return {"success": True, "message": "Task removed"}
    finally:
        await db.close()

@router.post("/ai/parse-task", response_model=ParsedTaskResponse)
async def ai_parse_task(request: ParseTaskRequest, authorization: Optional[str] = Header(None)):
    """Smart Capture: parses student natural language into structured task fields and discovers optimal slots"""
    user_id = extract_user_id(authorization)
    return await parse_natural_language_task(
        request.text,
        user_id=user_id,
        preferred_date=request.preferred_date
    )

@router.post("/ai/recommend-slots", response_model=List[RecommendedSlot])
async def ai_recommend_slots(request: RecommendSlotsRequest, authorization: Optional[str] = Header(None)):
    """Dynamically recommends clash-free time slots for a task based on duration and deadline"""
    user_id = extract_user_id(authorization)
    deadline = request.deadline
    if deadline:
        resolved = resolve_relative_date(deadline)
        if resolved:
            deadline = resolved
    return await find_optimal_slots(
        user_id=user_id,
        estimated_hours=request.estimated_hours,
        deadline_date=deadline,
        category=request.category or "errand",
        preferred_date=request.preferred_date
    )
