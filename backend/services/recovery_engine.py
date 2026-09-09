from typing import List, Dict, Any
from ..models.schemas import RecoveryItem, WorkloadResponse

def get_recovery_recommendations(
    workload: WorkloadResponse,
    checkin: Dict[str, Any] = None
) -> List[RecoveryItem]:
    """
    Generates non-pressuring, context-appropriate recovery opportunities
    grounded in the student's primary fatigue factors.
    """
    items: List[RecoveryItem] = []
    points = workload.load_points
    sleep = float(checkin.get("sleep_hours", 7.0)) if checkin else 7.0
    stress = int(checkin.get("stress", 3)) if checkin else 3

    # 1. High Mental Load
    if points.mental_load >= 15 or stress >= 4:
        items.append(RecoveryItem(
            id="recov-mental-reset",
            category="mental",
            title="Screen-Free Horizon Reset",
            duration="20 minutes",
            description="Step away from all devices and screens. Look out of a window or sit outside without headphones. Let your optic nerves and prefrontal cortex downshift.",
            reason="You have carried dense cognitive focus today with high attention demands.",
            icon="🧠"
        ))

    # 2. Sleep deficit & Physical fatigue
    if sleep < 6.8 or points.physical_load >= 12:
        items.append(RecoveryItem(
            id="recov-physical-sleep",
            category="physical",
            title="Early Sleep Wind-Down Buffer",
            duration="30 minutes before bed",
            description="Dim room lighting, sip warm caffeine-free tea, and do 5 minutes of gentle lower back stretching. Put devices in Do-Not-Disturb mode.",
            reason=f"Your sleep duration was {sleep}h, below the restorative threshold for memory consolidation.",
            icon="😴"
        ))

    # 3. High Social Load or Social Battery Depletion
    if points.social_load >= 12:
        items.append(RecoveryItem(
            id="recov-social-battery",
            category="social",
            title="Quiet Sanctuary Space",
            duration="45 minutes",
            description="A dedicated solo evening block where you don't have to reply to group chats, attend gatherings, or hold conversations.",
            reason="Multiple social commitments require active emotional energy and active listening.",
            icon="👥"
        ))

    # 4. Light Outdoor Walk / Nature Reset
    items.append(RecoveryItem(
        id="recov-outdoor-walk",
        category="mindfulness",
        title="Restorative Fresh Air Stroll",
        duration="15–20 minutes",
        description="A slow, unstructured walk around campus or your neighborhood without rushing or timing yourself. Leave your task list at home.",
        reason="Physical circulation improves mood regulation and breaks continuous sitting postures.",
        icon="🌿"
    ))

    # 5. Restful audio immersion
    items.append(RecoveryItem(
        id="recov-ambient-audio",
        category="mental",
        title="Ambient Sound Drift",
        duration="15 minutes",
        description="Listen to binaural beats, soft rain, or lo-fi soundscapes with your eyes closed and body relaxed.",
        reason="Reduces sympathetic nervous system activation into parasympathetic relaxation.",
        icon="🎧"
    ))

    return items[:4]
