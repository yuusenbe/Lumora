import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .database.connection import init_db
from .database.seed_data import seed_demo_data
from .api import auth, dashboard, tasks, checkins, rebalance, recovery, whatif

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed initial demo data
    await init_db()
    await seed_demo_data(force=False)
    yield

app = FastAPI(
    title="Lumora API",
    description="Burnout Autopilot & Workload Recovery Engine for Students",
    version="1.0.0",
    lifespan=lifespan
)

# Allow CORS for frontend Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(checkins.router, prefix="/api")
app.include_router(rebalance.router, prefix="/api")
app.include_router(recovery.router, prefix="/api")
app.include_router(whatif.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "Lumora",
        "positioning": "A Burnout Autopilot, Not Another To-Do List."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
