# 🎯 PLAN PARA GENERAR CERTIFICADOS EN CRESTCHAIN

**Arquitectura Correcta:** Vite + Supabase Edge Functions + Crestchain  
**No necesitamos Python** ✅

---

## 📊 ARQUITECTURA ACTUAL DE VERALIX

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (Vite + React)                                 │
│ - Desplegado en Cloudflare Pages                        │
│ - UI para crear joyas y certificados                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ SUPABASE EDGE FUNCTIONS (Deno/TypeScript)               │
│ - generate-nft-certificate                              │
│ - mint-nft-crestchain                                   │
│ - Usa ethers.js para blockchain                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ CRESTCHAIN (Blockchain)                                 │
│ - Smart Contract ERC-721                                │
│ - Token nativo: TCT                                     │
│ - RPC: https://rpc.crestchain.pro                       │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ LO QUE YA TIENES

1. ✅ Frontend en Vite (React)
2. ✅ Supabase configurado
3. ✅ Edge Functions con ethers.js
4. ✅ Integración con Pinata (IPFS)
5. ✅ Template de certificados HTML
6. ✅ Sistema de generación de QR

---

## ❌ LO QUE FALTA

1. ❌ Wallet del sistema con TCT tokens
2. ❌ Smart contract desplegado en Crestchain
3. ❌ Edge Functions actualizadas para Crestchain
4. ❌ Variables de entorno configuradas

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### PASO 1: Crear Wallet del Sistema (5 min)

**Opción A: Usando Node.js (Recomendado)**

```javascript
// create-wallet.js
const { Wallet } = require('ethers');

const wallet = Wallet.createRandom();

console.log('============================================');
console.log('🔐 WALLET DEL SISTEMA PARA CRESTCHAIN');
console.log('============================================');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('============================================');
console.log('⚠️  GUARDA ESTA INFORMACIÓN DE FORMA SEGURA');
console.log('============================================');

// Guardar en archivo (opcional)
const fs = require('fs');
fs.writeFileSync('system_wallet.json', JSON.stringify({
  address: wallet.address,
  privateKey: wallet.privateKey,
  network: 'Crestchain',
  chainId: 85523
}, null, 2));

console.log('✅ Guardado en system_wallet.json');
```

**Ejecutar:**
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
node create-wallet.js
```

**Opción B: Usando MetaMask**

1. Abre MetaMask
2. Crear nueva cuenta → "Veralix System"
3. Exportar private key
4. Guardar de forma segura

---

### PASO 2: Obtener TCT Tokens (Variable)

**Necesitas:** ~1.5 TCT

**Opciones:**

1. **Faucet** (si existe)
   - https://faucet.crestchain.pro

2. **Discord/Telegram**
   - Buscar comunidad de Crestchain
   - Solicitar tokens de testnet

3. **Contacto directo**
   - Email: support@crestchain.pro
   - Explicar: Sistema de certificación NFT

---

### PASO 3: Desplegar Smart Contract (10 min)

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-contract

# Instalar dependencias
npm install

# Crear .env
cp .env.example .env

# Editar .env con tu private key
notepad .env
```

**Contenido de `.env`:**
```env
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
PRIVATE_KEY=tu_private_key_sin_0x
```

**Desplegar:**
```bash
npm run deploy
```

**Copiar el contract address del output:**
```
✅ VeralixCertificate deployed to: 0xDEF456...
```

---

### PASO 4: Configurar Supabase (5 min)

1. Ve a: https://supabase.com/dashboard
2. Proyecto: `hykegpmjnpaupvwptxtl`
3. Settings → Edge Functions → Secrets

**Agregar/Actualizar:**

```bash
# RPC de Crestchain
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro

# Private key del sistema (CON 0x)
SYSTEM_PRIVATE_KEY=0xabcdef1234567890...

# Contract address (del deployment)
VERALIX_CONTRACT_ADDRESS=0xDEF456...

# Pinata (ya debería estar)
PINATA_JWT=tu_jwt_de_pinata
```

---

### PASO 5: Actualizar Edge Function (10 min)

**Archivo:** `supabase/functions/mint-nft-crestchain/index.ts`

**Cambios necesarios:**

1. ✅ Cambiar RPC_URL a Crestchain
2. ✅ Usar datos reales de jewelry_items
3. ✅ Actualizar blockchain_network a "CRESTCHAIN"
4. ✅ Usar metadataURI real de IPFS

---

### PASO 6: Probar Sistema (15 min)

1. **Iniciar Veralix localmente:**
   ```bash
   cd veralix-crestchain-1.0
   npm run dev
   ```

2. **Crear joya de prueba:**
   - Nombre: "Test Ring"
   - Tipo: "Ring"
   - Material: "Gold"
   - Peso: 5.5g
   - Precio: 1000000 COP

3. **Generar certificado:**
   - Click en "Generate Certificate"
   - Esperar proceso completo

4. **Verificar en Crestchain:**
   - https://scan.crestchain.pro/tx/[TX_HASH]
   - Verificar NFT creado

---

## 📝 ARCHIVOS A CREAR/MODIFICAR

### 1. Script de Wallet (Node.js)

```javascript
// veralix-crestchain-1.0/scripts/create-wallet.js
const { Wallet } = require('ethers');
const fs = require('fs');

const wallet = Wallet.createRandom();

const walletData = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  network: 'Crestchain',
  chainId: 85523,
  createdAt: new Date().toISOString()
};

console.log('🔐 Wallet creada:');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);

fs.writeFileSync('system_wallet.json', JSON.stringify(walletData, null, 2));
console.log('✅ Guardado en system_wallet.json');
```

### 2. Actualizar mint-nft-crestchain

```typescript
// Cambiar línea 10
const RPC_URL = Deno.env.get("CRESTCHAIN_RPC_URL") || "https://rpc.crestchain.pro";

// Cambiar línea 92
blockchain_network: "CRESTCHAIN",

// Usar datos reales (líneas 59-66)
// Obtener de jewelry_items table
```

### 3. Actualizar generate-nft-certificate

```typescript
// Asegurar que llama a mint-nft-crestchain
// con datos reales de la joya
```

---

## 🔧 COMANDOS RÁPIDOS

### Crear Wallet
```bash
cd veralix-crestchain-1.0
node -e "const {Wallet}=require('ethers');const w=Wallet.createRandom();console.log('Address:',w.address);console.log('Private:',w.privateKey)"
```

### Verificar Balance
```bash
node -e "const {JsonRpcProvider}=require('ethers');const p=new JsonRpcProvider('https://rpc.crestchain.pro');p.getBalance('TU_ADDRESS').then(b=>console.log('Balance:',b.toString(),'wei'))"
```

### Desplegar Contract
```bash
cd ../veralix-contract
npm run deploy
```

### Desplegar Edge Functions
```bash
cd ../veralix-crestchain-1.0
npx supabase functions deploy mint-nft-crestchain
npx supabase functions deploy generate-nft-certificate
```

---

## ✅ CHECKLIST COMPLETO

### Preparación
- [ ] Crear wallet del sistema (Node.js)
- [ ] Guardar private key de forma segura
- [ ] Obtener ~1.5 TCT tokens
- [ ] Verificar balance en explorer

### Smart Contract
- [ ] Instalar dependencias de hardhat
- [ ] Configurar .env con private key
- [ ] Desplegar contrato en Crestchain
- [ ] Copiar contract address

### Supabase
- [ ] Agregar CRESTCHAIN_RPC_URL
- [ ] Agregar SYSTEM_PRIVATE_KEY
- [ ] Agregar VERALIX_CONTRACT_ADDRESS
- [ ] Verificar PINATA_JWT

### Edge Functions
- [ ] Actualizar mint-nft-crestchain
- [ ] Actualizar generate-nft-certificate
- [ ] Desplegar funciones
- [ ] Verificar logs

### Testing
- [ ] Iniciar Veralix localmente
- [ ] Crear joya de prueba
- [ ] Generar certificado
- [ ] Verificar TX en Crestchain
- [ ] Verificar NFT en explorer
- [ ] Verificar metadata en IPFS

---

## 🎯 PRÓXIMO PASO INMEDIATO

**Crear wallet del sistema usando Node.js:**

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Crear script
echo "const {Wallet}=require('ethers');const w=Wallet.createRandom();console.log('Address:',w.address);console.log('Private:',w.privateKey)" > create-wallet.js

# Ejecutar
node create-wallet.js
```

**¿Quieres que cree este script ahora y continuemos?** 🚀
