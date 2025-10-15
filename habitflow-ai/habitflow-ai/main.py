import os
import sys
import asyncio
from dotenv import load_dotenv

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()


def run_api():
    """Ejecutar la API de FastAPI"""
    import uvicorn
    from api.main import app
    
    uvicorn.run(
        app,
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )


def run_bot():
    """Ejecutar el bot de Telegram"""
    from bot.telegram_bot import HabitFlowBot
    
    bot = HabitFlowBot()
    bot.run()


def run_both():
    """Ejecutar tanto la API como el bot"""
    import threading
    
    # Ejecutar API en un hilo separado
    api_thread = threading.Thread(target=run_api, daemon=True)
    api_thread.start()
    
    print("API started in background...")
    print("Starting Telegram bot...")
    
    # Ejecutar bot en el hilo principal
    run_bot()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="HabitFlow AI - MVP")
    parser.add_argument(
        "--mode",
        choices=["api", "bot", "both"],
        default="both",
        help="Modo de ejecución: api, bot, o both (default: both)"
    )
    
    args = parser.parse_args()
    
    print("HabitFlow AI - MVP Starting...")
    print(f"Working directory: {os.getcwd()}")
    print(f"Mode: {args.mode}")
    
    # Verificar variables de entorno
    required_env_vars = [
        "TELEGRAM_BOT_TOKEN",
        "GOOGLE_SHEETS_CREDENTIALS_FILE", 
        "SPREADSHEET_ID",
        "GEMINI_API_KEY"
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        print("Missing environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nCopy .env.template to .env and complete the variables")
        sys.exit(1)
    
    # Verificar archivo de credenciales
    creds_file = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE")
    if not os.path.exists(creds_file):
        print(f"Credentials file not found: {creds_file}")
        print("Download credentials.json from Google Cloud Console")
        sys.exit(1)
    
    print("Configuration verified")
    print("-" * 50)
    
    try:
        if args.mode == "api":
            run_api()
        elif args.mode == "bot":
            run_bot()
        else:
            run_both()
    except KeyboardInterrupt:
        print("\nGoodbye!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

