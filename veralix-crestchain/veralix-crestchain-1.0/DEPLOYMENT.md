# Guía de Deployment - Veralix Platform

**Fecha de creación:** 14 de Noviembre de 2025  
**Última actualización:** 14 de Noviembre de 2025  
**Versión:** 1.0.0

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Configuración de GitHub](#configuración-de-github)
4. [Configuración de Windsurf](#configuración-de-windsurf)
5. [Configuración de Portainer](#configuración-de-portainer)
6. [Configuración de Cloudflare](#configuración-de-cloudflare)
7. [CI/CD con GitHub Actions](#cicd-con-github-actions)
8. [Variables de Entorno](#variables-de-entorno)
9. [Deployment Manual](#deployment-manual)
10. [Verificación y Testing](#verificación-y-testing)
11. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

### Infraestructura
- ✅ Servidor Linux con Docker instalado
- ✅ Portainer CE/EE instalado y configurado
- ✅ Traefik como reverse proxy configurado
- ✅ Red Docker `traefik_proxy` creada
- ✅ Certificados SSL configurados (Let's Encrypt)

### Servicios Backend
- ✅ Supabase self-hosted instalado con:
  - PostgreSQL (base de datos principal)
  - MinIO (storage para imágenes)
  - Kong Gateway (API Gateway)
  - PostgREST (REST API)
  - GoTrue (autenticación)
  - Realtime (subscripciones)
- ✅ Base de datos con 68 migraciones aplicadas

### Dominios y DNS
- ✅ Dominio: `oriluxtech.com`
- ✅ Cloudflare configurado como DNS provider
- ✅ Registros DNS configurados (ver sección Cloudflare)

### Cuentas y Accesos
- ✅ Cuenta GitHub con repositorio creado
- ✅ Acceso a Portainer con permisos de administrador
- ✅ Acceso a Cloudflare con permisos de edición DNS
- ✅ Credenciales de Supabase (URL, Anon Key, Service Role Key)

---

## 🏗️ Stack Tecnológico

### Frontend
```yaml
Framework: React 18.3.1
Build Tool: Vite 5.4
Language: TypeScript 5.8
Styling: Tailwind CSS 3.4
UI Components: Radix UI + shadcn/ui
State Management: TanStack Query 5.83
Routing: React Router DOM 6.30
Forms: React Hook Form 7.61 + Zod 3.25
PWA: vite-plugin-pwa 1.1
Icons: Lucide React 0.462
```

### Backend (Supabase)
```yaml
Database: PostgreSQL 15
Storage: MinIO (S3-compatible)
Auth: GoTrue (email, OAuth Google)
Edge Functions: Deno (9 funciones activas)
Realtime: WebSocket subscriptions
API: PostgREST (auto-generated REST API)
```

### Infraestructura
```yaml
Container Runtime: Docker 24+
Orchestration: Docker Compose + Portainer
Reverse Proxy: Traefik 2.x
SSL/TLS: Let's Encrypt (automatic)
CDN/DNS: Cloudflare
CI/CD: GitHub Actions
```

### Integraciones de Pago
```yaml
Bold Payments: Integrado (Colombia)
Stripe: Preparado (no activo)
DIAN: Integración para facturación electrónica
```

---

## 🔐 Configuración de GitHub

### 1. Conectar Lovable a GitHub

```bash
# En Lovable:
1. Ir a GitHub → "Connect to GitHub"
2. Autorizar Lovable GitHub App
3. Seleccionar organización/cuenta
4. Crear repositorio "veralix-platform"
5. Verificar sincronización bidireccional
```

### 2. Configurar Branch Protection

```bash
# En GitHub:
Settings → Branches → Add rule

Branch name pattern: main
✅ Require pull request reviews before merging
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
✅ Include administrators
```

### 3. Configurar Secrets

```bash
# Settings → Secrets and variables → Actions → New repository secret

PORTAINER_URL: https://portainer.tuservidor.com
PORTAINER_USERNAME: admin
PORTAINER_PASSWORD: ****
STACK_NAME: veralix-platform
VITE_SUPABASE_URL: https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY: eyJ...
VITE_SUPABASE_PROJECT_ID: tu-project-id
```

---

## 💻 Configuración de Windsurf

### 1. Clonar Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/tu-usuario/veralix-platform.git
cd veralix-platform

# Verificar rama principal
git branch -a
git checkout main
```

### 2. Configurar Entorno Local

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus credenciales
nano .env.local
```

Contenido de `.env.local`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://hykegpmjnpaupvwptxtl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=hykegpmjnpaupvwptxtl

# Bold Payments (Colombia)
VITE_BOLD_MERCHANT_ID=tu-merchant-id
VITE_BOLD_PUBLIC_KEY=tu-public-key

# Optional: Development
VITE_ENABLE_DEV_TOOLS=true
```

### 3. Instalar Dependencias

```bash
# Instalar paquetes
npm install

# Verificar versiones
npm list --depth=0

# Ejecutar desarrollo
npm run dev
```

### 4. Configurar Windsurf IDE

```json
// .vscode/settings.json (crear si no existe)
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 5. Verificar Sincronización Bidireccional

```bash
# Test 1: Cambio local → GitHub → Lovable
echo "# Test sync" >> test-sync.md
git add test-sync.md
git commit -m "test: Verify bidirectional sync"
git push origin main

# Verificar en Lovable que aparece el archivo

# Test 2: Cambio en Lovable → GitHub → Local
# Hacer un cambio en Lovable
git pull origin main

# Verificar que el cambio aparece localmente
```

---

## 🐳 Configuración de Portainer

### 1. Crear Stack desde Git

```bash
# En Portainer UI:
Stacks → Add stack → Git Repository

Name: veralix-platform
Repository URL: https://github.com/tu-usuario/veralix-platform
Repository reference: refs/heads/main
Compose path: docker-compose.yml
Authentication: ✅ (usar GitHub token si es privado)
```

### 2. Configurar Variables de Entorno

```yaml
# En Portainer → Stack → Environment variables

VITE_SUPABASE_URL: https://hykegpmjnpaupvwptxtl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID: hykegpmjnpaupvwptxtl
NODE_ENV: production
```

### 3. Conectar a Red Traefik

```bash
# Verificar que la red existe
docker network ls | grep traefik_proxy

# Si no existe, crearla
docker network create traefik_proxy

# El docker-compose.yml ya la usa automáticamente
```

### 4. Deploy Stack

```bash
# En Portainer:
Deploy the stack → Esperar build

# Verificar logs en tiempo real:
Containers → veralix-frontend → Logs
```

### 5. Configurar Webhook (Auto-deploy)

```bash
# En Portainer:
Stacks → veralix-platform → Webhooks

✅ Create webhook
Copiar URL del webhook

# En GitHub:
Settings → Webhooks → Add webhook
Payload URL: [URL del webhook de Portainer]
Content type: application/json
Events: ✅ Just the push event
```

---

## ☁️ Configuración de Cloudflare

### 1. Agregar Dominio

```bash
# En Cloudflare Dashboard:
Add site → oriluxtech.com
Select plan: Free
```

### 2. Configurar DNS Records

```dns
# Tipo  Nombre  Contenido                          Proxy  TTL
A       @       [IP-DE-TU-SERVIDOR]               ☁️      Auto
A       www     [IP-DE-TU-SERVIDOR]               ☁️      Auto
CNAME   api     hykegpmjnpaupvwptxtl.supabase.co  📄      Auto

# Nota: 
# ☁️ = Proxied (naranja) - Pasa por Cloudflare
# 📄 = DNS Only (gris) - Directo al servidor
```

### 3. Configurar SSL/TLS

```bash
# SSL/TLS → Overview
Encryption mode: Full (strict)

# Edge Certificates
✅ Always Use HTTPS
✅ Automatic HTTPS Rewrites
✅ Certificate Transparency Monitoring
Minimum TLS Version: TLS 1.2

# Origin Server
Crear Origin Certificate (15 años)
Descargar .pem y .key
Instalar en Traefik
```

### 4. Optimizar Speed

```bash
# Speed → Optimization
✅ Auto Minify: JavaScript, CSS, HTML
✅ Brotli
✅ Early Hints
✅ HTTP/2 to Origin
✅ HTTP/3 (with QUIC)
✅ 0-RTT Connection Resumption
✅ Rocket Loader

# Caching
✅ Always Online
✅ Development Mode (OFF en producción)
```

### 5. Page Rules

```bash
# Rules → Page Rules → Create Page Rule

Rule 1: Cache Static Assets
URL: oriluxtech.com/assets/*
Settings:
  - Browser Cache TTL: 1 month
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

Rule 2: Cache Images
URL: oriluxtech.com/*.{jpg,jpeg,png,gif,svg,webp,ico}
Settings:
  - Browser Cache TTL: 1 month
  - Cache Level: Cache Everything

Rule 3: Force HTTPS
URL: http://*oriluxtech.com/*
Settings:
  - Always Use HTTPS
```

### 6. Security Settings

```bash
# Security → Settings
✅ Security Level: Medium
✅ Challenge Passage: 30 minutes
✅ Browser Integrity Check

# Firewall → Firewall Rules
Crear regla para bloquear bots:
  Expression: (cf.threat_score gt 30)
  Action: Challenge (Managed Challenge)

# Security → Bots
✅ Bot Fight Mode (Free plan)
```

---

## 🚀 CI/CD con GitHub Actions

El workflow `.github/workflows/deploy.yml` automatiza:

1. **Build**: Compila la aplicación React con Vite
2. **Test**: Ejecuta linter y type-check
3. **Deploy**: Despliega a Portainer vía webhook

### Flujo de Trabajo

```bash
# 1. Developer hace push a main
git push origin main

# 2. GitHub Actions se activa automáticamente
# 3. Ejecuta build y tests
# 4. Si pasa, hace deploy a Portainer
# 5. Portainer reconstruye y reinicia el stack
# 6. Verificación automática de health check
```

### Monitorear Deployments

```bash
# En GitHub:
Actions → Workflows → Deploy to Portainer

# Ver logs en tiempo real
# Ver estado de cada step
# Ver artefactos generados
```

---

## 📝 Variables de Entorno

### Producción (.env en Portainer)

```env
# === SUPABASE ===
VITE_SUPABASE_URL=https://hykegpmjnpaupvwptxtl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=hykegpmjnpaupvwptxtl

# === BOLD PAYMENTS ===
VITE_BOLD_MERCHANT_ID=tu-merchant-id
VITE_BOLD_PUBLIC_KEY=tu-public-key
VITE_BOLD_INTEGRITY_KEY=tu-integrity-key

# === DIAN (Facturación Electrónica Colombia) ===
VITE_DIAN_ENVIRONMENT=produccion
VITE_DIAN_NIT=tu-nit
VITE_DIAN_SOFTWARE_ID=tu-software-id

# === APLICACIÓN ===
NODE_ENV=production
VITE_APP_URL=https://oriluxtech.com
VITE_API_URL=https://api.oriluxtech.com
```

### Desarrollo (.env.local)

```env
# Igual que producción pero:
VITE_ENABLE_DEV_TOOLS=true
VITE_BOLD_ENVIRONMENT=sandbox
VITE_DIAN_ENVIRONMENT=habilitacion
```

---

## 🔨 Deployment Manual

### Opción 1: Desde Portainer (Recomendado)

```bash
# 1. Ir a Portainer
# 2. Stacks → veralix-platform
# 3. Pull and redeploy

# O vía API:
curl -X POST "https://portainer.tuservidor.com/api/webhooks/[webhook-id]"
```

### Opción 2: Desde Servidor (SSH)

```bash
# Conectar al servidor
ssh user@tu-servidor.com

# Ir al directorio del proyecto
cd /opt/portainer/veralix-platform

# Pull últimos cambios
git pull origin main

# Reconstruir y levantar
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver logs
docker logs -f veralix-frontend
```

### Opción 3: Deployment Blue-Green (Zero Downtime)

```bash
# 1. Crear versión blue (actual)
docker-compose -p veralix-blue up -d

# 2. Crear versión green (nueva)
docker-compose -p veralix-green up -d

# 3. Cambiar en Traefik para apuntar a green
# 4. Verificar que funciona
# 5. Eliminar blue
docker-compose -p veralix-blue down
```

---

## ✅ Verificación y Testing

### 1. Health Checks

```bash
# Frontend health
curl https://oriluxtech.com/health
# Debe retornar: "healthy"

# SSL check
curl -I https://oriluxtech.com
# Verificar: "HTTP/2 200"

# DNS resolution
nslookup oriluxtech.com
dig oriluxtech.com

# Container status
docker ps | grep veralix
docker logs veralix-frontend --tail 100
```

### 2. Functional Testing

```bash
# Testing checklist:
✅ Homepage carga correctamente
✅ Login con email funciona
✅ Login con Google funciona
✅ Marketplace muestra productos
✅ Búsqueda funciona
✅ Filtros funcionan
✅ Crear certificado NFT funciona
✅ Verificar certificado público funciona
✅ Upload de imágenes funciona
✅ PWA offline mode funciona
✅ Notificaciones funcionan
✅ Chat de soporte funciona
✅ Checkout con Bold funciona
```

### 3. Performance Testing

```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://oriluxtech.com --view

# Load time
curl -o /dev/null -s -w '%{time_total}\n' https://oriluxtech.com

# WebPageTest
https://www.webpagetest.org/

# Objetivos:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Performance Score: > 90
```

### 4. Security Testing

```bash
# SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=oriluxtech.com

# Security Headers
https://securityheaders.com/?q=oriluxtech.com

# Objetivos:
- SSL Grade: A+
- Security Headers Grade: A
- No vulnerabilities en Snyk scan
```

---

## 🔧 Troubleshooting

### Problema: Container no inicia

```bash
# Ver logs detallados
docker logs veralix-frontend --tail 200

# Verificar errores de build
docker-compose build veralix-app

# Verificar variables de entorno
docker exec veralix-frontend env | grep VITE

# Entrar al container
docker exec -it veralix-frontend sh
ls -la
cat /app/package.json
```

### Problema: 502 Bad Gateway

```bash
# Verificar que el puerto está expuesto
docker ps | grep veralix
netstat -tulpn | grep 4173

# Verificar red Traefik
docker network inspect traefik_proxy

# Verificar labels de Traefik
docker inspect veralix-frontend | grep -A 20 Labels

# Revisar logs de Traefik
docker logs traefik --tail 100
```

### Problema: Imágenes no cargan

```bash
# Verificar storage bucket en Supabase
# Verificar que las URLs tienen el formato correcto
# Verificar CORS en Supabase Storage

# Test manual:
curl -I https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/test.jpg
```

### Problema: PWA no funciona offline

```bash
# Verificar Service Worker
# En Chrome DevTools:
Application → Service Workers
# Debe estar "activated and running"

# Verificar cache
Application → Cache Storage
# Debe tener: workbox-*, images-cache-v1

# Forzar actualización
Application → Service Workers → Update

# Ver logs del SW
console.log en /sw.js
```

### Problema: Build falla en GitHub Actions

```bash
# Ver logs en GitHub
Actions → Failed workflow → View logs

# Errores comunes:
- Falta variable de entorno → Agregar en Secrets
- Error de TypeScript → Corregir localmente primero
- Falta dependencia → Verificar package.json

# Ejecutar build localmente
npm run build
npm run preview
```

---

## 📊 Métricas de Éxito

### Performance
- ✅ Lighthouse Score: > 90
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3.5s
- ✅ Bundle size: < 500KB (gzipped)

### Reliability
- ✅ Uptime: > 99.5%
- ✅ Error rate: < 1%
- ✅ Deployment success: > 95%

### Security
- ✅ SSL Grade: A+
- ✅ Security Headers: A
- ✅ Zero critical vulnerabilities

---

## 📚 Recursos Adicionales

- [Documentación Vite PWA](https://vite-pwa-org.netlify.app/)
- [Supabase Docs](https://supabase.com/docs)
- [Traefik Docs](https://doc.traefik.io/traefik/)
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [Portainer Docs](https://docs.portainer.io/)

---

## 👥 Soporte

**Equipo Veralix**  
Email: soporte@veralix.io  
GitHub Issues: https://github.com/tu-usuario/veralix-platform/issues

---

**¡Deployment exitoso! 🎉**
