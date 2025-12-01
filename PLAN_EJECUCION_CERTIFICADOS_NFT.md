# 🚀 PLAN DE EJECUCIÓN: CERTIFICADOS NFT CON VERALIX

**Fecha:** 25 de Noviembre, 2025 - 7:00 PM  
**Objetivo:** Desplegar sistema completo de certificados NFT usando Pinata + Crestchain + Veralix

---

## 📊 STACK TECNOLÓGICO CONFIRMADO

### ✅ LO QUE FUNCIONA:

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND                                                 │
│ - Vite + React + TypeScript                             │
│ - Cloudflare Pages (deployment)                         │
│ - UI para crear joyas y certificados                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ BACKEND (Supabase)                                       │
│ - PostgreSQL (jewelry_items, certificates, users)       │
│ - Edge Functions (Deno/TypeScript)                      │
│   • generate-nft-certificate                            │
│   • mint-nft-crestchain                                 │
│ - Storage (imágenes de joyas)                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ IPFS (Pinata)                                            │
│ - Almacenamiento de metadata JSON                       │
│ - Almacenamiento de imágenes                            │
│ - Almacenamiento de certificados PDF                    │
│ - Gateway: https://gateway.pinata.cloud/ipfs/           │
└─────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ BLOCKCHAIN                                               │
│ FASE 1: Hardhat Local (Testing inmediato)               │
│ FASE 2: Crestchain (Producción)                         │
│   - RPC: https://rpc.crestchain.pro ✅                  │
│   - Explorer: https://scan.crestchain.pro ✅            │
│   - Token: TCT                                          │
│   - Chain ID: 85523                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 PLAN DE EJECUCIÓN EN 2 FASES

### 📍 FASE 1: TESTING LOCAL (HOY - 2 horas)
**Objetivo:** Sistema funcionando end-to-end en local

### 📍 FASE 2: PRODUCCIÓN CRESTCHAIN (1-3 días)
**Objetivo:** Desplegar en Crestchain real cuando tengamos TCT

---

## 🔥 FASE 1: TESTING LOCAL (IMPLEMENTACIÓN INMEDIATA)

### PASO 1.1: Configurar Hardhat Local (15 min)

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-contract

# Instalar dependencias
npm install

# Iniciar red local (dejar corriendo en terminal)
npx hardhat node
```

**Output esperado:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**Guardar:**
- RPC URL: `http://127.0.0.1:8545`
- Account #0 address y private key

---

### PASO 1.2: Desplegar Smart Contract en Local (5 min)

**Terminal 2:**
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-contract

# Desplegar en red local
npx hardhat run scripts/deploy.js --network localhost
```

**Copiar el contract address:**
```
✅ VeralixCertificate deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

### PASO 1.3: Configurar Variables de Entorno Supabase (10 min)

**Ir a:** https://supabase.com/dashboard  
**Proyecto:** `hykegpmjnpaupvwptxtl`  
**Settings → Edge Functions → Secrets**

**Agregar/Actualizar:**

```bash
# Red local de Hardhat
CRESTCHAIN_RPC_URL=http://127.0.0.1:8545

# Private key de Account #0 de Hardhat
SYSTEM_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Contract address del deployment local
VERALIX_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Pinata (ya debería estar configurado)
PINATA_JWT=tu_jwt_actual_de_pinata

# Supabase (ya están)
SUPABASE_URL=https://hykegpmjnpaupvwptxtl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

---

### PASO 1.4: Actualizar Edge Function mint-nft-crestchain (15 min)

Voy a crear la versión actualizada ahora...

---

### PASO 1.5: Actualizar Edge Function generate-nft-certificate (15 min)

Voy a actualizar para usar datos reales...

---

### PASO 1.6: Desplegar Edge Functions (5 min)

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Desplegar funciones actualizadas
npx supabase functions deploy mint-nft-crestchain
npx supabase functions deploy generate-nft-certificate

# Ver logs en tiempo real
npx supabase functions logs mint-nft-crestchain --follow
```

---

### PASO 1.7: Probar Sistema Completo (30 min)

```bash
# Iniciar Veralix frontend
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
npm run dev
```

**Abrir:** http://localhost:5173

**Flujo de prueba:**

1. **Login/Registro**
   - Crear cuenta o iniciar sesión

2. **Crear Joya**
   - Ir a "Jewelry Items"
   - Click "Add New Item"
   - Completar:
     ```
     Nombre: Anillo de Oro Test
     Tipo: Ring
     Material: Gold 18K
     Peso: 5.5g
     Precio: 1,500,000 COP
     Descripción: Anillo de oro con diamante central
     ```
   - Subir imagen
   - Guardar

3. **Generar Certificado NFT**
   - Click en la joya creada
   - Click "Generate Certificate"
   - Esperar proceso:
     ```
     ⏳ Generando certificado HTML...
     ⏳ Subiendo imagen a IPFS (Pinata)...
     ⏳ Subiendo metadata a IPFS (Pinata)...
     ⏳ Minteando NFT en blockchain...
     ✅ ¡Certificado creado exitosamente!
     ```

4. **Verificar Resultado**
   - Ver transaction hash
   - Ver token ID
   - Ver metadata URI (IPFS)
   - Descargar certificado PDF

5. **Verificar en Hardhat**
   - Ver logs en terminal de Hardhat
   - Confirmar transacción de minteo

6. **Verificar en IPFS**
   - Copiar metadata URI
   - Abrir: `https://gateway.pinata.cloud/ipfs/[HASH]`
   - Ver JSON con datos de la joya

---

## 🚀 FASE 2: PRODUCCIÓN EN CRESTCHAIN

### PASO 2.1: Obtener TCT Tokens (1-3 días)

**Acción inmediata:**

```bash
# Enviar email a Crestchain
Para: info@thecrest.io
Asunto: TCT Tokens Request - Veralix NFT Project

[Usar template de COMO_OBTENER_TCT_TOKENS.md]

Wallet: 0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9
Cantidad: ~1.5 TCT
```

**Mientras esperas:**
- Continuar testing en local
- Optimizar código
- Documentar proceso
- Preparar casos de uso

---

### PASO 2.2: Desplegar en Crestchain Real (10 min)

**Cuando tengas TCT:**

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-contract

# Crear .env para Crestchain
cp .env.example .env
notepad .env
```

**Contenido de `.env`:**
```env
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
PRIVATE_KEY=e7e2ad18bf9c34363c3c52bc2b29c4905759ad11ad77f64711b96c957d93bebd
```

**Desplegar:**
```bash
npm run deploy
```

**Copiar contract address:**
```
✅ VeralixCertificate deployed to: 0x...
```

---

### PASO 2.3: Actualizar Supabase para Producción (5 min)

**Cambiar variables:**

```bash
# RPC de Crestchain REAL
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro

# Private key de tu wallet del sistema
SYSTEM_PRIVATE_KEY=0xe7e2ad18bf9c34363c3c52bc2b29c4905759ad11ad77f64711b96c957d93bebd

# Contract address de Crestchain REAL
VERALIX_CONTRACT_ADDRESS=0x... # Del deployment en Crestchain
```

---

### PASO 2.4: Redesplegar Edge Functions (5 min)

```bash
npx supabase functions deploy mint-nft-crestchain
npx supabase functions deploy generate-nft-certificate
```

---

### PASO 2.5: Probar en Producción (15 min)

1. **Crear certificado de prueba**
2. **Verificar en Crestchain Explorer:**
   ```
   https://scan.crestchain.pro/tx/[TX_HASH]
   ```
3. **Verificar NFT:**
   ```
   https://scan.crestchain.pro/address/[CONTRACT_ADDRESS]
   ```
4. **Verificar metadata en IPFS**

---

## 📋 CHECKLIST COMPLETO

### FASE 1: Local (Hoy)
- [ ] Hardhat node corriendo
- [ ] Smart contract desplegado en local
- [ ] Variables de Supabase configuradas (local)
- [ ] Edge Functions actualizadas
- [ ] Edge Functions desplegadas
- [ ] Frontend corriendo
- [ ] Joya de prueba creada
- [ ] Certificado generado exitosamente
- [ ] Metadata en IPFS verificada
- [ ] Transaction en Hardhat confirmada

### FASE 2: Producción (Cuando tengas TCT)
- [ ] Email enviado a Crestchain
- [ ] TCT tokens recibidos (~1.5 TCT)
- [ ] Balance verificado en explorer
- [ ] Smart contract desplegado en Crestchain
- [ ] Variables de Supabase actualizadas (producción)
- [ ] Edge Functions redesplegadas
- [ ] Certificado de prueba en Crestchain
- [ ] NFT verificado en explorer
- [ ] Sistema en producción funcionando

---

## 🔧 COMANDOS RÁPIDOS

### Iniciar Todo (3 terminales)

**Terminal 1 - Hardhat:**
```bash
cd veralix-contract
npx hardhat node
```

**Terminal 2 - Frontend:**
```bash
cd veralix-crestchain-1.0
npm run dev
```

**Terminal 3 - Logs:**
```bash
cd veralix-crestchain-1.0
npx supabase functions logs mint-nft-crestchain --follow
```

---

## 📊 FLUJO COMPLETO DEL SISTEMA

```
1. Usuario crea joya en Veralix
   ↓
2. Usuario sube imagen de la joya
   ↓
3. Datos guardados en Supabase (jewelry_items)
   ↓
4. Usuario click "Generate Certificate"
   ↓
5. Edge Function: generate-nft-certificate
   - Obtiene datos de la joya de Supabase
   - Genera HTML del certificado
   - Genera QR code
   - Sube imagen a Pinata (IPFS)
   - Sube metadata JSON a Pinata (IPFS)
   ↓
6. Edge Function: mint-nft-crestchain
   - Conecta a blockchain (Hardhat local o Crestchain)
   - Usa wallet del sistema
   - Llama a createCertificate() del smart contract
   - Espera confirmación
   ↓
7. Smart Contract (VeralixCertificate)
   - Mintea NFT ERC-721
   - Asigna token ID
   - Guarda metadata URI (IPFS)
   - Asigna ownership al usuario
   ↓
8. Edge Function actualiza Supabase
   - Guarda transaction hash
   - Guarda token ID
   - Guarda metadata URI
   - Marca certificado como verificado
   ↓
9. Usuario ve certificado
   - Transaction hash
   - Token ID
   - Link a IPFS
   - Link a explorer
   - Puede descargar PDF
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### AHORA MISMO (15 min):

1. **Iniciar Hardhat:**
   ```bash
   cd veralix-contract
   npx hardhat node
   ```

2. **Desplegar contrato:**
   ```bash
   # En otra terminal
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Copiar contract address**

4. **Configurar Supabase** con valores locales

---

## ❓ ¿LISTO PARA EMPEZAR?

**Voy a crear los archivos actualizados de las Edge Functions ahora.**

**Mientras tanto, puedes:**
1. ✅ Iniciar Hardhat node
2. ✅ Desplegar contrato en local
3. ✅ Copiar el contract address

**¿Comenzamos?** 🚀
