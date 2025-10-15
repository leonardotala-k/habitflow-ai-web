from typing import List, Dict, Any
import google.generativeai as genai
from datetime import datetime, timedelta
import json
from models.schemas import AIInsight, UserStats
from services.sheets_service import GoogleSheetsService


class AIAnalysisService:
    """Servicio para análisis de IA y generación de insights usando Google Gemini"""
    
    def __init__(self, gemini_api_key: str):
        genai.configure(api_key=gemini_api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def generate_insights(self, user_id: str, sheets_service: GoogleSheetsService) -> List[AIInsight]:
        """Generar insights personalizados para un usuario"""
        try:
            # Obtener datos del usuario
            habits = sheets_service.get_user_habits(user_id)
            entries = sheets_service.get_user_entries(user_id, days=30)
            stats = sheets_service.get_user_stats(user_id)
            
            if not entries:
                return [AIInsight(
                    user_id=user_id,
                    insight="¡Comienza a registrar tus hábitos para obtener insights personalizados! 🚀",
                    category="motivation",
                    confidence=1.0
                )]
            
            # Preparar contexto para la IA
            context = self._prepare_context(habits, entries, stats)
            
            # Generar insights con Gemini
            insights = self._call_gemini_for_insights(context, user_id)
            
            return insights
            
        except Exception as e:
            print(f"Error generando insights: {e}")
            return [AIInsight(
                user_id=user_id,
                insight="Hubo un problema generando tus insights. ¡Sigue registrando tus hábitos! 💪",
                category="motivation",
                confidence=0.5
            )]
    
    def _prepare_context(self, habits: List[Dict], entries: List[Dict], stats: UserStats) -> str:
        """Preparar contexto para el análisis de IA"""
        
        # Resumen de hábitos
        habit_names = [h['name'] for h in habits]
        
        # Análisis de entradas recientes
        completed_count = len([e for e in entries if e.get('completed', '').lower() == 'true'])
        total_entries = len(entries)
        
        # Patrones por día de la semana
        weekly_pattern = self._analyze_weekly_pattern(entries)
        
        # Contexto estructurado
        context = f"""
Datos del usuario (últimos 30 días):
- Hábitos activos: {', '.join(habit_names)}
- Total de registros: {total_entries}
- Registros completados: {completed_count}
- Tasa de éxito: {stats.completion_rate:.1%}
- Racha actual: {stats.streak_days} días
- Patrón semanal: {weekly_pattern}

Por favor, analiza estos datos y proporciona 3-4 insights útiles y motivadores.
Cada insight debe ser:
1. Específico y personal
2. Accionable
3. Motivador pero realista
4. Basado en los patrones observados

Formato de respuesta (JSON):
[
    {{
        "insight": "mensaje del insight",
        "category": "motivation|improvement|pattern|achievement",
        "confidence": 0.8
    }}
]
"""
        return context
    
    def _analyze_weekly_pattern(self, entries: List[Dict]) -> str:
        """Analizar patrones por día de la semana"""
        try:
            if not entries:
                return "Sin datos suficientes"
            
            from collections import defaultdict
            import datetime
            
            day_counts = defaultdict(int)
            day_completed = defaultdict(int)
            
            for entry in entries:
                try:
                    date = datetime.datetime.fromisoformat(entry['date'])
                    day_name = date.strftime('%A')
                    day_counts[day_name] += 1
                    if entry.get('completed', '').lower() == 'true':
                        day_completed[day_name] += 1
                except ValueError:
                    continue
            
            # Encontrar el mejor y peor día
            best_day = max(day_completed, key=day_completed.get) if day_completed else "Sin datos"
            worst_day = min(day_completed, key=day_completed.get) if day_completed else "Sin datos"
            
            return f"Mejor día: {best_day}, Día más difícil: {worst_day}"
            
        except Exception:
            return "Patrón no disponible"
    
    def _call_gemini_for_insights(self, context: str, user_id: str) -> List[AIInsight]:
        """Llamar a Google Gemini para generar insights"""
        try:
            prompt = f"""
Eres un coach experto en hábitos que ayuda a las personas a mejorar sus rutinas. 
Tu trabajo es analizar los datos de hábitos y proporcionar insights valiosos, motivadores y accionables.
Siempre mantén un tono positivo y constructivo. Usa emojis apropiados.

{context}

Responde SOLO con un JSON válido en este formato:
[
    {{
        "insight": "mensaje del insight específico y motivador",
        "category": "motivation",
        "confidence": 0.8
    }},
    {{
        "insight": "otro insight accionable",
        "category": "improvement", 
        "confidence": 0.9
    }}
]

Categorías válidas: motivation, improvement, pattern, achievement
"""
            
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            
            # Limpiar el contenido si tiene markdown
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            # Intentar parsear como JSON
            try:
                insights_data = json.loads(content)
                insights = []
                
                for insight_data in insights_data:
                    insights.append(AIInsight(
                        user_id=user_id,
                        insight=insight_data.get('insight', ''),
                        category=insight_data.get('category', 'motivation'),
                        confidence=float(insight_data.get('confidence', 0.7))
                    ))
                
                return insights
                
            except json.JSONDecodeError:
                # Si no es JSON válido, usar el contenido como un solo insight
                return [AIInsight(
                    user_id=user_id,
                    insight=content,
                    category="motivation",
                    confidence=0.7
                )]
            
        except Exception as e:
            print(f"Error llamando a Gemini: {e}")
            return [AIInsight(
                user_id=user_id,
                insight="¡Sigue así! Cada día que registras tus hábitos es un paso hacia una mejor versión de ti mismo. 🌟",
                category="motivation",
                confidence=0.5
            )]
    
    def get_habit_recommendation(self, user_habits: List[str]) -> str:
        """Recomendar nuevos hábitos basado en los actuales"""
        try:
            if not user_habits:
                return "Empieza con hábitos simples como beber 8 vasos de agua al día o caminar 10 minutos. 💧🚶‍♂️"
            
            habits_text = ", ".join(user_habits)
            
            prompt = f"""
El usuario ya tiene estos hábitos: {habits_text}. 

Recomienda 1-2 nuevos hábitos que complementen bien estos. 
Respuesta corta y motivadora (máximo 2 líneas).
Incluye emojis apropiados.
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"Error obteniendo recomendación: {e}")
            return "Considera agregar un hábito de mindfulness como 5 minutos de meditación diaria. 🧘‍♂️"

