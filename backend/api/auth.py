import uuid
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID, DEMO_EMAIL, seed_demo_data
from ..models.schemas import UserLogin, UserSignup, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse)
async def signup(data: UserSignup):
    db = await get_db()
    try:
        # Check existing
        cursor = await db.execute("SELECT id FROM users WHERE email = ?", (data.email,))
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="User with this email already exists")

        user_id = f"user-{uuid.uuid4().hex[:12]}"
        await db.execute(
            "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
            (user_id, data.name, data.email, data.password)
        )
        await db.commit()
        return UserResponse(
            id=user_id,
            name=data.name,
            email=data.email,
            token=f"lumora-token-{user_id}"
        )
    finally:
        await db.close()

@router.post("/login", response_model=UserResponse)
async def login(data: UserLogin):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", (data.email,))
        user = await cursor.fetchone()
        if not user:
            # If logging in as demo email, auto-seed if needed
            if data.email == DEMO_EMAIL:
                await seed_demo_data(force=False)
                return UserResponse(
                    id=DEMO_USER_ID,
                    name="Alex Chen",
                    email=DEMO_EMAIL,
                    token=f"lumora-token-{DEMO_USER_ID}"
                )
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            token=f"lumora-token-{user['id']}"
        )
    finally:
        await db.close()

@router.post("/demo-login", response_model=UserResponse)
async def demo_login():
    """One-click demo student login as Alex Chen with pre-configured realistic university data"""
    await seed_demo_data(force=False)
    return UserResponse(
        id=DEMO_USER_ID,
        name="Alex Chen",
        email=DEMO_EMAIL,
        token=f"lumora-token-{DEMO_USER_ID}"
    )

@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None)):
    user_id = DEMO_USER_ID
    if authorization and "lumora-token-" in authorization:
        user_id = authorization.replace("Bearer ", "").replace("lumora-token-", "")

    db = await get_db()
    try:
        cursor = await db.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
        user = await cursor.fetchone()
        if not user:
            return {"id": DEMO_USER_ID, "name": "Alex Chen", "email": DEMO_EMAIL}
        return {"id": user["id"], "name": user["name"], "email": user["email"]}
    finally:
        await db.close()
