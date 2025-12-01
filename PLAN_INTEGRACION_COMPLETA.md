# 🚀 PLAN DE INTEGRACIÓN COMPLETA: ORILUXCHAIN + VERALIX

**Fecha:** 25 de Noviembre, 2025 - 8:40 PM  
**Objetivo:** Integrar Oriluxchain como blockchain principal en el flujo de certificados de Veralix

---

## 📊 SITUACIÓN ACTUAL

### ✅ Lo que ya funciona:
- Veralix tiene UI completa para generar certificados
- Edge Function `generate-nft-certificate` genera certificados "off-chain"
- Pinata (IPFS) almacena imágenes y metadata
- HTML + QR codes se generan automáticamente
- Oriluxchain API corriendo en puerto 5001
- Sistema de certificación de joyería en Oriluxchain funcionando

### ⚠️ Lo que falta:
- Conectar el flujo de Veralix con Oriluxchain real
- Reemplazar simulación de blockchain por llamadas reales
- Actualizar schema de Supabase para datos de Oriluxchain
- Configurar variables de entorno
- Probar flujo end-to-end desde UI de Veralix

---

## 🎯 OBJETIVO FINAL

**Usuario en veralix.io:**
1. Crea una joya
2. Click en "Generar Certificado"
3. **Detrás de escena:**
   - Se sube imagen a Pinata (IPFS)
   - Se crea certificado en **Oriluxchain blockchain**
   - Se crea NFT en **Oriluxchain**
   - Se genera HTML + QR code
   - Se guarda todo en Supabase
4. Usuario ve certificado con:
   - Transaction hash real de Oriluxchain
   - Token ID del NFT
   - QR code de verificación
   - Link a verificación pública

**Sin cambios en el frontend** - mismo botón, misma UX.

---

## 📋 PLAN DE EJECUCIÓN (4 FASES)

### **FASE 1: PREPARACIÓN** (15 min)
Configurar entorno y variables

### **FASE 2: MODIFICAR EDGE FUNCTION** (30 min)
Adaptar `generate-nft-certificate` para usar Oriluxchain

### **FASE 3: DEPLOYMENT** (10 min)
Desplegar cambios y configurar

### **FASE 4: TESTING** (15 min)
Probar flujo completo desde UI

**Tiempo total estimado: ~70 minutos**

---

## 🔧 FASE 1: PREPARACIÓN (15 min)

### 1.1. Verificar Oriluxchain corriendo ✅
```bash
# Terminal 1 - Oriluxchain
cd C:\Users\Sebastian\Desktop\Oriluxchain
.venv\Scripts\activate
python api_simple.py

# Debe mostrar:
# ✅ Oriluxchain API Simple iniciada
# 📍 URL: http://127.0.0.1:5001
```

### 1.2. Probar endpoints de Oriluxchain
```powershell
# Verificar health
Invoke-RestMethod -Uri "http://127.0.0.1:5001/health"

# Verificar stats de jewelry
Invoke-RestMethod -Uri "http://127.0.0.1:5001/api/jewelry/stats"
```

### 1.3. Actualizar schema de Supabase

**En Supabase Dashboard → SQL Editor:**

```sql
-- Agregar columnas para Oriluxchain si no existen
ALTER TABLE nft_certificates
ADD COLUMN IF NOT EXISTS orilux_certificate_id TEXT,
ADD COLUMN IF NOT EXISTS orilux_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS orilux_token_id TEXT,
ADD COLUMN IF NOT EXISTS orilux_qr_code TEXT,
ADD COLUMN IF NOT EXISTS orilux_verification_url TEXT,
ADD COLUMN IF NOT EXISTS orilux_blockchain_status TEXT DEFAULT 'active';

-- Actualizar jewelry_items
ALTER TABLE jewelry_items
ADD COLUMN IF NOT EXISTS orilux_certificate_id TEXT,
ADD COLUMN IF NOT EXISTS orilux_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS orilux_qr_code TEXT,
ADD COLUMN IF NOT EXISTS orilux_verification_url TEXT,
ADD COLUMN IF NOT EXISTS is_certified BOOLEAN DEFAULT FALSE;

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_orilux_cert_id 
ON nft_certificates(orilux_certificate_id);

CREATE INDEX IF NOT EXISTS idx_jewelry_orilux_cert 
ON jewelry_items(orilux_certificate_id);

-- Comentarios
COMMENT ON COLUMN nft_certificates.orilux_certificate_id IS 'ID del certificado en Oriluxchain (CERT-YYYYMMDD-xxxxx)';
COMMENT ON COLUMN nft_certificates.orilux_qr_code IS 'QR code en base64 generado por Oriluxchain';
COMMENT ON COLUMN nft_certificates.orilux_verification_url IS 'URL pública de verificación en Oriluxchain';
```

### 1.4. Configurar variables de entorno en Supabase

**Dashboard → Settings → Edge Functions → Secrets:**

Agregar/verificar:

```
ORILUXCHAIN_API_URL=http://host.docker.internal:5001
```

**⚠️ IMPORTANTE:** 
- Para desarrollo local con Docker: `http://host.docker.internal:5001`
- Para producción (cuando Oriluxchain tenga dominio): `https://api.oriluxchain.io`

---

## 🔧 FASE 2: MODIFICAR EDGE FUNCTION (30 min)

### 2.1. Backup del archivo actual

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Crear backup
copy supabase\functions\generate-nft-certificate\index.ts supabase\functions\generate-nft-certificate\index.ts.backup
```

### 2.2. Cambios a realizar en `generate-nft-certificate/index.ts`

#### **CAMBIO 1: Reemplazar simulación de blockchain (líneas 622-629)**

**ANTES:**
```typescript
// Generate blockchain data (MVP simulation)
const transactionHash = `0x${Array.from({ length: 64 }, () => 
  Math.floor(Math.random() * 16).toString(16)
).join('')}`
const blockNumber = Math.floor(Math.random() * 1000000).toString()
const tokenId = Math.floor(Math.random() * 1000000).toString()
const contractAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
```

**DESPUÉS:**
```typescript
// ============================================================================
// ORILUXCHAIN INTEGRATION - Crear certificado real en blockchain
// ============================================================================
console.log('🔗 Creando certificado en Oriluxchain...')

const ORILUX_API = Deno.env.get('ORILUXCHAIN_API_URL') || 'http://host.docker.internal:5001'

// Preparar datos para Oriluxchain
const oriluxData = {
  item_id: jewelryItemId,
  jewelry_type: jewelryData.type || 'ring',
  material: (jewelryData.materials || []).join(', ') || 'gold',
  purity: jewelryData.purity || '18k',
  weight: parseFloat(jewelryData.weight) || 0,
  stones: jewelryData.stones || [],
  jeweler: jewelryData.craftsman || 'Veralix',
  manufacturer: jewelryData.manufacturer || 'Unknown',
  origin_country: jewelryData.origin || 'Colombia',
  creation_date: new Date().toISOString(),
  description: jewelryData.description || '',
  images: jewelryData.image_url ? [jewelryData.image_url] : [],
  estimated_value: parseFloat(jewelryData.sale_price) || 0,
  owner: userId,
  issuer: 'Veralix System'
}

console.log('📤 Enviando a Oriluxchain:', oriluxData)

// Crear certificado en Oriluxchain
const certifyResponse = await fetch(`${ORILUX_API}/api/jewelry/certify`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(oriluxData)
})

if (!certifyResponse.ok) {
  const errorText = await certifyResponse.text()
  console.error('❌ Error de Oriluxchain:', errorText)
  throw new Error(`Oriluxchain API error: ${certifyResponse.status}`)
}

const oriluxCertificate = await certifyResponse.json()

if (!oriluxCertificate.success) {
  throw new Error(oriluxCertificate.error || 'Failed to create certificate in Oriluxchain')
}

console.log('✅ Certificado creado en Oriluxchain:', oriluxCertificate.certificate_id)

// Crear NFT en Oriluxchain
console.log('🎨 Creando NFT en Oriluxchain...')
const nftResponse = await fetch(
  `${ORILUX_API}/api/jewelry/nft/${oriluxCertificate.certificate_id}`,
  { 
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
)

let oriluxNFT = null
if (nftResponse.ok) {
  oriluxNFT = await nftResponse.json()
  console.log('✅ NFT creado:', oriluxNFT.nft_token_id)
} else {
  console.warn('⚠️ No se pudo crear NFT, pero certificado existe')
}

// Usar datos reales de Oriluxchain
const transactionHash = oriluxCertificate.blockchain_tx
const blockNumber = 'pending' // Oriluxchain maneja esto internamente
const tokenId = oriluxNFT?.nft_token_id || 'pending'
const contractAddress = 'oriluxchain_native'
const oriluxCertificateId = oriluxCertificate.certificate_id
const oriluxQRCode = oriluxCertificate.qr_code
const oriluxVerificationUrl = oriluxCertificate.verification_url

console.log('🔗 Blockchain data (Oriluxchain):', { 
  transactionHash, 
  tokenId, 
  oriluxCertificateId 
})
```

#### **CAMBIO 2: Actualizar metadata con datos de Oriluxchain (líneas 649-672)**

**Buscar esta línea:**
```typescript
{ trait_type: 'Blockchain', value: DEFAULT_BLOCKCHAIN_NAME },
```

**Reemplazar por:**
```typescript
{ trait_type: 'Blockchain', value: 'ORILUXCHAIN' },
{ trait_type: 'Orilux Certificate ID', value: oriluxCertificateId },
```

#### **CAMBIO 3: Actualizar inserción en nft_certificates (líneas 700-724)**

**Buscar:**
```typescript
.from('nft_certificates')
.insert({
  id: crypto.randomUUID(),
  certificate_id: certificateId,
  jewelry_item_id: jewelryItemId,
  user_id: userId,
  owner_id: userId,
  transaction_hash: transactionHash,
  token_id: tokenId,
  contract_address: contractAddress,
  block_number: blockNumber,
  metadata_uri: metadataUri,
  certificate_pdf_url: certificateHtmlUri,
  qr_code_url: await generateQRCode(verificationUrl),
  social_image_url: socialImageUri,
  verification_url: verificationUrl,
  certificate_view_url: verificationUrl,
  blockchain_verification_url: `https://scan.crestchain.pro/tx/${transactionHash}`,
  is_verified: true,
  blockchain_network: 'crestchain',
  verification_date: new Date().toISOString()
})
```

**Agregar después de `verification_date`:**
```typescript
  // Datos de Oriluxchain
  orilux_certificate_id: oriluxCertificateId,
  orilux_tx_hash: transactionHash,
  orilux_token_id: tokenId,
  orilux_qr_code: oriluxQRCode,
  orilux_verification_url: oriluxVerificationUrl,
  orilux_blockchain_status: 'active',
  blockchain_network: 'ORILUXCHAIN',
  blockchain_verification_url: oriluxVerificationUrl
```

#### **CAMBIO 4: Actualizar jewelry_items (líneas 753-757)**

**Buscar:**
```typescript
await supabaseAdmin
  .from('jewelry_items')
  .update({ status: 'certified' })
  .eq('id', jewelryItemId)
```

**Reemplazar por:**
```typescript
await supabaseAdmin
  .from('jewelry_items')
  .update({ 
    status: 'certified',
    is_certified: true,
    orilux_certificate_id: oriluxCertificateId,
    orilux_tx_hash: transactionHash,
    orilux_qr_code: oriluxQRCode,
    orilux_verification_url: oriluxVerificationUrl
  })
  .eq('id', jewelryItemId)
```

#### **CAMBIO 5: Eliminar/comentar llamada a registerInOriluxchain (líneas 772-809)**

**Buscar:**
```typescript
// ============= REGISTRO EN ORILUXCHAIN (BACKGROUND) =============
if (typeof EdgeRuntime !== 'undefined' && (EdgeRuntime as any).waitUntil) {
  (EdgeRuntime as any).waitUntil(
    registerInOriluxchain(...)
  );
}
```

**Comentar todo ese bloque:**
```typescript
// ============= REGISTRO EN ORILUXCHAIN (BACKGROUND) =============
// YA NO ES NECESARIO - Ahora Oriluxchain es la blockchain principal
// El certificado ya se creó arriba de forma síncrona
```

---

## 🔧 FASE 3: DEPLOYMENT (10 min)

### 3.1. Desplegar Edge Function actualizada

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Desplegar
npx supabase functions deploy generate-nft-certificate
```

**Deberías ver:**
```
Deployed Functions on project hykegpmjnpaupvwptxtl: generate-nft-certificate
```

### 3.2. Verificar deployment

**En Supabase Dashboard:**
1. Edge Functions → `generate-nft-certificate`
2. Verificar que aparece "Deployed" con timestamp reciente

---

## 🔧 FASE 4: TESTING (15 min)

### 4.1. Preparar entorno de prueba

**Terminal 1 - Oriluxchain:**
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain
.venv\Scripts\activate
python api_simple.py

# Debe estar corriendo en puerto 5001
```

**Terminal 2 - Veralix (opcional, si quieres correr localmente):**
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
npm run dev
```

### 4.2. Probar desde UI de Veralix

1. Ir a **veralix.io** (o `localhost:5173` si corres local)
2. Login con tu usuario
3. Ir a sección de joyas
4. Seleccionar una joya existente (o crear una nueva)
5. Click en **"Generar Certificado"**

### 4.3. Verificar resultado

**Deberías ver:**
- ✅ Mensaje de éxito
- ✅ Certificado generado con:
  - Certificate ID (formato: `CERT-YYYYMMDD-xxxxx`)
  - Transaction Hash de Oriluxchain
  - Token ID del NFT
  - QR Code
  - Link de verificación

### 4.4. Verificar en Supabase

**Table Editor → nft_certificates:**
- Buscar el certificado recién creado
- Verificar columnas:
  - `orilux_certificate_id` ✅
  - `orilux_tx_hash` ✅
  - `orilux_token_id` ✅
  - `orilux_qr_code` ✅
  - `orilux_verification_url` ✅
  - `blockchain_network` = `'ORILUXCHAIN'` ✅

### 4.5. Verificar en Oriluxchain

**En terminal donde corre `api_simple.py`:**

Deberías ver logs como:
```
📝 Creando certificado para: [jewelry_id]
✅ Certificado creado: CERT-20251125-abc123
📝 TX Hash: tx_hash_here
🎨 NFT creado: nft_token_id
```

### 4.6. Probar verificación pública

1. Copiar el `orilux_verification_url` del certificado
2. Abrir en navegador
3. Verificar que muestra información del certificado

---

## 📊 CHECKLIST COMPLETO

### Preparación
- [ ] Oriluxchain corriendo en puerto 5001
- [ ] Endpoints de Oriluxchain respondiendo
- [ ] Schema de Supabase actualizado
- [ ] Variables de entorno configuradas

### Desarrollo
- [ ] Backup de `generate-nft-certificate/index.ts` creado
- [ ] CAMBIO 1: Reemplazar simulación por llamadas a Oriluxchain
- [ ] CAMBIO 2: Actualizar metadata
- [ ] CAMBIO 3: Actualizar inserción en nft_certificates
- [ ] CAMBIO 4: Actualizar jewelry_items
- [ ] CAMBIO 5: Comentar registerInOriluxchain background

### Deployment
- [ ] Edge Function desplegada
- [ ] Deployment verificado en Dashboard

### Testing
- [ ] Certificado generado desde UI
- [ ] Datos guardados en Supabase
- [ ] Logs visibles en Oriluxchain
- [ ] Verificación pública funciona

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot connect to Oriluxchain"

**Problema:** Edge Function no puede conectar a `http://host.docker.internal:5001`

**Soluciones:**
1. Verificar que Oriluxchain esté corriendo
2. Si estás en producción, cambiar a URL pública
3. Verificar variable `ORILUXCHAIN_API_URL` en Supabase

### Error: "Jewelry item not found"

**Problema:** No encuentra la joya en Supabase

**Soluciones:**
1. Verificar que la joya existe en `jewelry_items`
2. Verificar permisos de la tabla
3. Ver logs de la Edge Function en Dashboard

### Error: "Oriluxchain API error: 500"

**Problema:** Error en Oriluxchain API

**Soluciones:**
1. Ver logs de Oriluxchain en terminal
2. Verificar que los datos enviados sean válidos
3. Probar endpoint manualmente con curl

### Certificado se crea pero sin datos de Oriluxchain

**Problema:** Certificado en Supabase pero columnas `orilux_*` vacías

**Soluciones:**
1. Verificar que ejecutaste el SQL del schema
2. Ver logs de Edge Function para errores
3. Verificar que Oriluxchain devuelve datos correctos

---

## 📝 NOTAS IMPORTANTES

### Sobre Docker y host.docker.internal

- `host.docker.internal` funciona en Docker Desktop (Windows/Mac)
- Si usas Linux, puede ser `172.17.0.1` o la IP del host
- Para producción, Oriluxchain debe tener dominio público

### Sobre el flujo asíncrono

- La creación del certificado en Oriluxchain es **síncrona**
- El usuario espera ~5-10 segundos mientras se procesa
- Si quieres hacerlo más rápido, podemos optimizar después

### Sobre backups

- Siempre haz backup antes de modificar Edge Functions
- Puedes revertir con: `copy index.ts.backup index.ts`

---

## 🎯 RESULTADO FINAL

Después de completar este plan:

✅ **Usuario en veralix.io:**
- Crea joya
- Click "Generar Certificado"
- Ve certificado con datos reales de blockchain

✅ **Detrás de escena:**
- Certificado creado en Oriluxchain blockchain
- NFT creado en Oriluxchain
- Metadata en IPFS (Pinata)
- HTML + QR generados
- Todo guardado en Supabase

✅ **Verificación pública:**
- QR code escaneable
- URL de verificación funcional
- Datos visibles en Oriluxchain

---

## 🚀 PRÓXIMOS PASOS (DESPUÉS DE COMPLETAR)

1. **Optimización:**
   - Caché de certificados
   - Compresión de imágenes
   - Batch processing

2. **Producción:**
   - Dominio público para Oriluxchain
   - SSL/HTTPS
   - Backup de blockchain
   - Monitoreo

3. **Features adicionales:**
   - Transferencia de propiedad
   - Historial de certificados
   - Reportar perdido/robado
   - Marketplace integration

---

**¿Listo para empezar con la FASE 1?** 🚀
