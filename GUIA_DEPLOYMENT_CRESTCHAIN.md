# 🚀 GUÍA PASO A PASO - DEPLOYMENT EN CRESTCHAIN

**Fecha:** 25 de Noviembre, 2025  
**Tiempo estimado:** 2-3 horas

---

## 📋 CHECKLIST PRE-DEPLOYMENT

Antes de empezar, asegúrate de tener:

- [ ] Node.js instalado (v18+)
- [ ] npm instalado
- [ ] Wallet con CREST tokens (~1 CREST)
- [ ] Private key de la wallet
- [ ] Acceso a Supabase Dashboard

---

## 🎯 PASO 1: PREPARAR WALLET (15 min)

### 1.1. Crear Wallet Nueva (Recomendado)

**Opción A: Usando MetaMask**
1. Abre MetaMask
2. Click en tu perfil → "Agregar cuenta"
3. Crea nueva cuenta llamada "Veralix System"
4. Copia la dirección (0x...)

**Opción B: Usando script de Node.js**
```javascript
// create-wallet.js
const ethers = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('⚠️ GUARDA ESTA INFORMACIÓN DE FORMA SEGURA');
```

```bash
node create-wallet.js
```

### 1.2. Agregar Crestchain a MetaMask

1. Abre MetaMask
2. Click en red → "Agregar red"
3. "Agregar red manualmente"
4. Completa:
   - **Nombre de red:** Crestchain
   - **RPC URL:** https://rpc.crestchain.pro
   - **Chain ID:** 85523
   - **Símbolo:** CREST
   - **Explorer:** https://scan.crestchain.pro

### 1.3. Obtener CREST Tokens

**Necesitas:** ~1 CREST para deployment y testing

**Opciones:**

**A) Faucet (si existe):**
```
https://faucet.crestchain.pro
```

**B) Exchange/Bridge:**
- Buscar exchange que tenga CREST
- Comprar y enviar a tu wallet

**C) Contactar al equipo de Crestchain:**
- Discord/Telegram de Crestchain
- Solicitar tokens de testnet

### 1.4. Verificar Balance

```bash
# En MetaMask, verifica que veas tu balance de CREST
# O usa este comando:
```

```javascript
// check-balance.js
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider('https://rpc.crestchain.pro');
const address = 'TU_WALLET_ADDRESS';

provider.getBalance(address).then(balance => {
  console.log('Balance:', ethers.formatEther(balance), 'CREST');
});
```

---

## 🔧 PASO 2: SETUP DEL PROYECTO (10 min)

### 2.1. Instalar Dependencias

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-contract
npm install
```

**Deberías ver:**
```
added 500+ packages
```

### 2.2. Configurar Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar .env
notepad .env
```

**Contenido de `.env`:**
```env
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
PRIVATE_KEY=tu_private_key_sin_0x
```

⚠️ **IMPORTANTE:** 
- NO incluyas el prefijo `0x` en la private key
- NUNCA compartas este archivo
- NUNCA lo subas a Git

### 2.3. Verificar Configuración

```bash
# Compilar contrato
npm run compile
```

**Deberías ver:**
```
Compiled 1 Solidity file successfully
```

---

## 🚀 PASO 3: DEPLOYMENT (15 min)

### 3.1. Desplegar Contrato

```bash
npm run deploy
```

**Output esperado:**
```
🚀 Deploying VeralixCertificate to Crestchain...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Deploying with account: 0xABC123...
💰 Account balance: 1.5 CREST

⏳ Deploying contract...
✅ VeralixCertificate deployed to: 0xDEF456...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ Waiting for 5 confirmations...
✅ Contract confirmed!

🔍 Verifying contract on Crestchain explorer...
✅ Contract verified!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 DEPLOYMENT SUCCESSFUL!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Contract Information:
   Address: 0xDEF456...
   Network: Crestchain (Chain ID: 85523)
   Explorer: https://scan.crestchain.pro/address/0xDEF456...
```

### 3.2. Guardar Contract Address

**⚠️ MUY IMPORTANTE:**

Copia el contract address que aparece en el output:
```
0xDEF456...
```

Lo necesitarás para el siguiente paso.

### 3.3. Verificar en Explorer

1. Abre el link del explorer que aparece en el output
2. Deberías ver:
   - ✅ Contract creado
   - ✅ Balance: 0 CREST
   - ✅ Código verificado (si la verificación funcionó)
   - ✅ Transacciones: 1 (el deployment)

---

## ⚙️ PASO 4: CONFIGURAR SUPABASE (10 min)

### 4.1. Agregar Variables de Entorno

1. Ve a Supabase Dashboard
2. Selecciona tu proyecto: `hykegpmjnpaupvwptxtl`
3. Settings → Edge Functions → Secrets
4. Agregar/Actualizar estas variables:

```bash
# RPC URL de Crestchain
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro

# Contract address (el que obtuviste en el deployment)
VERALIX_CONTRACT_ADDRESS=0xDEF456...

# Private key del sistema (la misma que usaste para deployment)
SYSTEM_PRIVATE_KEY=0xtu_private_key_completa_con_0x
```

⚠️ **NOTA:** En Supabase SÍ incluye el `0x` en la private key

### 4.2. Verificar Variables

En Supabase Dashboard, deberías ver:
- ✅ CRESTCHAIN_RPC_URL
- ✅ VERALIX_CONTRACT_ADDRESS  
- ✅ SYSTEM_PRIVATE_KEY
- ✅ PINATA_JWT (ya debería estar)
- ✅ SUPABASE_URL (ya está)
- ✅ SUPABASE_SERVICE_ROLE_KEY (ya está)

---

## 📝 PASO 5: ACTUALIZAR EDGE FUNCTIONS (20 min)

### 5.1. Actualizar mint-nft-crestchain

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
```

Voy a crear el archivo actualizado ahora...

---

## 🧪 PASO 6: TESTING (30 min)

### 6.1. Desplegar Edge Functions

```bash
# Desplegar función actualizada
npx supabase functions deploy mint-nft-crestchain

# Verificar logs
npx supabase functions logs mint-nft-crestchain --follow
```

### 6.2. Crear Certificado de Prueba

1. Abre Veralix: http://localhost:5173
2. Inicia sesión
3. Ve a "Jewelry Items"
4. Crea una joya de prueba:
   - Nombre: "Test Ring"
   - Tipo: "Ring"
   - Material: "Gold"
   - Peso: 5.5g
   - Precio: 1000000 COP

5. Sube una imagen
6. Guarda

### 6.3. Generar Certificado

1. Click en la joya creada
2. Click en "Generate Certificate"
3. Espera (puede tomar 30-60 segundos)

**Deberías ver:**
- ✅ "Generating certificate..."
- ✅ "Uploading to IPFS..."
- ✅ "Minting NFT..."
- ✅ "Certificate created successfully!"

### 6.4. Verificar en Crestchain

1. Copia el Transaction Hash que aparece
2. Abre: https://scan.crestchain.pro/tx/[TX_HASH]
3. Deberías ver:
   - ✅ Status: Success
   - ✅ From: Tu wallet del sistema
   - ✅ To: Contract address
   - ✅ Method: createCertificate
   - ✅ Token ID: 0 (primer NFT)

### 6.5. Verificar NFT

1. Ve a: https://scan.crestchain.pro/address/[CONTRACT_ADDRESS]
2. Click en "Tokens" tab
3. Deberías ver:
   - ✅ Token ID: 0
   - ✅ Owner: Wallet del usuario
   - ✅ Metadata URI: ipfs://...

### 6.6. Verificar Metadata en IPFS

1. Copia el Metadata URI
2. Reemplaza `ipfs://` con `https://ipfs.io/ipfs/`
3. Abre en navegador
4. Deberías ver JSON con:
   - ✅ name
   - ✅ description
   - ✅ image
   - ✅ attributes

---

## ✅ CHECKLIST FINAL

### Deployment
- [ ] Smart contract desplegado en Crestchain
- [ ] Contract address copiado
- [ ] Verificado en explorer

### Configuración
- [ ] Variables en Supabase configuradas
- [ ] Edge Functions actualizadas
- [ ] Edge Functions desplegadas

### Testing
- [ ] Joya de prueba creada
- [ ] Certificado generado
- [ ] TX confirmada en Crestchain
- [ ] NFT visible en explorer
- [ ] Metadata accesible en IPFS

### Verificación
- [ ] Balance de CREST suficiente
- [ ] Logs sin errores
- [ ] Frontend muestra TX hash
- [ ] Usuario puede ver certificado

---

## 🐛 TROUBLESHOOTING

### Error: "Insufficient CREST balance"

**Solución:**
```bash
# Verificar balance
node check-balance.js

# Obtener más CREST tokens
```

### Error: "Contract not deployed"

**Solución:**
```bash
# Verificar que el deployment fue exitoso
# Revisar el contract address en explorer
# Verificar que la variable VERALIX_CONTRACT_ADDRESS está correcta
```

### Error: "Transaction reverted"

**Causas comunes:**
1. Certificate ID duplicado
2. Owner address inválido
3. Metadata URI vacío

**Solución:**
```bash
# Ver logs detallados
npx supabase functions logs mint-nft-crestchain --follow

# Verificar datos de entrada
```

### Error: "IPFS upload failed"

**Solución:**
```bash
# Verificar PINATA_JWT en Supabase
# Verificar que Pinata tiene espacio disponible
```

---

## 📊 COSTOS ESTIMADOS

### Deployment
- Smart Contract: ~0.05-0.1 CREST

### Por Certificado
- Minteo NFT: ~0.001-0.005 CREST
- IPFS (Pinata): Gratis (hasta 1GB)

### Total Mensual (100 certificados)
- Gas fees: ~0.5 CREST
- IPFS: Gratis
- **Total: ~$5-10 USD** (dependiendo del precio de CREST)

---

## 🎉 ¡ÉXITO!

Si completaste todos los pasos:

✅ Smart contract desplegado en Crestchain  
✅ Edge Functions configuradas  
✅ Sistema funcional end-to-end  
✅ Certificados NFT reales en blockchain pública  

**¡Felicitaciones! El sistema está completamente operativo.** 🚀

---

## 📝 PRÓXIMOS PASOS

1. **Testing exhaustivo**
   - Crear múltiples certificados
   - Probar diferentes tipos de joyas
   - Verificar transferencias de NFTs

2. **Optimización**
   - Ajustar gas limits
   - Implementar batch minting
   - Caché de metadata

3. **Producción**
   - Documentar para usuarios
   - Crear guías de verificación
   - Monitoreo de transacciones

---

**¿Listo para empezar? Sigue los pasos en orden.** 🚀
