from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import gspread
from google.oauth2.service_account import Credentials
from models.schemas import Habit, HabitEntry, TelegramUser, UserStats
import pandas as pd
import os


class GoogleSheetsService:
    """Servicio para manejar Google Sheets como base de datos"""
    
    def __init__(self, credentials_file: str, spreadsheet_id: str):
        self.credentials_file = credentials_file
        self.spreadsheet_id = spreadsheet_id
        self.client = None
        self.spreadsheet = None
        self._connect()
    
    def _connect(self):
        """Conectar a Google Sheets"""
        try:
            scope = [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]
            
            creds = Credentials.from_service_account_file(
                self.credentials_file, 
                scopes=scope
            )
            self.client = gspread.authorize(creds)
            self.spreadsheet = self.client.open_by_key(self.spreadsheet_id)
            
            # Crear hojas si no existen
            self._initialize_sheets()
            
        except Exception as e:
            print(f"Error conectando a Google Sheets: {e}")
            raise
    
    def _initialize_sheets(self):
        """Inicializar las hojas necesarias"""
        try:
            # Hoja de usuarios
            try:
                self.spreadsheet.worksheet("users")
            except gspread.WorksheetNotFound:
                users_sheet = self.spreadsheet.add_worksheet(title="users", rows="1000", cols="10")
                users_sheet.append_row([
                    "user_id", "username", "first_name", "last_name", 
                    "joined_at", "is_active"
                ])
            
            # Hoja de hábitos
            try:
                self.spreadsheet.worksheet("habits")
            except gspread.WorksheetNotFound:
                habits_sheet = self.spreadsheet.add_worksheet(title="habits", rows="1000", cols="10")
                habits_sheet.append_row([
                    "user_id", "name", "description", "target_frequency", "created_at"
                ])
            
            # Hoja de entradas
            try:
                self.spreadsheet.worksheet("entries")
            except gspread.WorksheetNotFound:
                entries_sheet = self.spreadsheet.add_worksheet(title="entries", rows="5000", cols="10")
                entries_sheet.append_row([
                    "user_id", "habit_name", "completed", "date", "notes", "rating"
                ])
                
        except Exception as e:
            print(f"Error inicializando hojas: {e}")
    
    def create_user(self, user: TelegramUser) -> bool:
        """Crear un nuevo usuario"""
        try:
            users_sheet = self.spreadsheet.worksheet("users")
            
            # Verificar si el usuario ya existe
            existing_users = users_sheet.get_all_records()
            for existing_user in existing_users:
                if existing_user['user_id'] == user.user_id:
                    return False  # Usuario ya existe
            
            # Agregar nuevo usuario
            users_sheet.append_row([
                user.user_id,
                user.username or "",
                user.first_name or "",
                user.last_name or "",
                user.joined_at.isoformat(),
                str(user.is_active)
            ])
            return True
            
        except Exception as e:
            print(f"Error creando usuario: {e}")
            return False
    
    def create_habit(self, habit: Habit) -> bool:
        """Crear un nuevo hábito"""
        try:
            habits_sheet = self.spreadsheet.worksheet("habits")
            
            # Verificar si el hábito ya existe para este usuario
            existing_habits = habits_sheet.get_all_records()
            for existing_habit in existing_habits:
                if (existing_habit['user_id'] == habit.user_id and 
                    existing_habit['name'].lower() == habit.name.lower()):
                    return False  # Hábito ya existe
            
            # Agregar nuevo hábito
            habits_sheet.append_row([
                habit.user_id,
                habit.name,
                habit.description or "",
                habit.target_frequency,
                habit.created_at.isoformat()
            ])
            return True
            
        except Exception as e:
            print(f"Error creando hábito: {e}")
            return False
    
    def add_habit_entry(self, entry: HabitEntry) -> bool:
        """Agregar una entrada de hábito"""
        try:
            entries_sheet = self.spreadsheet.worksheet("entries")
            
            entries_sheet.append_row([
                entry.user_id,
                entry.habit_name,
                str(entry.completed),
                entry.date.isoformat(),
                entry.notes or "",
                str(entry.rating) if entry.rating else ""
            ])
            return True
            
        except Exception as e:
            print(f"Error agregando entrada: {e}")
            return False
    
    def get_user_habits(self, user_id: str) -> List[Dict[str, Any]]:
        """Obtener todos los hábitos de un usuario"""
        try:
            habits_sheet = self.spreadsheet.worksheet("habits")
            all_habits = habits_sheet.get_all_records()
            
            user_habits = [
                habit for habit in all_habits 
                if habit['user_id'] == user_id
            ]
            return user_habits
            
        except Exception as e:
            print(f"Error obteniendo hábitos: {e}")
            return []
    
    def get_user_entries(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Obtener entradas de un usuario de los últimos N días"""
        try:
            entries_sheet = self.spreadsheet.worksheet("entries")
            all_entries = entries_sheet.get_all_records()
            
            # Filtrar por usuario y fecha
            cutoff_date = datetime.now() - timedelta(days=days)
            user_entries = []
            
            for entry in all_entries:
                if entry['user_id'] == user_id:
                    try:
                        entry_date = datetime.fromisoformat(entry['date'])
                        if entry_date >= cutoff_date:
                            user_entries.append(entry)
                    except ValueError:
                        continue  # Ignorar fechas malformadas
            
            return user_entries
            
        except Exception as e:
            print(f"Error obteniendo entradas: {e}")
            return []
    
    def get_user_stats(self, user_id: str) -> UserStats:
        """Calcular estadísticas de un usuario"""
        try:
            habits = self.get_user_habits(user_id)
            entries = self.get_user_entries(user_id, days=30)
            
            total_habits = len(habits)
            active_habits = len([h for h in habits if h])  # Simplificado por ahora
            
            # Calcular tasa de completación
            completed_entries = [e for e in entries if e.get('completed', '').lower() == 'true']
            completion_rate = len(completed_entries) / len(entries) if entries else 0.0
            
            # Calcular racha (simplificado)
            streak_days = self._calculate_streak(user_id)
            
            # Última actividad
            last_activity = datetime.now()  # Simplificado
            if entries:
                try:
                    last_entry_date = max([datetime.fromisoformat(e['date']) for e in entries])
                    last_activity = last_entry_date
                except ValueError:
                    pass
            
            return UserStats(
                user_id=user_id,
                total_habits=total_habits,
                active_habits=active_habits,
                completion_rate=completion_rate,
                streak_days=streak_days,
                last_activity=last_activity
            )
            
        except Exception as e:
            print(f"Error calculando estadísticas: {e}")
            return UserStats(
                user_id=user_id,
                total_habits=0,
                active_habits=0,
                completion_rate=0.0,
                streak_days=0,
                last_activity=datetime.now()
            )
    
    def _calculate_streak(self, user_id: str) -> int:
        """Calcular la racha actual de días"""
        try:
            entries = self.get_user_entries(user_id, days=365)  # Último año
            
            if not entries:
                return 0
            
            # Convertir a DataFrame para análisis más fácil
            df = pd.DataFrame(entries)
            df['date'] = pd.to_datetime(df['date'])
            df['completed'] = df['completed'].str.lower() == 'true'
            
            # Agrupar por día y verificar si hubo al menos un hábito completado
            daily_completion = df.groupby(df['date'].dt.date)['completed'].any()
            
            # Calcular racha desde el día más reciente
            streak = 0
            for date in sorted(daily_completion.index, reverse=True):
                if daily_completion[date]:
                    streak += 1
                else:
                    break
            
            return streak
            
        except Exception as e:
            print(f"Error calculando racha: {e}")
            return 0

