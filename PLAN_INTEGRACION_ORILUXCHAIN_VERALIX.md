# 🚀 PLAN DE INTEGRACIÓN: ORILUXCHAIN + VERALIX + PINATA

**Fecha:** 25 de Noviembre, 2025 - 7:35 PM  
**Estrategia:** Usar Oriluxchain (tu blockchain) en lugar de Crestchain

---

## ✅ VENTAJAS DE USAR ORILUXCHAIN

### 🎯 Control Total
- ✅ **Es tu blockchain** - control completo
- ✅ **Ya está funcionando** - no necesitas tokens externos
- ✅ **Sistema de certificación ya implementado** - `jewelry_certification.py`
- ✅ **API REST completa** - endpoints listos
- ✅ **Sin dependencias externas** - no necesitas TCT ni permisos

### 🔧 Funcionalidades Existentes
```python
# Oriluxchain YA TIENE:
✅ JewelryCertificationSystem
✅ JewelryItem (estructura de joyas)
✅ JewelryCertificate (certificados)
✅ API endpoints para certificación
✅ Generación de QR codes
✅ Verificación de certificados
✅ Transferencia de propiedad
✅ Historial de certificados
✅ Sistema de NFTs
```

---

## 📊 ARQUITECTURA DE INTEGRACIÓN

```
┌─────────────────────────────────────────────────────────┐
│ VERALIX FRONTEND (Vite + React)                         │
│ - UI para crear joyas                                   │
│ - UI para generar certificados                          │
│ - Visualización de NFTs                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ SUPABASE (Backend)                                       │
│ - PostgreSQL (jewelry_items, certificates)              │
│ - Edge Functions (TypeScript/Deno)                      │
│   • generate-certificate-orilux                         │
│   • mint-nft-orilux                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├──────────────┬──────────────┐
                 ▼              ▼              ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ PINATA (IPFS)    │  │ ORILUXCHAIN  │  │ SUPABASE DB  │
│ - Metadata JSON  │  │ - Blockchain │  │ - Persistencia│
│ - Imágenes       │  │ - NFTs       │  │ - Relaciones │
│ - Certificados   │  │ - API REST   │  │              │
└──────────────────┘  └──────────────┘  └──────────────┘
```

---

## 🎯 FLUJO COMPLETO

### 1. Usuario Crea Joya en Veralix
```
Usuario → Veralix UI → Supabase (jewelry_items)
```

### 2. Usuario Genera Certificado
```
Usuario click "Generate Certificate"
    ↓
Edge Function: generate-certificate-orilux
    ↓
1. Obtiene datos de joya (Supabase)
2. Sube imagen a Pinata (IPFS)
3. Genera metadata JSON
4. Sube metadata a Pinata (IPFS)
    ↓
Edge Function: mint-nft-orilux
    ↓
1. Llama API de Oriluxchain
   POST /api/jewelry/certify
2. Oriluxchain crea certificado en blockchain
3. Oriluxchain genera QR code
4. Retorna certificate_id y tx_hash
    ↓
Edge Function actualiza Supabase
    ↓
Usuario ve certificado con:
- Certificate ID
- Transaction Hash
- IPFS metadata URI
- QR code
- Link a verificación
```

---

## 🔧 ENDPOINTS DE ORILUXCHAIN DISPONIBLES

### Ya Implementados:

```python
# 1. Crear Certificado
POST /api/jewelry/certify
Body: {
    "item_id": "string",
    "jewelry_type": "ring|necklace|bracelet|earrings",
    "material": "gold|silver|platinum",
    "purity": "24k|18k|925",
    "weight": float,
    "stones": [{"type": "diamond", "carats": 0.5}],
    "jeweler": "string",
    "manufacturer": "string",
    "origin_country": "string",
    "creation_date": "ISO date",
    "description": "string",
    "images": ["url1", "url2"],
    "estimated_value": float,
    "owner": "wallet_address",
    "issuer": "issuer_address"
}
Response: {
    "success": true,
    "certificate_id": "CERT-20251125-abc123",
    "blockchain_tx": "tx_hash",
    "qr_code": "data:image/png;base64,...",
    "verification_url": "https://oriluxchain.io/verify/CERT-..."
}

# 2. Verificar Certificado
GET /api/jewelry/verify/<certificate_id>
Response: {
    "success": true,
    "certificate": {...},
    "valid": true,
    "blockchain_verified": true,
    "verification_date": "ISO date"
}

# 3. Crear NFT
POST /api/jewelry/nft/<certificate_id>
Response: {
    "success": true,
    "nft_token_id": "string",
    "certificate_id": "string"
}

# 4. Historial
GET /api/jewelry/history/<certificate_id>
Response: {
    "success": true,
    "certificate_id": "string",
    "history": [...]
}

# 5. Transferir Propiedad
POST /api/jewelry/transfer
Body: {
    "certificate_id": "string",
    "new_owner": "wallet_address",
    "current_owner": "wallet_address"
}

# 6. Buscar Certificados
GET /api/jewelry/search?jewelry_type=ring&material=gold

# 7. Certificados por Propietario
GET /api/jewelry/owner/<owner_address>

# 8. Estadísticas
GET /api/jewelry/stats
```

---

## 📝 IMPLEMENTACIÓN PASO A PASO

### FASE 1: CONFIGURAR ORILUXCHAIN (10 min)

#### 1.1. Verificar que Oriluxchain esté corriendo
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain

# Activar entorno virtual
.venv\Scripts\activate

# Iniciar Oriluxchain
python api.py
```

**Deberías ver:**
```
✅ Sistema de certificación de joyería inicializado
 * Running on http://127.0.0.1:5000
```

#### 1.2. Probar endpoints
```bash
# Verificar API
curl http://127.0.0.1:5000/api/stats

# Verificar sistema de joyería
curl http://127.0.0.1:5000/api/jewelry/stats
```

---

### FASE 2: CREAR EDGE FUNCTIONS PARA ORILUXCHAIN (30 min)

#### 2.1. Edge Function: mint-nft-orilux

**Archivo:** `supabase/functions/mint-nft-orilux/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ORILUXCHAIN_API = Deno.env.get("ORILUXCHAIN_API_URL") || "http://127.0.0.1:5000";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MintRequest {
  certificateId: string;
  jewelryItemId: string;
  userId: string;
  ownerAddress: string;
  issuerAddress: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json() as MintRequest;
    
    console.log('🔗 Conectando a Oriluxchain:', ORILUXCHAIN_API);
    
    // 1. Obtener datos de la joya
    const { data: item, error: itemError } = await supabase
      .from('jewelry_items')
      .select('*')
      .eq('id', body.jewelryItemId)
      .single();
    
    if (itemError || !item) {
      throw new Error('Jewelry item not found');
    }
    
    console.log('💎 Datos de joya obtenidos:', item.name);
    
    // 2. Preparar datos para Oriluxchain
    const oriluxData = {
      item_id: body.jewelryItemId,
      jewelry_type: item.type || 'ring',
      material: item.material || 'gold',
      purity: item.purity || '18k',
      weight: item.weight || 0,
      stones: item.stones || [],
      jeweler: item.jeweler || 'Veralix',
      manufacturer: item.manufacturer || 'Unknown',
      origin_country: item.origin_country || 'Colombia',
      creation_date: item.created_at,
      description: item.description || '',
      images: item.image_url ? [item.image_url] : [],
      estimated_value: item.price || 0,
      owner: body.ownerAddress,
      issuer: body.issuerAddress
    };
    
    // 3. Llamar a Oriluxchain para crear certificado
    console.log('📝 Creando certificado en Oriluxchain...');
    const oriluxResponse = await fetch(`${ORILUXCHAIN_API}/api/jewelry/certify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oriluxData)
    });
    
    if (!oriluxResponse.ok) {
      throw new Error(`Oriluxchain error: ${oriluxResponse.statusText}`);
    }
    
    const oriluxResult = await oriluxResponse.json();
    console.log('✅ Certificado creado:', oriluxResult.certificate_id);
    
    // 4. Crear NFT en Oriluxchain
    console.log('🎨 Creando NFT...');
    const nftResponse = await fetch(
      `${ORILUXCHAIN_API}/api/jewelry/nft/${oriluxResult.certificate_id}`,
      { method: 'POST' }
    );
    
    const nftResult = await nftResponse.json();
    console.log('✅ NFT creado:', nftResult.nft_token_id);
    
    // 5. Guardar en Supabase
    const { data: certificate, error: certError } = await supabase
      .from('nft_certificates')
      .insert({
        certificate_id: body.certificateId,
        jewelry_item_id: body.jewelryItemId,
        user_id: body.userId,
        orilux_certificate_id: oriluxResult.certificate_id,
        transaction_hash: oriluxResult.blockchain_tx,
        token_id: nftResult.nft_token_id,
        qr_code: oriluxResult.qr_code,
        verification_url: oriluxResult.verification_url,
        blockchain_network: 'ORILUXCHAIN',
        is_verified: true,
        metadata_uri: item.metadata_uri || ''
      })
      .select('id')
      .single();
    
    if (certError) {
      throw new Error(`Database error: ${certError.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        certificateId: certificate.id,
        oriluxCertificateId: oriluxResult.certificate_id,
        transactionHash: oriluxResult.blockchain_tx,
        tokenId: nftResult.nft_token_id,
        qrCode: oriluxResult.qr_code,
        verificationUrl: oriluxResult.verification_url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

### FASE 3: CONFIGURAR SUPABASE (5 min)

**Variables de entorno:**

```bash
# En Supabase Dashboard → Settings → Edge Functions → Secrets

ORILUXCHAIN_API_URL=http://127.0.0.1:5000
# O si Oriluxchain está en servidor:
# ORILUXCHAIN_API_URL=https://api.oriluxchain.io

PINATA_JWT=tu_jwt_de_pinata

SUPABASE_URL=https://hykegpmjnpaupvwptxtl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

---

### FASE 4: ACTUALIZAR SCHEMA DE SUPABASE (5 min)

Agregar columnas a `nft_certificates`:

```sql
ALTER TABLE nft_certificates
ADD COLUMN IF NOT EXISTS orilux_certificate_id TEXT,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS verification_url TEXT;

CREATE INDEX IF NOT EXISTS idx_orilux_cert 
ON nft_certificates(orilux_certificate_id);
```

---

### FASE 5: DESPLEGAR Y PROBAR (15 min)

#### 5.1. Desplegar Edge Function
```bash
cd veralix-crestchain-1.0
npx supabase functions deploy mint-nft-orilux
```

#### 5.2. Iniciar Oriluxchain
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain
.venv\Scripts\activate
python api.py
```

#### 5.3. Iniciar Veralix
```bash
cd veralix-crestchain-1.0
npm run dev
```

#### 5.4. Probar flujo completo
1. Abrir http://localhost:5173
2. Crear joya
3. Generar certificado
4. Ver resultado con QR code

---

## 🎯 VENTAJAS DE ESTA INTEGRACIÓN

### ✅ Inmediato
- No necesitas esperar TCT tokens
- No dependes de terceros
- Control total del sistema

### ✅ Completo
- Certificación en blockchain
- NFTs nativos
- QR codes automáticos
- Verificación pública
- Historial completo

### ✅ Escalable
- API REST estándar
- Fácil de extender
- Compatible con otros sistemas

### ✅ Profesional
- Sistema ya probado
- Documentación completa
- Endpoints robustos

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Preparación
- [ ] Oriluxchain corriendo en puerto 5000
- [ ] Verificar endpoints de jewelry
- [ ] Probar creación de certificado manual

### Desarrollo
- [ ] Crear Edge Function mint-nft-orilux
- [ ] Actualizar schema de Supabase
- [ ] Configurar variables de entorno
- [ ] Desplegar Edge Function

### Testing
- [ ] Crear joya en Veralix
- [ ] Generar certificado
- [ ] Verificar en Oriluxchain
- [ ] Ver QR code
- [ ] Probar verificación pública

### Producción
- [ ] Configurar dominio para Oriluxchain
- [ ] SSL/HTTPS
- [ ] Backup de blockchain
- [ ] Monitoreo

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Iniciar Oriluxchain** (2 min)
2. **Crear Edge Function** (15 min)
3. **Configurar Supabase** (5 min)
4. **Probar sistema** (10 min)

**Total: 32 minutos para tener todo funcionando** ✅

---

**¿Comenzamos con el paso 1: Iniciar Oriluxchain?** 🚀
