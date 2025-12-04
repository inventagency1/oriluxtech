# ✅ Checklist de Implementación Veralix - Crestchain

## 📋 Estado Actual

### 1. Configuración de Red ✅
| Parámetro | Valor | Estado |
|-----------|-------|--------|
| **Red** | Crestchain (EVM compatible) | ✅ Configurado |
| **Token nativo** | TCT (gas) | ✅ |
| **RPC URL** | `https://rpc.crestchain.pro:8545` | ⚠️ Verificar puerto |
| **Explorer** | `https://scan.crestchain.pro` | ✅ |

### 2. Smart Contract ✅
| Parámetro | Valor | Estado |
|-----------|-------|--------|
| **Proxy (UUPS)** | `0xddF276c0Ab894fa7D085Ac3441471A431610A0E4` | ✅ Desplegado |
| **Implementación** | `0x80440661B86D2A16d2f4dBcB7800F21F915bCB3F` | ✅ |
| **Explorer Link** | [Ver en Explorer](https://scan.crestchain.pro/address/0xddF276c0Ab894fa7D085Ac3441471A431610A0E4) | ✅ |

### 3. Variables de Entorno (Supabase Edge Functions)

#### Requeridas:
```bash
VERALIX_CONTRACT_ADDRESS=0xddF276c0Ab894fa7D085Ac3441471A431610A0E4
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro:8545
SYSTEM_PRIVATE_KEY=0x<clave_admin_para_mint>
```

#### Estado en Supabase:
- [ ] `VERALIX_CONTRACT_ADDRESS` - Configurar en Supabase Dashboard
- [ ] `CRESTCHAIN_RPC_URL` - Configurar en Supabase Dashboard  
- [ ] `SYSTEM_PRIVATE_KEY` - Configurar en Supabase Dashboard (⚠️ SECRETO)
- [ ] `PINATA_JWT` - Para subir a IPFS

---

## 🔧 Pasos de Implementación

### Paso 1: Verificar Variables de Entorno en Supabase
1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Proyecto → Settings → Edge Functions → Secrets
3. Agregar/verificar las siguientes variables:

```
VERALIX_CONTRACT_ADDRESS = 0xddF276c0Ab894fa7D085Ac3441471A431610A0E4
CRESTCHAIN_RPC_URL = https://rpc.crestchain.pro:8545
SYSTEM_PRIVATE_KEY = 0x... (tu clave privada del owner)
PINATA_JWT = ... (tu JWT de Pinata)
```

### Paso 2: Verificar Conexión RPC
Ejecutar test de conexión:
```bash
curl -X POST https://rpc.crestchain.pro:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Paso 3: Verificar Balance TCT
La wallet del sistema necesita TCT para gas:
```bash
# Verificar balance de la wallet del sistema
curl -X POST https://rpc.crestchain.pro:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["<WALLET_ADDRESS>","latest"],"id":1}'
```

### Paso 4: Test de Mint
Probar la función de mint:
```bash
curl -X POST https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/mint-nft-crestchain \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "VRX-TEST-001",
    "jewelryItemId": "<UUID_JOYA>",
    "userId": "<UUID_USUARIO>",
    "ownerAddress": "0x..."
  }'
```

---

## 📁 Edge Functions Clave

| Función | Archivo | Propósito |
|---------|---------|-----------|
| `generate-nft-certificate` | `supabase/functions/generate-nft-certificate/index.ts` | Genera certificado, QR, IPFS |
| `mint-nft-crestchain` | `supabase/functions/mint-nft-crestchain/index.ts` | Mint en Crestchain |
| `dual-mint-orilux-crestchain` | `supabase/functions/dual-mint-orilux-crestchain/index.ts` | Mint dual |
| `verify-nft-status` | `supabase/functions/verify-nft-status/index.ts` | Verificar estado NFT |
| `test-crestchain-rpc` | `supabase/functions/test-crestchain-rpc/index.ts` | Test de conexión |

---

## 🗄️ Tablas de Base de Datos

### `nft_certificates`
```sql
- id (uuid)
- certificate_id (text) -- VRX-YYYYMMDD-XXXXX
- jewelry_item_id (uuid)
- user_id (uuid)
- token_id (text)
- contract_address (text)
- transaction_hash (text)
- blockchain_network (enum: CRESTCHAIN, ORILUXCHAIN, DUAL)
- metadata_uri (text)
- certificate_pdf_url (text)
- qr_code_url (text)
- is_verified (boolean)
- blockchain_verification_url (text)
```

---

## 🔍 Troubleshooting

### Error: "SYSTEM_PRIVATE_KEY missing"
→ Configurar la variable en Supabase Edge Functions Secrets

### Error: "insufficient funds for gas"
→ La wallet necesita TCT. Obtener TCT del faucet o transferir

### Error: "execution reverted"
→ Verificar que el contrato esté correctamente desplegado y la ABI coincida

### Error: RPC timeout
→ Verificar que el RPC URL sea correcto (con puerto :8545)

---

## 📊 Verificación Final

- [ ] Contrato visible en Explorer
- [ ] Variables de entorno configuradas
- [ ] Wallet con balance TCT
- [ ] Test de mint exitoso
- [ ] Certificado visible en frontend
- [ ] QR funcional
- [ ] PDF descargable

---

## 🔗 Links Útiles

- **Explorer**: https://scan.crestchain.pro
- **Contrato**: https://scan.crestchain.pro/address/0xddF276c0Ab894fa7D085Ac3441471A431610A0E4
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl
- **Veralix App**: https://veralix.io
