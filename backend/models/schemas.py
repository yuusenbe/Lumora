from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    token: str

class TaskBase(BaseModel):
    title: str
    category: str = "academic"  # academic, work, social, physical, errand
    priority: str = "medium"    # low, medium, high
    estimated_hours: float = 2.0
    deadline: Optional[str] = None
    energy_required: str = "medium"  # low, medium, high
    flexibility: str = "medium"     # low, medium, high (high flexibility is candidate for rebalancing)
    scheduled_date: Optional[str] = None
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    progress: int = 0
    is_protected: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[float] = None
    deadline: Optional[str] = None
    energy_required: Optional[str] = None
    flexibility: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None
    is_protected: Optional[bool] = None

class Task(TaskBase):
    id: str
    user_id: str
    status: str = "pending"  # pending, completed

class CheckinCreate(BaseModel):
    stress: int = Field(default=3, ge=1, le=5)
    mood: int = Field(default=3, ge=1, le=5)
    mental_fatigue: int = Field(default=3, ge=1, le=5)
    physical_fatigue: int = Field(default=3, ge=1, le=5)
    sleep_hours: float = Field(default=7.0, ge=0, le=24)
    notes: Optional[str] = None

class Checkin(CheckinCreate):
    id: str
    user_id: str
    date: str

class LoadBreakdown(BaseModel):
    academic: float
    work: float
    social: float
    physical: float
    errands: float

class LoadPoints(BaseModel):
    time_load: float
    mental_load: float
    physical_load: float
    social_load: float
    errand_load: float
    recovery_score: float

class WorkloadResponse(BaseModel):
    capacity_score: int
    status: str
    status_level: str  # low, moderate, high, very_high
    status_color: str
    breakdown: LoadBreakdown
    load_points: LoadPoints
    explanation: str
    top_contributors: List[str]
    needs_rebalance: bool

class RecommendationAction(BaseModel):
    id: str
    type: str  # move, reduce, protect, postpone, recover
    title: str
    task_id: Optional[str] = None
    details: str
    impact: str
    original_state: Optional[str] = None
    proposed_state: Optional[str] = None

class RebalancePlan(BaseModel):
    before_load: int
    after_load: int
    load_reduction: int
    before_status: str
    after_status: str
    explanation: str
    recommendations: List[RecommendationAction]

class RecoveryItem(BaseModel):
    id: str
    category: str  # mental, physical, social, sleep, mindfulness
    title: str
    duration: str
    description: str
    reason: str
    icon: str

class SanctuaryStatus(BaseModel):
    streak_days: int
    streak_status: str  # active, frozen
    plant_stage: str    # sprout, foliage, blooming_bonsai
    plant_stage_name: str
    plant_growth_percent: int
    balance_points: int
    status_headline: str
    status_message: str
    milestones: List[str]

class WhatIfRequest(BaseModel):
    scenario: str

class WhatIfOption(BaseModel):
    option_id: str
    title: str
    projected_load: int
    delta: int
    tradeoff: str
    recommended: bool = False

class WhatIfResponse(BaseModel):
    question: str
    current_load: int
    projected_load_unbalanced: int
    impact_analysis: str
    peak_day: str
    options: List[WhatIfOption]
    recommendation: str

class RecommendedSlot(BaseModel):
    date: str
    day_name: str
    start_time: str
    end_time: str
    label: str
    reason: str
    is_primary: bool = False

class RecommendSlotsRequest(BaseModel):
    estimated_hours: float = 1.5
    deadline: Optional[str] = None
    preferred_date: Optional[str] = None
    category: Optional[str] = "errand"

class ParseTaskRequest(BaseModel):
    text: str
    preferred_date: Optional[str] = None

class ParsedTaskResponse(BaseModel):
    title: str
    category: str
    estimated_hours: float
    deadline: Optional[str] = None
    scheduled_date: Optional[str] = None
    priority: str
    energy_required: str
    flexibility: str
    confidence: float
    raw_understanding: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_time_specific: bool = False
    recommended_slots: Optional[List[RecommendedSlot]] = None

