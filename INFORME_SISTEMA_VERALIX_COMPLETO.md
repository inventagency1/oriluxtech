# 📋 INFORME TÉCNICO COMPLETO - SISTEMA VERALIX
## Plataforma de Certificación NFT para Joyería de Lujo

**Versión:** 2.0  
**Fecha:** Diciembre 2024  
**Autor:** Equipo de Desarrollo Veralix  

---

## 📑 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Módulos Desarrollados](#4-módulos-desarrollados)
5. [Integración Blockchain](#5-integración-blockchain)
6. [Sistema de Pagos](#6-sistema-de-pagos)
7. [Base de Datos](#7-base-de-datos)
8. [Edge Functions (Backend)](#8-edge-functions-backend)
9. [Sistema de Roles y Permisos](#9-sistema-de-roles-y-permisos)
10. [Funcionalidades Pendientes](#10-funcionalidades-pendientes)
11. [Diferenciadores Futuros](#11-diferenciadores-futuros)
12. [Métricas y KPIs](#12-métricas-y-kpis)
13. [Roadmap](#13-roadmap)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Visión del Producto

**Veralix** es una plataforma integral que revoluciona la industria de la joyería de lujo mediante la combinación de:

- **Certificación NFT en Blockchain** para autenticidad inmutable
- **Marketplace Premium** para compra/venta verificada
- **Sistema de Trazabilidad** completo de propiedad
- **Analytics Avanzados** para joyeros y administradores

### 1.2 Problema que Resuelve

| Problema | Solución Veralix |
|----------|------------------|
| Falsificación de joyas | Certificados NFT inmutables en blockchain |
| Pérdida de certificados físicos | Certificados digitales permanentes con QR |
| Falta de trazabilidad | Historial completo de propiedad en blockchain |
| Desconfianza en mercados secundarios | Verificación pública instantánea |
| Procesos manuales de certificación | Automatización completa del flujo |

### 1.3 Estado Actual del Proyecto

```
✅ MVP Completo y Funcional
✅ Integración Dual-Blockchain (Oriluxchain + BSC Mainnet)
✅ Sistema de Pagos (Wompi + Bold)
✅ Marketplace V2 con Infinite Scroll
✅ Panel de Administración Completo
✅ Sistema de Auditoría
✅ PWA (Progressive Web App)
⏳ Optimizaciones de rendimiento en curso
⏳ Expansión de funcionalidades blockchain
```

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Cliente   │  │   Joyero    │  │    Admin    │  │   Público   │    │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │  Marketplace│    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (Backend as a Service)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Auth       │  │  Database   │  │  Storage    │  │  Realtime   │    │
│  │  (JWT)      │  │  (Postgres) │  │  (S3-like)  │  │  (WebSocket)│    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    EDGE FUNCTIONS (Deno Runtime)                   │  │
│  │  • generate-nft-certificate    • bold-payments                    │  │
│  │  • mint-nft-orilux             • wompi-webhook                    │  │
│  │  • send-email                  • ai-support-chat                  │  │
│  │  • marketplace-chat            • cleanup-marketplace              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│    ORILUXCHAIN      │ │    BSC MAINNET      │ │      IPFS           │
│  (Blockchain        │ │  (BNB Smart Chain)  │ │    (Pinata)         │
│   Propietaria)      │ │                     │ │                     │
│                     │ │  Contract:          │ │  • Metadata JSON    │
│  • Certificación    │ │  0x5aDcEEf785...    │ │  • Imágenes         │
│  • Trazabilidad     │ │                     │ │  • Certificados HTML│
│  • API REST         │ │  • NFT Minting      │ │                     │
└─────────────────────┘ │  • On-chain Data    │ └─────────────────────┘
                        └─────────────────────┘
```

### 2.2 Flujo de Certificación NFT

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Joyero  │───▶│  Crear   │───▶│  Subir   │───▶│ Generar  │───▶│   NFT    │
│  Login   │    │   Joya   │    │ Imágenes │    │   QR     │    │ Minted   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                                                      ▼
                                        ┌─────────────────────────┐
                                        │   DUAL-MINT PROCESS     │
                                        │                         │
                                        │  1. Oriluxchain API     │
                                        │     └─▶ Certificate ID  │
                                        │     └─▶ TX Hash         │
                                        │                         │
                                        │  2. BSC Mainnet         │
                                        │     └─▶ Token ID        │
                                        │     └─▶ TX Hash         │
                                        │     └─▶ BscScan Link    │
                                        │                         │
                                        │  3. IPFS (Pinata)       │
                                        │     └─▶ Metadata URI    │
                                        │     └─▶ Image URI       │
                                        │     └─▶ HTML Certificate│
                                        └─────────────────────────┘
```

---

## 3. STACK TECNOLÓGICO

### 3.1 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.3.1 | Framework UI principal |
| **TypeScript** | 5.6.2 | Tipado estático |
| **Vite** | 5.4.x | Build tool y dev server |
| **React Router DOM** | 6.x | Enrutamiento SPA |
| **TanStack Query** | 5.x | Server state management |
| **Tailwind CSS** | 3.4.x | Estilos utility-first |
| **shadcn/ui** | Latest | Componentes UI |
| **Radix UI** | Latest | Primitivos accesibles |
| **Lucide React** | Latest | Iconografía |
| **Recharts** | 2.x | Gráficos y visualizaciones |
| **React Hook Form** | 7.x | Manejo de formularios |
| **Zod** | 3.x | Validación de esquemas |

### 3.2 Backend (Supabase)

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Database** | PostgreSQL 15 | Base de datos relacional |
| **Auth** | Supabase Auth | Autenticación JWT |
| **Storage** | S3-compatible | Almacenamiento de imágenes |
| **Edge Functions** | Deno Runtime | Lógica de negocio serverless |
| **Realtime** | WebSockets | Actualizaciones en tiempo real |
| **RLS** | Row Level Security | Seguridad a nivel de fila |

### 3.3 Blockchain

| Red | Tipo | Propósito |
|-----|------|-----------|
| **Oriluxchain** | Blockchain Propietaria | Certificación y trazabilidad |
| **BSC Mainnet** | BNB Smart Chain (EVM) | NFT Minting con TCT |
| **IPFS (Pinata)** | Almacenamiento Descentralizado | Metadata y certificados |

### 3.4 Integraciones de Pago

| Proveedor | Región | Características |
|-----------|--------|-----------------|
| **Wompi** | Colombia | PSE, Tarjetas, Nequi |
| **Bold Payments** | Colombia | 3D Secure, Webhooks |

---

## 4. MÓDULOS DESARROLLADOS

### 4.1 Módulo de Certificación NFT

**Ubicación:** `src/hooks/useNFTCertificate.tsx`, `supabase/functions/generate-nft-certificate/`

**Funcionalidades:**
- ✅ Generación automática de Certificate ID único (`VRX-YYYYMMDD-XXXXXX`)
- ✅ Dual-mint en Oriluxchain + BSC Mainnet
- ✅ Subida de metadata a IPFS (Pinata)
- ✅ Generación de QR code verificable
- ✅ Certificado HTML interactivo
- ✅ Caché de certificados para carga rápida (10x más rápido)
- ✅ Soporte para contraseña de certificado
- ✅ Imagen social generada con IA (Lovable AI)

**Contrato BSC:**
```solidity
Contract: 0x5aDcEEf785FD21b65986328ca1e6DE0C973eC423
Network: BSC Mainnet (Chain ID: 56)
Functions:
  - createCertificate(certificateNumber, jewelryType, description, imageHash, metadataURI, owner, appraisalValue, appraisalCurrency)
  - getCertificate(tokenId)
  - totalSupply()
```

### 4.2 Módulo de Marketplace

**Ubicación:** `src/pages/MarketplaceV2.tsx`, `src/components/marketplace-v2/`

**Funcionalidades:**
- ✅ Listado de joyas certificadas
- ✅ Búsqueda avanzada con filtros múltiples
- ✅ Infinite scroll (configurable via feature flag)
- ✅ Sistema de favoritos
- ✅ Chat de ventas con IA
- ✅ Sistema de reviews y ratings
- ✅ Gestión de órdenes
- ✅ Comunicación comprador-vendedor
- ✅ Integración con pagos Wompi

**Hooks Relacionados:**
```typescript
useMarketplace()           // Listados generales
useInfiniteMarketplace()   // Scroll infinito
useAdvancedSearch()        // Búsqueda avanzada
useFavorites()             // Sistema de favoritos
useOrders()                // Gestión de órdenes
useMarketplaceWompiPayment() // Pagos
```

### 4.3 Panel de Administración

**Ubicación:** `src/components/AdminDashboard.tsx`, `src/components/admin/`

**Funcionalidades:**

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **UserManagement** | Gestión de usuarios y roles | ✅ Completo |
| **PackageManagement** | Paquetes de certificados | ✅ Completo |
| **PricingManagement** | Configuración de precios | ✅ Completo |
| **AirdropManagement** | Campañas de tokens VRX | ✅ Completo |
| **CategoryManagement** | Categorías de clientes | ✅ Completo |
| **SystemStats** | Estadísticas del sistema | ✅ Completo |
| **MarketplaceCleanupPanel** | Limpieza de marketplace | ✅ Completo |
| **AdminCertificateAssignment** | Asignación manual de certificados | ✅ Completo |
| **JewelryApprovalPanel** | Aprobación de joyerías | ✅ Completo |
| **WaitlistManagement** | Gestión de lista de espera | ✅ Completo |
| **BlockchainNetworkSwitch** | Cambio de red blockchain | ✅ Completo |
| **MaintenanceModeToggle** | Modo mantenimiento | ✅ Completo |

### 4.4 Sistema de Analytics

**Ubicación:** `src/pages/Analytics.tsx`, `src/hooks/useAdvancedAnalytics.tsx`

**Métricas Disponibles:**
- ✅ Certificados generados por período
- ✅ Ingresos por ventas
- ✅ Usuarios activos
- ✅ Transacciones completadas
- ✅ Tendencias de marketplace
- ✅ Exportación a CSV

### 4.5 Sistema de Auditoría

**Ubicación:** `src/pages/AuditPage.tsx`, `src/hooks/useAudit.tsx`

**Eventos Auditados:**
- Creación/modificación de usuarios
- Generación de certificados
- Transacciones de pago
- Cambios de configuración
- Accesos al sistema
- Transferencias de certificados

### 4.6 Sistema de Notificaciones

**Ubicación:** `src/hooks/useNotifications.tsx`, `src/components/NotificationCenter.tsx`

**Tipos de Notificaciones:**
- ✅ Certificado generado
- ✅ Pago completado
- ✅ Nueva orden recibida
- ✅ Mensaje de comprador
- ✅ Airdrop disponible
- ✅ Actualización de estado

---

## 5. INTEGRACIÓN BLOCKCHAIN

### 5.1 Arquitectura Dual-Blockchain

Veralix implementa un sistema **Dual-Blockchain** que combina:

#### 5.1.1 Oriluxchain (Blockchain Propietaria)

```
Endpoint: https://oriluxchain-production.up.railway.app
Propósito: Certificación y trazabilidad de joyas

API Endpoints:
  POST /api/jewelry/certify    → Crear certificado
  POST /api/jewelry/nft/{id}   → Crear NFT
  GET  /api/jewelry/{id}       → Consultar certificado
  GET  /explorer/certificate/{id} → Verificación pública
```

**Datos Almacenados:**
- ID único de certificado
- Tipo de joya y materiales
- Peso y dimensiones
- Artesano/fabricante
- País de origen
- Valor estimado
- Historial de propiedad

#### 5.1.2 BSC Mainnet (BNB Smart Chain)

```
Network: BSC Mainnet
Chain ID: 56
RPC URLs:
  - https://bsc-dataseed.binance.org
  - https://bsc-dataseed1.binance.org
  - https://bsc-dataseed2.binance.org

Contract: VeralixMasterRegistry
Address: 0x5aDcEEf785FD21b65986328ca1e6DE0C973eC423
Explorer: https://bscscan.com
```

**Funciones del Contrato:**
```solidity
// Crear certificado NFT
function createCertificate(
    string certificateNumber,
    string jewelryType,
    string description,
    string imageHash,
    string metadataURI,
    address owner,
    uint256 appraisalValue,
    string appraisalCurrency
) returns (uint256 tokenId)

// Consultar certificado
function getCertificate(uint256 tokenId) returns (Certificate)

// Total de NFTs minteados
function totalSupply() returns (uint256)
```

### 5.2 Flujo de Mint Dual

```javascript
// 1. Mint en Oriluxchain
const oriluxResponse = await fetch(`${ORILUXCHAIN_API}/api/jewelry/certify`, {
  method: 'POST',
  body: JSON.stringify({
    item_id: jewelryItemId,
    jewelry_type: jewelryData.type,
    material: materials.join(', '),
    weight: jewelryData.weight,
    estimated_value: jewelryData.sale_price,
    certificate_id: certificateId
  })
});

// 2. Mint en BSC Mainnet
const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
const wallet = new ethers.Wallet(SYSTEM_PRIVATE_KEY, provider);
const contract = new ethers.Contract(BSC_CONTRACT_ADDRESS, ABI, wallet);

const tx = await contract.createCertificate(
  certificateId,
  jewelryType,
  description,
  imageHash,
  metadataURI,
  ownerAddress,
  appraisalValue,
  'COP'
);

const receipt = await tx.wait(1); // 1 confirmación
```

### 5.3 IPFS (Pinata)

**Almacenamiento Descentralizado:**

```javascript
// Subir metadata JSON
const metadataUri = await uploadJSONToPinata({
  name: `${jewelryName} - Certificado Veralix`,
  description: `Certificado de autenticidad NFT...`,
  image: jewelryImageUri,
  external_url: verificationUrl,
  attributes: [
    { trait_type: 'Tipo', value: jewelryType },
    { trait_type: 'Materiales', value: materials },
    { trait_type: 'Certificado ID', value: certificateId }
  ]
}, `${certificateId}-metadata.json`);

// Subir imagen de joya
const imageUri = await uploadFileToPinata(imageBlob, `${certificateId}-jewelry.jpg`);

// Subir certificado HTML
const htmlUri = await uploadFileToPinata(htmlBlob, `${certificateId}.html`);
```

**Gateways IPFS Configurados:**
- `https://gateway.pinata.cloud/ipfs/`
- `https://ipfs.io/ipfs/`
- `https://cloudflare-ipfs.com/ipfs/`
- `https://dweb.link/ipfs/`
- `https://w3s.link/ipfs/`

---

## 6. SISTEMA DE PAGOS

### 6.1 Wompi (Principal)

**Ubicación:** `src/hooks/useMarketplaceWompiPayment.tsx`, `supabase/functions/create-wompi-payment-link/`

**Métodos de Pago Soportados:**
- ✅ PSE (Transferencia bancaria)
- ✅ Tarjetas de crédito/débito
- ✅ Nequi
- ✅ Bancolombia QR

**Flujo de Pago:**
```
1. Usuario selecciona producto
2. Sistema crea payment link en Wompi
3. Usuario completa pago en widget Wompi
4. Webhook notifica resultado
5. Sistema actualiza estado de orden
6. Notificación a comprador y vendedor
```

### 6.2 Bold Payments (Alternativo)

**Ubicación:** `src/hooks/useBoldPayments.tsx`, `supabase/functions/bold-payments/`

**Características:**
- ✅ 3D Secure
- ✅ Tokenización de tarjetas
- ✅ Webhooks de confirmación
- ✅ Reconciliación automática

### 6.3 Paquetes de Certificados

| Paquete | Certificados | Precio (COP) | Ahorro |
|---------|--------------|--------------|--------|
| Básico | 10 | $270,000 | $30,000 |
| Profesional | 50 | $1,350,000 | $150,000 |
| Enterprise | 100 | $2,500,000 | $500,000 |

---

## 7. BASE DE DATOS

### 7.1 Tablas Principales

```sql
-- Usuarios y perfiles
profiles (user_id, email, full_name, role, business_name, ...)

-- Joyas
jewelry_items (id, user_id, name, type, materials[], weight, sale_price, ...)

-- Certificados NFT
nft_certificates (
  id, certificate_id, jewelry_item_id, user_id,
  transaction_hash, token_id, contract_address,
  orilux_tx_hash, orilux_verification_url,
  crestchain_tx_hash, crestchain_verification_url,
  metadata_uri, qr_code_url, verification_url, ...
)

-- Marketplace
marketplace_listings (id, jewelry_item_id, seller_id, price, status, ...)
orders (id, buyer_id, seller_id, status, total_amount, ...)
order_items (id, order_id, jewelry_item_id, unit_price, ...)

-- Pagos
certificate_payments (id, user_id, amount, payment_status, ...)
certificate_purchases (id, user_id, certificates_purchased, certificates_remaining, ...)

-- Sistema
audit_logs (id, user_id, action, resource_type, details, ...)
notifications (id, user_id, type, title, message, read, ...)
system_settings (key, value, ...)
```

### 7.2 Enums

```sql
-- Tipos de joya
jewelry_type: ring, necklace, bracelet, earrings, watch, pendant, brooch, other

-- Estados de joya
jewelry_status: draft, pending, certified, listed, sold

-- Redes blockchain
blockchain_network: ORILUXCHAIN, CRESTCHAIN, DUAL, BSC

-- Categorías de cliente
client_category: standard, premium, vip, enterprise

-- Estados de transferencia
transfer_status: pending, completed, rejected
```

### 7.3 Row Level Security (RLS)

Todas las tablas tienen políticas RLS que garantizan:
- Usuarios solo ven sus propios datos
- Admins tienen acceso completo
- Datos públicos accesibles sin autenticación (marketplace, verificación)

---

## 8. EDGE FUNCTIONS (BACKEND)

### 8.1 Funciones Desplegadas

| Función | Propósito | Trigger |
|---------|-----------|---------|
| `generate-nft-certificate` | Generación completa de certificado NFT | HTTP POST |
| `mint-nft-orilux` | Mint en Oriluxchain | HTTP POST |
| `mint-nft-crestchain` | Mint en CrestChain | HTTP POST |
| `dual-mint-orilux-crestchain` | Mint dual simultáneo | HTTP POST |
| `bold-payments` | Procesamiento Bold | HTTP POST |
| `create-wompi-payment-link` | Crear link de pago Wompi | HTTP POST |
| `wompi-webhook` | Webhook de Wompi | HTTP POST |
| `send-email` | Envío de emails (Resend) | HTTP POST |
| `auth-email-hook` | Hook de autenticación | Auth Trigger |
| `ai-support-chat` | Chat de soporte con IA | HTTP POST |
| `marketplace-chat` | Chat de ventas | HTTP POST |
| `cleanup-marketplace` | Limpieza de listings | Scheduled |
| `verify-nft-status` | Verificación de NFT | HTTP GET |
| `generate-dian-invoice` | Facturación electrónica | HTTP POST |
| `enhance-jewelry-descriptions` | Mejora de descripciones con IA | HTTP POST |
| `generate-jewelry-images` | Generación de imágenes con IA | HTTP POST |

### 8.2 Ejemplo: generate-nft-certificate

```typescript
// Flujo principal
1. Validar datos de entrada
2. Obtener configuración de blockchain desde BD
3. Obtener datos de jewelry_item
4. Generar Certificate ID único
5. DUAL-MINT:
   a. Mint en Oriluxchain (API REST)
   b. Mint en BSC Mainnet (ethers.js)
6. Subir imágenes a IPFS
7. Crear metadata JSON y subir a IPFS
8. Generar certificado HTML
9. Generar QR code
10. Guardar en nft_certificates
11. Cachear HTML para acceso rápido
12. Actualizar jewelry_item
13. Log de auditoría
14. Retornar respuesta con todos los datos
```

---

## 9. SISTEMA DE ROLES Y PERMISOS

### 9.1 Roles Definidos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **cliente** | Usuario comprador | Ver marketplace, comprar, favoritos, ver certificados propios |
| **joyero** | Profesional/empresa | Todo de cliente + crear joyas, generar NFTs, analytics, marketplace propio |
| **admin** | Administrador | Acceso total: usuarios, configuración, auditoría, precios, airdrops |

### 9.2 Navegación por Rol

**Cliente:**
```
/dashboard → Inicio
/marketplace → Explorar joyas
/favoritos → Mis favoritos
/certificados → Mis certificados
/perfil → Mi perfil
/settings → Configuración
```

**Joyero:**
```
/dashboard → Dashboard con métricas
/certificados → Mis joyas
/nueva-joya → Crear joya
/gestion-certificados → Gestión masiva
/certificate-bundles/manage → Mis paquetes
/mi-marketplace → Mi tienda
/crear-listado → Nuevo listado
/analytics → Analytics
/airdrop → Tokens VRX
```

**Admin:**
```
/dashboard → Panel de administración
/admin/users → Gestión de usuarios
/admin/certificate-bundles → Paquetes
/admin/wompi-monitoring → Monitor de pagos
/auditoria → Logs de auditoría
/pricing → Configuración de precios
/airdrop → Gestión de airdrops
/admin/settings → Configuración del sistema
/email-testing → Testing de emails
/bsc-testing → Testing de BSC
/wompi-diagnostics → Diagnóstico Wompi
/orilux-status → Estado de Oriluxchain
```

---

## 10. FUNCIONALIDADES PENDIENTES

### 10.1 Alta Prioridad

| Funcionalidad | Descripción | Esfuerzo |
|---------------|-------------|----------|
| **Transferencia de NFTs** | Permitir transferir certificados entre usuarios | 2 semanas |
| **Wallet Connect** | Integración con MetaMask y wallets Web3 | 1 semana |
| **Notificaciones Push** | PWA push notifications | 1 semana |
| **Multi-idioma** | Soporte para inglés y portugués | 2 semanas |

### 10.2 Media Prioridad

| Funcionalidad | Descripción | Esfuerzo |
|---------------|-------------|----------|
| **API Pública** | REST API para integraciones externas | 3 semanas |
| **Reportes Avanzados** | Exportación PDF, reportes personalizados | 2 semanas |
| **Sistema de Subastas** | Subastas de joyas en marketplace | 3 semanas |
| **Verificación KYC** | Verificación de identidad para joyeros | 2 semanas |

### 10.3 Baja Prioridad

| Funcionalidad | Descripción | Esfuerzo |
|---------------|-------------|----------|
| **App Móvil Nativa** | React Native para iOS/Android | 8 semanas |
| **Integración ERP** | Conexión con sistemas de joyerías | 4 semanas |
| **Blockchain Explorer** | Explorer propio para Oriluxchain | 4 semanas |

---

## 11. DIFERENCIADORES FUTUROS

### 11.1 Innovaciones Tecnológicas

#### 🔮 Realidad Aumentada (AR)
```
Funcionalidad: Visualización 3D de joyas antes de comprar
Tecnología: WebXR, Three.js, AR.js
Impacto: Aumento de conversión en marketplace
Timeline: Q2 2025
```

#### 🌿 Certificación de Sostenibilidad
```
Funcionalidad: Trazabilidad de origen ético de materiales
Datos: Minas certificadas, proveedores verificados, huella de carbono
Impacto: Diferenciación en mercado de lujo consciente
Timeline: Q3 2025
```

#### 🛡️ Seguros Blockchain
```
Funcionalidad: Pólizas de seguro tokenizadas para joyas
Partners: Aseguradoras tradicionales + DeFi
Impacto: Nuevo revenue stream, mayor confianza
Timeline: Q4 2025
```

#### 🤖 IA Avanzada
```
Funcionalidades:
  - Valuación automática de joyas con ML
  - Detección de falsificaciones por imagen
  - Recomendaciones personalizadas
  - Chatbot experto en joyería
Timeline: Ongoing
```

### 11.2 Expansión de Mercado

#### 🌎 Internacionalización
```
Fase 1: Latinoamérica (México, Perú, Chile)
Fase 2: España y Portugal
Fase 3: Estados Unidos (Miami, NYC)
Fase 4: Europa (Italia, Francia)
```

#### 🤝 Partnerships Estratégicos
```
- Gremios de joyeros nacionales
- Casas de subastas (Christie's, Sotheby's)
- Marcas de lujo
- Certificadores gemológicos (GIA, IGI)
```

### 11.3 Modelo de Negocio Expandido

#### 💎 Veralix Premium
```
Servicio: White-label para marcas de lujo
Precio: $5,000 - $50,000 USD/mes
Incluye: Branding personalizado, API dedicada, soporte 24/7
```

#### 🏦 Veralix Finance
```
Servicio: Préstamos respaldados por joyas certificadas
Modelo: DeFi + Traditional Finance hybrid
Partners: Bancos, fondos de inversión
```

#### 📊 Veralix Data
```
Servicio: Analytics de mercado de joyería
Datos: Tendencias, precios, demanda por región
Clientes: Joyeros, inversores, aseguradoras
```

---

## 12. MÉTRICAS Y KPIs

### 12.1 Métricas de Producto

| Métrica | Descripción | Target |
|---------|-------------|--------|
| **MAU** | Monthly Active Users | 10,000 |
| **Certificados/mes** | NFTs generados | 1,000 |
| **GMV** | Gross Merchandise Value | $500M COP/mes |
| **Conversion Rate** | Visitantes → Compradores | 3% |
| **NPS** | Net Promoter Score | > 50 |

### 12.2 Métricas Técnicas

| Métrica | Descripción | Target |
|---------|-------------|--------|
| **Uptime** | Disponibilidad del sistema | 99.9% |
| **TTFB** | Time to First Byte | < 200ms |
| **LCP** | Largest Contentful Paint | < 2.5s |
| **Error Rate** | Tasa de errores | < 0.1% |
| **Mint Success** | Éxito de mint blockchain | > 99% |

### 12.3 Métricas de Negocio

| Métrica | Descripción | Target |
|---------|-------------|--------|
| **MRR** | Monthly Recurring Revenue | $50M COP |
| **CAC** | Customer Acquisition Cost | < $50,000 COP |
| **LTV** | Lifetime Value | > $500,000 COP |
| **Churn** | Tasa de abandono | < 5% |

---

## 13. ROADMAP

### Q1 2025
- [ ] Transferencia de NFTs entre usuarios
- [ ] Wallet Connect (MetaMask)
- [ ] Notificaciones Push PWA
- [ ] Optimización de rendimiento

### Q2 2025
- [ ] API Pública v1
- [ ] Multi-idioma (EN, PT)
- [ ] Sistema de subastas
- [ ] AR Preview (MVP)

### Q3 2025
- [ ] Certificación de sostenibilidad
- [ ] Verificación KYC
- [ ] App móvil nativa (iOS)
- [ ] Expansión a México

### Q4 2025
- [ ] Seguros blockchain
- [ ] Veralix Premium (White-label)
- [ ] App móvil (Android)
- [ ] Expansión a España

---

## ANEXOS

### A. Variables de Entorno Requeridas

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Blockchain
SYSTEM_PRIVATE_KEY=
VERALIX_CONTRACT_ADDRESS=
CRESTCHAIN_RPC_URL=
ORILUXCHAIN_API_URL=
ORILUXCHAIN_API_KEY=

# IPFS
PINATA_JWT=

# Payments
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
BOLD_API_KEY=

# Email
RESEND_API_KEY=

# AI
LOVABLE_API_KEY=
OPENAI_API_KEY=

# URLs
PUBLIC_BASE_URL=https://veralix.io
```

### B. Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=veralix

# Supabase
supabase functions serve
supabase db push
supabase gen types typescript > src/integrations/supabase/types.ts
```

### C. Contacto

- **Repositorio:** GitHub (privado)
- **Producción:** https://veralix.io
- **Staging:** https://staging.veralix.io
- **Documentación:** https://docs.veralix.io

---

**© 2024 Veralix. Todos los derechos reservados.**
