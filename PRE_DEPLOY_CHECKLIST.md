# ✅ Checklist Pre-Despliegue

Usa esta lista para asegurarte de que todo esté listo antes de desplegar a producción.

## 🔧 Configuración del Proyecto

- [ ] Todas las dependencias están en `package.json`
- [ ] El proyecto se construye sin errores: `npm run build`
- [ ] No hay errores de linting: `npm run lint`
- [ ] El preview funciona localmente: `npm run preview`

## 🔐 Variables de Entorno

- [ ] `VITE_SUPABASE_URL` configurada correctamente
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` configurada correctamente
- [ ] `VITE_API_URL` apunta al backend de producción
- [ ] Todas las variables están documentadas en `ENV_VARIABLES.md`

## 🌐 Configuración de Servicios Externos

### Supabase
- [ ] El dominio de producción está autorizado en Supabase
- [ ] Las políticas RLS están configuradas correctamente
- [ ] El trigger `handle_new_user` está funcionando
- [ ] Las migraciones están aplicadas

### Firebase
- [ ] El dominio de producción está en los dominios autorizados
- [ ] Google Sign-In está habilitado
- [ ] Las credenciales de OAuth están configuradas

### Backend Flask
- [ ] El backend está desplegado y funcionando
- [ ] CORS está configurado para permitir el dominio de producción
- [ ] Las variables de entorno del backend están configuradas
- [ ] La base de datos del backend está configurada

## 📝 Archivos de Configuración

- [ ] `render.yaml` o `render-static.yaml` está configurado
- [ ] `.gitignore` incluye archivos sensibles
- [ ] `DEPLOY.md` tiene instrucciones actualizadas
- [ ] `ENV_VARIABLES.md` está completo

## 🧪 Pruebas

- [ ] Registro de usuario funciona
- [ ] Inicio de sesión funciona
- [ ] Google Sign-In funciona
- [ ] Las llamadas al backend funcionan
- [ ] Las rutas protegidas funcionan
- [ ] El diagnóstico funciona
- [ ] Los módulos de aprendizaje cargan
- [ ] Las transacciones financieras funcionan
- [ ] La comunidad funciona
- [ ] El calendario funciona

## 🚀 Despliegue

- [ ] Repositorio está sincronizado con GitHub/GitLab
- [ ] Render está conectado al repositorio
- [ ] Variables de entorno están configuradas en Render
- [ ] Build command está correcto: `npm install && npm run build`
- [ ] Publish directory está correcto: `dist`
- [ ] El primer deploy se completó exitosamente

## 🔍 Post-Despliegue

- [ ] La aplicación carga correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Las peticiones HTTP funcionan (revisar Network tab)
- [ ] Los estilos se cargan correctamente
- [ ] Las imágenes y assets se cargan
- [ ] El SEO básico está funcionando (meta tags)

## 📊 Monitoreo

- [ ] Logs de Render están configurados
- [ ] Errores están siendo capturados y registrados
- [ ] Analytics (si aplica) está configurado

---

**Nota:** Marca cada item cuando esté completo. Si encuentras problemas, revisa la documentación en `DEPLOY.md` o los logs de Render.

