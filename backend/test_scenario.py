import asyncio
from backend.database.connection import init_db
from backend.database.seed_data import seed_demo_data, seed_overload_scenario
from backend.services.rebalance_engine import generate_rebalance_plan
from backend.services.load_engine import calculate_workload
from backend.services.ai_service import parse_natural_language_task, simulate_whatif
from backend.database.connection import get_db

async def test_full_scenario():
    print("--- 1. Initializing DB and Baseline ---")
    await init_db()
    await seed_demo_data(force=True)

    db = await get_db()
    cur = await db.execute("SELECT * FROM tasks WHERE user_id = 'demo-alex-student-001'")
    tasks = [dict(r) for r in await cur.fetchall()]
    checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = 'demo-alex-student-001'")
    checkin = dict(await checkin_cur.fetchone())

    baseline = calculate_workload(tasks, checkin)
    print(f"Scene 1: Alex Baseline Capacity: {baseline.capacity_score}% ({baseline.status})")

    print("\n--- 2. Testing AI Smart Capture on Demo Sentence ---")
    parsed = await parse_natural_language_task("I need to finish my FYP methodology by Thursday and it will take around 4 hours.")
    print(f"Parsed Title: {parsed.title}")
    print(f"Parsed Category: {parsed.category}")
    print(f"Parsed Hours: {parsed.estimated_hours}")
    print(f"Parsed Deadline: {parsed.deadline}")
    print(f"Parsed Priority: {parsed.priority}")
    assert "FYP" in parsed.title or "Methodology" in parsed.title
    assert parsed.category == "academic"
    assert parsed.estimated_hours == 4.0

    print("\n--- 3. Testing Overload Scenario ---")
    await seed_overload_scenario()
    cur = await db.execute("SELECT * FROM tasks WHERE user_id = 'demo-alex-student-001'")
    overload_tasks = [dict(r) for r in await cur.fetchall()]
    checkin_cur = await db.execute("SELECT * FROM checkins WHERE user_id = 'demo-alex-student-001'")
    checkin_overloaded = dict(await checkin_cur.fetchone())

    overload_workload = calculate_workload(overload_tasks, checkin_overloaded)
    print(f"Scene 3: Overloaded Capacity: {overload_workload.capacity_score}% ({overload_workload.status})")
    assert 85 <= overload_workload.capacity_score <= 98, f"Unexpected overload: {overload_workload.capacity_score}"

    print("\n--- 4. Testing Rebalance Plan Generation ---")
    plan = generate_rebalance_plan(overload_tasks, checkin_overloaded)
    print(f"Before Load: {plan.before_load}%")
    print(f"After Load: {plan.after_load}% (Reduction: {plan.load_reduction}%)")
    print(f"Actions generated: {len(plan.recommendations)}")
    for r in plan.recommendations:
        print(f"  [{r.type.upper()}] {r.title}: {r.details}")
    assert plan.load_reduction >= 12
    assert plan.after_load <= 78

    print("\n--- 5. Testing What-If Simulation ---")
    whatif = await simulate_whatif("Can I accept another part-time shift on Saturday?", plan.after_load)
    print(f"Question: {whatif.question}")
    print(f"Current: {whatif.current_load}% -> With shift: {whatif.projected_load_unbalanced}%")
    print(f"Analysis: {whatif.impact_analysis}")
    print(f"Recommendation: {whatif.recommendation}")
    assert whatif.projected_load_unbalanced > whatif.current_load

    await db.close()
    print("\nALL VERIFICATIONS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_full_scenario())
