# Configuración de Autenticación con Google

## ⚠️ IMPORTANTE: Configurar Google OAuth en Supabase

Para que el inicio de sesión con Google funcione correctamente **sin pedir contraseña**, necesitas configurar Google OAuth en Supabase.

### Pasos para Configurar Google OAuth en Supabase:

1. **Ve a [Supabase Dashboard](https://app.supabase.com/)**
2. **Selecciona tu proyecto**
3. **Ve a Authentication > Providers**
4. **Habilita Google** como proveedor
5. **Configura las credenciales de Google:**

   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un proyecto o selecciona uno existente
   - Ve a **APIs & Services > Credentials**
   - Crea un **OAuth 2.0 Client ID** para "Web application"
   - Agrega estas URLs autorizadas:
     - `http://localhost:8080` (desarrollo)
     - `http://localhost:5173` (Vite dev server)
     - Tu dominio de producción
   - Copia el **Client ID** y **Client Secret**
   - Pégalos en Supabase > Authentication > Providers > Google

6. **Configura el OAuth Consent Screen:**
   - En Google Cloud Console, ve a **APIs & Services > OAuth consent screen**
   - Configura:
     - **User Type**: External
     - **Application name**: SAO - Sistema de Acompañamiento y Orientación
     - **Authorized domains**: Tu dominio
     - **Scopes**: email, profile, openid

## Configuración de Firebase (Opcional - Solo como fallback)

### 1. Verificar Dominios Autorizados

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `childfund-a90da`
3. Ve a **Authentication** > **Settings** > **Authorized domains**
4. Asegúrate de que estos dominios estén agregados:
   - `localhost` (para desarrollo local)
   - `127.0.0.1` (para desarrollo local)
   - Tu dominio de producción (ej: `tu-dominio.com`)

### 2. Habilitar Google como Proveedor de Autenticación

1. En Firebase Console, ve a **Authentication** > **Sign-in method**
2. Habilita **Google** como proveedor
3. Configura:
   - **Project support email**: Tu email de soporte
   - **Project public-facing name**: ChildFund Bolivia - SAO

### 3. Configurar OAuth Consent Screen (Google Cloud Console)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto: `childfund-a90da`
3. Ve a **APIs & Services** > **OAuth consent screen**
4. Configura:
   - **User Type**: External (o Internal si es solo para tu organización)
   - **Application name**: SAO - Sistema de Acompañamiento y Orientación
   - **Authorized domains**: Agrega tus dominios
   - **Scopes**: email, profile, openid

### 4. Verificar Credenciales OAuth

1. En Google Cloud Console, ve a **APIs & Services** > **Credentials**
2. Verifica que exista un **OAuth 2.0 Client ID** para Web application
3. Asegúrate de que los **Authorized JavaScript origins** incluyan:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (alternativo)
   - Tu dominio de producción

### 5. Verificar en el Código

El archivo `src/integrations/firebase/config.ts` ya tiene la configuración correcta. Solo asegúrate de que:

- Las credenciales sean correctas
- El dominio desde el que se ejecuta la app esté autorizado

## Solución de Problemas

### Error: "auth/popup-blocked"

- **Causa**: El navegador está bloqueando popups
- **Solución**: Permite popups para tu dominio en la configuración del navegador

### Error: "auth/popup-closed-by-user"

- **Causa**: El usuario cerró el popup de Google
- **Solución**: Intenta de nuevo y no cierres el popup

### Error: "auth/network-request-failed"

- **Causa**: Problema de conexión o dominio no autorizado
- **Solución**:
  1. Verifica tu conexión a internet
  2. Asegúrate de que el dominio esté en la lista de dominios autorizados en Firebase

### Error: "already registered" o "already exists"

- **Causa**: El email ya está registrado en Supabase
- **Solución**: Usa el método de inicio de sesión normal con tu contraseña

### El popup no se abre

- **Causa**: Dominio no autorizado o bloqueador de popups
- **Solución**:
  1. Verifica que `localhost` esté en dominios autorizados
  2. Desactiva bloqueadores de popups temporalmente
  3. Verifica la consola del navegador para más detalles

## Verificación

Para verificar que todo está configurado correctamente:

1. Abre la consola del navegador (F12)
2. Intenta iniciar sesión con Google
3. Revisa los mensajes en la consola:
   - Deberías ver: "Iniciando autenticación con Google..."
   - Luego: "Usuario autenticado en Firebase: [email]"
   - Luego: "Sincronizando con Supabase..."
   - Finalmente: "Sincronización completada"

Si ves errores, revisa los pasos anteriores.
