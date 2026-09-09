# LUMORA — AI Workload & Recovery Autopilot

> **A Burnout Autopilot, Not Another To-Do List.**
>
> *"Most productivity apps help students fit more into their schedules. Lumora helps them know when they shouldn't."*

---

## 1. Product Overview

**Lumora** is a web application designed specifically for university students juggling academic workloads, part-time jobs, social lives, errands, and physical health.

Unlike traditional task managers and calendars that push users to maximize output, Lumora functions as a **burnout autopilot**:
1. **Understands what the student is carrying** across mental, academic, physical, social, and everyday errand demands.
2. **Quantifies combined load** using a deterministic, explainable 0–100% capacity engine.
3. **Detects impending overload** before burnout occurs.
4. **Rebalances flexible commitments** (moving groceries, reducing workout durations, postponing optional meetups, and shielding deep study blocks).
5. **Protects recovery** by giving students explicit permission to downshift without shame or guilt.
6. **Simulates What-If decisions** before students say "yes" to new shifts or projects.

---

## 2. Core Product Loop

```text
Capture → Understand Load → Detect Overload → Rebalance → Recover → Learn
```

---

## 3. Technology Stack

- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4 + Recharts + Canvas Confetti + Lucide Icons
- **Backend**: FastAPI (Python 3.13) + Uvicorn + Pydantic v2
- **Database**: SQLite (built-in async zero-friction persistence via `aiosqlite`, with Supabase/PostgreSQL compatibility)
- **AI Engine**: Gemini API (`google-genai`) with an offline-resilient heuristic NLP fallback parser

---

## 4. Quick Start Guide

### Start Both Frontend & Backend (One-Click)
Double-click `start_lumora.bat` or run:
```powershell
# Terminal 1: Backend
python backend_server.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 5. Hackathon Demo Scenario (Alex Chen)

Lumora is pre-configured with a realistic fictional university student profile (**Alex Chen**).

### The 7-Step Narrative Flow:
1. **Scene 1 (Baseline)**: Open `http://localhost:5173` and click **"Launch Live Demo"** (or **"Continue as Alex Chen"**). Alex begins Monday at a manageable **65%–68% capacity**.
2. **Scene 2 (Smart Capture)**: Click **"Smart Capture"** and type naturally:
   > *"I need to finish my FYP methodology by Thursday and it will take around 4 hours."*
   The AI extracts: Title (`FYP methodology`), Category (`academic`), Est. Hours (`4.0h`), Deadline (`Thursday`), and Priority (`high`). Click **"Add to my week"**.
3. **Scene 3 (Overload Arrives)**: Add additional commitments or click **"Simulate 91% Overload"** in the demo toolbar. Capacity jumps to **90%–91% ("Very high load")** with plain-language explanation:
   > *"Academic responsibilities and part-time work shifts are converging closely this week."*
4. **Scene 4 (AI Load Balancer)**: Click **"Rebalance My Week"**. The system proposes 4 non-destructive adjustments:
   - 🛒 **MOVE**: Grocery shopping & errands → Sunday
   - 🏋️ **REDUCE**: Gym workout → 30m focused recovery session
   - 📚 **PROTECT**: FYP methodology focus block on Tuesday evening
   - 👥 **POSTPONE**: Optional social dinner to next weekend
5. **Scene 5 (Accept Changes)**: Click **"Accept Changes"**.
   - Before: **91%**
   - After: **73%**
   - **↓ 18% projected load reduction** with confetti celebration!
6. **Scene 6 (Recovery Sanctuary)**: Navigate to `/recovery`:
   - *"YOU'VE DONE ENOUGH TODAY. Your mental load is high. Take 30 minutes."*
   - Guided restorative protocols (Screen-free reset, sleep wind-down, fresh air walk, ambient soundscapes).
   - Interactive box breathing widget (4s inhale • 4s hold • 4s exhale).
7. **Scene 7 (What-If Simulator)**: Navigate to `/whatif`:
   - User asks: *"Can I accept another part-time shift on Saturday?"*
   - Instant calculation: Current 73% vs With Shift 89%.
   - Explores Option A (89%), Option B (76%), Option C (72%) with strategic tradeoffs.

---

## 6. Key Low-Stress UX Principles

- **Aggressive Whitespace**: Breathable cards, generous margins, no claustrophobic corporate tables.
- **The Rule of 3**: The dashboard presents only the top 3 most important commitments for today. Secondary items are accessible behind *"View All"*.
- **Progress Over Deadlines**: Tasks feature completion bars (`80% complete`) rather than screaming red countdown timers.
- **Soft Geometry**: 20px+ rounded borders, subtle gradients, and serene emerald/teal/slate color palettes.
- **Non-Clinical Language**: The system assesses load with *"Your load appears high"*, strictly avoiding medical diagnostic claims like *"You have burnout"*.
