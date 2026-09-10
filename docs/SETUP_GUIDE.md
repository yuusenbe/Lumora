# Lumora — Local Development Setup Guide

Follow this step-by-step guide to configure, build, and run **Lumora** on your local machine.

---

## 1. System Prerequisites

Ensure you have the following software installed:

| Tool | Minimum Version | Recommended Version | Check Command |
|---|---|---|---|
| **Python** | `3.10+` | `3.13` | `python --version` |
| **Node.js** | `18.0+` | `20.x` or `22.x` | `node --version` |
| **npm** | `9.0+` | `10.x` | `npm --version` |
| **Git** | `2.x` | Latest | `git --version` |

---

## 2. Environment Configuration

### Backend Configuration
Create a `.env` file in the root directory (optional for demo mode, required for live Gemini AI parsing):

```bash
# Optional: Google Gemini API Key for live LLM extraction
# If omitted, Lumora automatically uses its built-in offline heuristic parser
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Server Configuration
HOST=127.0.0.1
PORT=8000
ENVIRONMENT=development
```

---

## 3. Step-by-Step Installation

### Step 1: Clone the Repository
```powershell
git clone https://github.com/yuusenbe/Lumora.git
cd Lumora
```

### Step 2: Configure Python Backend
1. Create and activate a Python virtual environment:
   ```powershell
   # Windows (PowerShell)
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install backend dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```

### Step 3: Configure React Frontend
1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Install Node packages:
   ```powershell
   npm install
   cd ..
   ```

---

## 4. Running the Application

### Option A: One-Click Startup (Windows)
Double-click **`start_lumora.bat`** in the project root, or execute:
```powershell
.\start_lumora.bat
```
This automatically launches both backend and frontend servers in separate terminal windows.

### Option B: Manual Multi-Terminal Startup

#### Terminal 1: FastAPI Backend
```powershell
# In project root
python backend_server.py
```
*Backend runs at:* `http://127.0.0.1:8000`  
*API Documentation (Swagger):* `http://127.0.0.1:8000/docs`

#### Terminal 2: React Vite Frontend
```powershell
cd frontend
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## 5. Running Tests & Verifications

### 1. Verify Backend Test Scenario
Executes the automated 7-scene narrative test suite (baseline $\rightarrow$ capture $\rightarrow$ overload $\rightarrow$ rebalance $\rightarrow$ what-if):
```powershell
python -m backend.test_scenario
```
*Expected output:* `ALL VERIFICATIONS PASSED PERFECTLY!`

### 2. Verify Frontend Production Build
Validates bundle compilation and JSX syntax integrity:
```powershell
cd frontend
npm run build
```
*Expected output:* `✓ built in ~1.5s`

---

## 6. Troubleshooting Matrix

| Issue / Symptom | Root Cause | Solution |
|---|---|---|
| `ModuleNotFoundError: No module named 'backend'` | Running scripts without the root package in `PYTHONPATH`. | Execute test scripts using `-m`: `python -m backend.test_scenario`. |
| `Port 8000 already in use` | A lingering Python or Uvicorn process is occupying the port. | Terminate the process: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force` |
| `Port 5173 already in use` | Another Vite development instance is active. | Vite will automatically suggest port `5174`. Access via the printed localhost port. |
| `API request failed / Network Error` | Frontend dev server cannot reach backend. | Ensure `python backend_server.py` is actively running on `http://127.0.0.1:8000`. |
| `Recharts blank or invisible on tab switch` | Container dimensions unmounted during initial load. | Fixed in current release via default trend data fallbacks and `min-h-[250px]` bounds. |
