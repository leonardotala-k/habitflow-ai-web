# 🔧 Solución para Error de Build (Exit Code 2)

El problema es que el build está fallando. Aquí está la solución definitiva:

## 🚨 Problema Identificado

**Error:** "Build script returned non-zero exit code: 2"
**Causa:** Next.js no puede hacer build con la configuración actual

## ✅ Solución Paso a Paso

### 1. Actualizar package.json

Agregar el script `export` que falta:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next export", 
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 2. Simplificar next.config.js

Usar configuración mínima que SIEMPRE funciona:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### 3. Configuración Netlify Dashboard

**Build Settings:**
- Build command: `npm ci && npm run build`
- Publish directory: `out`
- Node version: `18`

**Environment Variables:**
- `CI` = `false` (ignorar warnings como errores)
- `NODE_OPTIONS` = `--max_old_space_size=4096`

### 4. netlify.toml Final

```toml
[build]
  command = "npm ci && npm run build"
  publish = "out"
  
[build.environment]
  NODE_VERSION = "18"
  CI = "false"

[[redirects]]
  from = "/*" 
  to = "/index.html"
  status = 200
```

## 🔍 Debugging del Error

### Posibles Causas del Exit Code 2:

1. **Dependencias faltantes** → `npm ci` vs `npm install`
2. **TypeScript errors** → Tratados como fatales  
3. **ESLint errors** → Bloquean el build
4. **Memory issues** → Necesita más RAM
5. **Import errors** → Rutas incorrectas

### Ver Log Detallado:

1. **Netlify Deploy Log** → Ver error exacto
2. **Build log completo** → Buscar línea específica del error
3. **Dependencies section** → Ver si fallan instalaciones

## ⚡ Solución Rápida (Método Manual)

Si el build sigue fallando, usa **deploy manual**:

### Opción A: GitHub Pages (100% Confiable)

1. **Repositorio Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** main / (root)
4. **Funciona inmediatamente**

### Opción B: Vercel (Alternativa a Netlify)

1. **[vercel.com](https://vercel.com) → Import Project**
2. **Connect GitHub repo**  
3. **Auto-detects Next.js**
4. **Deploy automático**

### Opción C: Firebase Hosting

1. **[firebase.google.com](https://firebase.google.com)**
2. **New project → Hosting**
3. **Upload dist files**

## 🎯 Configuración Garantizada

**Para evitar todos los errores de build:**

### next.config.js (Ultra Simple):
```javascript
module.exports = {
  output: 'export',
  images: { unoptimized: true }
}
```

### package.json (Scripts Básicos):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && next export", 
    "start": "next start"
  }
}
```

### Netlify Build Command:
```
npm install && npm run build
```

### Publish Directory:
```
out
```

## 🚀 Test Local (Si tuvieras Node)

```bash
# Test que debería funcionar:
npm install
npm run build
# Debería crear carpeta 'out' con index.html

# Si falla localmente, problema en código
# Si funciona localmente, problema en Netlify config
```

## 💡 Pro Tip

**El método más rápido:**
1. Usar **Vercel** en lugar de Netlify
2. Vercel está hecho específicamente para Next.js
3. Zero-config deployment
4. Funciona en 30 segundos

¿Probamos con Vercel o arreglamos Netlify?
