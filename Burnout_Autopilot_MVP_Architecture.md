# Burnout Autopilot — Hackathon MVP Blueprint

## 1. Product Concept

### Working positioning

> **A Burnout Autopilot, Not Another To-Do List.**

Most productivity apps help students fit more things into their schedules. This product helps them know **when they should not be doing more**.

The system gives university students a clear picture of their combined load across:

- 🧠 Mental
- ⏰ Time / Academic
- 🏃 Physical
- 👥 Social
- 🛒 Errands

It does not simply track and report. It:

1. Understands what the student is carrying.
2. Quantifies their current capacity/load.
3. Explains what is contributing to overload.
4. Rebalances flexible tasks and commitments.
5. Protects recovery time.
6. Lets the student simulate "what if?" decisions.

### Core product loop

**Capture → Understand Load → Detect Overload → Rebalance → Recover → Learn**

---

# 2. Why This Fits the Judging Rubric

The judging rubric allocates:

- **Ideation — 25%**
- **Creativity and Novelty — 15%**
- **Feasibility — 15%**
- **Presentation — 15%**
- **Design — 10%**
- **Impact — 20%**

The solution should therefore be designed not only as a functional application, but also as a strong story.

The rubric rewards:

- A well-structured mindmap/problem tree/user-flow.
- Documented iteration and idea evolution.
- Meaningful mentor feedback integration.
- Several ideas being explored and compared.
- A fresh angle and distinctive features.
- A realistic and achievable technical stack.
- A concrete build plan.
- An end-to-end core flow.
- Strong usability and visual consistency.
- A clear target user and meaningful before/after impact.

### Recommended ideation story

Document an evolution such as:

```text
IDEA 1
Simple Stress Tracker
        ↓
Problem:
Only reports stress.
Doesn't help students act.

        ↓

IDEA 2
AI Task Manager
        ↓
Problem:
Too similar to existing productivity apps.

        ↓

IDEA 3
Workload Visualiser
        ↓
Problem:
Shows overload but doesn't solve it.

        ↓

FINAL
AI Workload Autopilot
        ↓
Detect → Explain → Rebalance → Recover
```

Keep screenshots, sketches, discarded ideas, mentor feedback, and design changes as evidence during the hackathon.

---

# 3. Target User

## Primary target

University students juggling multiple types of responsibilities, such as:

- Assignments and projects
- Lectures and study
- Part-time work
- Social commitments
- Exercise
- Household responsibilities
- Errands
- Rest and recovery

The key problem is not necessarily one extremely difficult task.

It is the **accumulation of many individually manageable responsibilities**.

---

# 4. Core Problem

Students often do not know how much they are carrying at a given moment.

They may:

- Keep saying yes to commitments.
- Prioritise only urgent tasks.
- Postpone recovery.
- Underestimate physical and mental fatigue.
- Treat all tasks as equally important.
- Discover overload only after they are already exhausted.

The product therefore asks:

> **"How much are you carrying, and what can we safely change?"**

rather than only:

> "What tasks do you have?"

---

# 5. Product Differentiation

### Key positioning

> **Most productivity apps help students fit more into their schedules. We help them know when they shouldn't.**

Traditional productivity tools optimise task completion.

This product optimises **capacity and recovery**.

### Signature features

1. **Workload Capacity Score**
   - Shows overall load as a simple percentage.
   - Example: `91% capacity`.

2. **Load Breakdown**
   - Shows where the load is coming from.
   - Academic, work, social, physical, errands, etc.

3. **Smart Capture**
   - Student types naturally.
   - AI extracts task information.

4. **AI Load Explanation**
   - Explains why the student is overloaded in plain language.

5. **Load Balancer**
   - Suggests moving, reducing, postponing, or protecting tasks.
   - Student explicitly accepts or declines every recommendation.

6. **Recovery Engine**
   - Suggests rest, sleep, outdoor activity, social connection, or downtime.

7. **What-If Simulator**
   - Lets students test decisions before committing.
   - Example: "Can I accept another Saturday shift?"

8. **Before → After Rebalancing**
   - Example:
   - `91% → 73% projected load`

---

# 6. Recommended End-to-End Architecture

```text
                         ┌──────────────────────┐
                         │       STUDENT        │
                         │                      │
                         │ Tasks / Schedule     │
                         │ Mood / Stress        │
                         │ Sleep / Physical     │
                         │ Social / Errands     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      REACT WEB APP   │
                         │                      │
                         │ Landing              │
                         │ Login / Signup       │
                         │ Dashboard            │
                         │ Academic             │
                         │ Mood                 │
                         │ Physical             │
                         │ Social / Errands     │
                         │ Add Task             │
                         │ Recommendation       │
                         │ Rebalance            │
                         │ Recovery             │
                         └──────────┬───────────┘
                                    │
                              REST API / JSON
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       FASTAPI        │
                         │       BACKEND        │
                         │                      │
                         │ Task Management      │
                         │ Load Calculation     │
                         │ Risk Engine          │
                         │ Rebalance Engine     │
                         │ Recovery Engine      │
                         │ AI Service           │
                         └──────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
       ┌────────────────┐  ┌─────────────────┐  ┌────────────────┐
       │ Supabase /     │  │ LLM API         │  │ Rule Engine    │
       │ PostgreSQL     │  │                 │  │                │
       │                │  │ Smart Capture   │  │ Load Score     │
       │ Users          │  │ Explanations    │  │ Risk Levels    │
       │ Tasks          │  │ Recommendations │  │ Rebalancing    │
       │ Check-ins      │  │                 │  │ Recovery       │
       └────────────────┘  └─────────────────┘  └────────────────┘
```

---

# 7. Recommended Technology Stack

| Layer | Recommended Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Web application |
| Styling | Tailwind CSS | Fast, consistent UI |
| Charts | Recharts | Load visualisation |
| Backend | FastAPI / Python | REST API and business logic |
| Database | Supabase / PostgreSQL | Persistent data |
| Authentication | Supabase Auth | Login/signup |
| AI | LLM API | Natural-language understanding and recommendations |
| Deployment | Vercel + Render/Railway + Supabase | Hosting |
| Data format | JSON | API communication |
| Architecture | REST API | Frontend/backend communication |

This stack is intentionally simple and realistic for a hackathon.

---

# 8. End-to-End Pipeline

```text
USER INPUT
    │
    ▼
Capture Lifestyle Data
    │
    ├── Academic / Tasks
    ├── Schedule
    ├── Mood / Stress
    ├── Physical / Sleep
    └── Social / Errands
    │
    ▼
Normalize Activities
    │
    ▼
Workload Engine
    │
    ├── Time Load
    ├── Mental Load
    ├── Physical Load
    ├── Social Load
    ├── Errand Load
    └── Recovery Score
    │
    ▼
Capacity / Load Score
    │
    ├── 0–39  = Low
    ├── 40–69 = Moderate
    ├── 70–84 = High
    └── 85–100 = Very High
    │
    ▼
Overload Detection
    │
    ├───────────────┐
    ▼               ▼
Rebalance        Recovery
Engine           Engine
    │               │
    └───────┬───────┘
            ▼
      AI Explanation
            │
            ▼
      Recommendation
            │
       ┌────┴────┐
       ▼         ▼
    ACCEPT     DECLINE
       │
       ▼
Apply changes
       │
       ▼
Recalculate load
       │
       ▼
Show before → after
       │
       ▼
Student feedback
       │
       └──────────→ repeat
```

---

# 9. Do We Need to Train an AI Model?

## Short answer: No.

A custom machine-learning model is **not necessary for the MVP**.

In fact, it is better not to train one during the hackathon because:

- You probably do not have enough representative student burnout data.
- A trained model could make questionable claims about burnout.
- It would take time away from building the actual product.
- The judges reward technical feasibility and realistic scope.

### Recommended AI architecture

Use:

**Deterministic rule engine → objective workload score**

and:

**LLM → natural-language understanding + explanation + recommendations**

This keeps the numerical system explainable.

### Strong technical explanation for judges

> "Our system uses an explainable workload engine to quantify a student's combined load, while an LLM provides natural-language task extraction, contextual explanations, and personalised recommendations."

Do NOT say:

> "ChatGPT calculates the student's burnout score."

The system should calculate the score.

The AI should help interpret and communicate it.

---

# 10. Workload Engine

A simple MVP formula can be:

```text
Total Load =
    Time Load
  + Mental Load
  + Physical Load
  + Social Load
  + Errand Load
  - Recovery Score
```

Normalise the result to a `0–100` capacity scale.

Example:

```text
Academic tasks       35
Part-time work       20
Social commitments   10
Physical fatigue     12
Errands               8
Poor sleep            10
Recovery              -5
-------------------------
TOTAL                90
```

Result:

> 🔴 90% capacity

The exact weights can be tuned during testing.

The key design principle is that the score should be **explainable**.

---

# 11. Input Data

Keep onboarding and daily input lightweight.

## Mental

- Stress level: 1–5
- Mood: 1–5
- Mental fatigue: 1–5

## Time / Academic

Tasks and commitments:

```json
{
  "task": "Complete FYP report",
  "category": "academic",
  "duration": 4,
  "deadline": "2026-09-10",
  "priority": "high"
}
```

## Physical

- Sleep hours
- Exercise
- Physical fatigue

## Social

- Events
- Hangouts
- Group commitments

## Errands

- Laundry
- Groceries
- Cleaning
- Transportation

---

# 12. AI Feature 1 — Smart Capture

The user should not have to fill in many fields.

They can type:

> "I need to finish my FYP methodology by Thursday and it probably takes around 4 hours."

The AI extracts:

```json
{
  "task": "FYP methodology",
  "category": "academic",
  "estimated_hours": 4,
  "deadline": "Thursday",
  "priority": "high"
}
```

The user reviews the result before saving.

### UI

```text
What's on your mind?

┌──────────────────────────────────┐
│ I need to finish my FYP...       │
└──────────────────────────────────┘

             [ Add ]

AI understands:

📚 FYP Methodology
⏱ ~4 hours
🔴 High priority
📅 Due Thursday

[ Add to my week ]
```

---

# 13. AI Feature 2 — Personalised Load Explanation

If the workload engine calculates:

```text
Load = 87%
```

the structured data can be passed to the LLM.

The AI generates something like:

> **You're running at 87% capacity.**
>
> Your academic workload is the main contributor this week, while your sleep has also dropped below your normal level.
>
> I'd recommend protecting your Thursday evening for recovery and moving your lower-priority errands to Sunday.

The LLM should explain the system's findings rather than inventing the underlying score.

---

# 14. AI Feature 3 — Load Balancer

This should be one of the main hero features.

Example schedule:

```text
MONDAY
├── Lecture
├── FYP 2h
├── Part-time work 4h
└── Gym

TUESDAY
├── Assignment
├── Group meeting
└── Grocery shopping

WEDNESDAY
├── FYP
├── Quiz
└── Friend's birthday
```

System detects:

> ⚠️ Wednesday is overloaded.

Recommendation:

```text
MOVE
🛒 Grocery shopping
Wednesday → Sunday

REDUCE
🏋️ Gym
60 min → 30 min

PROTECT
📚 FYP
2-hour uninterrupted block

POSTPONE
👥 Optional meetup
```

Projected result:

```text
Before: 91%

After: 73%

↓ 18% projected load
```

---

# 15. Recommendation Engine Interaction

The recommendation engine should appear **after the user adds a new task and the system receives the task input**.

### Flow

```text
User
  ↓
Add new task
  ↓
AI parses task
  ↓
Task added to temporary schedule
  ↓
Workload engine recalculates
  ↓
Overload detected?
  │
  ├── NO → Save normally
  │
  └── YES
        ↓
Recommendation Engine
        ↓
Suggest changes
        ↓
┌───────────────────────┐
│ Your week is becoming │
│ overloaded.           │
│                       │
│ We recommend:         │
│                       │
│ • Move groceries      │
│ • Reduce gym          │
│ • Protect FYP block   │
└───────────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
ACCEPT     DECLINE
   │         │
   ▼         ▼
Apply      Keep original
changes    schedule
   │
   ▼
Recalculate
   │
   ▼
Show new projected load
```

### Important UX rule

**Never silently alter a student's schedule.**

Every recommendation should have:

- `Accept`
- `Decline`

The user remains in control.

---

# 16. Recovery Engine

The app should not turn recovery into another productivity task.

When overloaded:

```text
YOU'VE DONE ENOUGH TODAY.

Your mental load is high.

Take 30 minutes.

🌿 Go outside
🎧 Listen to music
🚶 Take a short walk
💬 Talk to someone
😴 Prepare for sleep

[ Start Recovery ]
```

### Example rules

High mental load:

> 🧠 Mental Reset  
> You've had several high-focus tasks today. Consider 20 minutes away from screens.

Low sleep + high physical load:

> 🏃 Physical Recovery  
> You've had a demanding day and limited sleep. Consider reducing intense activity tonight.

High social load:

> 👥 Social Battery  
> You have several social commitments this week. Consider protecting one evening for yourself.

Low activity / possible isolation pattern:

> 💬 Connection  
> You've had several low-activity days. Consider having dinner or taking a walk with someone you trust.

Avoid diagnostic language.

The system should say **"your load appears high"**, not **"you have burnout"**.

---

# 17. What-If Simulator

A standout feature.

The student asks:

> "Can I accept another part-time shift on Saturday?"

The system simulates the additional commitment.

```text
CURRENT

🟢 68% capacity

        ↓

WITH EXTRA SHIFT

🔴 89% capacity
```

Then:

> Your Saturday becomes your highest-load day.

The system can test alternatives:

```text
Option A
Accept shift
Projected load: 89%

Option B
Move Sunday errands → Monday
Projected load: 76%

Option C
Reduce another flexible commitment
Projected load: 72%
```

This changes the product from a tracker into a **decision-support system**.

---

# 18. Frontend Page Structure

The requested UX flow should be:

```text
Landing Page
     ↓
Login / Signup
     ↓
Dashboard
     ↓
Category Pages
     ├── Academic
     ├── Mood
     ├── Physical
     └── Social / Errands
     ↓
Current Timetable / To-Do List
     ↓
Add New Task
     ↓
AI Recommendation Engine
     ↓
Accept / Decline
     ↓
Updated Schedule
     ↓
Recovery Suggestions
```

---

# 19. Page 1 — Landing Page

Purpose:

Immediately explain the product without overwhelming the user.

Suggested headline:

> **Know Your Load. Protect Your Energy.**

Supporting copy:

> A smarter way for students to balance study, work, life and recovery before everything becomes too much.

Primary CTA:

> **Get Started**

Secondary CTA:

> **See How It Works**

Visual direction:

- Large whitespace
- Soft rounded cards
- Simple capacity visualisation
- Calm animations
- Minimal text

---

# 20. Page 2 — Login / Signup

For first-time users:

```text
Welcome back 👋

Email
[________________]

Password
[________________]

[ Log In ]

──────── or ────────

[ Continue with Google ]

Don't have an account?
Create one
```

Signup:

```text
Let's make your week lighter.

Name
Email
Password

[ Create Account ]
```

Keep the authentication experience simple.

---

# 21. Page 3 — Dashboard

The dashboard should be the main home screen.

Example:

```text
Good evening, Alex 👋

YOUR CURRENT CAPACITY

        82%

████████████████░░░░

⚠️ High load

--------------------------------

WHERE YOUR LOAD COMES FROM

Academic       █████████░  42%
Work           ████░░░░░░  18%
Social         ███░░░░░░░  12%
Physical       ████░░░░░░  15%
Errands        ██░░░░░░░░   8%

--------------------------------

TODAY

1. 📚 Finish FYP methodology
2. 📝 Prepare presentation
3. 👥 Group meeting

[ View All ]

--------------------------------

✨ SUGGESTED ACTION

Move grocery shopping from
Wednesday → Sunday

[ Rebalance My Week ]
```

---

# 22. Dashboard Navigation

Have clear buttons/cards for:

### 📚 Academic

Contains:

- Tasks
- Assignments
- Projects
- Deadlines
- Study schedule
- Academic load

### 🧠 Mood

Contains:

- Stress check-in
- Mood
- Mental fatigue
- Historical trend

### 🏃 Physical

Contains:

- Sleep
- Exercise
- Physical fatigue
- Recovery status

### 👥 Social

Contains:

- Social commitments
- Hangouts
- Events
- Social load

### 🛒 Errands

Contains:

- Groceries
- Laundry
- Cleaning
- Household tasks

---

# 23. Current Timetable / To-Do List

The home screen should NOT show the student's entire semester.

Use:

## The Rule of 3

Show only the **top 3 most important things for today**.

Example:

```text
TODAY

09:00
📚 Lecture

12:30
🍴 Lunch

14:00
📚 FYP Methodology
████████░░ 80%

17:00
💼 Part-time shift

20:00
🌿 Recovery
```

Everything else:

> **View All**

This prevents the dashboard from becoming another source of anxiety.

---

# 24. Low-Stress UI/UX Principles

The application should visually communicate:

> **"You are safe to slow down."**

rather than:

> **"You have more things to complete."**

## 24.1 Aggressive Whitespace

Stress can make interfaces feel claustrophobic.

Use:

- Generous padding
- Large margins
- Clear separation between cards
- Limited information per screen
- Plenty of breathing room

---

## 24.2 The Rule of 3

Do not show the entire semester's workload on the home screen.

Show:

> **Top 3 things today**

Everything else stays behind:

> **View All**

---

## 24.3 Progress Over Deadlines

Avoid giant red countdown clocks.

Instead of:

> 🔴 ONLY 3 HOURS LEFT!!!

use:

> FYP Methodology  
> ████████░░ 80% complete

Frame tasks around:

**completion**

rather than:

**time running out.**

---

## 24.4 Soft Geometry

Use:

- Rounded cards
- Rounded buttons
- Soft containers
- Friendly typography

Suggested CSS direction:

```css
border-radius: 16px;
```

or larger for hero cards.

Avoid overly rigid, corporate-looking layouts.

---

## 24.5 Micro-interactions

When a task is completed:

- Smooth transition
- Progress bar animation
- Small celebratory animation
- Optional subtle confetti
- Card moves into completed state

The interaction should feel rewarding without becoming distracting.

---

# 25. Visual Design Direction

Recommended visual personality:

### Calm + modern + student-friendly

Use:

- Light backgrounds
- Soft neutral surfaces
- One primary accent
- Subtle status colours only when necessary
- Large typography
- Rounded cards
- Gentle shadows
- Minimal borders
- Clear hierarchy

Avoid:

- Dense dashboards
- Excessive red
- Flashing warnings
- Too many graphs
- Tiny text
- Too many notifications
- Aggressive countdown timers

### Important distinction

Red should mean:

> **"Pay attention."**

not:

> **"You are failing."**

---

# 26. Backend Modules

Suggested FastAPI structure:

```text
backend/
│
├── main.py
│
├── api/
│   ├── tasks.py
│   ├── checkins.py
│   ├── dashboard.py
│   ├── recommendations.py
│   └── rebalance.py
│
├── services/
│   ├── load_engine.py
│   ├── burnout_engine.py
│   ├── recovery_engine.py
│   ├── rebalance_engine.py
│   └── ai_service.py
│
├── models/
│   ├── task.py
│   ├── checkin.py
│   └── user.py
│
└── database/
    └── connection.py
```

---

# 27. Database Design

Keep the MVP database simple.

## users

```text
user_id
name
email
created_at
```

## tasks

```text
task_id
user_id
title
category
priority
estimated_hours
deadline
status
energy_required
```

## checkins

```text
checkin_id
user_id
date
stress
mood
mental_fatigue
physical_fatigue
sleep_hours
```

## commitments

```text
commitment_id
user_id
title
category
start_time
end_time
flexibility
```

## recommendations

```text
recommendation_id
user_id
type
message
priority
accepted
created_at
```

---

# 28. API Design

Example endpoints:

```text
POST /auth/signup
POST /auth/login

GET  /dashboard

GET  /tasks
POST /tasks
PUT  /tasks/{id}
DELETE /tasks/{id}

POST /checkins
GET  /checkins/history

POST /ai/parse-task

GET  /load/current
GET  /load/breakdown

POST /recommendations/generate
POST /recommendations/{id}/accept
POST /recommendations/{id}/decline

POST /rebalance/simulate
POST /rebalance/apply

GET /recovery/recommendations
```

---

# 29. Recommended AI Architecture

```text
                  USER
                    │
                    ▼
          Natural Language Input
                    │
                    ▼
              ┌──────────┐
              │   LLM    │
              └────┬─────┘
                   │
             Structured Data
                   │
                   ▼
        ┌─────────────────────┐
        │   WORKLOAD ENGINE   │
        │                     │
        │ Time                │
        │ Mental              │
        │ Physical            │
        │ Social              │
        │ Errands             │
        │ Recovery            │
        └──────────┬──────────┘
                   │
                   ▼
             LOAD = 87%
                   │
          ┌────────┴────────┐
          ▼                 ▼
     Rebalance           Recovery
      Engine              Engine
          │                 │
          └────────┬────────┘
                   ▼
                  LLM
                   │
                   ▼
         Personalised Advice
```

---

# 30. MVP Feature Priorities

## P0 — Must Work

1. Landing page
2. Login/signup
3. Dashboard
4. Task input
5. Lifestyle check-in
6. Workload calculation
7. Load visualisation
8. AI task parsing
9. Recommendation engine
10. Accept/Decline recommendation
11. Schedule update
12. Recovery recommendation

## P1 — If Time Allows

13. What-if simulator
14. Historical load graph
15. Weekly AI summary
16. Daily recovery reminder
17. Better recommendation personalisation

## P2 — Avoid During MVP

18. Wearable integration
19. Apple Health integration
20. Google Calendar integration
21. Custom ML training
22. Computer vision
23. Full native mobile app
24. Social network
25. Real-time physiological monitoring

---

# 31. Suggested Demo Story

Build the demo around **one student's week**.

## Scene 1 — Monday

Student opens the app.

```text
🟢 68% capacity
```

Everything looks manageable.

## Scene 2 — Add commitments

Student adds:

> "FYP methodology due Thursday."

> "Part-time shift Saturday."

> "Friend's birthday Wednesday."

> "Need to buy groceries."

The AI automatically categorises the inputs.

## Scene 3 — Overload appears

Dashboard changes:

```text
🔴 91% capacity
```

System explains:

> Your academic workload and social commitments are colliding this week.

## Scene 4 — Rebalance

Student taps:

> **Rebalance My Week**

System suggests:

```text
✓ Move groceries → Sunday
✓ Reduce gym → 30 minutes
✓ Protect FYP Tuesday evening
✓ Postpone optional meetup
```

Projected:

```text
91% → 73%
```

Student presses:

> **Accept Changes**

## Scene 5 — Recovery

System says:

> **You've been operating at high capacity for 3 days.**

> Tonight isn't another task to complete.

> 🌿 Take 30 minutes outside.

## Scene 6 — What-If

Student asks:

> "Can I accept another shift?"

System:

```text
Current:       73%
With shift:    88%
```

Then:

> Possible, but your Saturday becomes your highest-load day.

This demonstrates the complete loop:

**Capture → Detect → Explain → Rebalance → Recover → Simulate**

---

# 32. Strong Presentation Message

Use this as the central pitch:

> **"Most productivity apps help students fit more into their schedules. We help them know when they shouldn't."**

Then explain:

> Our system combines academic, work, physical, social and everyday responsibilities into one workload picture. When the student's capacity becomes too high, we don't simply warn them. We recommend specific changes, let them accept or decline those changes, and protect recovery time.

---

# 33. Technical Explanation for Judges

If asked why you did not train an ML model:

> "For the MVP, we chose an explainable workload engine instead of training a custom burnout model because reliable burnout prediction would require a much larger and more representative dataset. Our system calculates the workload using transparent rules, while AI is used where it adds the most value: understanding natural-language tasks, explaining workload patterns, and generating contextual recommendations."

If asked where the AI is:

> "AI is used in Smart Capture, personalised explanations, and recommendation generation. The numerical capacity score remains deterministic and explainable."

If asked whether the app diagnoses burnout:

> "No. This is a wellbeing and workload-awareness tool, not a clinical diagnostic system."

---

# 34. Why This Is Stronger Than a Simple Stress Tracker

A stress tracker:

```text
Stress = 8/10
```

does not necessarily answer:

> What should I do?

This product:

```text
Load = 91%

Main contributors:
Academic +18
Work +14
Poor sleep +12

Recommended:
Move groceries
Reduce gym
Protect FYP block
Take recovery time

Projected:
91% → 73%
```

The system therefore moves from:

**TRACKING**

to:

**ACTION**

That is the core product value.

---

# 35. Final Product Model

The complete product can be represented as:

```text
                  ┌──────────────────┐
                  │     STUDENT      │
                  └────────┬─────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   CAPTURE   │
                    │             │
                    │ Tasks       │
                    │ Schedule    │
                    │ Mood        │
                    │ Sleep       │
                    │ Social      │
                    │ Errands     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  UNDERSTAND │
                    │             │
                    │ AI parses   │
                    │ natural     │
                    │ language    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   MEASURE   │
                    │             │
                    │ Load Engine │
                    │ 0–100       │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   DETECT    │
                    │             │
                    │ Overload?   │
                    └──────┬──────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   RECOMMENDATION       │
              │                        │
              │ Move                   │
              │ Reduce                 │
              │ Postpone               │
              │ Protect                │
              └───────────┬────────────┘
                          │
                    ┌─────┴─────┐
                    ▼           ▼
                 ACCEPT       DECLINE
                    │           │
                    ▼           ▼
                 APPLY       KEEP PLAN
                    │
                    ▼
              ┌─────────────┐
              │   RECOVER   │
              │             │
              │ Rest        │
              │ Sleep       │
              │ Walk        │
              │ Connect     │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  WHAT-IF    │
              │             │
              │ Test next   │
              │ decision    │
              └──────┬──────┘
                     │
                     └──────────→ REPEAT
```

---

# 36. One-Sentence Product Definition

> **An AI-powered workload autopilot that helps university students understand what is draining their capacity, rebalance flexible commitments, and protect recovery before overload becomes burnout.**

---

# 37. Core MVP in One Line

> **Don't just tell students they're overwhelmed — show them what is causing it, help them change it, and give them permission to recover.**
