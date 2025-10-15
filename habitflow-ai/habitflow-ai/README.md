# 🌟 HabitFlow AI - MVP

Un habit tracker inteligente que analiza tu progreso y te da insights personalizados usando IA.

## 🚀 Características

- 📱 **Interfaz via Telegram**: Fácil de usar, notificaciones automáticas
- 📊 **Google Sheets**: Base de datos simple y accesible
- 🤖 **Análisis con IA**: Insights personalizados sobre tus hábitos
- 🌐 **Dashboard web**: Visualizaciones avanzadas (opcional)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd habitflow-ai
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Ejecutar el backend**
```bash
python main.py
```

## 📋 Configuración inicial

### 1. Bot de Telegram
1. Habla con [@BotFather](https://t.me/BotFather)
2. Crea un nuevo bot: `/newbot`
3. Copia el token en `.env`

### 2. Google Sheets
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto y habilita Google Sheets API
3. Descarga `credentials.json`
4. Crea una hoja de cálculo y copia el ID

### 3. OpenAI
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una API key
3. Añádela a `.env`

## 🎯 Uso

1. **Iniciar conversación**: Envía `/start` al bot
2. **Agregar hábito**: `/add_habit Ejercicio`
3. **Registrar progreso**: `/track Ejercicio completado`
4. **Ver análisis**: `/insights`

## 🏗️ Arquitectura

```
habitflow-ai/
├── main.py              # FastAPI app principal
├── bot/                 # Bot de Telegram
├── api/                 # Endpoints de FastAPI
├── services/            # Lógica de negocio
├── models/              # Modelos de datos
└── utils/               # Utilidades
```

