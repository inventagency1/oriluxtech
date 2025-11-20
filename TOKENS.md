# 🪙 ORILUXCHAIN - SISTEMA DUAL-TOKEN

## Tokens Nativos

Oriluxchain implementa un sistema dual-token innovador con dos criptomonedas nativas:

### 1. ORX - Orilux Tech Token 🟡

**Símbolo**: ORX  
**Nombre**: Orilux Tech Token  
**Supply Total**: 1,000,000,000 (1 billón)  
**Decimales**: 18  
**Tipo**: Token de Utilidad

#### Casos de Uso
- ✅ **Transaction Fees**: Pago de comisiones por transacciones
- ✅ **Mining Rewards**: Recompensa principal para mineros (50 ORX/bloque)
- ✅ **Staking**: Participación en validación de red
- ✅ **Governance**: Poder de voto en decisiones del protocolo

#### Distribución Inicial
- 20% → Genesis Address (200M ORX)
- 50% → Mining Pool (500M ORX)
- 30% → Treasury (300M ORX)

---

### 2. VRX - Veralix Token 💜

**Símbolo**: VRX  
**Nombre**: Veralix Token  
**Supply Total**: 100,000,000 (100 millones)  
**Decimales**: 18  
**Tipo**: Token de Gobernanza Premium

#### Casos de Uso
- ✅ **Protocol Governance**: Gobernanza de alto nivel del protocolo
- ✅ **Premium Staking**: Staking con mayores recompensas (15% APY vs 10% APY)
- ✅ **Exclusive Features**: Acceso a funcionalidades premium
- ✅ **Fee Discounts**: Descuentos en transaction fees

#### Distribución Inicial
- 10% → Genesis Address (10M VRX)
- 60% → Staking Pool (60M VRX)
- 30% → Treasury (30M VRX)

---

## 💱 Sistema de Intercambio (Swap)

### Exchange Rate
```
1 VRX = 10 ORX
```

VRX es 10 veces más valioso que ORX debido a:
- Supply más limitado (100M vs 1B)
- Utilidad premium
- Mayor dificultad de obtención

### Cómo Hacer Swap

```bash
# Intercambiar ORX por VRX
curl -X POST http://localhost:5000/tokens/swap \
  -H "Content-Type: application/json" \
  -d '{
    "from_token": "ORX",
    "to_token": "VRX",
    "amount": 100,
    "address": "tu_direccion"
  }'

# Resultado: 100 ORX → 10 VRX
```

```bash
# Intercambiar VRX por ORX
curl -X POST http://localhost:5000/tokens/swap \
  -H "Content-Type: application/json" \
  -d '{
    "from_token": "VRX",
    "to_token": "ORX",
    "amount": 10,
    "address": "tu_direccion"
  }'

# Resultado: 10 VRX → 100 ORX
```

---

## 🔒 Sistema de Staking

### Recompensas de Staking

| Token | APY Base | APY Premium | Multiplicador |
|-------|----------|-------------|---------------|
| ORX   | 10%      | -           | 1.0x          |
| VRX   | 15%      | 22.5%       | 1.5x          |

### Cómo Stakear

```bash
# Stakear ORX
curl -X POST http://localhost:5000/staking/stake \
  -H "Content-Type: application/json" \
  -d '{
    "address": "tu_direccion",
    "amount": 1000,
    "token": "ORX"
  }'
```

```bash
# Stakear VRX (mayor recompensa)
curl -X POST http://localhost:5000/staking/stake \
  -H "Content-Type: application/json" \
  -d '{
    "address": "tu_direccion",
    "amount": 100,
    "token": "VRX"
  }'
```

### Retirar Staking

```bash
curl -X POST http://localhost:5000/staking/unstake \
  -H "Content-Type: application/json" \
  -d '{
    "address": "tu_direccion",
    "amount": 1000,
    "token": "ORX"
  }'
```

### Consultar Staking

```bash
curl http://localhost:5000/staking/tu_direccion
```

Respuesta:
```json
{
  "address": "tu_direccion",
  "stakes": {
    "ORX": {
      "amount": 1000,
      "rewards": 25.5
    },
    "VRX": {
      "amount": 100,
      "rewards": 8.2
    }
  }
}
```

---

## 💰 Recompensas de Minería

Cada bloque minado otorga:
- **50 ORX** (token principal)
- **5 VRX** (token premium)

Valor total por bloque: **50 ORX + 5 VRX = 100 ORX** (equivalente)

---

## 📊 API Endpoints

### Información de Tokens

```bash
# Obtener info de ambos tokens
GET /tokens

# Respuesta:
{
  "tokens": {
    "ORX": {
      "name": "Orilux Tech Token",
      "symbol": "ORX",
      "total_supply": 1000000000,
      "decimals": 18,
      "description": "Token de utilidad principal",
      "use_cases": [...]
    },
    "VRX": {
      "name": "Veralix Token",
      "symbol": "VRX",
      "total_supply": 100000000,
      "decimals": 18,
      "description": "Token de gobernanza premium",
      "use_cases": [...]
    }
  },
  "exchange_rate": 10.0
}
```

### Balances

```bash
# Balance de todos los tokens
GET /balance/{address}

# Balance de un token específico
GET /balance/{address}/ORX
GET /balance/{address}/VRX
```

### Transacciones

```bash
# Crear transacción con ORX (por defecto)
POST /transactions/new
{
  "sender": "address1",
  "recipient": "address2",
  "amount": 100
}

# Crear transacción con VRX
POST /transactions/new
{
  "sender": "address1",
  "recipient": "address2",
  "amount": 10,
  "token": "VRX"
}
```

---

## 🎯 Estrategias de Uso

### Para Usuarios Nuevos
1. Mina bloques para obtener ORX y VRX
2. Usa ORX para transacciones diarias
3. Acumula VRX para staking premium

### Para Inversores
1. Stakea VRX para máximas recompensas (22.5% APY)
2. Usa el swap para balancear tu portfolio
3. Participa en governance con VRX

### Para Mineros
1. Mina continuamente para obtener ambos tokens
2. Stakea las recompensas para ingresos pasivos
3. Vende ORX, mantén VRX para apreciación

---

## 🔐 Seguridad

- ✅ Tokens implementados con ERC-20 estándar
- ✅ Allowances para transferencias seguras
- ✅ Mint/Burn controlado por el protocolo
- ✅ Staking con lock-up period
- ✅ Swap con AMM (Automated Market Maker)

---

## 📈 Tokenomics

### ORX (Orilux Tech)
- **Inflacionario**: Nuevos tokens minados constantemente
- **Uso**: Transacciones y fees
- **Objetivo**: Liquidez y utilidad

### VRX (Veralix)
- **Deflacionario**: Supply limitado
- **Uso**: Governance y staking
- **Objetivo**: Valor y gobernanza

### Ratio de Valor
```
VRX/ORX = 10:1

Ejemplo:
- 1000 ORX = 100 VRX
- 100 VRX = 1000 ORX
```

---

## 🚀 Roadmap

### Fase 1 (Actual)
- ✅ Implementación dual-token
- ✅ Sistema de swap
- ✅ Staking básico

### Fase 2 (Próximo)
- 🔄 Liquidity pools
- 🔄 Yield farming
- 🔄 NFT marketplace con ORX/VRX

### Fase 3 (Futuro)
- 📅 Cross-chain bridges
- 📅 DeFi protocols
- 📅 DAO governance completo

---

## 💡 Casos de Uso Reales

### E-commerce
- Pagos con ORX (fees bajos)
- Cashback en VRX (premium)

### Gaming
- Compras in-game con ORX
- Items exclusivos con VRX

### DeFi
- Lending/Borrowing con ORX
- Governance de protocolos con VRX

### NFTs
- Mint con ORX
- Subastas premium con VRX

---

**Desarrollado por Orilux Tech & Veralix**  
**Blockchain del Futuro 🚀**
