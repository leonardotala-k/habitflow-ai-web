from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class Habit(BaseModel):
    """Modelo para un hábito"""
    name: str = Field(..., description="Nombre del hábito")
    description: Optional[str] = Field(None, description="Descripción del hábito")
    target_frequency: str = Field(default="daily", description="Frecuencia objetivo (daily, weekly, monthly)")
    created_at: datetime = Field(default_factory=datetime.now)
    user_id: str = Field(..., description="ID del usuario de Telegram")


class HabitEntry(BaseModel):
    """Modelo para una entrada/registro de hábito"""
    habit_name: str = Field(..., description="Nombre del hábito")
    user_id: str = Field(..., description="ID del usuario")
    completed: bool = Field(..., description="Si se completó el hábito")
    date: datetime = Field(default_factory=datetime.now)
    notes: Optional[str] = Field(None, description="Notas adicionales")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Calificación del 1-5")


class UserStats(BaseModel):
    """Estadísticas del usuario"""
    user_id: str
    total_habits: int
    active_habits: int
    completion_rate: float
    streak_days: int
    last_activity: datetime


class AIInsight(BaseModel):
    """Insight generado por IA"""
    user_id: str
    insight: str
    category: str  # motivation, improvement, pattern, achievement
    confidence: float = Field(ge=0.0, le=1.0)
    generated_at: datetime = Field(default_factory=datetime.now)


class TelegramUser(BaseModel):
    """Usuario de Telegram"""
    user_id: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    joined_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = True

