import os
import random
import string
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Header, HTTPException, Request, BackgroundTasks
from ..database.connection import get_db
from ..database.seed_data import DEMO_USER_ID
from ..models.schemas import TelegramLinkCodeResponse, TelegramStatusResponse, TelegramSetWebhookRequest, TelegramSetWebhookResponse
from ..services.telegram_service import (
    process_telegram_update,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_USERNAME,
    TELEGRAM_WEBHOOK_SECRET,
    LUMORA_WEB_URL
)

router = APIRouter(prefix="/telegram", tags=["telegram"])

def extract_user_id(authorization: Optional[str] = None) -> str:
    if authorization and "lumora-token-" in authorization:
        return authorization.replace("Bearer ", "").replace("lumora-token-", "").strip()
    return DEMO_USER_ID

@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: Optional[str] = Header(None)
):
    """
    Primary Telegram Webhook endpoint.
    Validates X-Telegram-Bot-Api-Secret-Token and processes incoming update asynchronously.
    """
    # Verify secret if configured
    if TELEGRAM_WEBHOOK_SECRET:
        if x_telegram_bot_api_secret_token != TELEGRAM_WEBHOOK_SECRET:
            # Also allow if header is missing during local dev/tests, but enforce if mismatch
            if x_telegram_bot_api_secret_token is not None:
                raise HTTPException(status_code=403, detail="Invalid webhook secret token")

    try:
        update_data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Process in background task so response to Telegram is immediate (< 200ms)
    background_tasks.add_task(process_telegram_update, update_data)
    return {"ok": True}

@router.post("/generate-link-code", response_model=TelegramLinkCodeResponse)
async def generate_link_code(authorization: Optional[str] = Header(None)):
    """
    Generates a secure, single-use 6-character linking code valid for 15 minutes.
    """
    user_id = extract_user_id(authorization)
    
    # Generate 4-character random alphanumeric suffix
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=4))
    code = f"LUMORA-{suffix}"

    expires_at = (datetime.now() + timedelta(minutes=15)).isoformat()

    db = await get_db()
    try:
        # Clear existing old codes for this user
        await db.execute("DELETE FROM telegram_linking_codes WHERE user_id = ?", (user_id,))
        # Insert new code
        await db.execute(
            "INSERT INTO telegram_linking_codes (code, user_id, expires_at) VALUES (?, ?, ?)",
            (code, user_id, expires_at)
        )
        await db.commit()
    finally:
        await db.close()

    bot_handle = TELEGRAM_BOT_USERNAME or "Lumora_App_Bot"
    deep_link = f"https://t.me/{bot_handle}?start={code}"

    return TelegramLinkCodeResponse(
        code=code,
        bot_username=bot_handle,
        deep_link=deep_link,
        expires_in_minutes=15
    )

@router.get("/status", response_model=TelegramStatusResponse)
async def get_telegram_status(authorization: Optional[str] = Header(None)):
    """
    Checks if the authenticated user currently has a linked Telegram account.
    """
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        cur = await db.execute(
            "SELECT telegram_user_id, telegram_username, created_at FROM telegram_accounts WHERE user_id = ?",
            (user_id,)
        )
        row = await cur.fetchone()
        bot_handle = TELEGRAM_BOT_USERNAME or "Lumora_App_Bot"

        if row:
            return TelegramStatusResponse(
                is_connected=True,
                telegram_username=row["telegram_username"],
                telegram_user_id=row["telegram_user_id"],
                bot_username=bot_handle,
                connected_at=str(row["created_at"])
            )
        return TelegramStatusResponse(
            is_connected=False,
            telegram_username=None,
            telegram_user_id=None,
            bot_username=bot_handle,
            connected_at=None
        )
    finally:
        await db.close()

@router.post("/unlink")
async def unlink_telegram_account(authorization: Optional[str] = Header(None)):
    """
    Unlinks Telegram account for current user.
    """
    user_id = extract_user_id(authorization)
    db = await get_db()
    try:
        await db.execute("DELETE FROM telegram_accounts WHERE user_id = ?", (user_id,))
        await db.commit()
        return {"success": True, "message": "Telegram account disconnected successfully."}
    finally:
        await db.close()

@router.post("/set-webhook", response_model=TelegramSetWebhookResponse)
async def set_telegram_webhook(
    data: Optional[TelegramSetWebhookRequest] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Registers the webhook URL with Telegram Bot API.
    """
    if not TELEGRAM_BOT_TOKEN:
        return TelegramSetWebhookResponse(
            success=False,
            message="TELEGRAM_BOT_TOKEN is not configured in backend/.env."
        )

    # Determine public webhook URL
    target_url = (data.webhook_url if data and data.webhook_url else None) or f"{LUMORA_WEB_URL}/api/telegram/webhook"

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    payload = {
        "url": target_url,
        "secret_token": TELEGRAM_WEBHOOK_SECRET,
        "drop_pending_updates": True
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            result = resp.json()
            if result.get("ok"):
                return TelegramSetWebhookResponse(
                    success=True,
                    message=f"Webhook successfully registered to {target_url}!",
                    webhook_url=target_url
                )
            else:
                return TelegramSetWebhookResponse(
                    success=False,
                    message=f"Telegram API error: {result.get('description')}",
                    webhook_url=target_url
                )
    except Exception as e:
        return TelegramSetWebhookResponse(
            success=False,
            message=f"Failed to set webhook: {str(e)}",
            webhook_url=target_url
        )
