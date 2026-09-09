import uuid
from datetime import datetime, timedelta
from .connection import get_db

DEMO_USER_ID = "demo-alex-student-001"
DEMO_EMAIL = "alex@lumora.edu"

async def seed_demo_data(force=False):
    db = await get_db()
    try:
        # Check if demo user already exists
        cursor = await db.execute("SELECT id FROM users WHERE id = ?", (DEMO_USER_ID,))
        user_row = await cursor.fetchone()

        if user_row and not force:
            return

        # Clear existing data for demo user
        await db.execute("DELETE FROM recommendations WHERE user_id = ?", (DEMO_USER_ID,))
        await db.execute("DELETE FROM checkins WHERE user_id = ?", (DEMO_USER_ID,))
        await db.execute("DELETE FROM commitments WHERE user_id = ?", (DEMO_USER_ID,))
        await db.execute("DELETE FROM tasks WHERE user_id = ?", (DEMO_USER_ID,))
        await db.execute("DELETE FROM users WHERE id = ?", (DEMO_USER_ID,))

        # Insert Alex
        await db.execute(
            "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
            (DEMO_USER_ID, "Alex Chen", DEMO_EMAIL, "demo_pass_hash")
        )

        now = datetime.now()
        today = now.strftime("%Y-%m-%d")                          # Monday 2026-09-07
        tuesday = (now + timedelta(days=1)).strftime("%Y-%m-%d")    # Tuesday 2026-09-08
        wednesday = (now + timedelta(days=2)).strftime("%Y-%m-%d")  # Wednesday 2026-09-09
        thursday = (now + timedelta(days=3)).strftime("%Y-%m-%d")   # Thursday 2026-09-10
        friday = (now + timedelta(days=4)).strftime("%Y-%m-%d")     # Friday 2026-09-11
        saturday = (now + timedelta(days=5)).strftime("%Y-%m-%d")   # Saturday 2026-09-12
        sunday = (now + timedelta(days=6)).strftime("%Y-%m-%d")     # Sunday 2026-09-13

        # Balanced schedule across Academic, Work, Physical, Social, Errands
        baseline_tasks = [
            # --- MONDAY (Sept 7) ---
            (
                "task-mon-1",
                DEMO_USER_ID,
                "Machine Learning Lecture",
                "academic",
                "high",
                2.0,
                today,
                "completed",
                "high",
                "low",
                today,
                "09:00",
                "11:00",
                100,
                1
            ),
            (
                "task-mon-2",
                DEMO_USER_ID,
                "Data Structures Quiz prep",
                "academic",
                "medium",
                2.5,
                today,
                "pending",
                "high",
                "medium",
                today,
                "14:00",
                "16:30",
                60,
                0
            ),
            (
                "task-mon-3",
                DEMO_USER_ID,
                "Campus Library Shift",
                "work",
                "high",
                3.5,
                today,
                "pending",
                "medium",
                "low",
                today,
                "17:00",
                "20:30",
                0,
                0
            ),

            # --- TUESDAY (Sept 8) ---
            # Afternoon 12:00-17:00 left clear for demo Smart Capture addition!
            (
                "task-tue-1",
                DEMO_USER_ID,
                "Distributed Systems Tutorial",
                "academic",
                "medium",
                1.5,
                tuesday,
                "pending",
                "medium",
                "low",
                tuesday,
                "10:00",
                "11:30",
                0,
                0
            ),
            (
                "task-tue-2",
                DEMO_USER_ID,
                "Gym Cardio & Core Session",
                "physical",
                "medium",
                1.2,
                tuesday,
                "pending",
                "high",
                "high",
                tuesday,
                "17:30",
                "18:45",
                0,
                0
            ),
            (
                "task-tue-3",
                DEMO_USER_ID,
                "Review AI Research Paper",
                "academic",
                "low",
                1.5,
                tuesday,
                "pending",
                "low",
                "high",
                tuesday,
                "20:00",
                "21:30",
                0,
                0
            ),

            # --- WEDNESDAY (Sept 9) ---
            (
                "task-wed-1",
                DEMO_USER_ID,
                "Software Engineering Lab",
                "academic",
                "high",
                2.0,
                wednesday,
                "pending",
                "high",
                "low",
                wednesday,
                "10:00",
                "12:00",
                0,
                0
            ),
            (
                "task-wed-2",
                DEMO_USER_ID,
                "FYP Literature Review & Analysis",
                "academic",
                "high",
                2.5,
                wednesday,
                "pending",
                "high",
                "low",
                wednesday,
                "14:00",
                "16:30",
                0,
                1
            ),
            (
                "task-wed-3",
                DEMO_USER_ID,
                "Grocery Restock & Household Essentials",
                "errand",
                "medium",
                1.5,
                wednesday,
                "pending",
                "medium",
                "high",
                wednesday,
                "17:30",
                "19:00",
                0,
                0
            ),
            (
                "task-wed-4",
                DEMO_USER_ID,
                "Study Group Dinner & Social Sync",
                "social",
                "medium",
                2.0,
                wednesday,
                "pending",
                "medium",
                "medium",
                wednesday,
                "19:30",
                "21:30",
                0,
                0
            ),

            # --- THURSDAY (Sept 10) ---
            (
                "task-thu-1",
                DEMO_USER_ID,
                "Operating Systems Lecture",
                "academic",
                "high",
                2.0,
                thursday,
                "pending",
                "high",
                "low",
                thursday,
                "09:30",
                "11:30",
                0,
                0
            ),
            (
                "task-thu-2",
                DEMO_USER_ID,
                "Cloud Architecture Case Study",
                "academic",
                "medium",
                2.0,
                thursday,
                "pending",
                "medium",
                "medium",
                thursday,
                "14:00",
                "16:00",
                0,
                0
            ),
            (
                "task-thu-3",
                DEMO_USER_ID,
                "Student Association Tech Sync",
                "social",
                "low",
                1.2,
                thursday,
                "pending",
                "low",
                "high",
                thursday,
                "16:30",
                "17:45",
                0,
                0
            ),
            (
                "task-thu-4",
                DEMO_USER_ID,
                "Apartment Cleaning & Laundry",
                "errand",
                "low",
                1.5,
                thursday,
                "pending",
                "low",
                "high",
                thursday,
                "19:00",
                "20:30",
                0,
                0
            ),

            # --- FRIDAY (Sept 11) ---
            (
                "task-fri-1",
                DEMO_USER_ID,
                "Machine Learning Coding Assignment",
                "academic",
                "high",
                2.5,
                friday,
                "pending",
                "high",
                "low",
                friday,
                "10:00",
                "12:30",
                0,
                0
            ),
            (
                "task-fri-2",
                DEMO_USER_ID,
                "FYP Methodology Drafting",
                "academic",
                "high",
                2.0,
                friday,
                "pending",
                "high",
                "medium",
                friday,
                "14:00",
                "16:00",
                0,
                0
            ),
            (
                "task-fri-3",
                DEMO_USER_ID,
                "Campus Running Club / Outdoor Jog",
                "physical",
                "medium",
                1.2,
                friday,
                "pending",
                "medium",
                "high",
                friday,
                "17:30",
                "18:45",
                0,
                0
            ),
            (
                "task-fri-4",
                DEMO_USER_ID,
                "Weekend Kickoff Dinner with Roommates",
                "social",
                "medium",
                2.0,
                friday,
                "pending",
                "medium",
                "high",
                friday,
                "19:30",
                "21:30",
                0,
                0
            ),

            # --- SATURDAY (Sept 12) ---
            (
                "task-sat-1",
                DEMO_USER_ID,
                "Weekend Library Circulation Desk Shift",
                "work",
                "high",
                4.0,
                saturday,
                "pending",
                "medium",
                "low",
                saturday,
                "10:00",
                "14:00",
                0,
                0
            ),
            (
                "task-sat-2",
                DEMO_USER_ID,
                "Gym Strength & Mobility Training",
                "physical",
                "medium",
                1.5,
                saturday,
                "pending",
                "high",
                "high",
                saturday,
                "15:30",
                "17:00",
                0,
                0
            ),
            (
                "task-sat-3",
                DEMO_USER_ID,
                "Board Game Night with Friends",
                "social",
                "medium",
                2.5,
                saturday,
                "pending",
                "low",
                "high",
                saturday,
                "18:30",
                "21:00",
                0,
                0
            ),

            # --- SUNDAY (Sept 13) ---
            (
                "task-sun-1",
                DEMO_USER_ID,
                "Weekly Meal Prep & Cooking Batch",
                "errand",
                "medium",
                2.0,
                sunday,
                "pending",
                "medium",
                "high",
                sunday,
                "11:00",
                "13:00",
                0,
                0
            ),
            (
                "task-sun-2",
                DEMO_USER_ID,
                "Upcoming Week Schedule Review & Buffer",
                "academic",
                "low",
                1.5,
                sunday,
                "pending",
                "low",
                "high",
                sunday,
                "14:30",
                "16:00",
                0,
                0
            ),
            (
                "task-sun-3",
                DEMO_USER_ID,
                "Nature Walk & Recovery Unwind",
                "physical",
                "low",
                1.2,
                sunday,
                "pending",
                "low",
                "high",
                sunday,
                "17:00",
                "18:15",
                0,
                0
            )
        ]

        await db.executemany(
            """INSERT INTO tasks (
                id, user_id, title, category, priority, estimated_hours,
                deadline, status, energy_required, flexibility,
                scheduled_date, scheduled_start, scheduled_end, progress, is_protected
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            baseline_tasks
        )

        # Baseline checkin
        await db.execute(
            """INSERT INTO checkins (
                id, user_id, date, stress, mood, mental_fatigue, physical_fatigue, sleep_hours, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                "checkin-demo-1",
                DEMO_USER_ID,
                today,
                3, # Moderate stress
                3, # Balanced mood
                3, # Mental fatigue
                3, # Physical fatigue
                6.8, # Sleep hours
                "Feeling steady, but week schedule is starting to build up."
            )
        )

        # Commitments
        commitments = [
            ("comm-1", DEMO_USER_ID, "AI Systems Core Lecture", "academic", "09:00", "11:00", "Monday", "fixed"),
            ("comm-2", DEMO_USER_ID, "Campus Library Shift", "work", "17:00", "20:30", "Monday", "fixed"),
            ("comm-3", DEMO_USER_ID, "Software Engineering Lab", "academic", "10:00", "12:00", "Wednesday", "fixed"),
            ("comm-4", DEMO_USER_ID, "Operating Systems Lecture", "academic", "09:30", "11:30", "Thursday", "fixed"),
            ("comm-5", DEMO_USER_ID, "Weekend Library Circulation Desk Shift", "work", "10:00", "14:00", "Saturday", "fixed")
        ]

        await db.executemany(
            """INSERT INTO commitments (id, user_id, title, category, start_time, end_time, day_of_week, flexibility)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            commitments
        )

        await db.commit()
    finally:
        await db.close()

async def seed_overload_scenario():
    """Adds the 4 hackathon demo tasks that push Alex's load from 68% to 91%"""
    db = await get_db()
    try:
        now = datetime.now()
        thursday = (now + timedelta(days=3)).strftime("%Y-%m-%d")
        wednesday = (now + timedelta(days=2)).strftime("%Y-%m-%d")
        saturday = (now + timedelta(days=5)).strftime("%Y-%m-%d")

        overload_tasks = [
            (
                "task-overload-fyp",
                DEMO_USER_ID,
                "FYP Methodology Final Draft",
                "academic",
                "high",
                4.5,
                thursday,
                "pending",
                "high",
                "low",
                thursday,
                "13:00",
                "17:30",
                15,
                0
            ),
            (
                "task-overload-shift",
                DEMO_USER_ID,
                "Extra Weekend Shift at Cafe",
                "work",
                "high",
                4.5,
                saturday,
                "pending",
                "high",
                "low",
                saturday,
                "14:30",
                "19:00",
                0,
                0
            ),
            (
                "task-overload-bday",
                DEMO_USER_ID,
                "Friend's Birthday Dinner",
                "social",
                "medium",
                3.0,
                wednesday,
                "pending",
                "medium",
                "medium",
                wednesday,
                "19:30",
                "22:30",
                0,
                0
            ),
            (
                "task-overload-groceries",
                DEMO_USER_ID,
                "Grocery Shopping & Meal Prep",
                "errand",
                "medium",
                2.0,
                wednesday,
                "pending",
                "medium",
                "high", # High flexibility!
                wednesday,
                "17:00",
                "19:00",
                0,
                0
            )
        ]

        for t in overload_tasks:
            # Delete if exists to avoid duplicate
            await db.execute("DELETE FROM tasks WHERE id = ?", (t[0],))

        await db.executemany(
            """INSERT INTO tasks (
                id, user_id, title, category, priority, estimated_hours,
                deadline, status, energy_required, flexibility,
                scheduled_date, scheduled_start, scheduled_end, progress, is_protected
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            overload_tasks
        )

        # Clear any previously applied rebalance and un-postpone tasks
        await db.execute("DELETE FROM recommendations WHERE user_id = ? AND type = 'rebalance'", (DEMO_USER_ID,))
        await db.execute("UPDATE tasks SET status = 'pending' WHERE user_id = ? AND status = 'postponed'", (DEMO_USER_ID,))

        await db.commit()
    finally:
        await db.close()
