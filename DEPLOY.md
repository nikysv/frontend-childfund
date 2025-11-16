# 🚀 Guía de Despliegue a Render

Esta guía te ayudará a desplegar el frontend de Emprende Voz en Render.

## 📋 Requisitos Previos

1. Cuenta en [Render](https://render.com)
2. Cuenta en [Supabase](https://supabase.com)
3. Backend Flask desplegado en Render (o la URL del backend)

## 🔧 Configuración en Render

### Opción 1: Despliegue Estático (Recomendado)

1. **Conecta tu repositorio:**
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - Click en "New +" → "Static Site"
   - Conecta tu repositorio de GitHub/GitLab

2. **Configuración:**
   - **Name:** `emprende-voz-frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

3. **Variables de Entorno:**
   Agrega las siguientes variables de entorno en Render:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
   VITE_API_URL=https://tu-backend.onrender.com
   ```

4. **Deploy:**
   - Click en "Create Static Site"
   - Render construirá y desplegará tu aplicación

### Opción 2: Despliegue con Node.js

Si prefieres usar Node.js para servir la aplicación:

1. **Conecta tu repositorio:**
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio

2. **Configuración:**
   - **Name:** `emprende-voz-frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview`

3. **Variables de Entorno:**
   (Mismas que en Opción 1)

## 🔐 Variables de Entorno

### Obtener credenciales de Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

### URL del Backend:

- Si tu backend está en Render: `https://tu-backend.onrender.com`
- Si está en otro lugar: usa la URL completa

## 📝 Notas Importantes

1. **Build Time Variables:**
   - Las variables `VITE_*` se inyectan en tiempo de build
   - Si cambias las variables, necesitas hacer un nuevo deploy

2. **CORS:**
   - Asegúrate de que tu backend Flask tenga configurado CORS para permitir tu dominio de Render
   - Ejemplo: `https://emprende-voz-frontend.onrender.com`

3. **Supabase:**
   - Agrega tu dominio de Render a las URLs autorizadas en Supabase
   - Ve a **Authentication** → **URL Configuration**
   - Agrega: `https://tu-app.onrender.com`

4. **Firebase:**
   - Agrega tu dominio de Render a los dominios autorizados en Firebase
   - Ve a [Firebase Console](https://console.firebase.google.com)
   - **Authentication** → **Settings** → **Authorized domains**

## 🧪 Verificar el Despliegue

Después del despliegue:

1. Visita tu URL de Render
2. Verifica que la aplicación carga correctamente
3. Prueba el registro e inicio de sesión
4. Verifica que las llamadas al backend funcionan

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. Haz push a tu repositorio
2. Render detectará los cambios automáticamente
3. Se ejecutará un nuevo build y deploy

## 🐛 Solución de Problemas

### Error: "Failed to fetch"
- Verifica que `VITE_API_URL` esté correctamente configurada
- Verifica que el backend esté corriendo y accesible
- Revisa la configuración de CORS en el backend

### Error: "Supabase connection failed"
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` sean correctos
- Verifica que el dominio esté autorizado en Supabase

### Build falla
- Revisa los logs de build en Render
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `npm install` se ejecute correctamente

## 📞 Soporte

Si tienes problemas, revisa:
- [Documentación de Render](https://render.com/docs)
- [Documentación de Vite](https://vitejs.dev/guide/static-deploy.html)
- Logs de build y runtime en Render Dashboard

