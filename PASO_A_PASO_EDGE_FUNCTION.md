# 📝 PASO A PASO: CREAR EDGE FUNCTION PARA ORILUXCHAIN

**Fecha:** 25 de Noviembre, 2025 - 7:45 PM  
**Objetivo:** Conectar Veralix con Oriluxchain para generar certificados NFT

---

## ✅ PREREQUISITOS

Antes de empezar, asegúrate de tener:

- [x] Oriluxchain API corriendo en puerto 5001
- [x] Supabase CLI instalado
- [x] Cuenta de Supabase activa
- [x] Proyecto Veralix configurado

---

## 📋 PASO 1: VERIFICAR ESTRUCTURA DE ARCHIVOS (2 min)

### 1.1. Verificar que existe la carpeta de functions

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Verificar estructura
dir supabase\functions
```

**Deberías ver:**
```
supabase/
  └── functions/
      ├── generate-nft-certificate/
      ├── mint-nft-crestchain/
      └── oriluxchain-webhook/
```

### 1.2. Verificar que se creó la nueva función

```bash
dir supabase\functions\mint-nft-orilux
```

**Deberías ver:**
```
mint-nft-orilux/
  └── index.ts  ✅ (Ya creado)
```

---

## 📋 PASO 2: CONFIGURAR VARIABLES DE ENTORNO EN SUPABASE (5 min)

### 2.1. Ir al Dashboard de Supabase

1. Abrir navegador
2. Ir a: https://supabase.com/dashboard
3. Seleccionar proyecto: `hykegpmjnpaupvwptxtl`

### 2.2. Navegar a Edge Functions Secrets

```
Dashboard → Settings (⚙️) → Edge Functions → Secrets
```

### 2.3. Agregar/Actualizar Variables

Click en "Add new secret" para cada una:

#### Variable 1: ORILUXCHAIN_API_URL
```
Name: ORILUXCHAIN_API_URL
Value: http://127.0.0.1:5001
```

**⚠️ IMPORTANTE:** 
- Para desarrollo local: `http://127.0.0.1:5001`
- Para producción: `https://api.oriluxchain.io` (cuando tengas dominio)

#### Variable 2: Verificar SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://hykegpmjnpaupvwptxtl.supabase.co
```
*(Ya debería estar configurada)*

#### Variable 3: Verificar SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [tu service role key]
```
*(Ya debería estar configurada)*

### 2.4. Guardar Cambios

Click en "Save" después de agregar cada variable.

---

## 📋 PASO 3: ACTUALIZAR SCHEMA DE SUPABASE (3 min)

### 3.1. Ir al SQL Editor

```
Dashboard → SQL Editor → New query
```

### 3.2. Ejecutar este SQL

```sql
-- Agregar columnas para Oriluxchain
ALTER TABLE nft_certificates
ADD COLUMN IF NOT EXISTS orilux_certificate_id TEXT,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS verification_url TEXT;

-- Crear índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_orilux_cert 
ON nft_certificates(orilux_certificate_id);

-- Actualizar tabla jewelry_items
ALTER TABLE jewelry_items
ADD COLUMN IF NOT EXISTS certificate_id TEXT,
ADD COLUMN IF NOT EXISTS blockchain_tx TEXT,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS verification_url TEXT,
ADD COLUMN IF NOT EXISTS is_certified BOOLEAN DEFAULT FALSE;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_jewelry_cert 
ON jewelry_items(certificate_id);

-- Comentarios
COMMENT ON COLUMN nft_certificates.orilux_certificate_id IS 'ID del certificado en Oriluxchain (CERT-YYYYMMDD-xxxxx)';
COMMENT ON COLUMN nft_certificates.qr_code IS 'QR code en base64 para verificación';
COMMENT ON COLUMN nft_certificates.verification_url IS 'URL pública de verificación';
```

### 3.3. Ejecutar Query

Click en "Run" o presiona `Ctrl + Enter`

**Deberías ver:**
```
✅ Success. No rows returned
```

---

## 📋 PASO 4: DESPLEGAR EDGE FUNCTION (5 min)

### 4.1. Abrir Terminal en el proyecto

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
```

### 4.2. Login en Supabase (si no lo has hecho)

```bash
npx supabase login
```

**Seguir instrucciones:**
1. Se abrirá navegador
2. Autorizar acceso
3. Volver a terminal

### 4.3. Link al proyecto (si no lo has hecho)

```bash
npx supabase link --project-ref hykegpmjnpaupvwptxtl
```

**Cuando pida password:**
- Usar tu password de Supabase

### 4.4. Desplegar la función

```bash
npx supabase functions deploy mint-nft-orilux
```

**Deberías ver:**
```
Deploying function mint-nft-orilux...
✓ Deployed function mint-nft-orilux
Function URL: https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/mint-nft-orilux
```

**📋 COPIAR LA URL** - La necesitarás después

---

## 📋 PASO 5: VERIFICAR DEPLOYMENT (2 min)

### 5.1. Ver logs de la función

```bash
npx supabase functions logs mint-nft-orilux --follow
```

Esto mostrará los logs en tiempo real.

### 5.2. Verificar en Dashboard

```
Dashboard → Edge Functions → mint-nft-orilux
```

Deberías ver:
- ✅ Estado: Deployed
- ✅ Última actualización: Hace unos segundos
- ✅ URL disponible

---

## 📋 PASO 6: PROBAR LA FUNCIÓN (5 min)

### 6.1. Crear joya de prueba en Supabase

```sql
-- En SQL Editor
INSERT INTO jewelry_items (
    name,
    type,
    material,
    purity,
    weight,
    price,
    description,
    user_id
) VALUES (
    'Anillo de Oro Test',
    'ring',
    'gold',
    '18k',
    5.5,
    1500000,
    'Anillo de prueba para certificación',
    (SELECT id FROM auth.users LIMIT 1)
)
RETURNING id;
```

**📋 COPIAR EL ID** que retorna

### 6.2. Probar la función con curl

```powershell
# Reemplazar [JEWELRY_ID] y [USER_ID] con valores reales

$body = @{
    certificateId = "CERT-TEST-001"
    jewelryItemId = "[JEWELRY_ID]"
    userId = "[USER_ID]"
    ownerAddress = "test_wallet_address"
    issuerAddress = "Veralix System"
} | ConvertTo-Json

$headers = @{
    "apikey" = "tu_anon_key_de_supabase"
    "Authorization" = "Bearer tu_anon_key_de_supabase"
    "Content-Type" = "application/json"
}

Invoke-RestMethod `
    -Uri "https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/mint-nft-orilux" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 6.3. Verificar respuesta

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "certificateId": 1,
    "oriluxCertificateId": "CERT-20251125-abc123",
    "transactionHash": "tx_hash_here",
    "tokenId": "nft_token_id",
    "qrCode": "data:image/png;base64,...",
    "verificationUrl": "https://oriluxchain.io/verify/CERT-...",
    "blockchainNetwork": "ORILUXCHAIN"
  },
  "message": "Certificado NFT creado exitosamente en Oriluxchain"
}
```

---

## 📋 PASO 7: INTEGRAR CON FRONTEND (10 min)

### 7.1. Actualizar servicio de Crestchain

**Archivo:** `src/services/crestchain/mint.ts`

```typescript
import { supabase } from '@/lib/supabase';

export async function mintNFTOrilux(data: {
  certificateId: string;
  jewelryItemId: string;
  userId: string;
  ownerAddress?: string;
}) {
  try {
    const { data: result, error } = await supabase.functions.invoke(
      'mint-nft-orilux',
      {
        body: {
          certificateId: data.certificateId,
          jewelryItemId: data.jewelryItemId,
          userId: data.userId,
          ownerAddress: data.ownerAddress || 'veralix_system',
          issuerAddress: 'Veralix System'
        }
      }
    );

    if (error) throw error;
    
    return result;
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}
```

### 7.2. Usar en componente

```typescript
import { mintNFTOrilux } from '@/services/crestchain/mint';

// En tu componente
const handleGenerateCertificate = async () => {
  try {
    setLoading(true);
    
    const result = await mintNFTOrilux({
      certificateId: `CERT-${Date.now()}`,
      jewelryItemId: jewelry.id,
      userId: user.id,
      ownerAddress: user.wallet_address
    });
    
    if (result.success) {
      toast.success('¡Certificado NFT creado!');
      console.log('QR Code:', result.data.qrCode);
      console.log('Verification URL:', result.data.verificationUrl);
    }
  } catch (error) {
    toast.error('Error al crear certificado');
  } finally {
    setLoading(false);
  }
};
```

---

## 📋 PASO 8: VERIFICAR LOGS (Opcional)

### 8.1. Ver logs en tiempo real

```bash
npx supabase functions logs mint-nft-orilux --follow
```

### 8.2. Logs que deberías ver

```
🚀 Iniciando proceso de certificación NFT
📋 Certificate ID: CERT-TEST-001
💎 Jewelry Item ID: xxx
📦 Obteniendo datos de jewelry_items...
✅ Joya obtenida: Anillo de Oro Test
🔧 Preparando datos para Oriluxchain...
🔗 Conectando a Oriluxchain: http://127.0.0.1:5001
📝 Creando certificado en blockchain...
✅ Certificado creado en blockchain!
🆔 Certificate ID: CERT-20251125-abc123
📝 TX Hash: tx_hash
🎨 Creando NFT...
✅ NFT creado: nft_token_id
💾 Guardando en Supabase...
✅ Certificado guardado en Supabase: 1
🔄 Actualizando jewelry_item...
✅ Jewelry item actualizado
🎉 Proceso completado exitosamente!
```

---

## ✅ CHECKLIST COMPLETO

### Preparación
- [ ] Oriluxchain API corriendo (puerto 5001)
- [ ] Supabase CLI instalado
- [ ] Proyecto linkeado a Supabase

### Configuración
- [ ] Edge Function creada (`mint-nft-orilux/index.ts`)
- [ ] Variables de entorno configuradas en Supabase
- [ ] Schema de base de datos actualizado

### Deployment
- [ ] Edge Function desplegada
- [ ] Logs verificados
- [ ] URL de función obtenida

### Testing
- [ ] Joya de prueba creada
- [ ] Función probada con curl
- [ ] Respuesta exitosa recibida
- [ ] Certificado visible en Supabase

### Integración
- [ ] Servicio actualizado en frontend
- [ ] Componente integrado
- [ ] Prueba end-to-end exitosa

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot connect to Oriluxchain"

**Problema:** Edge Function no puede conectar a `http://127.0.0.1:5001`

**Solución:**
1. Verificar que Oriluxchain esté corriendo
2. Si estás en producción, usar URL pública
3. Actualizar `ORILUXCHAIN_API_URL` en Supabase

### Error: "Jewelry item not found"

**Problema:** No encuentra la joya en Supabase

**Solución:**
1. Verificar que el `jewelryItemId` sea correcto
2. Verificar que la joya existe en `jewelry_items`
3. Verificar permisos de la tabla

### Error: "Database error"

**Problema:** No puede guardar en `nft_certificates`

**Solución:**
1. Verificar que ejecutaste el SQL del PASO 3
2. Verificar que las columnas existen
3. Verificar permisos de la tabla

### Error: "Oriluxchain error: 500"

**Problema:** Error en Oriluxchain API

**Solución:**
1. Ver logs de Oriluxchain: terminal donde corre `api_simple.py`
2. Verificar que los datos sean válidos
3. Verificar que blockchain esté inicializada

---

## 📊 FLUJO COMPLETO

```
Usuario en Veralix
    ↓
Click "Generate Certificate"
    ↓
Frontend llama mintNFTOrilux()
    ↓
Supabase Edge Function: mint-nft-orilux
    ↓
1. Obtiene datos de jewelry_items
2. Prepara datos para Oriluxchain
3. POST /api/jewelry/certify
4. POST /api/jewelry/nft/<cert_id>
5. Guarda en nft_certificates
6. Actualiza jewelry_items
    ↓
Retorna resultado con:
- Certificate ID
- Transaction Hash
- QR Code
- Verification URL
    ↓
Usuario ve certificado creado ✅
```

---

## 🎯 PRÓXIMOS PASOS

Una vez que todo funcione:

1. **Probar con joya real** en Veralix UI
2. **Verificar QR code** se genera correctamente
3. **Probar verificación** en URL pública
4. **Optimizar** tiempos de respuesta
5. **Agregar** manejo de errores más robusto

---

## 📝 COMANDOS RÁPIDOS

```bash
# Desplegar función
npx supabase functions deploy mint-nft-orilux

# Ver logs
npx supabase functions logs mint-nft-orilux --follow

# Listar funciones
npx supabase functions list

# Eliminar función (si necesitas)
npx supabase functions delete mint-nft-orilux
```

---

**¿Listo para empezar con el PASO 1?** 🚀
