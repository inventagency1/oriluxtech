# ✅ WALLET CREADA - PRÓXIMOS PASOS

**Fecha:** 25 de Noviembre, 2025 - 6:41 PM

---

## 🎉 WALLET DEL SISTEMA CREADA

### 📋 Información de la Wallet:

```
Address:      0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9
Private Key:  0xe7e2ad18bf9c34363c3c52bc2b29c4905759ad11ad77f64711b96c957d93bebd
Network:      Crestchain
Chain ID:     85523
```

**⚠️ IMPORTANTE:** Esta información está guardada en:
```
veralix-crestchain-1.0/system_wallet.json
```

**🔒 NO COMPARTAS** este archivo ni la private key con nadie.

---

## 🚀 PRÓXIMOS PASOS

### PASO 1: Obtener TCT Tokens (URGENTE)

**Necesitas:** ~1.5 TCT para:
- Desplegar smart contract: ~0.1 TCT
- Testing (10 certificados): ~0.05 TCT
- Buffer: ~1.35 TCT

**Tu Address:**
```
0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9
```

**Opciones para obtener TCT:**

#### A) Faucet (Más Rápido)
```
https://faucet.crestchain.pro
```
- Pega tu address
- Solicita tokens
- Espera confirmación

#### B) Discord/Telegram de Crestchain
1. Buscar servidor oficial de Crestchain
2. Canal #faucet o #testnet
3. Solicitar tokens para desarrollo
4. Mencionar: "Desarrollando sistema de certificación NFT (Veralix)"

#### C) Contacto Directo
Email a: `support@crestchain.pro`

```
Asunto: Solicitud de TCT para desarrollo - Veralix

Hola equipo de Crestchain,

Estoy desarrollando Veralix, un sistema de certificación de joyería 
usando NFTs en Crestchain.

Necesito ~1.5 TCT para:
- Desplegar smart contract ERC-721
- Testing de minteo de certificados NFT
- Validación del sistema end-to-end

Wallet Address: 0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9

Proyecto: https://github.com/[tu-repo] (si tienes)

¡Gracias por su apoyo!
```

---

### PASO 2: Verificar Balance

**Opción A: En el Explorer**
```
https://scan.crestchain.pro/address/0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9
```

**Opción B: Con Script**
```javascript
// check-balance.js
import { JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider('https://rpc.crestchain.pro');
const address = '0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9';

const balance = await provider.getBalance(address);
console.log('Balance:', balance.toString(), 'wei');
console.log('Balance:', (Number(balance) / 1e18).toFixed(4), 'TCT');
```

```bash
node check-balance.js
```

---

### PASO 3: Configurar Supabase (Cuando tengas TCT)

1. Ve a: https://supabase.com/dashboard
2. Proyecto: `hykegpmjnpaupvwptxtl`
3. Settings → Edge Functions → Secrets

**Agregar estas variables:**

```bash
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
SYSTEM_PRIVATE_KEY=0xe7e2ad18bf9c34363c3c52bc2b29c4905759ad11ad77f64711b96c957d93bebd
```

**⚠️ NOTA:** En Supabase SÍ incluye el `0x` en la private key

---

### PASO 4: Desplegar Smart Contract

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-contract

# Instalar dependencias (si no lo has hecho)
npm install

# Crear .env
cp .env.example .env

# Editar .env
notepad .env
```

**Contenido de `.env`:**
```env
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
PRIVATE_KEY=e7e2ad18bf9c34363c3c52bc2b29c4905759ad11ad77f64711b96c957d93bebd
```

**⚠️ NOTA:** En hardhat NO incluyas el `0x` en la private key

**Desplegar:**
```bash
npm run deploy
```

**Copiar el contract address del output:**
```
✅ VeralixCertificate deployed to: 0x...
```

---

### PASO 5: Actualizar Supabase con Contract Address

Agregar en Supabase:
```bash
VERALIX_CONTRACT_ADDRESS=0x... # El address del deployment
```

---

### PASO 6: Actualizar Edge Functions

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Desplegar funciones actualizadas
npx supabase functions deploy mint-nft-crestchain
npx supabase functions deploy generate-nft-certificate
```

---

### PASO 7: Probar Sistema

```bash
# Iniciar Veralix
npm run dev
```

1. Abrir: http://localhost:5173
2. Crear joya de prueba
3. Generar certificado
4. Verificar en Crestchain explorer

---

## 📋 CHECKLIST

### Completado ✅
- [x] Wallet del sistema creada
- [x] Private key guardada
- [x] Address generada

### Pendiente ⏳
- [ ] Obtener ~1.5 TCT tokens
- [ ] Verificar balance en explorer
- [ ] Configurar SYSTEM_PRIVATE_KEY en Supabase
- [ ] Configurar CRESTCHAIN_RPC_URL en Supabase
- [ ] Desplegar smart contract
- [ ] Configurar VERALIX_CONTRACT_ADDRESS en Supabase
- [ ] Actualizar Edge Functions
- [ ] Probar generación de certificado

---

## 🔐 SEGURIDAD

### Archivo Creado:
```
veralix-crestchain-1.0/system_wallet.json
```

### ⚠️ IMPORTANTE:
- Este archivo contiene tu private key
- NO lo subas a Git (ya está en .gitignore)
- Haz backup encriptado
- Guárdalo en lugar seguro

### Backup Recomendado:
```bash
# Copiar a lugar seguro
copy system_wallet.json C:\Users\Sebastian\Documents\Backups\

# O encriptar (si tienes gpg)
gpg -c system_wallet.json
```

---

## ❓ ¿NECESITAS AYUDA?

### Para obtener TCT:
1. Busca "Crestchain faucet" en Google
2. Busca "Crestchain Discord" o "Crestchain Telegram"
3. Revisa documentación oficial de Crestchain

### Mientras tanto:
- Puedo ayudarte a actualizar las Edge Functions
- Puedo preparar el código del smart contract
- Puedo crear scripts de testing

---

## 🎯 ACCIÓN INMEDIATA

**LO MÁS URGENTE:** Obtener TCT tokens

**Mientras esperas TCT, podemos:**
1. ✅ Actualizar código de Edge Functions
2. ✅ Preparar configuración de Supabase
3. ✅ Revisar smart contract
4. ✅ Crear scripts de verificación

**¿Qué quieres hacer mientras consigues los TCT?** 🚀
