"""
Setup inicial para Google Sheets
Este script ayuda a configurar la hoja de cálculo inicial
"""
import os
import sys
from dotenv import load_dotenv

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from services.sheets_service import GoogleSheetsService
from utils.config import SHEET_HEADERS, SHEET_NAMES


def setup_google_sheets():
    """Configurar Google Sheets inicial"""
    print("🔧 Configurando Google Sheets...")
    
    try:
        # Crear servicio
        sheets_service = GoogleSheetsService(
            credentials_file=os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE"),
            spreadsheet_id=os.getenv("SPREADSHEET_ID")
        )
        
        print("✅ Conexión a Google Sheets exitosa")
        print("✅ Hojas inicializadas correctamente")
        
        # Verificar hojas
        for sheet_name in SHEET_NAMES.values():
            try:
                sheet = sheets_service.spreadsheet.worksheet(sheet_name)
                row_count = len(sheet.get_values())
                print(f"📄 Hoja '{sheet_name}': {row_count} filas")
            except Exception as e:
                print(f"❌ Error con hoja '{sheet_name}': {e}")
        
        print("\n🎉 Google Sheets configurado correctamente!")
        return True
        
    except Exception as e:
        print(f"❌ Error configurando Google Sheets: {e}")
        return False


def create_sample_data():
    """Crear datos de ejemplo para testing"""
    print("\n📊 ¿Quieres crear datos de ejemplo? (y/n): ", end="")
    response = input().lower()
    
    if response != 'y':
        return
    
    try:
        from models.schemas import TelegramUser, Habit, HabitEntry
        from datetime import datetime, timedelta
        
        sheets_service = GoogleSheetsService(
            credentials_file=os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE"),
            spreadsheet_id=os.getenv("SPREADSHEET_ID")
        )
        
        # Usuario de ejemplo
        sample_user = TelegramUser(
            user_id="123456789",
            username="test_user",
            first_name="Usuario",
            last_name="Prueba"
        )
        
        sheets_service.create_user(sample_user)
        print("✅ Usuario de ejemplo creado")
        
        # Hábitos de ejemplo
        sample_habits = [
            Habit(name="Ejercicio", user_id="123456789", description="30 min de ejercicio"),
            Habit(name="Lectura", user_id="123456789", description="Leer 30 páginas"),
            Habit(name="Meditación", user_id="123456789", description="10 min de meditación")
        ]
        
        for habit in sample_habits:
            sheets_service.create_habit(habit)
            print(f"✅ Hábito '{habit.name}' creado")
        
        # Entradas de ejemplo (últimos 7 días)
        import random
        for i in range(7):
            date = datetime.now() - timedelta(days=i)
            for habit in sample_habits:
                entry = HabitEntry(
                    habit_name=habit.name,
                    user_id="123456789",
                    completed=random.choice([True, False, True]),  # 2/3 probabilidad de completar
                    date=date,
                    notes=f"Registro del día {date.strftime('%d/%m')}"
                )
                sheets_service.add_habit_entry(entry)
        
        print("✅ Entradas de ejemplo creadas")
        print("\n🎉 Datos de ejemplo listos!")
        print("👤 Usuario de prueba: 123456789")
        
    except Exception as e:
        print(f"❌ Error creando datos de ejemplo: {e}")


def main():
    """Función principal"""
    print("🌟 HabitFlow AI - Setup")
    print("=" * 40)
    
    # Verificar variables de entorno
    required_vars = [
        "GOOGLE_SHEETS_CREDENTIALS_FILE",
        "SPREADSHEET_ID"
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Variables de entorno faltantes:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n📝 Configura tu archivo .env primero")
        return
    
    # Verificar archivo de credenciales
    creds_file = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE")
    if not os.path.exists(creds_file):
        print(f"❌ Archivo de credenciales no encontrado: {creds_file}")
        print("📝 Descarga credentials.json desde Google Cloud Console")
        return
    
    print("✅ Configuración verificada")
    print("-" * 40)
    
    # Configurar Google Sheets
    if setup_google_sheets():
        create_sample_data()
    
    print("\n👍 Setup completado!")
    print("🚀 Ahora puedes ejecutar: python main.py")


if __name__ == "__main__":
    main()

