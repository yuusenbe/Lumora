from typing import Dict, Any, List
from ..models.schemas import SanctuaryStatus

def get_sanctuary_status(capacity_score: int, is_rebalanced: bool = False, recent_recovery_count: int = 1) -> SanctuaryStatus:
    """
    Computes the student's Anti-Streak (Balance Sanctuary) metrics.
    Instead of punishing with a reset upon overload, the streak gracefully pauses (freezes).
    """
    # Baseline streak calculation
    if capacity_score <= 80:
        streak_days = 5
        streak_status = "active"
        if capacity_score < 60:
            status_headline = "5 Days in Restorative Equilibrium 🌿"
            status_message = "Your energy envelope is well-protected in the sustainable sweet spot (40–80% load)."
        else:
            status_headline = "5 Days of Mindful Balance 🌿"
            status_message = "You are carrying a healthy academic and personal load without approaching the strain threshold."
    else:
        # Overload detected (> 80%) -> Graceful Freeze, NO reset to 0!
        streak_days = 5
        streak_status = "frozen"
        status_headline = "Streak Gracefully Paused 🛡️"
        status_message = "Peak workload detected (>80%). Lumora has frozen your streak with zero penalties. Focus on resting, not maintaining numbers."

    # Growth points calculation (Scale: 0 to 100)
    base_points = 65
    if is_rebalanced:
        base_points += 20
    if recent_recovery_count > 0:
        base_points += min(15, recent_recovery_count * 5)
    
    plant_growth_percent = min(100, max(20, base_points))

    # Determine visual plant stage
    if plant_growth_percent < 40:
        plant_stage = "sprout"
        stage_name = "Nurtured Sprout 🌱"
    elif plant_growth_percent < 75:
        plant_stage = "foliage"
        stage_name = "Thriving Sage Foliage 🌿"
    else:
        plant_stage = "blooming_bonsai"
        stage_name = "Flourishing Sanctuary Bonsai 🌳"

    milestones = [
        "Shielded 2h Deep Study Block",
        "Accepted Smart Rebalance (↓18% load)",
        "Logged Screen-Free Recovery"
    ]
    if is_rebalanced:
        milestones.insert(0, "Protected Weekend Energy Envelope")

    return SanctuaryStatus(
        streak_days=streak_days,
        streak_status=streak_status,
        plant_stage=plant_stage,
        plant_stage_name=stage_name,
        plant_growth_percent=plant_growth_percent,
        balance_points=base_points * 4,
        status_headline=status_headline,
        status_message=status_message,
        milestones=milestones[:4]
    )
