# 🔧 Guía de Configuración - HabitFlow AI

Esta guía te ayudará a configurar tu MVP de HabitFlow AI paso a paso.

## 📋 Requisitos previos

- Python 3.8+
- Cuenta de Google (para Google Sheets)
- Cuenta de Telegram
- Cuenta de OpenAI

## 🚀 Instalación

### 1. Clonar y preparar el proyecto

```bash
git clone <tu-repo>
cd habitflow-ai
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

```bash
cp .env.template .env
```

Edita el archivo `.env` con tus credenciales:

```bash
# Bot de Telegram
TELEGRAM_BOT_TOKEN=1234567890:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS_FILE=credentials.json
SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

## 🤖 Configurar Bot de Telegram

### Paso 1: Crear el bot
1. Abre Telegram y busca [@BotFather](https://t.me/BotFather)
2. Envía `/newbot`
3. Elige un nombre para tu bot (ej: "HabitFlow AI")
4. Elige un username (ej: "habitflow_ai_bot")
5. **Copia el token** que te da BotFather

### Paso 2: Configurar comandos
Envía a @BotFather:
```
/setcommands
```

Luego selecciona tu bot y envía:
```
start - Iniciar el bot
help - Ver ayuda
add_habit - Agregar nuevo hábito
my_habits - Ver mis hábitos
track - Registrar progreso
quick_track - Registro rápido
stats - Ver estadísticas
insights - Análisis con IA
```

### Paso 3: Configurar descripción
```
/setdescription
```
Descripción sugerida:
```
🌟 HabitFlow AI - Tu asistente personal para el seguimiento de hábitos

Funciones:
🎯 Seguimiento de hábitos diarios
📊 Análisis de progreso
🤖 Insights personalizados con IA
🔥 Cálculo de rachas

¡Empieza tu viaje hacia mejores hábitos!
```

## 📊 Configurar Google Sheets

### Paso 1: Crear proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**:
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Sheets API"
   - Haz clic en "Habilitar"

### Paso 2: Crear cuenta de servicio
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Cuenta de servicio"
3. Llena el formulario:
   - Nombre: `habitflow-ai-service`
   - ID: `habitflow-ai-service`
4. En "Rol", selecciona "Editor"
5. Haz clic en "Crear clave" > "JSON"
6. **Descarga el JSON** y renómbralo a `credentials.json`
7. Colócalo en la carpeta raíz del proyecto

### Paso 3: Crear hoja de cálculo
1. Ve a [Google Sheets](https://sheets.google.com/)
2. Crea una nueva hoja de cálculo
3. Nómbrala "HabitFlow AI - Database"
4. **Copia el ID de la hoja** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                    ↑ Este es el SPREADSHEET_ID
   ```

### Paso 4: Compartir la hoja
1. En tu hoja de Google Sheets, haz clic en "Compartir"
2. Agrega el email de la cuenta de servicio (está en `credentials.json` como `client_email`)
3. Dale permisos de "Editor"

## 🧠 Configurar OpenAI

### Paso 1: Crear cuenta
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión

### Paso 2: Generar API Key
1. Ve a "API Keys"
2. Haz clic en "Create new secret key"
3. **Copia la clave** (solo se mostrará una vez)
4. Pégala en tu archivo `.env`

### Paso 3: Configurar billing (importante)
1. Ve a "Billing" en tu dashboard de OpenAI
2. Agrega un método de pago
3. Establece un límite mensual (recomendado: $10-20 para MVP)

## ⚙️ Configuración inicial

### Ejecutar setup automático
```bash
python scripts/setup.py
```

Este script:
- ✅ Verifica la conexión a Google Sheets
- ✅ Crea las hojas necesarias (users, habits, entries)
- ✅ Opcionalmente crea datos de ejemplo

### Verificar configuración
```bash
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

required = ['TELEGRAM_BOT_TOKEN', 'SPREADSHEET_ID', 'OPENAI_API_KEY']
for var in required:
    print(f'{var}: {'✅' if os.getenv(var) else '❌'}')
print(f'credentials.json: {'✅' if os.path.exists('credentials.json') else '❌'}')
"
```

## 🚀 Ejecutar el MVP

### Modo completo (recomendado)
```bash
python main.py
```
Esto ejecuta tanto la API como el bot.

### Solo bot
```bash
python main.py --mode bot
```

### Solo API
```bash
python main.py --mode api
```

## 🌐 Dashboard Web (opcional)

El dashboard está en `web/dashboard.html`. Para usarlo:

### Local
1. Abre `web/dashboard.html` en tu navegador
2. Funciona en modo demo si no hay backend

### Con Vercel (gratis)
1. Instala Vercel CLI: `npm i -g vercel`
2. En la carpeta `web/`: `vercel`
3. Sigue las instrucciones
4. Actualiza `API_BASE` en el HTML con tu URL de la API

## 🧪 Probar el MVP

### 1. Verificar API
```bash
curl http://localhost:8000/health
```

### 2. Probar bot
1. Busca tu bot en Telegram
2. Envía `/start`
3. Prueba comandos básicos:
   - `/add_habit Ejercicio`
   - `/track Ejercicio completado`
   - `/stats`
   - `/insights`

### 3. Verificar Google Sheets
Revisa que se crean registros en tu hoja de cálculo.

## 🔧 Solución de problemas comunes

### Bot no responde
- ✅ Verifica `TELEGRAM_BOT_TOKEN`
- ✅ Asegúrate de que el bot esté iniciado con @BotFather

### Error de Google Sheets
- ✅ Verifica que `credentials.json` existe
- ✅ Confirma que el `SPREADSHEET_ID` es correcto
- ✅ Verifica que la cuenta de servicio tiene acceso a la hoja

### Error de OpenAI
- ✅ Verifica `OPENAI_API_KEY`
- ✅ Confirma que tienes billing configurado
- ✅ Revisa tu límite de uso

### Dependencias
```bash
pip install --upgrade -r requirements.txt
```

## 📊 Costos estimados

### Mensual (uso moderado):
- **Google Sheets**: Gratis (hasta 100 requests/100s)
- **OpenAI**: $5-15 (dependiendo del uso)
- **Telegram**: Gratis
- **Hosting**: 
  - Railway/Render: Gratis (con límites)
  - Vercel: Gratis (para frontend)

**Total estimado: $5-15/mes** 🎯

## 🚀 Próximos pasos

Una vez funcionando:
1. **Prueba con usuarios reales** 
2. **Recopila feedback**
3. **Itera y mejora**
4. **Considera monetización**:
   - Suscripciones premium
   - Análisis avanzados
   - Integraciones adicionales

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `python main.py`
2. Verifica la configuración paso a paso
3. Prueba con datos de ejemplo: `python scripts/setup.py`

¡Tu MVP está listo para conquistar el mundo de los hábitos! 🌟

