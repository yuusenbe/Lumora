from typing import List, Dict, Any, Optional
from ..models.schemas import WorkloadResponse, LoadBreakdown, LoadPoints

def calculate_workload(
    tasks: List[Dict[str, Any]],
    checkin: Optional[Dict[str, Any]] = None,
    recovery_credits: float = 0.0
) -> WorkloadResponse:
    """
    Deterministic Workload Engine:
    Quantifies the student's combined load across Academic, Work, Physical, Social, and Errands,
    factoring in lifestyle metrics (sleep, stress, fatigue) and recovery credits.
    """
    # 1. Base student cognitive load (enrolled full-time student baseline)
    base_load = 35.0

    # 2. Tally category points from pending and active tasks
    cat_points = {
        "academic": 0.0,
        "work": 0.0,
        "social": 0.0,
        "physical": 0.0,
        "errand": 0.0
    }

    priority_weights = {"high": 1.35, "medium": 1.0, "low": 0.75}
    energy_weights = {"high": 1.25, "medium": 1.0, "low": 0.85}

    total_task_hours = 0.0

    for t in tasks:
        status = t.get("status", "pending")
        if status == "completed":
            continue

        hours = float(t.get("estimated_hours", 2.0))
        cat = t.get("category", "academic").lower()
        if cat not in cat_points:
            cat = "academic"

        p_mult = priority_weights.get(t.get("priority", "medium").lower(), 1.0)
        e_mult = energy_weights.get(t.get("energy_required", "medium").lower(), 1.0)

        # Academic and work contribute higher mental/time weight
        cat_rate = 3.2 if cat in ["academic", "work"] else 2.2
        item_load = hours * cat_rate * p_mult * e_mult
        cat_points[cat] += item_load
        total_task_hours += hours

    # 3. Check-in lifestyle adjustments
    lifestyle_load = 0.0
    sleep_penalty = 0.0
    mental_penalty = 0.0

    if checkin:
        sleep = float(checkin.get("sleep_hours", 7.0))
        stress = int(checkin.get("stress", 3))
        m_fatigue = int(checkin.get("mental_fatigue", 3))
        p_fatigue = int(checkin.get("physical_fatigue", 3))

        # Sleep deficit: ideal is 7.5h
        if sleep < 7.0:
            sleep_penalty = (7.0 - sleep) * 5.0
        elif sleep > 8.0:
            recovery_credits += (sleep - 8.0) * 3.0

        mental_penalty = (stress - 1) * 2.5 + (m_fatigue - 1) * 2.2
        phys_penalty = (p_fatigue - 1) * 1.8
        lifestyle_load = sleep_penalty + mental_penalty + phys_penalty

        # Distribute lifestyle strain into categories for attribution
        cat_points["academic"] += mental_penalty * 0.5
        cat_points["work"] += mental_penalty * 0.3
        cat_points["physical"] += phys_penalty + sleep_penalty * 0.6
        cat_points["errand"] += sleep_penalty * 0.4

    # 4. Total calculation
    task_load_sum = sum(cat_points.values())
    task_strain = max(0.0, (total_task_hours - 34.0) * 0.68)
    total_raw = base_load + (task_load_sum * 0.082) + (lifestyle_load * 1.05) + task_strain - (recovery_credits * 1.6)

    # Normalize to 0-100 scale
    capacity_score = int(round(max(5, min(99, total_raw))))

    # Determine status level & calm tone
    if capacity_score < 40:
        status = "Low load"
        status_level = "low"
        status_color = "#10B981" # emerald
    elif capacity_score < 70:
        status = "Moderate load"
        status_level = "moderate"
        status_color = "#0D9488" # teal
    elif capacity_score < 85:
        status = "High load"
        status_level = "high"
        status_color = "#F59E0B" # warm amber
    else:
        status = "Very high load"
        status_level = "very_high"
        status_color = "#F43F5E" # calm rose/coral

    # Calculate percentage breakdown across categories
    total_cat_points = sum(cat_points.values())
    if total_cat_points > 0:
        breakdown = LoadBreakdown(
            academic=round((cat_points["academic"] / total_cat_points) * 100, 1),
            work=round((cat_points["work"] / total_cat_points) * 100, 1),
            social=round((cat_points["social"] / total_cat_points) * 100, 1),
            physical=round((cat_points["physical"] / total_cat_points) * 100, 1),
            errands=round((cat_points["errand"] / total_cat_points) * 100, 1),
        )
    else:
        breakdown = LoadBreakdown(academic=42.0, work=18.0, social=12.0, physical=15.0, errands=8.0)

    # Top contributors
    cat_items = [
        ("Academic responsibilities", breakdown.academic),
        ("Part-time work shifts", breakdown.work),
        ("Physical fatigue & exercise", breakdown.physical),
        ("Social commitments", breakdown.social),
        ("Errands & household tasks", breakdown.errands)
    ]
    sorted_contributors = sorted(cat_items, key=lambda x: x[1], reverse=True)
    top_contributors = [f"{item[0]} ({item[1]}%)" for item in sorted_contributors[:2]]

    # Explainable textual diagnosis (non-clinical)
    if capacity_score >= 85:
        explanation = (
            f"Your current load appears very high ({capacity_score}% capacity). "
            f"{sorted_contributors[0][0]} and {sorted_contributors[1][0].lower()} are converging "
            f"closely this week. Flexible activities can be rebalanced to restore breathing room."
        )
        needs_rebalance = True
    elif capacity_score >= 70:
        explanation = (
            f"Your current load appears high ({capacity_score}% capacity). "
            f"Driven primarily by {sorted_contributors[0][0].lower()}. "
            f"Protecting your recovery evening and shifting lower-priority errands is recommended."
        )
        needs_rebalance = True
    elif capacity_score >= 40:
        explanation = (
            f"Your workload is in a balanced, sustainable zone ({capacity_score}% capacity). "
            f"You have steady momentum without exceeding cognitive or physical limits."
        )
        needs_rebalance = False
    else:
        explanation = (
            f"Your schedule has plenty of available space ({capacity_score}% capacity). "
            f"A great window for deep focus, restorative recovery, or personal projects."
        )
        needs_rebalance = False

    load_points = LoadPoints(
        time_load=round(total_task_hours * 2.5, 1),
        mental_load=round(cat_points["academic"] * 0.7, 1),
        physical_load=round(cat_points["physical"], 1),
        social_load=round(cat_points["social"], 1),
        errand_load=round(cat_points["errand"], 1),
        recovery_score=round(max(0.0, recovery_credits), 1)
    )

    return WorkloadResponse(
        capacity_score=capacity_score,
        status=status,
        status_level=status_level,
        status_color=status_color,
        breakdown=breakdown,
        load_points=load_points,
        explanation=explanation,
        top_contributors=top_contributors,
        needs_rebalance=needs_rebalance
    )
