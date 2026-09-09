import os
import re
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from ..models.schemas import ParsedTaskResponse, WhatIfResponse, WhatIfOption, RecommendedSlot
from .slot_finder import find_optimal_slots
from ..database.seed_data import DEMO_USER_ID

# Check if Gemini API key exists
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

def resolve_relative_date(target: Optional[str]) -> Optional[str]:
    if not target:
        return None
    now = datetime.now()
    target_clean = target.strip().lower()
    if target_clean in ["today", "tonight"]:
        return now.strftime("%Y-%m-%d")
    if target_clean == "tomorrow":
        return (now + timedelta(days=1)).strftime("%Y-%m-%d")
    
    days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    current_dow = now.weekday()
    for idx, day in enumerate(days_of_week):
        if day in target_clean:
            delta = (idx - current_dow) % 7
            if delta == 0 and "next" in target_clean:
                delta = 7
            return (now + timedelta(days=delta)).strftime("%Y-%m-%d")
    try:
        datetime.strptime(target_clean, "%Y-%m-%d")
        return target_clean
    except ValueError:
        pass
    return None

async def parse_natural_language_task(
    text: str,
    user_id: str = DEMO_USER_ID,
    preferred_date: Optional[str] = None
) -> ParsedTaskResponse:
    """
    Extracts structured task properties from student natural language.
    Uses Gemini API if configured, otherwise falls back to deterministic NLP heuristics.
    """
    clean_text = text.strip()

    if GEMINI_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_KEY)
            prompt = f"""
            You are Lumora's Smart Capture assistant. Analyze this student input:
            "{clean_text}"

            Return a valid JSON object with:
            - title: clean string (remove conversational phrases)
            - category: one of [academic, work, social, physical, errand]
            - estimated_hours: float
            - deadline: relative or explicit deadline (e.g. "Tomorrow", "Thursday", "2026-09-08")
            - start_time: 24h format "HH:MM" if user mentions a specific time/window, otherwise null
            - end_time: 24h format "HH:MM" if user mentions a specific time/window, otherwise null
            - priority: one of [low, medium, high]
            - energy_required: one of [low, medium, high]
            - flexibility: one of [low, medium, high]
            - raw_understanding: a calm, supportive 1-sentence interpretation
            """
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={'response_mime_type': 'application/json'}
            )
            data_text = response.text.strip()
            parsed = json.loads(data_text)
            st = parsed.get("start_time")
            et = parsed.get("end_time")
            dl = parsed.get("deadline")
            sched_date = resolve_relative_date(dl) or resolve_relative_date(clean_text)
            return ParsedTaskResponse(
                title=parsed.get("title", clean_text),
                category=parsed.get("category", "academic"),
                estimated_hours=float(parsed.get("estimated_hours", 2.0)),
                deadline=dl,
                scheduled_date=sched_date,
                start_time=st,
                end_time=et,
                is_time_specific=bool(st),
                priority=parsed.get("priority", "medium"),
                energy_required=parsed.get("energy_required", "medium"),
                flexibility=parsed.get("flexibility", "medium"),
                confidence=0.95,
                raw_understanding=parsed.get("raw_understanding", f"Understood: {clean_text}")
            )
        except Exception as e:
            # Fallback to local heuristic
            pass

    # High-accuracy local heuristic fallback
    lower = clean_text.lower()

    # Time range detection (e.g. "9am to 12pm", "10:00 - 12:30", "at 3pm", "14:00 - 17:00")
    start_time = None
    end_time = None
    is_time_specific = False

    def to_24h(hour_str: str, min_str: Optional[str], meridiem: Optional[str]) -> str:
        h = int(hour_str)
        m = int(min_str) if min_str else 0
        if meridiem:
            meridiem = meridiem.lower()
            if meridiem == "pm" and h < 12:
                h += 12
            elif meridiem == "am" and h == 12:
                h = 0
        return f"{h:02d}:{m:02d}"

    # Pattern 1: Range like "9am to 12:30pm" or "10:00 - 12:00" or "from 2pm to 4pm"
    range_match = re.search(
        r'(?:from\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-|until|till)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b',
        lower
    )
    if range_match:
        h1, m1, p1, h2, m2, p2 = range_match.groups()
        # If second has pm but first has no meridiem, infer for first if reasonable
        if not p1 and p2:
            h1_val = int(h1)
            h2_val = int(h2)
            if p2 == "pm" and h1_val > h2_val:
                p1 = "am"
            elif p2 == "pm" and h1_val <= h2_val:
                p1 = "pm" if h1_val >= 12 else "am"
            else:
                p1 = p2
        elif not p2 and p1:
            p2 = p1

        start_time = to_24h(h1, m1, p1)
        end_time = to_24h(h2, m2, p2)
        is_time_specific = True
    else:
        # Pattern 2: "at 3pm" or "at 3:30pm"
        at_match = re.search(r'\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b', lower)
        if at_match:
            h, m, p = at_match.groups()
            start_time = to_24h(h, m, p)
            is_time_specific = True

    # Category detection
    category = "academic"
    if any(k in lower for k in ["shift", "cafe", "barista", "work", "job", "office", "client", "boss"]):
        category = "work"
    elif any(k in lower for k in ["birthday", "party", "friend", "hangout", "dinner", "coffee", "meetup", "drinks", "club"]):
        category = "social"
    elif any(k in lower for k in ["gym", "workout", "run", "swim", "yoga", "exercise", "training", "hike"]):
        category = "physical"
    elif any(k in lower for k in ["grocer", "laundry", "clean", "buy", "supermarket", "chore", "trash", "dishes", "bank", "poster", "print"]):
        category = "errand"
    elif any(k in lower for k in ["fyp", "methodology", "thesis", "quiz", "exam", "assignment", "lecture", "study", "paper", "essay", "lab", "midterm"]):
        category = "academic"

    # Estimated hours detection
    hours = 2.0
    hour_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr|h)\b', lower)
    if hour_match:
        hours = float(hour_match.group(1))
    elif start_time and end_time:
        # Calculate duration directly from time range
        sh, sm = map(int, start_time.split(':'))
        eh, em = map(int, end_time.split(':'))
        dur = (eh * 60 + em - (sh * 60 + sm)) / 60.0
        if dur > 0:
            hours = round(dur, 1)
    elif "30 min" in lower or "half hour" in lower:
        hours = 0.5
    elif "45 min" in lower:
        hours = 0.75
    elif "full day" in lower:
        hours = 6.0
    elif category == "errand":
        hours = 1.5
    elif category == "work":
        hours = 4.0
    elif category == "physical":
        hours = 1.0

    # If single start_time was given without end_time, compute end_time from hours
    if start_time and not end_time:
        sh, sm = map(int, start_time.split(':'))
        total_mins = int(sh * 60 + sm + hours * 60)
        eh = (total_mins // 60) % 24
        em = total_mins % 60
        end_time = f"{eh:02d}:{em:02d}"

    # Deadline / day detection
    deadline = None
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for d in days:
        if d in lower:
            deadline = d.capitalize()
            break
    if not deadline:
        if "tomorrow" in lower:
            deadline = "Tomorrow"
        elif "tonight" in lower:
            deadline = "Tonight"
        elif "this weekend" in lower:
            deadline = "Saturday"

    # Priority detection
    priority = "medium"
    if any(k in lower for k in ["urgent", "due", "fyp", "exam", "critical", "important", "methodology", "final"]):
        priority = "high"
    elif any(k in lower for k in ["maybe", "optional", "if time", "low"]):
        priority = "low"

    # Energy required
    energy_required = "medium"
    if any(k in lower for k in ["fyp", "methodology", "exam", "gym", "heavy", "intense", "hard"]):
        energy_required = "high"
    elif any(k in lower for k in ["quick", "easy", "casual", "light"]):
        energy_required = "low"

    # Flexibility: errands and meetups are high; shifts, exams, lectures are low
    flexibility = "medium"
    if category in ["errand", "social"]:
        flexibility = "high"
    elif category in ["academic"] and priority == "high":
        flexibility = "low"
    elif category == "work":
        flexibility = "low"

    # Clean title extraction
    title = clean_text
    # Remove phrases like "I need to", "I have to", "due thursday" from the title for neatness
    title = re.sub(r'^(?:i need to|i have to|need to|have to|please|remind me to|complete|finish)\s+', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+(?:by\s+before|before|by|due|on|this)?\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|tonight)\b.*$', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+(?:from\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:to|-)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b.*$', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b.*$', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+and\s+it\s+(?:probably|will)?\s*(?:takes|take)\s*around\s*\d+(?:\.\d+)?\s*(?:hours|hrs|h)', '', title, flags=re.IGNORECASE)
    title = re.sub(r'\s+for\s+\d+(?:\.\d+)?\s*(?:hours|hrs|h|hr)\b.*$', '', title, flags=re.IGNORECASE)
    title = title.strip()
    if title.lower().startswith("my "):
        title = title[3:].strip()

    # Capitalize first letter while preserving uppercase acronyms like FYP
    if title:
        title = title[0].upper() + title[1:]
    else:
        title = clean_text

    if start_time and end_time:
        raw_understanding = f"Identified as {category} anchor '{title}' scheduled from {start_time} to {end_time} (~{hours}h, {priority} priority)."
    else:
        raw_understanding = f"Identified as flexible {category} task '{title}', requiring ~{hours}h ({priority} priority, due {deadline or 'soon'})."

    scheduled_date = resolve_relative_date(deadline) or resolve_relative_date(clean_text)
    if not scheduled_date and not deadline:
        scheduled_date = datetime.now().strftime("%Y-%m-%d")

    # If the student did not specify explicit times, find optimal clash-free slots!
    recommended_slots = None
    if not is_time_specific or not start_time:
        recommended_slots = await find_optimal_slots(
            user_id=user_id,
            estimated_hours=hours,
            deadline_date=scheduled_date,
            category=category,
            preferred_date=preferred_date
        )
        if recommended_slots:
            top_slot = recommended_slots[0]
            scheduled_date = top_slot.date
            start_time = top_slot.start_time
            end_time = top_slot.end_time
            is_time_specific = True
            raw_understanding = f"Scheduled '{title}' for {top_slot.day_name} ({top_slot.start_time}–{top_slot.end_time}) ahead of {deadline or 'Sunday'} with zero conflicts."

    return ParsedTaskResponse(
        title=title,
        category=category,
        estimated_hours=hours,
        deadline=deadline,
        scheduled_date=scheduled_date,
        start_time=start_time,
        end_time=end_time,
        is_time_specific=is_time_specific,
        priority=priority,
        energy_required=energy_required,
        flexibility=flexibility,
        confidence=0.92,
        raw_understanding=raw_understanding,
        recommended_slots=recommended_slots
    )

async def simulate_whatif(scenario: str, current_load: int) -> WhatIfResponse:
    """
    Simulates a 'What-If' scenario: tests commitments before accepting them.
    Example: 'Can I accept another part-time shift on Saturday?'
    """
    lower = scenario.lower()

    # Determine load delta based on commitment type
    if any(k in lower for k in ["shift", "work", "job"]):
        delta = 16
        peak_day = "Saturday"
        analysis = (
            "Adding a 4–5 hour part-time shift increases your Saturday workload substantially. "
            "Because your academic schedule is already dense midweek, your Saturday rest buffer "
            "would be consumed entirely, pushing your overall capacity into the high strain threshold."
        )
        opt_a = WhatIfOption(
            option_id="opt-a",
            title="Accept shift as-is",
            projected_load=min(99, current_load + delta),
            delta=delta,
            tradeoff="Leaves zero downtime on your weekend. High risk of cognitive exhaustion on Sunday.",
            recommended=False
        )
        opt_b = WhatIfOption(
            option_id="opt-b",
            title="Accept shift + Move Sunday chores to Monday",
            projected_load=min(99, current_load + delta - 9),
            delta=delta - 9,
            tradeoff="Clears Sunday morning for sleep recovery while earning extra income.",
            recommended=True
        )
        opt_c = WhatIfOption(
            option_id="opt-c",
            title="Decline or swap for shorter 2.5h cover",
            projected_load=min(99, current_load + 6),
            delta=6,
            tradeoff="Protects mental reserve for your FYP methodology while assisting your team.",
            recommended=False
        )
        options = [opt_b, opt_a, opt_c]
        recommendation = "Option B balances financial opportunity with recovery by shielding Sunday for true rest."

    elif any(k in lower for k in ["course", "hackathon", "project", "assignment"]):
        delta = 18
        peak_day = "Friday / Saturday"
        analysis = (
            "Taking on an additional academic project increases your cognitive focus hours by ~6h this week. "
            "This will create direct competition for your FYP deep work hours."
        )
        options = [
            WhatIfOption(
                option_id="opt-1",
                title="Decline new project until next semester",
                projected_load=current_load,
                delta=0,
                tradeoff="Protects FYP quality and baseline health.",
                recommended=True
            ),
            WhatIfOption(
                option_id="opt-2",
                title="Join as secondary contributor",
                projected_load=current_load + 8,
                delta=8,
                tradeoff="Limits commitment to 2h/week with team coordination.",
                recommended=False
            )
        ]
        recommendation = "Protect your core semester milestone first. Decline or negotiate a lighter role."

    else:
        delta = 12
        peak_day = "Upcoming weekend"
        analysis = f"Adding this activity requires additional physical and mental energy, raising your capacity score by +{delta}%."
        options = [
            WhatIfOption(
                option_id="opt-gen-1",
                title="Proceed with balanced adjustments",
                projected_load=min(99, current_load + 5),
                delta=5,
                tradeoff="Shorten other flexible errands by 1 hour to absorb the load.",
                recommended=True
            ),
            WhatIfOption(
                option_id="opt-gen-2",
                title="Add without schedule changes",
                projected_load=min(99, current_load + delta),
                delta=delta,
                tradeoff="Compresses existing buffer times between commitments.",
                recommended=False
            )
        ]
        recommendation = "If this commitment is meaningful, compensate by trimming a flexible errand."

    return WhatIfResponse(
        question=scenario,
        current_load=current_load,
        projected_load_unbalanced=min(99, current_load + delta),
        impact_analysis=analysis,
        peak_day=peak_day,
        options=options,
        recommendation=recommendation
    )
