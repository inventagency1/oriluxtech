# 🔗 INTEGRACIÓN CRESTCHAIN MEJORADA

## 📊 ANÁLISIS DEL PROBLEMA ACTUAL

### ❌ Lo que NO funciona bien:

1. **Usa BSC Testnet en lugar de Crestchain**
   ```typescript
   const RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";
   ```

2. **Datos hardcodeados (placeholders)**
   ```typescript
   const jewelryType = "unknown";
   const description = "Veralix NFT Certificate";
   const imageHash = "ipfs://placeholder";
   ```

3. **No usa datos reales de la joya**
   - Ignora materiales, peso, origen, artesano
   - No envía imágenes reales
   - Metadata incompleta

4. **Integración Oriluxchain débil**
   - Solo se ejecuta en background
   - Si falla, no hay retry
   - No valida respuesta

---

## ✅ SOLUCIÓN PROPUESTA

### OPCIÓN 1: Integración Directa con Oriluxchain (RECOMENDADO)

**Ventajas:**
- ✅ Control total sobre la blockchain
- ✅ No depende de servicios externos (BSC)
- ✅ Más rápido y confiable
- ✅ Sin costos de gas
- ✅ Datos completos y verificables

**Arquitectura:**
```
Veralix Frontend
    ↓
Supabase Edge Function
    ↓
Oriluxchain API (/api/jewelry/certify)
    ↓
Blockchain Local
    ↓
Respuesta con TX Hash
    ↓
Actualizar Supabase
```

**Qué necesito:**

1. **URL de Oriluxchain API**
   - Desarrollo: `http://localhost:5000`
   - Producción: `https://api.oriluxchain.com`

2. **Endpoint específico**
   - `POST /api/jewelry/certify`

3. **Autenticación** (opcional)
   - API Key
   - O autenticación básica

4. **Formato de datos**
   - JSON con estructura específica

---

### OPCIÓN 2: Crestchain Real (Blockchain Pública)

**Ventajas:**
- ✅ Blockchain pública y descentralizada
- ✅ Verificación externa
- ✅ Mayor credibilidad

**Desventajas:**
- ⚠️ Requiere RPC endpoint de Crestchain
- ⚠️ Requiere smart contract desplegado
- ⚠️ Costos de gas (si aplica)

**Qué necesito:**

1. **RPC URL de Crestchain**
   - Ejemplo: `https://rpc.crestchain.pro`

2. **Smart Contract Address**
   - Contrato desplegado en Crestchain

3. **ABI del contrato**
   - Funciones disponibles

4. **Wallet con fondos**
   - Para pagar gas fees

---

## 🚀 IMPLEMENTACIÓN RECOMENDADA

### Paso 1: Crear Edge Function Mejorada

**Archivo:** `supabase/functions/certify-jewelry-crestchain/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuración de Oriluxchain
const ORILUXCHAIN_API_URL = Deno.env.get('ORILUXCHAIN_API_URL') || 'http://localhost:5000'
const ORILUXCHAIN_API_KEY = Deno.env.get('ORILUXCHAIN_API_KEY')

interface CertifyJewelryRequest {
  jewelryItemId: string
  userId: string
  metadataUri: string
  imageUri: string
}

interface OriluxchainCertifyPayload {
  jewelry_type: string
  material: string
  purity: string
  weight: number
  stones: Array<{
    type: string
    carats: number
    clarity: string
    color: string
  }>
  jeweler: string
  manufacturer: string
  origin_country: string
  description: string
  estimated_value: number
  currency: string
  owner_address: string
  metadata_uri: string
  image_uri: string
  certificate_id: string
}

async function certifyInOriluxchain(
  payload: OriluxchainCertifyPayload
): Promise<{
  success: boolean
  transaction_hash?: string
  block_number?: number
  certificate_id?: string
  error?: string
}> {
  try {
    console.log('🔗 Certificando en Oriluxchain...')
    
    const response = await fetch(`${ORILUXCHAIN_API_URL}/api/jewelry/certify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ORILUXCHAIN_API_KEY || '',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Oriluxchain error:', errorText)
      return {
        success: false,
        error: `Oriluxchain API error: ${response.status}`
      }
    }

    const data = await response.json()
    console.log('✅ Certificado en Oriluxchain:', data)

    return {
      success: true,
      transaction_hash: data.transaction_hash,
      block_number: data.block_number,
      certificate_id: data.certificate_id
    }

  } catch (error: any) {
    console.error('❌ Error certificando en Oriluxchain:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { jewelryItemId, userId, metadataUri, imageUri } = await req.json()

    // Obtener datos de la joya
    const { data: jewelryData, error: jewelryError } = await supabaseAdmin
      .from('jewelry_items')
      .select('*')
      .eq('id', jewelryItemId)
      .single()

    if (jewelryError || !jewelryData) {
      throw new Error('Jewelry item not found')
    }

    // Obtener datos del usuario/joyero
    const { data: userData } = await supabaseAdmin
      .from('profiles')
      .select('full_name, business_name, wallet_address')
      .eq('user_id', userId)
      .single()

    // Generar Certificate ID único
    const { data: certIdData } = await supabaseAdmin.rpc('generate_certificate_id')
    const certificateId = certIdData || `VRX-${Date.now()}`

    // Preparar payload para Oriluxchain
    const oriluxPayload: OriluxchainCertifyPayload = {
      jewelry_type: jewelryData.type || 'jewelry',
      material: (jewelryData.materials || []).join(', ') || 'Mixed',
      purity: jewelryData.purity || '18K',
      weight: jewelryData.weight || 0,
      stones: jewelryData.stones || [],
      jeweler: userData?.business_name || userData?.full_name || 'Veralix Jeweler',
      manufacturer: jewelryData.manufacturer || 'Veralix',
      origin_country: jewelryData.origin || 'Colombia',
      description: jewelryData.description || `${jewelryData.name} - Certificado Veralix`,
      estimated_value: jewelryData.sale_price || 0,
      currency: jewelryData.currency || 'COP',
      owner_address: userData?.wallet_address || '0x0000000000000000000000000000000000000000',
      metadata_uri: metadataUri,
      image_uri: imageUri,
      certificate_id: certificateId
    }

    // Certificar en Oriluxchain
    const oriluxResult = await certifyInOriluxchain(oriluxPayload)

    if (!oriluxResult.success) {
      throw new Error(`Failed to certify in Oriluxchain: ${oriluxResult.error}`)
    }

    // Guardar certificado en Supabase
    const { data: certificateRecord, error: certError } = await supabaseAdmin
      .from('nft_certificates')
      .insert({
        id: crypto.randomUUID(),
        certificate_id: certificateId,
        jewelry_item_id: jewelryItemId,
        user_id: userId,
        owner_id: userId,
        transaction_hash: oriluxResult.transaction_hash,
        block_number: oriluxResult.block_number?.toString(),
        metadata_uri: metadataUri,
        blockchain_network: 'oriluxchain',
        is_verified: true,
        verification_date: new Date().toISOString()
      })
      .select()
      .single()

    if (certError) {
      throw certError
    }

    // Actualizar estado de la joya
    await supabaseAdmin
      .from('jewelry_items')
      .update({ status: 'certified' })
      .eq('id', jewelryItemId)

    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          id: certificateRecord.id,
          certificateId,
          transactionHash: oriluxResult.transaction_hash,
          blockNumber: oriluxResult.block_number
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
```

---

### Paso 2: Mejorar Endpoint de Oriluxchain

**Archivo:** `api.py` (ya existe, pero mejorarlo)

```python
@self.app.route('/api/jewelry/certify', methods=['POST'])
def certify_jewelry():
    """Crea un certificado de joyería con datos completos."""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = [
            'jewelry_type', 'material', 'weight', 'jeweler',
            'manufacturer', 'origin_country', 'description',
            'estimated_value', 'currency', 'certificate_id'
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Crear certificado en blockchain
        certificate = self.jewelry_system.certify_jewelry(
            jewelry_type=data['jewelry_type'],
            material=data['material'],
            purity=data.get('purity', '18K'),
            weight=data['weight'],
            stones=data.get('stones', []),
            jeweler=data['jeweler'],
            manufacturer=data['manufacturer'],
            origin_country=data['origin_country'],
            description=data['description'],
            estimated_value=data['estimated_value'],
            currency=data['currency'],
            owner_address=data.get('owner_address'),
            metadata_uri=data.get('metadata_uri'),
            image_uri=data.get('image_uri'),
            certificate_id=data['certificate_id']
        )
        
        # Crear transacción
        transaction = self.blockchain.create_transaction(
            sender='SYSTEM',
            recipient=data.get('owner_address', 'VERALIX'),
            amount=0,
            transaction_type='JEWELRY_CERTIFICATION',
            metadata={
                'certificate_id': certificate.certificate_id,
                'jewelry_type': data['jewelry_type'],
                'material': data['material'],
                'weight': data['weight']
            }
        )
        
        # Minar bloque
        block = self.blockchain.mine_pending_transactions('SYSTEM')
        
        return jsonify({
            'success': True,
            'message': 'Jewelry certified successfully',
            'certificate_id': certificate.certificate_id,
            'transaction_hash': transaction.hash,
            'block_number': len(self.blockchain.chain) - 1,
            'verification_url': f'http://localhost:5000/api/jewelry/verify/{certificate.certificate_id}'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Configuración
- [ ] Definir URL de Oriluxchain (local o producción)
- [ ] Crear API Key para autenticación (opcional)
- [ ] Configurar variables de entorno en Supabase

### Backend (Oriluxchain)
- [ ] Mejorar endpoint `/api/jewelry/certify`
- [ ] Validar todos los campos requeridos
- [ ] Retornar datos completos (tx_hash, block_number)
- [ ] Agregar logging detallado

### Edge Function (Supabase)
- [ ] Crear nueva función `certify-jewelry-crestchain`
- [ ] Obtener datos reales de la joya
- [ ] Enviar a Oriluxchain con datos completos
- [ ] Manejar errores y retries
- [ ] Actualizar Supabase con resultado

### Frontend (Veralix)
- [ ] Actualizar llamada a nueva Edge Function
- [ ] Mostrar estado de certificación
- [ ] Mostrar TX hash y block number
- [ ] Link a verificación en Oriluxchain

---

## 🎯 PRÓXIMOS PASOS

1. **Decidir arquitectura:**
   - ¿Usar Oriluxchain directamente? (RECOMENDADO)
   - ¿O usar Crestchain pública?

2. **Configurar variables de entorno:**
   ```env
   ORILUXCHAIN_API_URL=http://localhost:5000
   ORILUXCHAIN_API_KEY=tu_api_key_aqui
   ```

3. **Crear Edge Function mejorada**

4. **Probar flujo completo**

---

## ❓ PREGUNTAS PARA TI

1. **¿Tienes Crestchain desplegada como blockchain pública?**
   - Si NO → Usar Oriluxchain directamente
   - Si SÍ → Necesito RPC URL y contract address

2. **¿Prefieres integración directa con Oriluxchain?**
   - Más simple y rápido
   - Control total
   - Sin costos

3. **¿Necesitas que los certificados sean públicamente verificables?**
   - Si SÍ → Considerar blockchain pública
   - Si NO → Oriluxchain es suficiente

---

**¿Qué opción prefieres? ¿Vamos con Oriluxchain directamente?**
