# ⚡ EJECUTAR AHORA - CERTIFICADOS NFT

**Tiempo total:** 30 minutos  
**Objetivo:** Sistema funcionando end-to-end en local

---

## 🚀 PASO 1: INICIAR HARDHAT (Terminal 1)

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-contract

# Instalar dependencias (solo primera vez)
npm install

# Iniciar red local (DEJAR CORRIENDO)
npx hardhat node
```

**✅ Deberías ver:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**📋 COPIAR ESTOS DATOS:**
- RPC URL: `http://127.0.0.1:8545`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 🔧 PASO 2: DESPLEGAR CONTRATO (Terminal 2)

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-contract

# Desplegar en red local
npx hardhat run scripts/deploy.js --network localhost
```

**✅ Deberías ver:**
```
🚀 Deploying VeralixCertificate to Crestchain...
✅ VeralixCertificate deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**📋 COPIAR:**
- Contract Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

## ⚙️ PASO 3: CONFIGURAR SUPABASE

**Ir a:** https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl/settings/functions

**Settings → Edge Functions → Secrets**

**Agregar/Actualizar estas variables:**

```bash
CRESTCHAIN_RPC_URL=http://127.0.0.1:8545

SYSTEM_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

VERALIX_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**⚠️ IMPORTANTE:** Usa los valores que copiaste en los pasos anteriores.

---

## 📤 PASO 4: DESPLEGAR EDGE FUNCTIONS

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Desplegar función actualizada
npx supabase functions deploy mint-nft-crestchain

# Desplegar función de generación
npx supabase functions deploy generate-nft-certificate
```

**✅ Deberías ver:**
```
Deploying function mint-nft-crestchain...
✓ Deployed function mint-nft-crestchain
```

---

## 🌐 PASO 5: INICIAR FRONTEND (Terminal 3)

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Iniciar desarrollo
npm run dev
```

**✅ Deberías ver:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Abrir:** http://localhost:5173

---

## 🧪 PASO 6: PROBAR SISTEMA

### 6.1. Login/Registro
1. Abrir http://localhost:5173
2. Crear cuenta o iniciar sesión

### 6.2. Crear Joya
1. Ir a "Jewelry Items" o "Inventario"
2. Click "Add New Item" o "Agregar Joya"
3. Completar datos:
   ```
   Nombre: Anillo de Oro Test
   Tipo: Ring
   Material: Gold 18K
   Peso: 5.5
   Precio: 1500000
   Descripción: Anillo de oro con diamante central
   ```
4. Subir imagen
5. Click "Save" o "Guardar"

### 6.3. Generar Certificado NFT
1. Click en la joya creada
2. Click "Generate Certificate" o "Generar Certificado"
3. Esperar proceso (30-60 segundos):
   ```
   ⏳ Generando certificado...
   ⏳ Subiendo a IPFS...
   ⏳ Minteando NFT...
   ✅ ¡Certificado creado!
   ```

### 6.4. Verificar Resultado
- ✅ Ver transaction hash
- ✅ Ver token ID
- ✅ Ver metadata URI (IPFS)
- ✅ Descargar certificado PDF

---

## 🔍 PASO 7: VERIFICAR EN HARDHAT

**En la Terminal 1 (Hardhat) deberías ver:**
```
eth_sendRawTransaction
eth_getTransactionReceipt
Contract call: createCertificate
  From: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  To: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  Gas used: 123456
```

---

## 📊 PASO 8: VERIFICAR EN IPFS

1. Copiar metadata URI del certificado
2. Reemplazar `ipfs://` con `https://gateway.pinata.cloud/ipfs/`
3. Abrir en navegador
4. Deberías ver JSON con datos de la joya

---

## ✅ CHECKLIST

- [ ] Terminal 1: Hardhat corriendo
- [ ] Terminal 2: Contrato desplegado
- [ ] Supabase: Variables configuradas
- [ ] Edge Functions: Desplegadas
- [ ] Terminal 3: Frontend corriendo
- [ ] Joya creada en Veralix
- [ ] Certificado generado exitosamente
- [ ] Transaction confirmada en Hardhat
- [ ] Metadata visible en IPFS

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot connect to RPC"
```bash
# Verificar que Hardhat esté corriendo
# Terminal 1 debe mostrar: "Started HTTP and WebSocket JSON-RPC server"
```

### Error: "Contract not deployed"
```bash
# Verificar contract address en Supabase
# Debe coincidir con el output del deployment
```

### Error: "SYSTEM_PRIVATE_KEY missing"
```bash
# Verificar variables en Supabase
# Settings → Edge Functions → Secrets
```

### Error: "Jewelry item not found"
```bash
# Asegúrate de haber creado la joya primero
# Verifica que la joya tenga imagen subida
```

---

## 📝 LOGS EN TIEMPO REAL

**Para ver logs de Edge Functions:**
```bash
# Terminal 4
cd veralix-crestchain-1.0
npx supabase functions logs mint-nft-crestchain --follow
```

**Deberías ver:**
```
🔗 Conectando a blockchain: http://127.0.0.1:8545
📦 Obteniendo datos de jewelry_items: xxx
💎 Datos del certificado: {...}
📝 Minteando NFT en blockchain...
⏳ Esperando confirmación... TX: 0x...
✅ Transacción confirmada!
```

---

## 🎯 PRÓXIMO PASO (Cuando tengas TCT)

### Cambiar a Crestchain Real:

**En Supabase, actualizar:**
```bash
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
SYSTEM_PRIVATE_KEY=0xe7e2ad18bf9c34363c3c52bc2b29c4905759ad11ad77f64711b96c957d93bebd
VERALIX_CONTRACT_ADDRESS=0x... # Del deployment en Crestchain
```

**Desplegar contrato en Crestchain:**
```bash
cd veralix-contract
npm run deploy
```

**Redesplegar Edge Functions:**
```bash
npx supabase functions deploy mint-nft-crestchain
```

---

## 🚀 ¡LISTO!

**Si todo funciona:**
- ✅ Tienes certificados NFT funcionando
- ✅ Metadata en IPFS (Pinata)
- ✅ Smart contract en blockchain
- ✅ Sistema end-to-end operativo

**Solo falta:**
- ⏳ Obtener TCT tokens
- ⏳ Desplegar en Crestchain real

---

**¿Listo para empezar? Abre 3 terminales y sigue los pasos.** 🚀
