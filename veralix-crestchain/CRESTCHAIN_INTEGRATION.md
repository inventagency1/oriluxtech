# 🔗 CRESTCHAIN INTEGRATION DOCUMENTATION

## Documentación Técnica de la Integración de Veralix con CrestChain

---

## 📋 Índice

1. [Resumen de la Integración](#resumen)
2. [Configuración de Red](#configuración-de-red)
3. [Smart Contract](#smart-contract)
4. [Edge Functions (Supabase)](#edge-functions)
5. [Flujo de Certificación NFT](#flujo-de-certificación)
6. [Variables de Entorno](#variables-de-entorno)
7. [System Wallet](#system-wallet)
8. [Endpoints y APIs](#endpoints-y-apis)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen de la Integración {#resumen}

Veralix utiliza **CrestChain** como blockchain principal para el minteo de certificados NFT de joyería. La integración permite:

- ✅ Minteo de NFTs de certificados de autenticidad
- ✅ Verificación on-chain de propiedad
- ✅ Almacenamiento de metadata en IPFS (Pinata)
- ✅ Validación de ownership
- ✅ Dual-mint con Oriluxchain (opcional)

---

## ⚙️ Configuración de Red {#configuración-de-red}

### CrestChain Network Details

| Parámetro | Valor |
|-----------|-------|
| **Network Name** | CrestChain |
| **Chain ID** | `85523` |
| **RPC URL** | `https://rpc.crestchain.pro` |
| **Block Explorer** | `https://scan.crestchain.pro` |
| **Currency Symbol** | CREST |
| **Currency Decimals** | 18 |

### Agregar a MetaMask

```javascript
{
  chainId: '0x14E13',  // 85523 en hex
  chainName: 'CrestChain',
  nativeCurrency: {
    name: 'CREST',
    symbol: 'CREST',
    decimals: 18
  },
  rpcUrls: ['https://rpc.crestchain.pro'],
  blockExplorerUrls: ['https://scan.crestchain.pro']
}
```

---

## 📜 Smart Contract {#smart-contract}

### Veralix NFT Contract

| Campo | Valor |
|-------|-------|
| **Contract Address** | `0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB` |
| **Contract Type** | ERC-721 (NFT) |
| **Network** | CrestChain Mainnet |

### ABI Principal

```solidity
// Funciones principales del contrato
function createCertificate(
    address to, 
    string memory certificateId, 
    string memory metadataURI
) external returns (uint256)

function ownerOf(uint256 tokenId) external view returns (address)

function totalSupply() external view returns (uint256)

function name() external view returns (string)

function symbol() external view returns (string)
```

### ABI Completo (JSON)

```json
[
  "function createCertificate(address to, string memory certificateId, string memory metadataURI) external returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
]
```

---

## 🔧 Edge Functions (Supabase) {#edge-functions}

### 1. `test-crestchain-rpc`

**Propósito:** Diagnóstico y testing de conexión con CrestChain.

**Ubicación:** `supabase/functions/test-crestchain-rpc/index.ts`

**Acciones disponibles:**

| Action | Descripción |
|--------|-------------|
| `getBlockNumber` | Obtiene el número de bloque actual y Chain ID |
| `getContractInfo` | Obtiene info del contrato (totalSupply, name, symbol) |
| `getWalletBalance` | Obtiene balance del system wallet |
| `fullDiagnostic` | Ejecuta diagnóstico completo del sistema |
| `testPinata` | Verifica autenticación con Pinata IPFS |

**Ejemplo de uso:**

```typescript
const { data, error } = await supabase.functions.invoke('test-crestchain-rpc', {
  body: { action: 'fullDiagnostic' }
});

// Respuesta:
{
  success: true,
  rpc: {
    url: 'https://rpc.crestchain.pro',
    blockNumber: 12345,
    chainId: '85523',
    status: 'connected'
  },
  contract: {
    address: '0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB',
    totalSupply: '100',
    status: 'active'
  },
  wallet: {
    configured: true,
    address: '0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9',
    balance: '1.5'
  }
}
```

---

### 2. `mint-nft-crestchain`

**Propósito:** Mintea NFTs directamente en CrestChain.

**Ubicación:** `supabase/functions/mint-nft-crestchain/index.ts`

**Payload:**

```typescript
{
  certificateId: string,    // ID único del certificado (ej: "VRX-20251127-ABC123")
  ownerAddress: string,     // Dirección del propietario del NFT
  metadataURI: string       // URI de metadata en IPFS
}
```

**Respuesta:**

```typescript
{
  success: true,
  transaction_hash: '0x...',
  token_id: '123',
  contract_address: '0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB',
  blockchain_network: 'CRESTCHAIN'
}
```

---

### 3. `dual-mint-orilux-crestchain`

**Propósito:** Mintea el certificado en ambas blockchains (Oriluxchain + CrestChain).

**Ubicación:** `supabase/functions/dual-mint-orilux-crestchain/index.ts`

**Flujo:**
1. Verifica que el certificado existe en Oriluxchain
2. Mintea NFT en CrestChain
3. Actualiza registro en Supabase con datos de ambas blockchains

**Payload:**

```typescript
{
  certificateId: string,
  jewelryItemId: string,
  userId: string,
  ownerAddress: string
}
```

**Respuesta:**

```typescript
{
  success: true,
  message: 'Dual mint completed successfully',
  oriluxchain: {
    verified: true,
    verificationUrl: 'https://oriluxchain.../explorer/VRX-...'
  },
  crestchain: {
    txHash: '0x...',
    tokenId: '123',
    contractAddress: '0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB',
    blockNumber: 12345,
    verificationUrl: 'https://scan.crestchain.pro/tx/0x...'
  }
}
```

---

### 4. `ownership-validator`

**Propósito:** Valida la propiedad de un NFT en CrestChain.

**Ubicación:** `supabase/functions/ownership-validator/index.ts`

**Funcionalidad:**
- Verifica si una dirección es propietaria de un token específico
- Actualiza el estado de verificación en la base de datos
- Genera URL del explorer para verificación

---

### 5. `verify-nft-status`

**Propósito:** Verifica el estado actual de un NFT.

**Ubicación:** `supabase/functions/verify-nft-status/index.ts`

**Funcionalidad:**
- Lee el estado on-chain del NFT
- Verifica ownership
- Retorna información del bloque actual

---

## 🔄 Flujo de Certificación NFT {#flujo-de-certificación}

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE CERTIFICACIÓN NFT                           │
└─────────────────────────────────────────────────────────────────────────┘

1. Usuario solicita certificación
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
│  Upload imagen a    │              │  Generar metadata   │
│  Pinata IPFS        │              │  JSON               │
└─────────────────────┘              └─────────────────────┘
         │                                      │
         └──────────────────┬───────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Upload metadata    │
                 │  a Pinata IPFS      │
                 └─────────────────────┘
                            │
                            ▼
         ┌──────────────────┴──────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│  Registrar en       │              │  Mint NFT en        │
│  Oriluxchain        │              │  CrestChain         │
└─────────────────────┘              └─────────────────────┘
         │                                      │
         └──────────────────┬───────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Guardar en         │
                 │  Supabase DB        │
                 │  (nft_certificates) │
                 └─────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Retornar           │
                 │  certificado        │
                 │  completo           │
                 └─────────────────────┘
```

---

## 🔐 Variables de Entorno {#variables-de-entorno}

### Supabase Edge Functions

```bash
# CrestChain Configuration
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
VERALIX_CONTRACT_ADDRESS=0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB

# System Wallet (para minteo)
SYSTEM_PRIVATE_KEY=0x...  # Private key del system wallet

# IPFS (Pinata)
PINATA_JWT=eyJ...  # JWT de Pinata para uploads

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...

# Oriluxchain (para dual-mint)
ORILUXCHAIN_API_URL=https://oriluxchain-production.up.railway.app
```

### Frontend (Vite)

```bash
# .env
VITE_CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
VITE_VERALIX_CONTRACT_ADDRESS=0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB
```

---

## 💼 System Wallet {#system-wallet}

El system wallet es la cuenta que firma las transacciones de minteo en nombre de Veralix.

### Datos del Wallet

| Campo | Valor |
|-------|-------|
| **Address** | `0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9` |
| **Network** | CrestChain |
| **Chain ID** | 85523 |

### Archivo de Configuración

**Ubicación:** `system_wallet.json`

```json
{
  "address": "0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9",
  "network": "Crestchain",
  "chainId": 85523,
  "rpcUrl": "https://rpc.crestchain.pro",
  "explorerUrl": "https://scan.crestchain.pro"
}
```

> ⚠️ **IMPORTANTE:** La private key se almacena SOLO en Supabase Secrets, nunca en el código.

---

## 🌐 Endpoints y APIs {#endpoints-y-apis}

### CrestChain RPC Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `https://rpc.crestchain.pro` | JSON-RPC principal |

### Métodos JSON-RPC Utilizados

```javascript
// Obtener número de bloque
{ "method": "eth_blockNumber", "params": [], "id": 1 }

// Obtener balance
{ "method": "eth_getBalance", "params": ["0x...", "latest"], "id": 1 }

// Llamar contrato (read)
{ "method": "eth_call", "params": [{ "to": "0x...", "data": "0x..." }, "latest"], "id": 1 }

// Enviar transacción (write)
{ "method": "eth_sendRawTransaction", "params": ["0x..."], "id": 1 }
```

### Block Explorer

| Tipo | URL Pattern |
|------|-------------|
| Transaction | `https://scan.crestchain.pro/tx/{txHash}` |
| Address | `https://scan.crestchain.pro/address/{address}` |
| Token | `https://scan.crestchain.pro/token/{contractAddress}` |

---

## 🧪 Testing {#testing}

### Página de Testing

**Ubicación:** `src/pages/CrestchainTesting.tsx`

**Ruta:** `/crestchain-testing`

### Tests Disponibles

| Test | Descripción |
|------|-------------|
| **RPC Connection** | Verifica conexión al nodo RPC |
| **Contract Connection** | Verifica que el contrato responde |
| **Wallet Balance** | Verifica balance del system wallet |
| **Full Diagnostic** | Ejecuta todos los tests |
| **Pinata Test** | Verifica conexión con IPFS |

### Ejecutar Tests Manualmente

```typescript
// Desde la consola del navegador
const { data } = await supabase.functions.invoke('test-crestchain-rpc', {
  body: { action: 'fullDiagnostic' }
});
console.log(data);
```

### Verificar Contrato con ethers.js

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://rpc.crestchain.pro');
const contractAddress = '0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB';

const abi = [
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

const contract = new ethers.Contract(contractAddress, abi, provider);

const [totalSupply, name, symbol] = await Promise.all([
  contract.totalSupply(),
  contract.name(),
  contract.symbol()
]);

console.log({ totalSupply: totalSupply.toString(), name, symbol });
```

---

## 🔧 Troubleshooting {#troubleshooting}

### Error: "Failed to connect to CrestChain RPC"

**Causa:** El nodo RPC no está disponible o hay problemas de red.

**Solución:**
1. Verificar que `https://rpc.crestchain.pro` está accesible
2. Probar con el diagnóstico completo
3. Verificar que no hay bloqueos de firewall

### Error: "CORS blocked"

**Causa:** Las llamadas directas desde el navegador son bloqueadas por CORS.

**Solución:**
- Usar las Edge Functions de Supabase que actúan como proxy
- Nunca llamar directamente al RPC desde el frontend

### Error: "Insufficient funds"

**Causa:** El system wallet no tiene suficiente CREST para gas.

**Solución:**
1. Verificar balance: `action: 'getWalletBalance'`
2. Enviar CREST al system wallet: `0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9`

### Error: "Contract not found"

**Causa:** La dirección del contrato es incorrecta o el contrato no está desplegado.

**Solución:**
1. Verificar la dirección: `0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB`
2. Verificar en el explorer: `https://scan.crestchain.pro/address/0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB`

### Error: "SYSTEM_PRIVATE_KEY not configured"

**Causa:** La variable de entorno no está configurada en Supabase.

**Solución:**
```bash
supabase secrets set SYSTEM_PRIVATE_KEY=0x...
```

---

## 📊 Estructura de Datos en Supabase

### Tabla: `nft_certificates`

Campos relacionados con CrestChain:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `crestchain_tx_hash` | text | Hash de la transacción de mint |
| `crestchain_token_id` | text | ID del token en CrestChain |
| `crestchain_contract_address` | text | Dirección del contrato |
| `crestchain_block_number` | integer | Número de bloque |
| `crestchain_network` | text | 'CRESTCHAIN' |
| `crestchain_verification_url` | text | URL del explorer |
| `dual_verification` | boolean | true si está en ambas blockchains |

---

## 📝 Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-11-25 | 1.0.0 | Integración inicial con CrestChain |
| 2025-11-26 | 1.1.0 | Agregado dual-mint con Oriluxchain |
| 2025-11-27 | 1.2.0 | Documentación completa |

---

## 📞 Soporte

Para problemas con la integración de CrestChain:

1. Revisar logs en Supabase Dashboard → Edge Functions → Logs
2. Ejecutar diagnóstico completo desde `/crestchain-testing`
3. Verificar variables de entorno en Supabase Secrets

---

*Documento generado el 27 de Noviembre de 2025*
*Veralix - Certificación de Joyería en Blockchain*
