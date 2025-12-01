# 🚀 CREAR WALLETS PARA CRESTCHAIN - GUÍA RÁPIDA

**Tiempo:** 5 minutos  
**Objetivo:** Crear wallets compatibles con Crestchain y conectar al ecosistema

---

## 📋 PASO 1: INSTALAR DEPENDENCIAS (2 min)

```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain

# Instalar librería eth-account
pip install eth-account web3
```

**Deberías ver:**
```
Successfully installed eth-account-... web3-...
```

---

## 🔐 PASO 2: CREAR WALLET DEL SISTEMA (1 min)

```bash
# Ejecutar script
python create_crestchain_wallet.py
```

**Interacción:**
```
🚀 GENERADOR DE WALLETS PARA CRESTCHAIN
============================================================

Opciones:
1. Crear 1 wallet (Sistema)
2. Crear 3 wallets (Sistema + Testing)
3. Crear N wallets (Custom)

Selecciona opción (1-3): 1
```

**Output esperado:**
```
🔐 Creando wallet del sistema...

============================================================
🔐 WALLET CREADA PARA CRESTCHAIN
============================================================

📋 Información de la Wallet:
   Address:     0x742d35Cc6634C0532925a3b844Bc454e4438f44e
   Private Key: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
   Public Key:  0x04a1b2c3d4e5f6...
   Created:     2025-11-25T18:30:00
   Network:     Crestchain
   Chain ID:    85523

============================================================
⚠️  SEGURIDAD:
============================================================
   ❌ NUNCA compartas tu private key
   ❌ NO la subas a Git
   ❌ NO la envíes por email/chat
   ✅ Guárdala en un lugar seguro
   ✅ Haz backups encriptados
============================================================

✅ Wallet guardada en system_wallet.json

📝 Próximos pasos:
   1. Guarda system_wallet.json de forma segura
   2. Obtén ~1.5 TCT tokens
   3. Envía TCT a: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
   4. Agrega SYSTEM_PRIVATE_KEY en Supabase:
      SYSTEM_PRIVATE_KEY=0xabcdef...
```

---

## 📝 PASO 3: GUARDAR INFORMACIÓN (1 min)

### 3.1. Copiar Private Key

**Del output, copia:**
```
Private Key: 0xabcdef1234567890...
```

### 3.2. Copiar Address

**Del output, copia:**
```
Address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

### 3.3. Verificar Archivo

```bash
# Ver contenido del archivo
type system_wallet.json
```

**Deberías ver:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "private_key": "0xabcdef...",
  "public_key": "0x04a1b2c3...",
  "created_at": "2025-11-25T18:30:00",
  "network": "Crestchain",
  "chain_id": 85523
}
```

---

## 💰 PASO 4: OBTENER TCT TOKENS (Variable)

### Opción A: Faucet (Más Fácil)

**Si existe faucet de Crestchain:**
1. Ve a: `https://faucet.crestchain.pro` (verificar si existe)
2. Pega tu address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
3. Solicita tokens
4. Espera confirmación

### Opción B: Comunidad

**Discord/Telegram de Crestchain:**
1. Únete al servidor oficial
2. Busca canal #faucet o #testnet
3. Solicita tokens para desarrollo
4. Explica: "Desarrollando sistema de certificación NFT"

### Opción C: Exchange/DEX

**Si TCT está listado:**
1. Compra TCT en exchange
2. Retira a tu address
3. Espera confirmación

### Opción D: Contacto Directo

**Email al equipo:**
```
Para: support@crestchain.pro
Asunto: Solicitud de TCT para desarrollo

Hola equipo de Crestchain,

Estoy desarrollando Veralix, un sistema de certificación 
de joyería usando NFTs en Crestchain.

Necesito ~1.5 TCT para:
- Desplegar smart contract de certificados
- Testing de minteo de NFTs
- Validación del sistema

Mi wallet address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e

Gracias!
```

---

## 🔍 PASO 5: VERIFICAR BALANCE (1 min)

### Opción A: En el Explorer

1. Ve a: https://scan.crestchain.pro
2. Busca tu address: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
3. Verifica balance de TCT

### Opción B: Con Script

```python
# check_balance.py
from web3 import Web3

# Conectar a Crestchain
w3 = Web3(Web3.HTTPProvider('https://rpc.crestchain.pro'))

# Tu address
address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'

# Obtener balance
balance_wei = w3.eth.get_balance(address)
balance_tct = w3.from_wei(balance_wei, 'ether')

print(f"Balance: {balance_tct} TCT")
```

```bash
python check_balance.py
```

---

## ⚙️ PASO 6: CONFIGURAR EN SUPABASE (2 min)

### 6.1. Ir a Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Selecciona proyecto: `hykegpmjnpaupvwptxtl`
3. Settings → Edge Functions → Secrets

### 6.2. Agregar Variables

**Agregar/Actualizar:**

```bash
# RPC URL de Crestchain
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro

# Private key del sistema (CON 0x)
SYSTEM_PRIVATE_KEY=0xabcdef1234567890...

# Contract address (después del deployment)
VERALIX_CONTRACT_ADDRESS=0x... # Agregar después
```

⚠️ **IMPORTANTE:** En Supabase SÍ incluye el `0x` en la private key

### 6.3. Verificar Variables

Deberías ver en Supabase:
- ✅ CRESTCHAIN_RPC_URL
- ✅ SYSTEM_PRIVATE_KEY
- ✅ PINATA_JWT (ya debería estar)
- ✅ SUPABASE_URL (ya está)
- ✅ SUPABASE_SERVICE_ROLE_KEY (ya está)

---

## ✅ CHECKLIST COMPLETO

### Instalación
- [ ] `eth-account` instalado
- [ ] `web3` instalado

### Wallet
- [ ] Wallet del sistema creada
- [ ] `system_wallet.json` guardado
- [ ] Private key copiada
- [ ] Address copiada

### Financiamiento
- [ ] TCT tokens solicitados
- [ ] Balance verificado en explorer
- [ ] ~1.5 TCT disponibles

### Configuración
- [ ] CRESTCHAIN_RPC_URL en Supabase
- [ ] SYSTEM_PRIVATE_KEY en Supabase
- [ ] Variables verificadas

---

## 🎯 PRÓXIMOS PASOS

Una vez que tengas TCT tokens:

### 1. Desplegar Smart Contract
```bash
cd veralix-contract
npm install
npm run deploy
```

### 2. Copiar Contract Address
```
VeralixCertificate deployed to: 0xDEF456...
```

### 3. Agregar en Supabase
```
VERALIX_CONTRACT_ADDRESS=0xDEF456...
```

### 4. Actualizar Edge Functions
```bash
cd ../veralix-crestchain-1.0
npx supabase functions deploy mint-nft-crestchain
```

### 5. Probar Sistema
- Crear joya en Veralix
- Generar certificado
- Verificar en Crestchain explorer

---

## 🔐 SEGURIDAD - MUY IMPORTANTE

### ❌ NUNCA:
- Compartir `system_wallet.json`
- Subir private key a Git
- Enviar private key por chat/email
- Guardar en texto plano sin protección

### ✅ SIEMPRE:
- Guardar `system_wallet.json` en lugar seguro
- Hacer backup encriptado
- Usar variables de entorno
- Rotar keys periódicamente

### Encriptar Wallet (Opcional pero Recomendado)

```bash
# Encriptar archivo
gpg -c system_wallet.json

# Resultado: system_wallet.json.gpg
# Eliminar original
rm system_wallet.json

# Para desencriptar cuando necesites:
gpg -d system_wallet.json.gpg > system_wallet.json
```

---

## 📊 RESUMEN

### Lo que tienes ahora:
- ✅ Script para crear wallets
- ✅ Wallet del sistema (ECDSA)
- ✅ Address compatible con Crestchain
- ✅ Private key para firmar transacciones

### Lo que necesitas:
- ⏳ ~1.5 TCT tokens
- ⏳ Configurar en Supabase
- ⏳ Desplegar smart contract

### Tiempo total estimado:
- Con faucet: ~10 minutos
- Sin faucet: ~1-2 días (esperar tokens)

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo usar la misma wallet para testing y producción?
**No recomendado.** Crea wallets separadas:
- Wallet 1: Desarrollo/Testing
- Wallet 2: Producción

### ¿Qué pasa si pierdo la private key?
**Pierdes acceso permanente.** No hay forma de recuperarla.
Haz backups seguros.

### ¿Cuánto TCT necesito realmente?
- Deployment: ~0.1 TCT
- 100 certificados: ~0.5 TCT
- Buffer: ~0.9 TCT
- **Total: ~1.5 TCT**

### ¿La wallet funciona con MetaMask?
**Sí.** Puedes importarla:
1. MetaMask → Import Account
2. Pega private key
3. Listo

---

**¿Listo para crear tu wallet?** 🚀

```bash
python create_crestchain_wallet.py
```
