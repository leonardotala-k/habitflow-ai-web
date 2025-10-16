"""
Configuración y constantes para HabitFlow AI
"""
import os
from typing import Dict, List

# Configuración de la aplicación
APP_NAME = "HabitFlow AI"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "Sistema de seguimiento de hábitos con análisis de IA"

# Configuración de Google Sheets
SHEETS_SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

# Configuración por defecto de hábitos
DEFAULT_TARGET_FREQUENCY = "daily"
MAX_HABIT_NAME_LENGTH = 50
MIN_HABIT_NAME_LENGTH = 2

# Límites de datos
MAX_ENTRIES_PER_REQUEST = 1000
DEFAULT_STATS_DAYS = 30
MAX_STATS_DAYS = 365

# Configuración de IA
AI_MODEL = "gpt-3.5-turbo"
AI_MAX_TOKENS = 800
AI_TEMPERATURE = 0.7

# Estados válidos para hábitos
VALID_POSITIVE_STATUSES = [
    'completado', 'hecho', 'sí', 'si', 'yes', 'done', 
    'terminado', 'finalizado', 'ok', 'cumplido', 'listo'
]

VALID_NEGATIVE_STATUSES = [
    'no', 'no hecho', 'incompleto', 'fallido', 'skip', 
    'saltado', 'omitido', 'perdido'
]

# Emojis para categorías
CATEGORY_EMOJIS = {
    'motivation': '💪',
    'improvement': '📈',
    'pattern': '🔍', 
    'achievement': '🏆',
    'warning': '⚠️',
    'celebration': '🎉'
}

# Comandos del bot
BOT_COMMANDS = [
    ("start", "Iniciar el bot"),
    ("help", "Ver ayuda"),
    ("add_habit", "Agregar nuevo hábito"),
    ("my_habits", "Ver mis hábitos"),
    ("track", "Registrar progreso"),
    ("quick_track", "Registro rápido"),
    ("stats", "Ver estadísticas"),
    ("insights", "Análisis con IA"),
]

# Mensajes del sistema
MESSAGES = {
    'welcome': """
🌟 ¡Hola {name}! Bienvenido a HabitFlow AI

Soy tu asistente personal para el seguimiento de hábitos. Puedo ayudarte a:

🎯 Crear y seguir tus hábitos
📊 Analizar tu progreso  
🤖 Darte insights personalizados con IA
📈 Visualizar tus patrones

¡Empecemos tu viaje hacia mejores hábitos! 🚀
    """,
    
    'no_habits': """
📝 Aún no tienes hábitos registrados.

Crea tu primer hábito con:
`/add_habit [nombre del hábito]`

Ejemplos:
• `/add_habit Ejercicio diario`
• `/add_habit Leer 30 minutos`
• `/add_habit Meditar`
    """,
    
    'habit_created': """
✅ ¡Hábito '{habit}' creado exitosamente!

Ahora puedes registrar tu progreso con:
• `/track {habit} completado`
• `/quick_track` para registro rápido
    """,
    
    'track_success': """
{emoji} **{habit}** registrado como '{status}'

📊 Usa `/stats` para ver tu progreso general
🧠 Usa `/insights` para análisis con IA
    """,
    
    'error_generic': """
❌ Hubo un error procesando tu solicitud.
Inténtalo de nuevo en unos momentos.
    """,
    
    'analyzing_ai': """
🤖 Analizando tus hábitos con IA... ⏳
Esto puede tomar unos segundos.
    """
}

# Configuración de notificaciones (para futuras implementaciones)
NOTIFICATION_TIMES = {
    'morning': "08:00",
    'afternoon': "14:00", 
    'evening': "20:00"
}

# Patrones de reconocimiento de texto
COMPLETION_PATTERNS = [
    r'\b(complet[oa]|hecho|terminado|listo|done|finish)\b',
    r'\b(sí|si|yes|ok)\b',
    r'✅|☑️|✓'
]

SKIP_PATTERNS = [
    r'\b(no|skip|omit|saltar|fallar)\b',
    r'❌|✗|❎'
]

# Configuración de base de datos (Google Sheets)
SHEET_NAMES = {
    'users': 'users',
    'habits': 'habits', 
    'entries': 'entries'
}

SHEET_HEADERS = {
    'users': ["user_id", "username", "first_name", "last_name", "joined_at", "is_active"],
    'habits': ["user_id", "name", "description", "target_frequency", "created_at"],
    'entries': ["user_id", "habit_name", "completed", "date", "notes", "rating"]
}

# URLs útiles para documentación
DOCS_URLS = {
    'telegram_bot': 'https://t.me/BotFather',
    'google_console': 'https://console.cloud.google.com/',
    'openai_platform': 'https://platform.openai.com/',
}

def get_env_or_default(key: str, default: str = "") -> str:
    """Obtener variable de entorno con valor por defecto"""
    return os.getenv(key, default)

def validate_config() -> Dict[str, bool]:
    """Validar configuración del sistema"""
    required_env_vars = [
        "TELEGRAM_BOT_TOKEN",
        "GOOGLE_SHEETS_CREDENTIALS_FILE",
        "SPREADSHEET_ID", 
        "OPENAI_API_KEY"
    ]
    
    validation = {}
    for var in required_env_vars:
        validation[var] = bool(os.getenv(var))
    
    return validation

