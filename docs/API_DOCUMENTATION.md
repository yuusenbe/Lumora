# Lumora — REST API Specification

## 1. Base URL & Authentication

- **Base URL**: `http://127.0.0.1:8000/api`
- **Authentication Scheme**: Bearer Token
- **Header Format**: `Authorization: Bearer lumora-token-<user-id>`
- **Default Demo Token**: `lumora-token-demo-alex-student-001`

---

## 2. API Endpoints

### 2.1 Authentication & Profile

#### `POST /auth/login`
Authenticates an existing student.
- **Request Body**:
  ```json
  {
    "email": "alex.chen@university.edu",
    "password": "securepassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": "demo-alex-student-001",
    "name": "Alex Chen",
    "email": "alex.chen@university.edu",
    "token": "lumora-token-demo-alex-student-001"
  }
  ```

#### `POST /auth/demo-login`
Instantly loads the pre-configured Alex Chen evaluation profile.

---

### 2.2 Dashboard & Capacity

#### `GET /dashboard`
Retrieves aggregated student capacity, today's top 3 tasks, suggested rebalancing, and Anti-Streak status.
- **Success Response (200 OK)**:
  ```json
  {
    "student_name": "Alex Chen",
    "capacity": {
      "capacity_score": 68,
      "status": "Moderate load",
      "status_level": "moderate",
      "status_color": "#7E9F7E",
      "breakdown": {
        "academic": 32.0,
        "work": 16.0,
        "social": 8.0,
        "physical": 7.0,
        "errands": 5.0
      },
      "explanation": "Your workload is in a manageable state. Academic focus dominates your schedule.",
      "top_contributors": ["Academic Thesis", "Part-Time Shift"],
      "needs_rebalance": false
    },
    "today_tasks": [
      {
        "id": "task-01",
        "title": "FYP Methodology",
        "category": "academic",
        "estimated_hours": 4.0,
        "scheduled_date": "2026-09-10",
        "progress": 50,
        "is_protected": 1
      }
    ],
    "total_pending_count": 5,
    "sanctuary": {
      "streak_days": 5,
      "streak_status": "active",
      "plant_stage": "foliage",
      "plant_stage_name": "Thriving Sage Foliage 🌿",
      "plant_growth_percent": 75,
      "balance_points": 340,
      "status_headline": "5 Days in Restorative Equilibrium 🌿",
      "status_message": "Your energy envelope is well-protected in the sustainable sweet spot.",
      "milestones": [
        "Shielded 2h Deep Study Block",
        "Accepted Smart Rebalance (↓18% load)",
        "Logged Screen-Free Recovery"
      ]
    }
  }
  ```

---

### 2.3 Tasks & AI Smart Capture

#### `POST /ai/parse-task`
Parses conversational text into structured task attributes and suggests clash-free slots.
- **Request Body**:
  ```json
  {
    "text": "Finish my FYP methodology draft by Thursday afternoon, will take about 4 hours",
    "preferred_date": "2026-09-10"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "title": "FYP methodology draft",
    "category": "academic",
    "estimated_hours": 4.0,
    "deadline": "Thursday",
    "scheduled_date": "2026-09-11",
    "priority": "high",
    "energy_required": "high",
    "flexibility": "low",
    "confidence": 0.95,
    "raw_understanding": "Identified high-focus academic project with imminent deadline."
  }
  ```

#### `POST /tasks/{task_id}/postpone`
Guilt-free rescheduling endpoint that moves a task forward without penalties.
- **Query Parameter**: `days` (integer, default: `1`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Wise choice! Rescheduled 'Grocery Shopping' to 2026-09-11. Your evening energy is protected.",
    "new_date": "2026-09-11",
    "boundary_respected": true
  }
  ```

---

### 2.4 Schedule Rebalancing

#### `POST /rebalance/simulate`
Simulates schedule optimization and calculates projected load reduction.
- **Success Response (200 OK)**:
  ```json
  {
    "before_load": 91,
    "after_load": 73,
    "load_reduction": 18,
    "before_status": "Very high load",
    "after_status": "Balanced load",
    "explanation": "By shifting flexible errands to Sunday and shortening workouts, projected load drops by 18%.",
    "recommendations": [
      {
        "id": "rec-action-move-errand",
        "type": "move",
        "title": "Move Grocery Restock",
        "details": "Shift Grocery shopping to Sunday morning.",
        "impact": "Reduces peak midweek congestion by 6% capacity."
      }
    ]
  }
  ```

#### `POST /rebalance/apply`
Applies simulated rebalance proposals to the user's live schedule in SQLite.

---

### 2.5 Recovery & Sanctuary

#### `GET /recovery/sanctuary`
Retrieves Anti-Streak status, living plant stage, and equilibrium history.

#### `POST /recovery/complete`
Logs completion of a restorative break and awards **+25 Growth Points** to the living plant.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Restorative session completed. Your plant absorbed new sanctuary energy!",
    "growth_points": 25,
    "streak_safe": true
  }
  ```

---

### 2.6 What-If Decision Simulator

#### `POST /what-if/simulate`
- **Request Body**:
  ```json
  {
    "scenario": "Can I accept another 5-hour part-time shift on Saturday?"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "question": "Can I accept another 5-hour part-time shift on Saturday?",
    "current_load": 70,
    "projected_load_unbalanced": 86,
    "impact_analysis": "Saturday becomes your highest-load day. Your weekend recovery buffer will be eliminated.",
    "peak_day": "Saturday",
    "options": [
      {
        "option_id": "opt-a",
        "title": "Option A: Accept Shift As-Is",
        "projected_load": 86,
        "delta": 16,
        "tradeoff": "Immediate strain risk across Sunday.",
        "recommended": false
      },
      {
        "option_id": "opt-b",
        "title": "Option B: Accept Shift + Move Sunday Errands to Monday",
        "projected_load": 74,
        "delta": 4,
        "tradeoff": "Balances income while protecting Sunday rest.",
        "recommended": true
      }
    ],
    "recommendation": "Option B balances financial opportunity with recovery by shielding Sunday for true rest."
  }
  ```

---

## 3. Sample cURL Request

```bash
curl -X POST "http://127.0.0.1:8000/api/ai/parse-task" \
     -H "Authorization: Bearer lumora-token-demo-alex-student-001" \
     -H "Content-Type: application/json" \
     -d '{"text": "Complete Lab Report 3 by Friday, about 2 hours"}'
```
