# Utilidades para HabitFlow AI
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json


def format_date(date: datetime) -> str:
    """Formatear fecha para mostrar al usuario"""
    return date.strftime("%d/%m/%Y")


def format_datetime(dt: datetime) -> str:
    """Formatear fecha y hora"""
    return dt.strftime("%d/%m/%Y %H:%M")


def calculate_completion_rate(entries: List[Dict[str, Any]]) -> float:
    """Calcular tasa de completación"""
    if not entries:
        return 0.0
    
    completed = len([e for e in entries if str(e.get('completed', '')).lower() == 'true'])
    return completed / len(entries)


def get_week_progress(entries: List[Dict[str, Any]]) -> Dict[str, int]:
    """Obtener progreso por día de la semana"""
    from collections import defaultdict
    
    week_progress = defaultdict(int)
    
    for entry in entries:
        try:
            date = datetime.fromisoformat(entry['date'])
            day_name = date.strftime('%A')
            if str(entry.get('completed', '')).lower() == 'true':
                week_progress[day_name] += 1
        except (ValueError, KeyError):
            continue
    
    return dict(week_progress)


def generate_streak_message(streak_days: int) -> str:
    """Generar mensaje motivacional basado en la racha"""
    if streak_days == 0:
        return "🌱 ¡Es hora de empezar una nueva racha!"
    elif streak_days == 1:
        return "🎯 ¡Primer día completado! Sigue así."
    elif streak_days < 7:
        return f"🔥 {streak_days} días seguidos. ¡Vas genial!"
    elif streak_days < 30:
        return f"💪 {streak_days} días de racha. ¡Eres imparable!"
    else:
        return f"🏆 {streak_days} días consecutivos. ¡Eres una leyenda!"


def parse_habit_status(status_text: str) -> bool:
    """Determinar si un estado de hábito significa completado"""
    status_lower = status_text.lower().strip()
    
    positive_status = [
        'completado', 'hecho', 'sí', 'si', 'yes', 'done', 
        'terminado', 'finalizado', '✅', 'ok', 'cumplido'
    ]
    
    return status_lower in positive_status


def get_motivational_emoji(completion_rate: float) -> str:
    """Obtener emoji motivacional basado en tasa de completación"""
    if completion_rate >= 0.9:
        return "🏆"
    elif completion_rate >= 0.7:
        return "🔥"
    elif completion_rate >= 0.5:
        return "💪"
    elif completion_rate >= 0.3:
        return "🌱"
    else:
        return "🚀"


def validate_habit_name(name: str) -> bool:
    """Validar nombre de hábito"""
    if not name or len(name.strip()) < 2:
        return False
    
    if len(name) > 50:
        return False
    
    # Caracteres no permitidos
    forbidden_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
    if any(char in name for char in forbidden_chars):
        return False
    
    return True


def create_progress_bar(current: int, total: int, length: int = 10) -> str:
    """Crear barra de progreso visual"""
    if total == 0:
        return "▱" * length
    
    filled = int((current / total) * length)
    bar = "▰" * filled + "▱" * (length - filled)
    percentage = (current / total) * 100
    
    return f"{bar} {percentage:.1f}%"


def get_time_greeting() -> str:
    """Obtener saludo basado en la hora"""
    hour = datetime.now().hour
    
    if 5 <= hour < 12:
        return "🌅 Buenos días"
    elif 12 <= hour < 18:
        return "☀️ Buenas tardes"
    else:
        return "🌙 Buenas noches"


def safe_json_parse(json_str: str, default: Any = None) -> Any:
    """Parsear JSON de forma segura"""
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return default


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncar texto con elipsis"""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."


def format_insights_for_telegram(insights: List[Dict[str, Any]]) -> str:
    """Formatear insights para Telegram"""
    if not insights:
        return "🤖 No hay insights disponibles en este momento."
    
    formatted = "🧠 **Insights personalizados:**\n\n"
    
    for i, insight in enumerate(insights, 1):
        category_emoji = {
            'motivation': '💪',
            'improvement': '📈', 
            'pattern': '🔍',
            'achievement': '🏆'
        }.get(insight.get('category', 'motivation'), '💡')
        
        formatted += f"{category_emoji} **{i}.** {insight.get('insight', '')}\n\n"
    
    return formatted

