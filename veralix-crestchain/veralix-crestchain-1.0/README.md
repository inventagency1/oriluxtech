# 🏆 Veralix - Plataforma NFT de Certificación para Joyería Premium

<div align="center">

![Veralix Logo](./public/logo.png)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![React](https://img.shields.io/badge/react-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.6.2-3178C6)
![Supabase](https://img.shields.io/badge/supabase-2.57.4-3ECF8E)

**Plataforma Full-Stack de Certificación NFT para Joyería Premium con Marketplace Integrado**

🌐 [Demo en Vivo](#) • 📚 [Documentación](#) • 🐛 [Reportar Bug](#)

</div>

---

## 📖 Tabla de Contenidos
- [Sobre Veralix](#-sobre-veralix)
- [Características Principales](#-características-principales)
- [💳 NFT Certificate Packages](#-nft-certificate-volume-packages-cop)
- [Tech Stack](#-tech-stack)
- [Prerequisitos](#-prerequisitos)
- [Instalación](#️-instalación)
- [Configuración](#-configuración)
- [Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [Roles y Permisos](#-roles-y-permisos)
- [Rutas Principales](#️-rutas-principales)
- [Seguridad](#-seguridad)
- [Database Schema](#-database-schema)
- [Scripts Disponibles](#-scripts-disponibles)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contribuciones](#-contribuciones)
- [Licencia](#-licencia)
- [Links Útiles](#-links-útiles)

---

## 🎯 Sobre Veralix

**Veralix** es una plataforma innovadora que combina tecnología **blockchain**, **certificación NFT** y un **marketplace premium** para revolucionar la industria de la joyería de lujo.

### 🔑 El Problema
La industria de la joyería enfrenta desafíos críticos:
- ❌ Falsificación y falta de autenticidad verificable  
- ❌ Dificultad para rastrear la procedencia de las piezas  
- ❌ Pérdida de certificados físicos  
- ❌ Falta de confianza en mercados secundarios  

### 💡 La Solución Veralix
Una plataforma integral que ofrece:
- ✅ **Autenticidad Garantizada**: Certificados NFT inmutables en blockchain  
- ✅ **Trazabilidad Completa**: Historial transparente de propiedad  
- ✅ **Marketplace Premium**: Compra/venta segura y verificada  
- ✅ **Verificación Pública**: QR codes escaneables  
- ✅ **Analytics Avanzados**: Insights en tiempo real  

### 🌟 Valor Único
- 🔐 Integración NFT + Marketplace + Analytics  
- 🎯 Enfoque B2B/B2C  
- 🛡️ Seguridad Enterprise  
- 📱 Diseño Mobile-First  

---

## ✨ Características Principales
### 🔐 Certificación NFT en Blockchain
- Generación automática de certificados NFT únicos  
- QR codes con metadata completa  
- Imágenes de alta resolución  

### 💎 Marketplace de Joyería Premium
- Galerías profesionales  
- Búsqueda inteligente y filtros  
- Chat en tiempo real  
- Reviews y recomendaciones  

### 📊 Analytics en Tiempo Real
- Dashboards por rol  
- Exportación CSV  
- Gráficos interactivos  

### 🔍 Verificación Pública
- Escaneo QR sin login  
- Visualización completa de certificados  

### 🛡️ Seguridad Robusta
- Row-Level Security  
- Audit Logging  
- RBAC granular  
- Protección contra XSS, CSRF, SQL Injection  

---

## 💳 NFT Certificate Volume Packages (COP)

> El modelo de negocio inicial de Veralix está basado en paquetes prepagados de certificados NFT para joyería premium.

| Paquete | Precio | Ahorro |
|----------|--------:|--------:|
| Pack de 10 Certificados | **$270,000 COP** | **Ahorra $30,000** |
| Pack de 50 Certificados | **$1,350,000 COP** | **Ahorra $150,000** |
| Pack de 100 Certificados | **$2,500,000 COP** | **Ahorra $500,000** |

### 🎁 Beneficios Incluidos
- ✅ **Certificado NFT Único** – permanentemente verificable en blockchain
- 📊 **Dashboard Gratuito** para gestionar hasta **100 certificados**
- 🛍️ **Acceso al Marketplace** (Fase 2) para joyeros premium verificados
- 🎧 **Soporte Premium** durante onboarding y fase inicial
- 🧩 **Personalización de Certificados** con logo y detalles del joyero

> 💡 Precios en Pesos Colombianos (COP). Pueden aplicar comisiones de procesamiento de pago.  
> Integraciones disponibles vía **Bold Payments** (3D Secure + reconciliación automatizada).

### 💳 Integración de Pagos
Cada compra de paquete de certificados se procesa a través de **Bold Payments** con validación 3D Secure y verificación basada en webhooks en Supabase Edge Functions.

---

## 🚀 Tech Stack

### **Frontend**
React 18.3.1 • TypeScript 5.6.2 • Vite • React Router DOM • TanStack Query  
UI con Tailwind CSS • shadcn/ui • Radix UI • Lucide React • Recharts  

### **Backend & Database**
Supabase 2.57.4 • PostgreSQL • Edge Functions (Deno) • Realtime Subscriptions  

### **Payments**
Bold Payments API (Colombia) • Webhooks personalizados  

### **State Management & Forms**
React Hook Form • Zod • @hookform/resolvers  

---

## 📋 Prerequisitos
- Node.js >= 18  
- npm >= 9 o yarn >= 1.22  
- Git  
- Cuenta Supabase  
- (Opcional) Cuenta Bold Payments  

---

## ⚙️ Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/yourusername/veralix.git
cd veralix

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar servidor de desarrollo
npm run dev
La aplicación estará disponible en http://localhost:8080

🔐 Configuración
Supabase
Crear proyecto y copiar credenciales

Ejecutar migraciones:

bash
Copiar código
supabase db push
Activar autenticación por email y protección de contraseñas filtradas

Crear bucket jewelry-images y configurar políticas RLS

Bold Payments
Crear cuenta en Bold.co

Configurar claves API en Supabase Secrets

🏗️ Arquitectura del Proyecto
bash
Copiar código
veralix/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── integrations/
│   ├── lib/
│   ├── assets/
│   └── main.tsx
├── supabase/
│   ├── functions/
│   ├── migrations/
│   └── config.toml
├── docs/
├── public/
├── package.json
├── vite.config.ts
└── tailwind.config.ts
👥 Roles y Permisos
Rol	Descripción	Permisos
🛍️ Cliente	Usuario comprador final	Ver certificados, comprar, favoritos, chat
💎 Joyero	Empresa o profesional	Crear joyas, generar NFT, analytics
⚙️ Admin	Administrador del sistema	Usuarios, auditoría, precios, airdrops

🛣️ Rutas Principales
Públicas
/, /marketplace, /verify, /pricing, /login, /register

Autenticadas
/dashboard, /certificados, /favoritos, /perfil, /analytics

Administración
/admin/usuarios, /admin/configuracion, /auditoria

🔒 Seguridad
RLS en todas las tablas

Audit Logs (acciones, IP, user agent)

RBAC y hooks personalizados

Protección XSS, CSRF, SQL Injection

Leaked Password Protection activado en Supabase

📊 Database Schema
mermaid
Copiar código
erDiagram
    profiles ||--o{ user_roles : has
    profiles ||--o{ jewelry_items : creates
    jewelry_items ||--|| nft_certificates : has
    nft_certificates ||--o{ certificate_transfers : transferred
    profiles ||--o{ marketplace_listings : sells
    marketplace_listings ||--o{ orders : generates
    orders ||--o{ reviews : receives
📜 Scripts Disponibles
bash
Copiar código
# Desarrollo
npm run dev

# Build
npm run build && npm run preview

# Lint
npm run lint

# Supabase CLI
supabase start
supabase db push
supabase functions serve
📦 Deployment
🔹 Opción 1: Lovable Cloud (Recomendada)
Despliegue automático al hacer push a main
Edge Functions se despliegan automáticamente

🔹 Opción 2: Vercel
bash
Copiar código
npm install -g vercel
vercel
🔹 Opción 3: Netlify / Self-Hosted
npm run build

Publicar /dist

🧪 Testing
Checklist Manual
 Login/Register

 Creación de joyas

 Certificados NFT

 Chat comprador-vendedor

 Analytics

 RLS Policies

Automatizado
bash
Copiar código
npm run security-test
npm run test:rls
npm run test:audit
🤝 Contribuciones
Fork del proyecto

Crea tu rama feature/AmazingFeature

Commits con convención (feat:, fix:, docs:...)

Push y Pull Request

📄 Licencia
MIT License © 2025 Veralix Team
Consulta el archivo LICENSE para más información.

👨‍💻 Autor / Equipo
Veralix Team
📧 inventagency@outlook.com
🌐 veralix.io
💼 LinkedIn • 🐦 Twitter

🔗 Links Útiles
📚 Documentación Completa

🔒 Security Model

🗺️ Navigation Guide

🧪 Security Testing

⚠️ Notas Importantes
No commitear .env

Configurar Supabase: migraciones, secrets, buckets y auth

Revisar audit logs regularmente

🐛 Known Issues
 Web3 wallet (MetaMask) en desarrollo

 Multi-idioma (i18n) pendiente

 PWA capabilities próximas

🎯 Roadmap
Q2 2025
✅ MVP con Certificación NFT
✅ Marketplace funcional
🔄 Integración completa Bold Payments para paquetes de certificados
🔄 App móvil (React Native)

Q3 2025
📱 PWA
🌍 Multi-idioma
🪙 Web3 Wallet

Q4 2025
🤖 AI Jewelry Recs
📊 Advanced Analytics
🌐 API Pública

<div align="center">
⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub ⭐

Hecho con ❤️ por el equipo de Veralix

🔝 Volver arriba
