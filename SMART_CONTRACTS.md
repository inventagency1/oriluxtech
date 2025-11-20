# 📜 ORILUXCHAIN - SMART CONTRACTS

## Sistema Completo de Contratos Inteligentes

Oriluxchain incluye un sistema completo de smart contracts con su propia **Virtual Machine (VM)** y lenguaje de scripting.

---

## 🎯 Características

- ✅ **Virtual Machine propia** - Ejecución segura de contratos
- ✅ **Lenguaje de scripting** - Simple pero poderoso
- ✅ **Gas system** - Control de recursos computacionales
- ✅ **Templates predefinidos** - ERC-20, MultiSig, Escrow, NFT, Staking
- ✅ **Storage persistente** - Estado del contrato guardado en blockchain
- ✅ **ABI (Application Binary Interface)** - Interface estándar
- ✅ **Execution logs** - Trazabilidad completa

---

## 🏗️ Arquitectura

### 1. Smart Contract VM
```python
class SmartContractVM:
    - gas_limit: 1,000,000
    - gas_price: 1 ORX por unidad
    - stack: Pila de ejecución
    - storage: Almacenamiento persistente
    - memory: Memoria temporal
```

### 2. Instrucciones Soportadas

| Instrucción | Descripción | Gas |
|-------------|-------------|-----|
| PUSH | Añade valor a la pila | 10 |
| POP | Remueve valor de la pila | 10 |
| STORE | Guarda en storage | 10 |
| LOAD | Carga desde storage | 10 |
| ADD | Suma dos valores | 10 |
| SUB | Resta dos valores | 10 |
| MUL | Multiplica dos valores | 10 |
| DIV | Divide dos valores | 10 |
| EQ | Igualdad | 10 |
| GT | Mayor que | 10 |
| LT | Menor que | 10 |
| RETURN | Retorna valor | 10 |
| REVERT | Revierte transacción | 10 |

---

## 📦 Templates Predefinidos

### 1. ERC-20 Token

Crea tu propio token compatible con el estándar ERC-20.

```bash
curl -X POST http://localhost:5000/contracts/deploy/template \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "tu_direccion",
    "template": "erc20",
    "params": {
      "name": "Mi Token",
      "symbol": "MTK",
      "total_supply": 1000000
    }
  }'
```

**Funciones:**
- `transfer(to, amount)` - Transferir tokens
- `balanceOf(address)` - Consultar balance
- `approve(spender, amount)` - Aprobar gasto
- `transferFrom(from, to, amount)` - Transferir desde allowance

---

### 2. MultiSig Wallet

Wallet que requiere múltiples firmas para ejecutar transacciones.

```bash
curl -X POST http://localhost:5000/contracts/deploy/template \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "tu_direccion",
    "template": "multisig",
    "params": {
      "owners": ["address1", "address2", "address3"],
      "required_confirmations": 2
    }
  }'
```

**Funciones:**
- `submitTransaction(to, amount, data)` - Proponer transacción
- `confirmTransaction(txId)` - Confirmar transacción
- `executeTransaction(txId)` - Ejecutar transacción
- `revokeConfirmation(txId)` - Revocar confirmación

**Casos de Uso:**
- Tesorería de DAO
- Fondos compartidos
- Seguridad empresarial

---

### 3. Escrow Contract

Contrato de garantía para transacciones seguras entre dos partes.

```bash
curl -X POST http://localhost:5000/contracts/deploy/template \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "tu_direccion",
    "template": "escrow",
    "params": {
      "buyer": "comprador_address",
      "seller": "vendedor_address",
      "arbiter": "arbitro_address"
    }
  }'
```

**Funciones:**
- `deposit()` - Depositar fondos (payable)
- `release()` - Liberar fondos al vendedor
- `refund()` - Devolver fondos al comprador
- `dispute(winner)` - Resolver disputa (solo árbitro)

**Casos de Uso:**
- Marketplace
- Freelancing
- Compra-venta segura

---

### 4. NFT Contract (ERC-721)

Crea y gestiona NFTs únicos.

```bash
curl -X POST http://localhost:5000/contracts/deploy/template \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "tu_direccion",
    "template": "nft",
    "params": {
      "name": "Mi Colección NFT",
      "symbol": "MNFT"
    }
  }'
```

**Funciones:**
- `mint(to, tokenId, metadata)` - Acuñar NFT
- `transfer(to, tokenId)` - Transferir NFT
- `ownerOf(tokenId)` - Consultar propietario
- `approve(to, tokenId)` - Aprobar transferencia
- `setApprovalForAll(operator, approved)` - Aprobar operador

**Casos de Uso:**
- Arte digital
- Coleccionables
- Gaming items
- Certificados

---

### 5. Staking Contract

Contrato de staking con recompensas automáticas.

```bash
curl -X POST http://localhost:5000/contracts/deploy/template \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "tu_direccion",
    "template": "staking",
    "params": {
      "token": "ORX",
      "reward_rate": 15.0
    }
  }'
```

**Funciones:**
- `stake(amount)` - Stakear tokens
- `unstake(amount)` - Retirar tokens
- `claimRewards()` - Reclamar recompensas
- `getStake(address)` - Consultar stake
- `getRewards(address)` - Consultar recompensas

**Casos de Uso:**
- Yield farming
- Liquidity mining
- Governance staking

---

## 🔧 API Endpoints

### Listar Contratos

```bash
GET /contracts

# Respuesta:
{
  "total": 5,
  "contracts": [
    {
      "address": "0x123...",
      "owner": "address1",
      "abi": {...},
      "balance": {"ORX": 100, "VRX": 10},
      "created_at": 1234567890,
      "execution_count": 42
    }
  ]
}
```

### Desplegar Contrato Custom

```bash
POST /contracts/deploy
Content-Type: application/json

{
  "owner": "tu_direccion",
  "bytecode": "PUSH 100\nSTORE balance\nRETURN 1",
  "abi": {
    "name": "Mi Contrato",
    "functions": {
      "getBalance": {
        "params": [],
        "returns": "uint256"
      }
    }
  },
  "constructor_params": {}
}
```

### Desplegar desde Template

```bash
POST /contracts/deploy/template
Content-Type: application/json

{
  "owner": "tu_direccion",
  "template": "erc20",
  "params": {
    "name": "Mi Token",
    "symbol": "MTK",
    "total_supply": 1000000
  }
}
```

### Obtener Contrato

```bash
GET /contracts/{contract_address}

# Respuesta:
{
  "address": "0x123...",
  "owner": "address1",
  "abi": {...},
  "storage": {...},
  "balance": {"ORX": 100, "VRX": 10},
  "created_at": 1234567890,
  "last_executed": 1234567900,
  "execution_count": 42
}
```

### Llamar Función del Contrato

```bash
POST /contracts/{contract_address}/call
Content-Type: application/json

{
  "function": "transfer",
  "params": {
    "to": "recipient_address",
    "amount": 100
  },
  "sender": "tu_direccion",
  "value": 0
}

# Respuesta:
{
  "success": true,
  "return_value": true,
  "gas_used": 150,
  "logs": [],
  "error": null
}
```

---

## 💻 Lenguaje de Scripting

### Ejemplo: Contador Simple

```assembly
# Inicializar contador
PUSH 0
STORE counter

# Incrementar
LOAD counter
PUSH 1
ADD
STORE counter

# Retornar valor
LOAD counter
RETURN
```

### Ejemplo: Token Transfer

```assembly
# Verificar balance
LOAD balance_sender
PUSH $amount
GT
# Si balance < amount, revertir
REVERT

# Transferir
LOAD balance_sender
PUSH $amount
SUB
STORE balance_sender

LOAD balance_recipient
PUSH $amount
ADD
STORE balance_recipient

PUSH 1
RETURN
```

---

## 🔐 Seguridad

### Gas Limit
- Previene loops infinitos
- Límite: 1,000,000 unidades
- Precio: 1 ORX por unidad

### Validaciones
- ✅ Verificación de firma del owner
- ✅ Validación de parámetros
- ✅ Control de acceso por función
- ✅ Revert en caso de error

### Best Practices
1. Siempre verificar balances antes de transferir
2. Usar REVERT para condiciones inválidas
3. Limitar gas en funciones complejas
4. Validar inputs del usuario
5. Implementar pausable en contratos críticos

---

## 📊 Casos de Uso Reales

### 1. DeFi Protocol
```
1. Desplegar ERC-20 para token de governance
2. Desplegar Staking contract para rewards
3. Desplegar MultiSig para tesorería
4. Conectar contratos entre sí
```

### 2. NFT Marketplace
```
1. Desplegar NFT contract para colección
2. Desplegar Escrow para ventas seguras
3. Implementar royalties en transfers
4. Sistema de subastas
```

### 3. DAO (Organización Autónoma Descentralizada)
```
1. Token ERC-20 para voting power
2. MultiSig para ejecución de propuestas
3. Staking para participación
4. Treasury management
```

---

## 🚀 Roadmap de Smart Contracts

### Fase 1 (Actual) ✅
- [x] Virtual Machine básica
- [x] Templates predefinidos
- [x] Gas system
- [x] API completa

### Fase 2 (Próximo)
- [ ] Solidity compiler (compatible con Ethereum)
- [ ] Events y logs avanzados
- [ ] Contract upgradability
- [ ] Oracle integration

### Fase 3 (Futuro)
- [ ] Cross-contract calls
- [ ] Delegatecall
- [ ] Assembly optimizer
- [ ] Formal verification

---

## 🎓 Tutorial: Tu Primer Smart Contract

### Paso 1: Desplegar Token ERC-20

```bash
curl -X POST http://localhost:5000/contracts/deploy/template \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "mi_wallet_address",
    "template": "erc20",
    "params": {
      "name": "MiPrimerToken",
      "symbol": "MPT",
      "total_supply": 1000000
    }
  }'
```

### Paso 2: Obtener Dirección del Contrato

```bash
# Respuesta del paso 1:
{
  "message": "Contrato erc20 desplegado exitosamente",
  "contract": {
    "address": "0xabc123...",
    ...
  }
}
```

### Paso 3: Transferir Tokens

```bash
curl -X POST http://localhost:5000/contracts/0xabc123.../call \
  -H "Content-Type: application/json" \
  -d '{
    "function": "transfer",
    "params": {
      "to": "recipient_address",
      "amount": 100
    },
    "sender": "mi_wallet_address"
  }'
```

### Paso 4: Verificar Balance

```bash
curl -X POST http://localhost:5000/contracts/0xabc123.../call \
  -H "Content-Type: application/json" \
  -d '{
    "function": "balanceOf",
    "params": {
      "address": "recipient_address"
    },
    "sender": "mi_wallet_address"
  }'
```

---

## 📚 Recursos Adicionales

- **Documentación de Tokens**: `TOKENS.md`
- **API Reference**: `README.md`
- **Ejemplos de Contratos**: `/examples/contracts/`
- **Tests**: `/tests/smart_contracts/`

---

## 🤝 Contribuir

¿Quieres añadir un nuevo template de contrato?

1. Crea la función en `ContractTemplates`
2. Añade tests
3. Documenta el ABI
4. Envía PR

---

**¡Construye el futuro con Oriluxchain Smart Contracts!** 🚀

---

## Comparación con Otras Blockchains

| Característica | Oriluxchain | Ethereum | Binance Smart Chain |
|----------------|-------------|----------|---------------------|
| VM Propia | ✅ | ✅ | ❌ (Fork de Ethereum) |
| Gas en Token Nativo | ✅ ORX | ✅ ETH | ✅ BNB |
| Templates Predefinidos | ✅ 5 | ❌ | ❌ |
| Lenguaje | Custom + Solidity* | Solidity | Solidity |
| Velocidad | Alta | Media | Alta |
| Costo de Gas | Bajo | Alto | Medio |

*Solidity support coming in Phase 2

---

**Desarrollado con ❤️ por Orilux Tech & Veralix**
