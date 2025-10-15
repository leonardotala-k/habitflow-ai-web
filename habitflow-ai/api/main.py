from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from services.sheets_service import GoogleSheetsService
from services.ai_service import AIAnalysisService
from models.schemas import Habit, HabitEntry, TelegramUser, UserStats, AIInsight

load_dotenv()

app = FastAPI(
    title="HabitFlow AI API",
    description="API para el sistema de seguimiento de hábitos con IA",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servicios
sheets_service = GoogleSheetsService(
    credentials_file=os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE"),
    spreadsheet_id=os.getenv("SPREADSHEET_ID")
)

ai_service = AIAnalysisService(os.getenv("GEMINI_API_KEY"))


# Modelos de request/response
class CreateHabitRequest(BaseModel):
    name: str
    description: Optional[str] = None
    target_frequency: str = "daily"
    user_id: str


class TrackHabitRequest(BaseModel):
    habit_name: str
    user_id: str
    completed: bool
    notes: Optional[str] = None
    rating: Optional[int] = None


class UserResponse(BaseModel):
    user_id: str
    habits_count: int
    last_activity: str


# Endpoints

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "HabitFlow AI API", 
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}


@app.post("/users", response_model=dict)
async def create_user(user: TelegramUser):
    """Crear un nuevo usuario"""
    try:
        success = sheets_service.create_user(user)
        if success:
            return {"message": "Usuario creado exitosamente", "user_id": user.user_id}
        else:
            raise HTTPException(status_code=400, detail="Usuario ya existe o error en creación")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/habits", response_model=dict)
async def create_habit(request: CreateHabitRequest):
    """Crear un nuevo hábito"""
    try:
        habit = Habit(
            name=request.name,
            description=request.description,
            target_frequency=request.target_frequency,
            user_id=request.user_id
        )
        
        success = sheets_service.create_habit(habit)
        if success:
            return {"message": "Hábito creado exitosamente", "habit_name": habit.name}
        else:
            raise HTTPException(status_code=400, detail="Hábito ya existe o error en creación")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/habits/{user_id}", response_model=List[dict])
async def get_user_habits(user_id: str):
    """Obtener hábitos de un usuario"""
    try:
        habits = sheets_service.get_user_habits(user_id)
        return habits
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/habits/track", response_model=dict)
async def track_habit(request: TrackHabitRequest):
    """Registrar progreso de un hábito"""
    try:
        entry = HabitEntry(
            habit_name=request.habit_name,
            user_id=request.user_id,
            completed=request.completed,
            notes=request.notes,
            rating=request.rating
        )
        
        success = sheets_service.add_habit_entry(entry)
        if success:
            return {
                "message": "Progreso registrado exitosamente",
                "habit_name": entry.habit_name,
                "completed": entry.completed
            }
        else:
            raise HTTPException(status_code=400, detail="Error registrando progreso")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats/{user_id}", response_model=UserStats)
async def get_user_stats(user_id: str):
    """Obtener estadísticas de un usuario"""
    try:
        stats = sheets_service.get_user_stats(user_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/entries/{user_id}", response_model=List[dict])
async def get_user_entries(user_id: str, days: int = 30):
    """Obtener entradas de un usuario"""
    try:
        entries = sheets_service.get_user_entries(user_id, days)
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/insights/{user_id}", response_model=List[AIInsight])
async def get_user_insights(user_id: str):
    """Obtener insights personalizados con IA"""
    try:
        insights = ai_service.generate_insights(user_id, sheets_service)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/{user_id}", response_model=dict)
async def get_habit_recommendations(user_id: str):
    """Obtener recomendaciones de nuevos hábitos"""
    try:
        habits = sheets_service.get_user_habits(user_id)
        habit_names = [h['name'] for h in habits]
        
        recommendation = ai_service.get_habit_recommendation(habit_names)
        
        return {
            "user_id": user_id,
            "current_habits": habit_names,
            "recommendation": recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint para dashboard web
@app.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str):
    """Obtener todos los datos para el dashboard"""
    try:
        habits = sheets_service.get_user_habits(user_id)
        entries = sheets_service.get_user_entries(user_id, days=30)
        stats = sheets_service.get_user_stats(user_id)
        insights = ai_service.generate_insights(user_id, sheets_service)
        
        return {
            "user_id": user_id,
            "habits": habits,
            "entries": entries,
            "stats": stats,
            "insights": insights,
            "last_updated": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=os.getenv("API_HOST", "0.0.0.0"), 
        port=int(os.getenv("API_PORT", 8000))
    )

