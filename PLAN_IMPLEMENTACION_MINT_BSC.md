# 🚀 PLAN DE IMPLEMENTACIÓN - MINT EN BSC MAINNET

**Fecha:** 1 de Diciembre, 2025  
**Objetivo:** Mintear NFT automáticamente en BSC Mainnet cada vez que se genera un certificado

---

## 📋 RESUMEN DE CONFIGURACIÓN

### Red BSC Mainnet
| Parámetro | Valor |
|-----------|-------|
| **Red** | BNB Smart Chain (BSC) Mainnet |
| **Chain ID** | 56 |
| **RPC URL** | `https://bsc-dataseed.binance.org` |
| **Explorer** | `https://bscscan.com` |
| **Token Gas** | BNB |

### Token TCT
| Parámetro | Valor |
|-----------|-------|
| **Red** | BSC Mainnet |
| **Contrato TCT** | `0x2D8931C368fE34D3d039Ab454aFc131342A339B5` |
| **Tipo** | BEP-20 |

### Wallet del Sistema
| Parámetro | Valor |
|-----------|-------|
| **Address** | `0x9C604DfFf13CbeB8ffe7A4102d9245b5b57784D9` |
| **Balance BNB** | ⚠️ **0 BNB** - Necesita fondos |
| **Mínimo requerido** | ~0.05 BNB para despliegue + gas |

### Contrato Veralix NFT (A DESPLEGAR)
| Parámetro | Valor |
|-----------|-------|
| **Red** | BSC Mainnet |
| **Contrato** | `<PENDIENTE DE DESPLEGAR>` |
| **Tipo** | ERC-721 |

---

## 🎯 FLUJO DE IMPLEMENTACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE CERTIFICACIÓN                        │
└─────────────────────────────────────────────────────────────────┘

1. Usuario solicita certificado
         │
         ▼
┌─────────────────────┐
│  generate-nft-      │
│  certificate        │
│  (Edge Function)    │
└─────────────────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│  1. Generar HTML    │              │  2. Subir imagen    │
│     del certificado │              │     a IPFS (Pinata) │
└─────────────────────┘              └─────────────────────┘
         │                                      │
         └──────────────────┬───────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  3. Crear metadata  │
                 │     JSON y subir    │
                 │     a IPFS          │
                 └─────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  4. MINT NFT en     │
                 │     BSC MAINNET     │  ← NUEVO
                 │     (createCertificate)
                 └─────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  5. Guardar en      │
                 │     Supabase        │
                 │     (nft_certificates)
                 └─────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  6. Retornar        │
                 │     certificado     │
                 │     con TX hash     │
                 └─────────────────────┘
```

---

## 📝 PASOS DE IMPLEMENTACIÓN

### PASO 0: Desplegar Contrato en BSC Mainnet ⏱️ 30 min

**⚠️ PREREQUISITO:** Necesitamos desplegar el contrato de certificados NFT en BSC Mainnet.

**Opciones:**
1. **Usar Remix IDE** - Conectar MetaMask a BSC y desplegar
2. **Usar Hardhat** - Script de deployment automatizado

**Requisitos:**
- Wallet con BNB para gas (~0.01-0.05 BNB)
- Contrato `VeralixCertificate.sol` compilado

---

### PASO 1: Configurar Variables de Entorno en Supabase ⏱️ 5 min

**Ir a:** Supabase Dashboard → Settings → Edge Functions → Secrets

```bash
# Variables requeridas para BSC Mainnet
BSC_RPC_URL=https://bsc-dataseed.binance.org
VERALIX_CONTRACT_ADDRESS=<DIRECCIÓN_DEL_CONTRATO_DESPLEGADO>
SYSTEM_PRIVATE_KEY=0x<TU_PRIVATE_KEY>
TCT_CONTRACT_ADDRESS=0x2D8931C368fE34D3d039Ab454aFc131342A339B5
```

**Verificar que ya existen:**
- ✅ `PINATA_JWT`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**Wallet del sistema necesita:**
- BNB para gas (fees de transacción)
- NO necesita TCT (TCT es el token del proyecto, no para gas)

---

### PASO 2: Verificar ABI del Contrato ⏱️ 10 min

Necesitamos confirmar la firma correcta de `createCertificate`. 

**Opción A:** Verificar en BscScan después de desplegar
```
https://bscscan.com/address/<CONTRATO_DESPLEGADO>#code
```

**Opción B:** Usar la ABI que ya tenemos (8 parámetros)
```typescript
const CONTRACT_ABI = [
  {
    inputs: [
      { name: "certificateNumber", type: "string" },
      { name: "jewelryType", type: "string" },
      { name: "description", type: "string" },
      { name: "imageHash", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "owner", type: "address" },
      { name: "appraisalValue", type: "uint256" },
      { name: "appraisalCurrency", type: "string" },
    ],
    name: "createCertificate",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
```

---

### PASO 3: Actualizar `generate-nft-certificate` ⏱️ 30 min

**Archivo:** `supabase/functions/generate-nft-certificate/index.ts`

**Cambios necesarios:**

1. **Importar ethers.js**
2. **Agregar función de mint**
3. **Llamar mint después de subir a IPFS**
4. **Guardar TX hash en base de datos**

---

### PASO 4: Crear Función de Mint ⏱️ 20 min

```typescript
// Función para mintear en BSC Mainnet
async function mintOnBSC(
  certificateId: string,
  jewelryData: {
    type: string;
    description: string;
    imageHash: string;
    metadataURI: string;
    price: number;
  },
  ownerAddress: string
): Promise<{ txHash: string; tokenId: string; blockNumber: number } | null> {
  
  // BSC Mainnet RPCs (con fallbacks)
  const BSC_RPCS = [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org',
    'https://bsc-dataseed3.binance.org',
    'https://bsc-dataseed4.binance.org'
  ];
  
  const RPC_URL = Deno.env.get('BSC_RPC_URL') || BSC_RPCS[0];
  const CONTRACT_ADDRESS = Deno.env.get('VERALIX_CONTRACT_ADDRESS');
  const PRIVATE_KEY = Deno.env.get('SYSTEM_PRIVATE_KEY');
  
  if (!PRIVATE_KEY) {
    console.error('❌ SYSTEM_PRIVATE_KEY no configurada');
    return null;
  }
  
  if (!CONTRACT_ADDRESS) {
    console.error('❌ VERALIX_CONTRACT_ADDRESS no configurada');
    return null;
  }
  
  try {
    const { ethers } = await import('https://esm.sh/ethers@6.7.0');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Verificar balance de BNB para gas
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance BNB:', ethers.formatEther(balance));
    
    if (balance < ethers.parseEther('0.001')) {
      console.error('❌ Balance BNB insuficiente para gas');
      return null;
    }
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    console.log('📝 Minteando NFT en BSC Mainnet...');
    console.log('   Certificate ID:', certificateId);
    console.log('   Owner:', ownerAddress);
    console.log('   Contract:', CONTRACT_ADDRESS);
    
    const tx = await contract.createCertificate(
      certificateId,                              // certificateNumber
      jewelryData.type,                           // jewelryType
      jewelryData.description,                    // description
      jewelryData.imageHash,                      // imageHash
      jewelryData.metadataURI,                    // metadataURI
      ownerAddress,                               // owner
      BigInt(Math.floor(jewelryData.price * 100)), // appraisalValue (centavos)
      'COP'                                       // appraisalCurrency
    );
    
    console.log('⏳ TX enviada:', tx.hash);
    console.log('🔗 Ver en BscScan: https://bscscan.com/tx/' + tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ TX confirmada en bloque:', receipt.blockNumber);
    
    // Extraer tokenId del evento
    const tokenId = receipt?.logs?.[0]?.args?.[0]?.toString() || '0';
    
    return {
      txHash: tx.hash,
      tokenId: tokenId,
      blockNumber: receipt.blockNumber
    };
    
  } catch (error) {
    console.error('❌ Error minteando en BSC:', error);
    return null;
  }
}
```

---

### PASO 5: Integrar en el Flujo de Generación ⏱️ 15 min

Después de subir metadata a IPFS, llamar al mint:

```typescript
// En generate-nft-certificate/index.ts

// ... después de subir metadata a IPFS ...

// 4. Mint en BSC Mainnet
console.log('🔗 Minteando NFT en BSC Mainnet...');
const mintResult = await mintOnBSC(
  certificateId,
  {
    type: jewelryItem.type || 'Jewelry',
    description: jewelryItem.description || `Certificado de autenticidad para ${jewelryItem.name}`,
    imageHash: imageIpfsHash,
    metadataURI: metadataIpfsUri,
    price: jewelryItem.price || 0
  },
  ownerWalletAddress || wallet.address // wallet del sistema si no hay owner
);

// 5. Guardar en base de datos
const certificateData = {
  certificate_id: certificateId,
  jewelry_item_id: jewelryItemId,
  user_id: userId,
  metadata_uri: metadataIpfsUri,
  certificate_pdf_url: htmlIpfsUri,
  qr_code_url: qrCodeUrl,
  // Datos de BSC Mainnet
  transaction_hash: mintResult?.txHash || null,
  token_id: mintResult?.tokenId || null,
  contract_address: CONTRACT_ADDRESS,
  block_number: mintResult?.blockNumber?.toString() || null,
  blockchain_network: 'BSC_MAINNET',
  blockchain_verification_url: mintResult?.txHash 
    ? `https://bscscan.com/tx/${mintResult.txHash}` 
    : null,
  is_verified: mintResult !== null
};
```

---

### PASO 6: Actualizar Tabla `nft_certificates` ⏱️ 5 min

Verificar que la tabla tenga los campos necesarios:

```sql
-- Verificar campos existentes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nft_certificates';

-- Si faltan campos, agregar:
ALTER TABLE nft_certificates 
ADD COLUMN IF NOT EXISTS block_number TEXT,
ADD COLUMN IF NOT EXISTS blockchain_verification_url TEXT;
```

---

### PASO 7: Desplegar y Probar ⏱️ 15 min

```bash
# 1. Desplegar función actualizada
cd veralix-crestchain/veralix-crestchain-1.0
npx supabase functions deploy generate-nft-certificate

# 2. Ver logs en tiempo real
npx supabase functions logs generate-nft-certificate --follow

# 3. Probar generando un certificado desde la app
```

---

## 🧪 PRUEBAS

### Test 1: Verificar Conexión RPC BSC
```bash
curl -X POST https://bsc-dataseed.binance.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Test 2: Verificar Balance BNB de Wallet
```bash
curl -X POST https://bsc-dataseed.binance.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["<WALLET_ADDRESS>","latest"],"id":1}'
```

### Test 3: Verificar Contrato TCT
```bash
# Ver en BscScan
https://bscscan.com/token/0x2D8931C368fE34D3d039Ab454aFc131342A339B5
```

### Test 4: Generar Certificado de Prueba
1. Crear joya de prueba en la app
2. Generar certificado
3. Verificar TX en BscScan: `https://bscscan.com/tx/<TX_HASH>`

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Configuración
- [ ] Contrato NFT desplegado en BSC Mainnet
- [ ] Variables de entorno configuradas en Supabase
- [ ] Wallet del sistema con balance BNB (para gas)
- [ ] ABI del contrato verificada

### Código
- [ ] Función `mintOnBSC` creada
- [ ] Integración en `generate-nft-certificate`
- [ ] Manejo de errores implementado
- [ ] Logs detallados agregados

### Base de Datos
- [ ] Campos de blockchain en `nft_certificates`
- [ ] Índices para búsqueda por TX hash

### Despliegue
- [ ] Edge Function desplegada
- [ ] Logs verificados
- [ ] Test de mint exitoso

### Verificación
- [ ] TX visible en BscScan
- [ ] NFT visible en contrato
- [ ] Certificado muestra TX hash en frontend

---

## 🔧 TROUBLESHOOTING

### Error: "SYSTEM_PRIVATE_KEY missing"
→ Configurar variable en Supabase Secrets

### Error: "insufficient funds for gas"
→ Enviar BNB a la wallet del sistema (mínimo 0.01 BNB)

### Error: "execution reverted"
→ Verificar ABI y parámetros del contrato
→ Verificar que el contrato esté desplegado correctamente

### Error: "nonce too low"
→ Esperar confirmación de TX anterior o resetear nonce

### Error: "VERALIX_CONTRACT_ADDRESS missing"
→ Desplegar contrato en BSC y configurar la dirección en Supabase

---

## 📊 ESTIMACIÓN DE TIEMPO

| Paso | Tiempo |
|------|--------|
| **Desplegar contrato en BSC** | 30 min |
| Configurar variables | 5 min |
| Verificar ABI | 10 min |
| Actualizar código | 30 min |
| Crear función mint | 20 min |
| Integrar en flujo | 15 min |
| Actualizar BD | 5 min |
| Desplegar y probar | 15 min |
| **TOTAL** | **~2 horas** |

---

## 💰 COSTOS ESTIMADOS (BSC Mainnet)

| Concepto | Costo Estimado |
|----------|----------------|
| Desplegar contrato | ~0.01-0.05 BNB (~$3-15 USD) |
| Mint por certificado | ~0.0005-0.002 BNB (~$0.15-0.60 USD) |
| 100 certificados/mes | ~0.05-0.2 BNB (~$15-60 USD) |

**Nota:** Los costos dependen del precio de BNB y la congestión de la red.

---

## 🎯 PRÓXIMOS PASOS

### Prerequisitos:
1. **Wallet con BNB** - Para desplegar contrato y pagar gas
2. **Contrato VeralixCertificate.sol** - ¿Tienes el código fuente?
3. **Decidir tipo de NFT** - ERC-721 (único) o ERC-1155 (múltiples)

### Preguntas:
1. **¿Tienes una wallet con BNB para desplegar?**
2. **¿Tienes el código del smart contract o usamos uno nuevo?**
3. **¿Quieres que cree el contrato desde cero?**

¿Empezamos con el despliegue del contrato?
