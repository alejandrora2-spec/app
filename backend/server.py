from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional
import uuid
from datetime import datetime, date
from auth_utils import hash_password, verify_password, create_access_token, get_current_user


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ========== MODELS ==========

# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Health Log Models
class DailyHealthLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: date
    
    # Alimentación
    meals_count: int = Field(ge=0, le=10, description="Número de comidas saludables")
    fruits_servings: int = Field(ge=0, le=10, description="Porciones de frutas")
    
    # Deporte
    exercise_minutes: int = Field(ge=0, le=300, description="Minutos de ejercicio")
    activity_type: str = Field(description="Tipo de actividad")
    
    # Mental
    mood_score: int = Field(ge=1, le=10, description="Estado de ánimo (1-10)")
    sleep_hours: float = Field(ge=0, le=24, description="Horas de sueño")
    
    # Calculated
    daily_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DailyHealthLogCreate(BaseModel):
    date: date
    meals_count: int = Field(ge=0, le=10)
    fruits_servings: int = Field(ge=0, le=10)
    exercise_minutes: int = Field(ge=0, le=300)
    activity_type: str
    mood_score: int = Field(ge=1, le=10)
    sleep_hours: float = Field(ge=0, le=24)

class MonthlyAnalysis(BaseModel):
    year: int
    month: int
    total_days: int
    average_score: float
    health_status: str
    category_scores: dict
    recommendations: List[str]
    daily_logs: List[DailyHealthLog]


# ========== HELPER FUNCTIONS ==========

def calculate_daily_score(log: DailyHealthLogCreate) -> float:
    """Calculate health score based on daily metrics"""
    score = 0.0
    
    # Alimentación (30 puntos)
    # Comidas: 3-5 comidas = 20 puntos, menos proporcional
    meals_score = min((log.meals_count / 4) * 20, 20)
    # Frutas: 3+ porciones = 10 puntos
    fruits_score = min((log.fruits_servings / 3) * 10, 10)
    
    # Deporte (35 puntos)
    # Ejercicio: 30+ minutos = 25 puntos
    exercise_score = min((log.exercise_minutes / 30) * 25, 25)
    # Actividad: cualquier actividad = 10 puntos
    activity_score = 10 if log.activity_type else 0
    
    # Mental (35 puntos)
    # Sueño: 7-8 horas = 20 puntos
    if 7 <= log.sleep_hours <= 8:
        sleep_score = 20
    elif 6 <= log.sleep_hours <= 9:
        sleep_score = 15
    else:
        sleep_score = max(0, 10 - abs(7.5 - log.sleep_hours) * 2)
    
    # Estado de ánimo: 8-10 = 15 puntos
    mood_score = (log.mood_score / 10) * 15
    
    score = meals_score + fruits_score + exercise_score + activity_score + sleep_score + mood_score
    return round(score, 2)

def get_health_status(average_score: float) -> str:
    """Determine health status based on average score"""
    if average_score >= 80:
        return "Excelente"
    elif average_score >= 60:
        return "Bueno"
    elif average_score >= 40:
        return "Regular"
    else:
        return "Necesita Mejorar"

def generate_recommendations(category_scores: dict) -> List[str]:
    """Generate health recommendations based on scores"""
    recommendations = []
    
    if category_scores["alimentacion"] < 20:
        recommendations.append("🍎 Aumenta tu ingesta de frutas y comidas saludables")
    
    if category_scores["deporte"] < 25:
        recommendations.append("🏃‍♂️ Intenta hacer al menos 30 minutos de ejercicio diario")
    
    if category_scores["mental"] < 25:
        recommendations.append("😴 Mejora tu rutina de sueño, intenta dormir 7-8 horas")
        recommendations.append("🧘‍♀️ Dedica tiempo a actividades que mejoren tu estado de ánimo")
    
    if not recommendations:
        recommendations.append("🎉 ¡Excelente trabajo! Mantén estos hábitos saludables")
    
    return recommendations


# ========== AUTH ROUTES ==========

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token({"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create token
    access_token = create_access_token({"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(id=user["id"], email=user["email"], name=user["name"])


# ========== HEALTH LOG ROUTES ==========

@api_router.post("/health/log", response_model=DailyHealthLog)
async def create_health_log(log_data: DailyHealthLogCreate, user_id: str = Depends(get_current_user)):
    # Check if log for this date already exists
    existing_log = await db.health_logs.find_one({
        "user_id": user_id,
        "date": log_data.date.isoformat()
    })
    
    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Log for this date already exists. Use PUT to update."
        )
    
    # Calculate score
    daily_score = calculate_daily_score(log_data)
    
    # Create log
    log = DailyHealthLog(
        user_id=user_id,
        date=log_data.date,
        meals_count=log_data.meals_count,
        fruits_servings=log_data.fruits_servings,
        exercise_minutes=log_data.exercise_minutes,
        activity_type=log_data.activity_type,
        mood_score=log_data.mood_score,
        sleep_hours=log_data.sleep_hours,
        daily_score=daily_score
    )
    
    log_dict = log.dict()
    log_dict["date"] = log_dict["date"].isoformat()
    
    await db.health_logs.insert_one(log_dict)
    
    return log

@api_router.get("/health/logs", response_model=List[DailyHealthLog])
async def get_health_logs(user_id: str = Depends(get_current_user), limit: int = 30):
    logs = await db.health_logs.find({"user_id": user_id}).sort("date", -1).limit(limit).to_list(limit)
    
    for log in logs:
        log["date"] = datetime.fromisoformat(log["date"]).date()
    
    return logs

@api_router.get("/health/log/{log_date}")
async def get_health_log_by_date(log_date: date, user_id: str = Depends(get_current_user)):
    log = await db.health_logs.find_one({
        "user_id": user_id,
        "date": log_date.isoformat()
    })
    
    if not log:
        return None
    
    log["date"] = datetime.fromisoformat(log["date"]).date()
    return DailyHealthLog(**log)

@api_router.put("/health/log/{log_date}", response_model=DailyHealthLog)
async def update_health_log(log_date: date, log_data: DailyHealthLogCreate, user_id: str = Depends(get_current_user)):
    # Calculate new score
    daily_score = calculate_daily_score(log_data)
    
    update_data = log_data.dict()
    update_data["daily_score"] = daily_score
    update_data["date"] = log_date.isoformat()
    
    result = await db.health_logs.update_one(
        {"user_id": user_id, "date": log_date.isoformat()},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")
    
    updated_log = await db.health_logs.find_one({
        "user_id": user_id,
        "date": log_date.isoformat()
    })
    
    updated_log["date"] = datetime.fromisoformat(updated_log["date"]).date()
    return DailyHealthLog(**updated_log)

@api_router.get("/health/monthly-analysis/{year}/{month}", response_model=MonthlyAnalysis)
async def get_monthly_analysis(year: int, month: int, user_id: str = Depends(get_current_user)):
    # Get all logs for the month
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    logs = await db.health_logs.find({
        "user_id": user_id,
        "date": {
            "$gte": start_date.isoformat(),
            "$lt": end_date.isoformat()
        }
    }).to_list(100)
    
    if not logs:
        raise HTTPException(status_code=404, detail="No data for this month")
    
    # Convert dates
    for log in logs:
        log["date"] = datetime.fromisoformat(log["date"]).date()
    
    # Calculate averages
    total_logs = len(logs)
    avg_score = sum(log["daily_score"] for log in logs) / total_logs
    
    # Category averages
    category_scores = {
        "alimentacion": sum((log["meals_count"] / 4 * 20) + (log["fruits_servings"] / 3 * 10) for log in logs) / total_logs,
        "deporte": sum((log["exercise_minutes"] / 30 * 25) + 10 for log in logs) / total_logs,
        "mental": sum(log["daily_score"] for log in logs) / total_logs * 0.35
    }
    
    health_status = get_health_status(avg_score)
    recommendations = generate_recommendations(category_scores)
    
    return MonthlyAnalysis(
        year=year,
        month=month,
        total_days=total_logs,
        average_score=round(avg_score, 2),
        health_status=health_status,
        category_scores=category_scores,
        recommendations=recommendations,
        daily_logs=[DailyHealthLog(**log) for log in logs]
    )


# ========== TEST ROUTE ==========

@api_router.get("/")
async def root():
    return {"message": "Health Tracker API"}


# Add your routes to the router instead of directly to app
@api_router.get("/status")
async def status_check():
    return {"status": "ok", "app": "health_tracker"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
