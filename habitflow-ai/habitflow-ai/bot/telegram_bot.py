from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes
from datetime import datetime
import os
from dotenv import load_dotenv
from services.sheets_service import GoogleSheetsService
from services.ai_service import AIAnalysisService
from models.schemas import TelegramUser, Habit, HabitEntry
import asyncio

load_dotenv()


class HabitFlowBot:
    """Bot de Telegram para HabitFlow AI"""
    
    def __init__(self):
        self.token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.sheets_service = GoogleSheetsService(
            credentials_file=os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE"),
            spreadsheet_id=os.getenv("SPREADSHEET_ID")
        )
        self.ai_service = AIAnalysisService(os.getenv("GEMINI_API_KEY"))
        
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Comando /start"""
        user = update.effective_user
        
        # Registrar usuario
        telegram_user = TelegramUser(
            user_id=str(user.id),
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name
        )
        
        self.sheets_service.create_user(telegram_user)
        
        welcome_text = f"""
Welcome {user.first_name}! Welcome to HabitFlow AI

I'm your personal assistant for habit tracking. I can help you:

- Create and follow your habits
- Analyze your progress  
- Give you personalized AI insights
- Visualize your patterns

**Main commands:**
/add_habit - Add a new habit
/my_habits - View your current habits
/track - Record progress of a habit
/stats - View your statistics
/insights - Get AI analysis
/help - See all commands

Let's start your journey to better habits!
        """
        
        await update.message.reply_text(welcome_text)
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Comando /help"""
        help_text = """
📚 **Guía de comandos de HabitFlow AI**

**🎯 Gestión de hábitos:**
/add_habit [nombre] - Crear nuevo hábito
  Ejemplo: `/add_habit Ejercicio`

/my_habits - Lista de tus hábitos
/delete_habit - Eliminar un hábito

**📝 Seguimiento:**
/track [hábito] [estado] - Registrar progreso
  Ejemplo: `/track Ejercicio completado`
  Estados: completado, no, parcial

/quick_track - Registro rápido de todos los hábitos

**📊 Análisis:**
/stats - Tus estadísticas generales
/insights - Análisis personalizado con IA
/progress [hábito] - Progreso específico

**🔧 Configuración:**
/settings - Configurar notificaciones
/timezone - Configurar zona horaria

**❓ Ayuda:**
/help - Esta guía
/support - Contactar soporte

¿Necesitas ayuda específica? ¡Solo pregúntame! 😊
        """
        
        await update.message.reply_text(help_text)
    
    async def add_habit(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Comando /add_habit"""
        user_id = str(update.effective_user.id)
        
        if not context.args:
            await update.message.reply_text(
                "Por favor, especifica el nombre del hábito.\n"
                "Ejemplo: `/add_habit Ejercicio diario`"
            )
            return
        
        habit_name = " ".join(context.args)
        
        # Crear hábito
        habit = Habit(
            name=habit_name,
            user_id=user_id,
            description=f"Hábito: {habit_name}",
            target_frequency="daily"
        )
        
        success = self.sheets_service.create_habit(habit)
        
        if success:
            await update.message.reply_text(
                f"✅ ¡Hábito '{habit_name}' creado exitosamente!\n\n"
                f"Ahora puedes registrar tu progreso con:\n"
                f"`/track {habit_name} completado`"
            )
        else:
            await update.message.reply_text(
                f"❌ No pude crear el hábito '{habit_name}'. "
                f"Tal vez ya existe o hubo un error."
            )
    
    async def my_habits(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Comando /my_habits"""
        user_id = str(update.effective_user.id)
        habits = self.sheets_service.get_user_habits(user_id)
        
        if not habits:
            await update.message.reply_text(
                "📝 Aún no tienes hábitos registrados.\n\n"
                "Crea tu primer hábito con:\n"
                "`/add_habit [nombre del hábito]`"
            )
            return
        
        habits_text = "🎯 **Tus hábitos actuales:**\n\n"
        for i, habit in enumerate(habits, 1):
            habits_text += f"{i}. **{habit['name']}**\n"
            if habit.get('description'):
                habits_text += f"   📄 {habit['description']}\n"
            habits_text += f"   📅 Frecuencia: {habit.get('target_frequency', 'daily')}\n\n"
        
        habits_text += "💡 Usa `/track [hábito] [estado]` para registrar tu progreso"
        
        await update.message.reply_text(habits_text)
    
    async def track_habit(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Comando /track"""
        user_id = str(update.effective_user.id)
        
        if len(context.args) < 2:
            await update.message.reply_text(
                "Formato incorrecto. Usa:\n"
                "`/track [hábito] [estado]`\n\n"
                "Estados válidos: completado, no, parcial\n"
                "Ejemplo: `/track Ejercicio completado`"
            )
            return
        
        habit_name = context.args[0]
        status = " ".join(context.args[1:]).lower()
        
        # Determinar si se completó
        completed = status in ['completado', 'sí', 'si', 'yes', 'done', 'hecho']
        
        # Crear entrada
        entry = HabitEntry(
            habit_name=habit_name,
            user_id=user_id,
            completed=completed,
            notes=f"Estado: {status}"
        )
        
        success = self.sheets_service.add_habit_entry(entry)
        
        if success:
            status_emoji = "✅" if completed else "❌"
            await update.message.reply_text(
                f"{status_emoji} **{habit_name}** registrado como '{status}'\n\n"
                f"📊 Usa `/stats` para ver tu progreso general"
            )
        else:
            await update.message.reply_text(
                "❌ Hubo un error registrando tu hábito. Inténtalo de nuevo."
            )
    
    async def stats(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Comando /stats"""
        user_id = str(update.effective_user.id)
        stats = self.sheets_service.get_user_stats(user_id)
        
        stats_text = f"""
📊 **Tus estadísticas (últimos 30 días)**

🎯 Hábitos totales: **{stats.total_habits}**
✅ Hábitos activos: **{stats.active_habits}**
📈 Tasa de éxito: **{stats.completion_rate:.1%}**
🔥 Racha actual: **{stats.streak_days} días**
🕐 Última actividad: **{stats.last_activity.strftime('%d/%m/%Y')}**

{'🏆 ¡Excelente trabajo!' if stats.completion_rate > 0.8 else 
 '💪 ¡Sigue así, vas por buen camino!' if stats.completion_rate > 0.5 else 
 '🚀 ¡Cada día es una nueva oportunidad!'}

💡 Usa `/insights` para obtener análisis personalizado con IA
        """
        
        await update.message.reply_text(stats_text)
    
    async def insights(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Comando /insights"""
        user_id = str(update.effective_user.id)
        
        await update.message.reply_text("AI analyzing your habits... Please wait...")
        
        try:
            insights = self.ai_service.generate_insights(user_id, self.sheets_service)
            
            insights_text = "🧠 **Insights personalizados con IA:**\n\n"
            
            for i, insight in enumerate(insights, 1):
                category_emoji = {
                    'motivation': '💪',
                    'improvement': '📈',
                    'pattern': '🔍',
                    'achievement': '🏆'
                }.get(insight.category, '💡')
                
                insights_text += f"{category_emoji} **Insight #{i}**\n"
                insights_text += f"{insight.insight}\n\n"
            
            # Agregar recomendación de nuevo hábito
            user_habits = self.sheets_service.get_user_habits(user_id)
            habit_names = [h['name'] for h in user_habits]
            
            if habit_names:
                recommendation = self.ai_service.get_habit_recommendation(habit_names)
                insights_text += f"🎯 **Recomendación de nuevo hábito:**\n{recommendation}"
            
            await update.message.reply_text(insights_text)
            
        except Exception as e:
            await update.message.reply_text(
                "❌ Hubo un error generando tus insights. "
                "Asegúrate de tener algunos registros de hábitos primero."
            )
    
    async def quick_track(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Registro rápido de todos los hábitos"""
        user_id = str(update.effective_user.id)
        habits = self.sheets_service.get_user_habits(user_id)
        
        if not habits:
            await update.message.reply_text(
                "No tienes hábitos para registrar. "
                "Crea uno primero con `/add_habit [nombre]`"
            )
            return
        
        keyboard = []
        for habit in habits:
            keyboard.append([
                InlineKeyboardButton(f"✅ {habit['name']}", callback_data=f"track_yes_{habit['name']}"),
                InlineKeyboardButton(f"❌ {habit['name']}", callback_data=f"track_no_{habit['name']}")
            ])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "📝 **Registro rápido de hábitos**\n\n"
            "Selecciona el estado de cada hábito:",
            reply_markup=reply_markup
        )
    
    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Manejar callbacks de botones inline"""
        query = update.callback_query
        await query.answer()
        
        user_id = str(query.from_user.id)
        data = query.data
        
        if data.startswith("track_"):
            parts = data.split("_", 2)
            status = parts[1]  # yes o no
            habit_name = parts[2]
            
            completed = status == "yes"
            
            entry = HabitEntry(
                habit_name=habit_name,
                user_id=user_id,
                completed=completed,
                notes="Registro rápido"
            )
            
            success = self.sheets_service.add_habit_entry(entry)
            
            if success:
                emoji = "✅" if completed else "❌"
                await query.edit_message_text(
                    f"{emoji} **{habit_name}** registrado correctamente\n\n"
                    f"📊 Usa `/stats` para ver tu progreso"
                )
            else:
                await query.edit_message_text(
                    "❌ Error registrando el hábito. Inténtalo de nuevo."
                )
    
    def run(self):
        """Ejecutar el bot"""
        application = Application.builder().token(self.token).build()
        
        # Comandos
        application.add_handler(CommandHandler("start", self.start))
        application.add_handler(CommandHandler("help", self.help_command))
        application.add_handler(CommandHandler("add_habit", self.add_habit))
        application.add_handler(CommandHandler("my_habits", self.my_habits))
        application.add_handler(CommandHandler("track", self.track_habit))
        application.add_handler(CommandHandler("stats", self.stats))
        application.add_handler(CommandHandler("insights", self.insights))
        application.add_handler(CommandHandler("quick_track", self.quick_track))
        
        # Callbacks
        application.add_handler(CallbackQueryHandler(self.handle_callback))
        
        # Ejecutar
        print("HabitFlow AI Bot starting...")
        application.run_polling()


if __name__ == "__main__":
    bot = HabitFlowBot()
    bot.run()

