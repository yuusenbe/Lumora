# Lumora — Product Requirements Document (PRD)

## 1. Project Scope & Goals

### 1.1 Mission Statement
> **"Most productivity apps help students fit more into their schedules. Lumora helps them know when they shouldn't."**

Lumora is a burnout prevention autopilot built specifically for university students. It quantifies combined academic, professional, mental, physical, social, and everyday lifestyle demands into a unified capacity score, proactively preventing overload and protecting recovery.

### 1.2 Target Personas
- **Primary Persona: Alex Chen (University Senior)**
  - *Context*: Juggling a Final Year Project (FYP), part-time job shifts, commuting, workouts, and social obligations.
  - *Pain Point*: Saying "yes" to commitments without realizing cumulative fatigue until crashing.
  - *Goal*: Maintain good grades and income without sacrificing sleep and mental wellbeing.

---

## 2. User Roles & Access

| Role | Permissions | Use Case |
|---|---|---|
| **Demo Student (Alex Chen)** | Full access with pre-seeded realistic scenario data, one-click demo triggers. | Hackathon evaluation, live walkthroughs, testing. |
| **Authenticated Student** | Full access to personal private schedule, check-ins, tasks, and sanctuary. | Real-world continuous daily use. |
| **Guest / Visitor** | Read-only access to public landing page and interactive sandbox. | Discovering product value. |

---

## 3. Functional Requirements

### Epic 1: Natural Language Smart Capture & Intelligent Placement
- **FR-1.1**: The system MUST accept natural-language text strings describing tasks.
- **FR-1.2**: The parser MUST extract: `Title`, `Category` (`academic`, `work`, `physical`, `social`, `errand`), `Estimated Hours`, `Deadline`, `Priority`, and `Flexibility`.
- **FR-1.3**: The system MUST recommend clash-free time slots based on existing schedule density.
- **FR-1.4**: Users MUST be able to review and modify extracted fields before saving.

### Epic 2: Workload Capacity & Overload Engine
- **FR-2.1**: The system MUST compute a composite Workload Capacity Score between $0\%$ and $100\%$.
- **FR-2.2**: The engine MUST categorize load into four discrete tiers:
  - $0–39\%$: Low load (Green)
  - $40–69\%$: Moderate load (Sage Green)
  - $70–84\%$: High load (Warm Sand Amber)
  - $85–100\%$: Very High load (Muted Rose)
- **FR-2.3**: The system MUST generate a plain-language explanation of primary load drivers without clinical or diagnostic phrasing.

### Epic 3: Autonomous Schedule Rebalancing
- **FR-3.1**: When capacity reaches $\ge 70\%$, the system MUST generate an actionable rebalancing plan.
- **FR-3.2**: The rebalance engine MUST generate up to 4 non-destructive adjustments:
  - **Move**: Shift flexible errands to low-density days.
  - **Reduce**: Shorten workouts into focused active recovery.
  - **Protect**: Shield high-priority academic blocks from interruptions.
  - **Postpone**: Reschedule flexible social events past deadlines.
- **FR-3.3**: The system MUST NOT modify a user's calendar without explicit user confirmation (`Accept Changes`).

### Epic 4: The "Anti-Streak" (Balance Sanctuary) & Living Plant
- **FR-4.1**: The system MUST track consecutive days spent within the sustainable capacity zone ($40\%–80\%$).
- **FR-4.2**: If capacity exceeds $80\%$, the system MUST **freeze** the streak rather than resetting it to zero.
- **FR-4.3**: The UI MUST visually represent habit progress through a living plant model ($\text{Sprout} \rightarrow \text{Foliage} \rightarrow \text{Bonsai}$).
- **FR-4.4**: Completing recovery sessions or accepting rebalances MUST award plant growth points.

### Epic 5: Guilt-Free Task Postponing (Anti-Fake Ticking)
- **FR-5.1**: Every active task row MUST provide a dedicated **`Push to Tomorrow`** action.
- **FR-5.2**: Postponing a task MUST NOT trigger red overdue warnings or negative visual states.
- **FR-5.3**: Postponing MUST display positive reinforcement affirming energy boundary preservation.

### Epic 6: Recovery Sanctuary & Guided Downshifting
- **FR-6.1**: The system MUST generate context-aware recovery recommendations based on check-in fatigue metrics.
- **FR-6.2**: The recovery page MUST provide an interactive 12-second rhythm Box Breathing visualizer ($4\text{s Inhale} \cdot 4\text{s Hold} \cdot 4\text{s Exhale}$).
- **FR-6.3**: Users MUST be able to start and complete timed restorative sessions with celebratory completion feedback.

### Epic 7: What-If Decision Simulator
- **FR-7.1**: Users MUST be able to query hypothetical workload additions (e.g., *"Can I take a Saturday shift?"*).
- **FR-7.2**: The simulator MUST calculate projected load, highlight peak congestion days, and output comparative trade-off options.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Latency
- **NFR-1.1**: Deterministic workload capacity calculations MUST execute within $< 50\text{ms}$.
- **NFR-1.2**: AI Smart Capture extraction MUST respond within $< 1.8\text{s}$ under active LLM connection, and $< 30\text{ms}$ under heuristic fallback.
- **NFR-1.3**: Frontend initial page render MUST complete within $< 1.0\text{s}$.

### 4.2 Reliability & Availability
- **NFR-2.1**: The application MUST remain fully functional offline using local heuristics if external AI APIs are unreachable.
- **NFR-2.2**: Database write transactions MUST be atomic to prevent schedule corruption.

### 4.3 Low-Stress UX & Accessibility Standards
- **NFR-3.1**: Color contrast ratios MUST meet **WCAG 2.1 AA** standards.
- **NFR-3.2**: Interfaces MUST adhere to the **Rule of 3** on primary dashboard overviews to prevent cognitive fatigue.
- **NFR-3.3**: Red status indicators MUST communicate *"Pay Attention"* rather than failure or shame.

---

## 5. Target Success Metrics & KPIs

| Metric | Target | Verification Method |
|---|---|---|
| **Load Reduction on Rebalance** | $\ge 15\%$ capacity drop | Automated engine simulation & user acceptance tracking |
| **User Retention (Anti-Streak)** | $> 70\%$ 30-day retention | Tracking graceful pauses vs. total user drop-offs |
| **Authentic Task Tracking** | $> 40\%$ reduction in abandoned tasks | Ratio of `Push to Tomorrow` vs. unchecked stale tasks |
| **Decision Simulation Confidence** | $< 10\text{s}$ decision time | What-If simulator query completion rate |
