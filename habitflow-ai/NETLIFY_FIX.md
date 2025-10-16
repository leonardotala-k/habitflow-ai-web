# 🔧 Solución para Error en Netlify

El error "Page not found" indica que hay un problema con la configuración de Next.js para static export. Aquí están las soluciones:

## 🚀 Solución Rápida (Recomendada)

### Opción 1: Cambiar a Framework Preset

1. **En Netlify Dashboard:**
   - Ve a Site Settings → Build & Deploy
   - Framework Preset: Cambia a "Next.js" (si no está seleccionado)
   - Build Command: `npm run build`
   - Publish Directory: `.next`

2. **Actualizar next.config.js** a configuración estándar de Netlify:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  }
}

module.exports = nextConfig
```

### Opción 2: Usar @netlify/plugin-nextjs

1. **Crear `netlify.toml` más robusto:**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

2. **En package.json**, asegurar scripts correctos:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 🛠 Solución Alternativa: Static Export Limpio

### Si quieres mantener static export:

1. **next.config.js para static export:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './image-loader.js'
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  },
  // Deshabilitar features que no funcionan con static export
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
```

2. **Crear image-loader.js:**

```javascript
export default function loader({ src }) {
  return src
}
```

3. **netlify.toml para static export:**

```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## 🎯 Pasos a Seguir (Elige una opción)

### Opción A: Más Fácil (Recomendada)
1. Ir a Netlify Site Settings
2. Build & Deploy → Build Settings
3. Framework preset: "Next.js"
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Redeploy

### Opción B: Configuración Manual
1. Reemplazar archivos en GitHub con las configuraciones de arriba
2. Commit y push
3. Esperar auto-redeploy

## 🔍 Debugging

### Ver logs de build en Netlify:
1. Deploy log para ver errores específicos
2. Function log para errores de runtime

### Common issues:
- Node version incompatible → Especificar NODE_VERSION="18"
- Build command incorrecto → Verificar package.json
- Publish directory wrong → Debe ser `.next` o `out`

### Test local:
Si tuvieras Node.js local, podrías probar:
```bash
npm run build
```

## ⚡ Solución Más Rápida

**Si nada funciona, prueba esto:**

1. **En Netlify:** Site Settings → Build & Deploy
2. **Clear cache and deploy site**
3. **Framework preset:** Next.js 
4. **Node version:** 18
5. **Build command:** `npm run build`
6. **Publish directory:** `.next`

Esto debería funcionar inmediatamente.
