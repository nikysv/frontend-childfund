# 🔐 Variables de Entorno

Este documento describe todas las variables de entorno necesarias para el proyecto.

## Variables Requeridas

### Supabase

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
```

**Cómo obtenerlas:**
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

### Backend API

```bash
VITE_API_URL=https://tu-backend.onrender.com
```

**Valores:**
- **Desarrollo local:** `http://localhost:5000`
- **Producción:** `https://tu-backend.onrender.com` (o la URL de tu backend)

## Configuración en Render

1. Ve a tu servicio en Render Dashboard
2. Click en **Environment**
3. Agrega cada variable con su valor correspondiente
4. Guarda los cambios
5. Render reconstruirá la aplicación automáticamente

## Configuración Local

Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=tu_url_aqui
VITE_SUPABASE_PUBLISHABLE_KEY=tu_key_aqui
VITE_API_URL=http://localhost:5000
```

**⚠️ Importante:** No commitees el archivo `.env` al repositorio. Ya está en `.gitignore`.

## Verificación

Para verificar que las variables están configuradas correctamente:

1. Abre la consola del navegador
2. Verifica que no haya errores de conexión
3. Revisa la pestaña Network para verificar que las peticiones se hacen a las URLs correctas

