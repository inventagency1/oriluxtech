# Navegación y Rutas de Veralix

Este documento describe todas las rutas disponibles en la aplicación Veralix, sus permisos requeridos y páginas relacionadas.

## Índice
- [Rutas Públicas](#rutas-públicas)
- [Rutas Protegidas (Requieren Login)](#rutas-protegidas-requieren-login)
- [Rutas de Administración](#rutas-de-administración)
- [Alias de Rutas](#alias-de-rutas)
- [Secciones de Anclaje](#secciones-de-anclaje)

---

## Rutas Públicas

Estas rutas son accesibles sin autenticación:

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Index | Landing page principal |
| `/login` | Login | Inicio de sesión |
| `/register` | Register | Registro de nuevos usuarios |
| `/forgot-password` | ForgotPassword | Recuperación de contraseña |
| `/reset-password` | ResetPassword | Reseteo de contraseña |
| `/admin` | AdminLogin | Login especial para administradores |
| `/pricing` | Pricing | Paquetes de Certificados NFT y precios por volumen |
| `/about` | About | Información sobre Veralix |
| `/terms` | Terms | Términos y condiciones |
| `/privacy` | Privacy | Política de privacidad |
| `/verify` | Verify | Verificación pública de certificados |
| `/verify/:id` | Verify | Verificación con ID específico |
| `/marketplace` | Marketplace | Marketplace público de joyas |
| `/marketplace/:listingId` | ListingDetail | Detalle de un listing |
| `/help` | Help | Centro de ayuda y FAQs |
| `/airdrop` | Airdrop | Página de airdrop de tokens |
| `/payment` | Payment | Procesamiento de pagos |
| `/payment-success` | PaymentSuccess | Confirmación de pago exitoso |
| `/payment-return` | PaymentReturn | Retorno desde Bold Payments |

---

## Rutas Protegidas (Requieren Login)

Estas rutas requieren que el usuario esté autenticado:

### Dashboard y Perfil
| Ruta | Página | Rol Requerido | Descripción |
|------|--------|---------------|-------------|
| `/dashboard` | Dashboard | Todos | Dashboard principal según rol |
| `/perfil` | Profile | Todos | Perfil de usuario |
| `/settings` | Settings | Todos | Configuración de cuenta |
| `/notifications` | Notifications | Todos | Centro de notificaciones |
| `/favorites` | Favorites | Todos | Joyas y listings favoritos |

### Certificados
| Ruta | Página | Rol Requerido | Permiso |
|------|--------|---------------|---------|
| `/certificados` | Certificates | Todos | - |
| `/gestion-certificados` | CertificateManagement | Joyero | `batch_certificates` |
| `/nueva-joya` | NewJewelry | Joyero | `create_jewelry` |

### Marketplace
| Ruta | Página | Rol Requerido | Descripción |
|------|--------|---------------|-------------|
| `/crear-listado` | CreateListing | Joyero | Crear nuevo listing |
| `/mi-marketplace` | MyMarketplace | Todos | Panel de marketplace del usuario |

### Pagos y Paquetes de Certificados
| Ruta | Página | Rol Requerido | Descripción |
|------|--------|---------------|-------------|
| `/checkout` | Checkout | Todos | Proceso de compra de paquetes de certificados |
| `/certificate-bundles/manage` | CertificateBundleManagement | Todos | Gestión de paquetes de certificados adquiridos |
| `/orders/:orderId` | OrderDetail | Todos | Detalle de orden de marketplace |

### Analytics y Auditoría
| Ruta | Página | Rol Requerido | Permiso |
|------|--------|---------------|---------|
| `/analytics` | Analytics | Todos | - |
| `/auditoria` | AuditPage | Joyero | `view_audit_logs` |

---

## Rutas de Administración

Estas rutas requieren rol de **Admin**:

| Ruta | Página | Permiso Requerido | Descripción |
|------|--------|-------------------|-------------|
| `/admin/users` | UserManagement | `manage_users` | Gestión de usuarios y roles |
| `/admin/settings` | AdminSettings | `manage_system` | Configuración del sistema |
| `/admin/certificate-bundles` | CertificateBundlesOverview | - | Vista de compras de paquetes de certificados |
| `/email-testing` | EmailTesting | - | Pruebas de emails |

---

## Alias de Rutas

Para mantener compatibilidad y mejorar la experiencia del usuario, se han creado los siguientes alias:

| Alias | Redirige a | Razón |
|-------|-----------|-------|
| `/profile` | `/perfil` | Mantener URLs en inglés para usuarios internacionales |
| `/certificates` | `/certificados` | Mantener URLs en inglés para usuarios internacionales |

---

## Secciones de Anclaje

En la página principal (`/`), existen las siguientes secciones con anclaje:

| Anclaje | Sección | Descripción |
|---------|---------|-------------|
| `#features` | Features | Características de Veralix |
| `#how-it-works` | How It Works | Cómo funciona el proceso |
| `#contact` | Contact | Formulario de contacto e información |
| `#legal` | Legal | Información legal (Términos, Privacidad, Datos corporativos) |

---

## Permisos por Rol

### Rol: Cliente
- ✅ Dashboard de cliente
- ✅ Ver certificados de joyas que posee
- ✅ Comprar en marketplace
- ✅ Ver sus órdenes
- ✅ Gestionar perfil y configuración
- ✅ Ver notificaciones
- ❌ Crear joyas
- ❌ Crear listings
- ❌ Acceso a admin

### Rol: Joyero
- ✅ Todo lo de Cliente
- ✅ Dashboard de joyero
- ✅ Crear y gestionar joyas
- ✅ Generar certificados NFT
- ✅ Crear listings en marketplace
- ✅ Ver analytics de su negocio
- ✅ Ver audit logs
- ✅ Gestión de certificados por lote
- ❌ Acceso a admin

### Rol: Admin
- ✅ Todo lo de Joyero
- ✅ Gestionar usuarios y roles
- ✅ Configuración del sistema
- ✅ Gestionar precios de certificación
- ✅ Gestionar categorías de clientes
- ✅ Crear y administrar airdrops
- ✅ Ver estadísticas del sistema
- ✅ Ver todos los audit logs
- ✅ Testing de emails

---

## Manejo de 404

Cuando un usuario intenta acceder a una ruta que no existe:

1. Se registra el intento en la consola del navegador
2. Se muestra la página `NotFound` con:
   - Logo de Veralix
   - Código 404 destacado
   - Mensaje de error amigable
   - Ruta intentada
   - Botones de navegación rápida
   - Links a páginas populares
   - Contacto de soporte

---

## Estructura de Navegación

### Sidebar (Usuarios Autenticados)

La navegación lateral se organiza en grupos según el rol:

**Principal (Todos los usuarios)**
- Dashboard
- Marketplace
- Verificar
- Precios
- Ayuda

**Joyero (Solo rol joyero)**
- Nueva Joya
- Mis Joyas
- Mis Certificados
- Crear Listing
- Mi Marketplace
- Analytics

**Cliente (Solo rol cliente)**
- Mis Certificados
- Marketplace
- Mis Compras

**Administración (Solo admin)**
- Usuarios (`/admin/users`)
- Configuración Admin (`/admin/settings`)
- Paquetes de Certificados (integrado en Dashboard)
- Auditoría (`/auditoria`)
- Email Testing (`/email-testing`)

**Cuenta (Todos los usuarios)**
- Perfil
- Notificaciones
- Configuración

### Header (Navegación Superior)

**Usuario No Autenticado:**
- Inicio
- Certificación
- Marketplace
- Verificación
- Precios
- Login / Registrarse

**Usuario Autenticado:**
- Logo (link a dashboard)
- Theme Toggle
- Notification Bell
- User Dropdown:
  - Dashboard
  - Airdrop
  - Perfil
  - Cerrar Sesión

---

## Mejores Prácticas de Navegación

1. **Consistencia**: Usa siempre las rutas en español para la UI interna
2. **Aliases**: Mantén aliases en inglés para URLs compartibles
3. **Protección**: Todas las rutas sensibles están protegidas con `ProtectedRoute`
4. **Permisos**: Las rutas de admin usan `RoleGuard` adicional
5. **Redirecciones**: Los usuarios no autenticados son redirigidos a `/login`
6. **404**: Las rutas inválidas muestran una página 404 útil con navegación

---

## Futuras Mejoras

- [ ] Agregar breadcrumbs en páginas anidadas
- [ ] Implementar búsqueda global en el header
- [ ] Agregar tooltips informativos en el sidebar
- [ ] Implementar navegación por teclado
- [ ] Agregar indicadores de "nuevo" en features recientes
- [ ] Implementar historial de navegación
- [ ] Agregar shortcuts de teclado para rutas comunes

---

## Contacto

Si encuentras links rotos o tienes sugerencias para mejorar la navegación:
- Email: soporte@veralix.com
- Crear issue en el repositorio
- Contactar al equipo de desarrollo
