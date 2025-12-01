# 🔐 ANÁLISIS DE WALLETS Y CONEXIÓN A CRESTCHAIN

**Fecha:** 25 de Noviembre, 2025 - 6:25 PM  
**Objetivo:** Identificar wallets existentes y conectarlas al ecosistema Crestchain

---

## 📊 SITUACIÓN ACTUAL

### Wallets en Oriluxchain

**Sistema de Wallets:**
- ✅ Oriluxchain usa **RSA 2048-bit** para wallets
- ✅ Genera pares de claves pública/privada
- ✅ Address = Primeros 40 caracteres del hash de la clave pública

**Endpoints disponibles:**
```python
POST /wallet/new          # Crear nueva wallet (RSA)
POST /wallet/create       # Crear wallet y retornar claves
GET  /api/wallets         # Listar todas las wallets
GET  /api/wallet/<address>/balance  # Ver balance
```

### Wallets para Crestchain

**Sistema de Wallets:**
- ✅ Crestchain usa **ECDSA secp256k1** (como Ethereum)
- ✅ Compatible con MetaMask, ethers.js
- ✅ Address = Formato 0x... (20 bytes)

---

## ⚠️ PROBLEMA IDENTIFICADO

### ❌ INCOMPATIBILIDAD DE SISTEMAS

**Oriluxchain:**
- Algoritmo: RSA 2048-bit
- Address: Hex de 40 caracteres (sin 0x)
- Ejemplo: `3082010a0282010100a1b2c3d4...`

**Crestchain:**
- Algoritmo: ECDSA secp256k1
- Address: 0x + 40 caracteres hex
- Ejemplo: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

### 🔴 NO SON COMPATIBLES DIRECTAMENTE

Las wallets de Oriluxchain (RSA) **NO** pueden usarse en Crestchain (ECDSA).

---

## ✅ SOLUCIONES

### OPCIÓN 1: Crear Wallets Nuevas para Crestchain (RECOMENDADO)

**Ventajas:**
- ✅ Compatible con Crestchain
- ✅ Compatible con MetaMask
- ✅ Estándar de la industria
- ✅ Fácil de usar

**Desventajas:**
- ⚠️ Wallets separadas de Oriluxchain
- ⚠️ Usuarios necesitan dos wallets

**Implementación:**
```python
# Crear wallet ECDSA para Crestchain
from eth_account import Account
import secrets

# Generar private key
private_key = "0x" + secrets.token_hex(32)
account = Account.from_key(private_key)

print(f"Address: {account.address}")
print(f"Private Key: {private_key}")
```

---

### OPCIÓN 2: Sistema Dual de Wallets

**Concepto:**
- Usuario tiene wallet RSA en Oriluxchain
- Usuario tiene wallet ECDSA en Crestchain
- Sistema vincula ambas wallets

**Ventajas:**
- ✅ Mejor de ambos mundos
- ✅ Flexibilidad
- ✅ Cada blockchain usa su estándar

**Implementación:**
```python
# En Supabase profiles table
{
  "user_id": "uuid",
  "orilux_wallet": "abc123...",  # RSA address
  "crestchain_wallet": "0xDEF456...",  # ECDSA address
  "wallet_link_date": "2025-11-25"
}
```

---

### OPCIÓN 3: Bridge/Wrapper (Complejo)

**Concepto:**
- Crear un "wrapper" que traduzca entre sistemas
- Usar firma RSA para autorizar transacciones ECDSA

**Ventajas:**
- ✅ Una sola wallet para el usuario

**Desventajas:**
- ❌ Muy complejo
- ❌ Riesgos de seguridad
- ❌ No estándar

**NO RECOMENDADO**

---

## 🚀 PLAN RECOMENDADO: SISTEMA DUAL

### FASE 1: Crear Wallet System para Crestchain

#### 1.1. Script de Generación de Wallets

```python
# create_crestchain_wallet.py
from eth_account import Account
import secrets
import json

def create_crestchain_wallet():
    """Crea una nueva wallet compatible con Crestchain."""
    # Generar private key aleatoria
    private_key = "0x" + secrets.token_hex(32)
    
    # Crear account desde private key
    account = Account.from_key(private_key)
    
    wallet_data = {
        "address": account.address,
        "private_key": private_key,
        "public_key": account._key_obj.public_key.to_hex()
    }
    
    return wallet_data

def save_wallet(wallet_data, filename="crestchain_wallet.json"):
    """Guarda wallet de forma segura."""
    with open(filename, 'w') as f:
        json.dump(wallet_data, f, indent=2)
    print(f"✅ Wallet guardada en {filename}")
    print(f"⚠️  IMPORTANTE: Guarda este archivo de forma segura!")

if __name__ == "__main__":
    print("🔐 Creando wallet para Crestchain...")
    wallet = create_crestchain_wallet()
    
    print(f"\n📋 Información de la Wallet:")
    print(f"   Address: {wallet['address']}")
    print(f"   Private Key: {wallet['private_key']}")
    print(f"\n⚠️  NUNCA compartas tu private key!")
    
    save_wallet(wallet)
```

#### 1.2. Instalar Dependencias

```bash
pip install eth-account web3
```

#### 1.3. Ejecutar Script

```bash
python create_crestchain_wallet.py
```

**Output esperado:**
```
🔐 Creando wallet para Crestchain...

📋 Información de la Wallet:
   Address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
   Private Key: 0xabcdef1234567890...

⚠️  NUNCA compartas tu private key!
✅ Wallet guardada en crestchain_wallet.json
```

---

### FASE 2: Vincular Wallets en Veralix

#### 2.1. Actualizar Schema de Supabase

```sql
-- Agregar columna para wallet de Crestchain
ALTER TABLE profiles 
ADD COLUMN crestchain_wallet TEXT;

-- Agregar índice
CREATE INDEX idx_crestchain_wallet ON profiles(crestchain_wallet);
```

#### 2.2. Actualizar Perfil de Usuario

```typescript
// En Veralix frontend
async function linkCrestchainWallet(userId: string, crestchainAddress: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      crestchain_wallet: crestchainAddress,
      wallet_link_date: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
}
```

---

### FASE 3: Configurar Wallet del Sistema

#### 3.1. Crear Wallet del Sistema

Esta wallet se usará para:
- Desplegar smart contracts
- Pagar gas fees
- Mintear NFTs en nombre de usuarios

```bash
# Ejecutar script
python create_crestchain_wallet.py

# Guardar output como "system_wallet.json"
```

#### 3.2. Financiar Wallet del Sistema

**Necesitas:**
- ~1 TCT para deployment
- ~0.5 TCT para testing
- Total: ~1.5 TCT

**Opciones para obtener TCT:**
1. Faucet de Crestchain (si existe)
2. Exchange/DEX
3. Contactar equipo de Crestchain

#### 3.3. Configurar en Supabase

```bash
# En Supabase Dashboard → Edge Functions → Secrets

SYSTEM_PRIVATE_KEY=0xabcdef1234567890...  # De system_wallet.json
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro
```

---

### FASE 4: Permitir a Usuarios Conectar MetaMask

#### 4.1. Agregar Botón en Veralix

```typescript
// ConnectWalletButton.tsx
import { useWeb3 } from '@/hooks/useWeb3';

export function ConnectWalletButton() {
  const { connect, account } = useWeb3();
  
  const handleConnect = async () => {
    try {
      // Conectar MetaMask
      await connect();
      
      // Agregar Crestchain si no está
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x14e13', // 85523 en hex
          chainName: 'Crestchain',
          nativeCurrency: {
            name: 'TCT',
            symbol: 'TCT',
            decimals: 18
          },
          rpcUrls: ['https://rpc.crestchain.pro'],
          blockExplorerUrls: ['https://scan.crestchain.pro']
        }]
      });
      
      // Guardar address en perfil
      await linkCrestchainWallet(userId, account);
      
    } catch (error) {
      console.error('Error conectando wallet:', error);
    }
  };
  
  return (
    <button onClick={handleConnect}>
      {account ? `Connected: ${account.slice(0, 6)}...` : 'Connect Wallet'}
    </button>
  );
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Preparación
- [ ] Instalar `eth-account` y `web3`
- [ ] Crear script de generación de wallets
- [ ] Generar wallet del sistema
- [ ] Guardar private key de forma segura

### Financiamiento
- [ ] Obtener ~1.5 TCT
- [ ] Enviar a wallet del sistema
- [ ] Verificar balance en explorer

### Configuración
- [ ] Agregar SYSTEM_PRIVATE_KEY en Supabase
- [ ] Agregar CRESTCHAIN_RPC_URL en Supabase
- [ ] Actualizar schema de Supabase (crestchain_wallet column)

### Frontend
- [ ] Agregar botón "Connect Wallet"
- [ ] Implementar conexión con MetaMask
- [ ] Agregar Crestchain a MetaMask automáticamente
- [ ] Guardar address en perfil de usuario

### Testing
- [ ] Conectar MetaMask
- [ ] Verificar que se agrega Crestchain
- [ ] Verificar que se guarda address
- [ ] Probar con usuario de prueba

---

## 🔐 SEGURIDAD

### Private Keys

**⚠️ NUNCA:**
- Compartir private keys
- Subirlas a Git
- Enviarlas por email/chat
- Guardarlas en texto plano sin encriptar

**✅ SIEMPRE:**
- Usar variables de entorno
- Encriptar archivos de wallets
- Usar servicios de secrets management
- Hacer backups encriptados

### Wallet del Sistema

```bash
# Guardar en archivo encriptado
gpg -c system_wallet.json

# Resultado: system_wallet.json.gpg
# Eliminar original: rm system_wallet.json
```

---

## 📊 RESUMEN

### Wallets Necesarias:

1. **Wallet del Sistema (1)**
   - Tipo: ECDSA (Crestchain)
   - Uso: Desplegar contratos, pagar gas
   - Balance: ~1.5 TCT

2. **Wallets de Usuarios (N)**
   - Tipo: ECDSA (Crestchain)
   - Uso: Recibir NFTs, transferir
   - Balance: 0 TCT (no necesitan)

### Flujo de Certificación:

```
1. Usuario crea joya en Veralix
2. Usuario conecta MetaMask (wallet ECDSA)
3. Veralix genera certificado
4. Sistema mintea NFT usando wallet del sistema
5. NFT se transfiere a wallet del usuario
6. Usuario ve NFT en MetaMask
```

---

## 🚀 PRÓXIMOS PASOS

1. **Crear wallet del sistema**
   ```bash
   python create_crestchain_wallet.py
   ```

2. **Obtener TCT tokens**
   - Buscar faucet
   - O contactar equipo de Crestchain

3. **Configurar en Supabase**
   - Agregar SYSTEM_PRIVATE_KEY
   - Agregar CRESTCHAIN_RPC_URL

4. **Desplegar smart contract**
   ```bash
   cd veralix-contract
   npm run deploy
   ```

5. **Actualizar Edge Functions**
   - Usar wallet del sistema para mintear
   - Transferir NFTs a usuarios

---

**¿Quieres que cree el script de generación de wallets ahora?** 🔐
