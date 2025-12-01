# 🟡 ORILUXCHAIN → BNB CHAIN - ESTRATEGIA DE INTEGRACIÓN

**Fecha:** 24 de Noviembre, 2025  
**Objetivo:** Integrar Oriluxchain con BNB Chain (Binance Smart Chain)

---

## 🎯 OPCIONES ESTRATÉGICAS

Tienes **3 caminos principales** para integrar con BNB Chain:

### Opción 1: 🌉 BRIDGE (Puente) - ⭐ RECOMENDADO
**Mantener Oriluxchain independiente + Puente a BNB**

### Opción 2: 🔄 MIGRAR A BNB COMO L1
**Desplegar contratos en BNB Chain directamente**

### Opción 3: 🏗️ ORILUXCHAIN COMO L2 DE BNB
**Convertir Oriluxchain en Layer 2 de BNB Chain**

---

## 🌉 OPCIÓN 1: BRIDGE (PUENTE) - ⭐ RECOMENDADO

### ¿Qué es?
Crear un **puente bidireccional** entre Oriluxchain y BNB Chain para transferir tokens (ORX/VRX) entre ambas redes.

### Arquitectura
```
┌─────────────────────┐         BRIDGE          ┌─────────────────────┐
│   ORILUXCHAIN       │◄──────────────────────►│    BNB CHAIN        │
│   (Layer 1 propia)  │   Lock & Mint          │   (EVM Compatible)  │
│                     │   Burn & Unlock        │                     │
│  - ORX nativo       │                        │  - wORX (wrapped)   │
│  - VRX nativo       │                        │  - wVRX (wrapped)   │
│  - Smart Contracts  │                        │  - BEP-20 tokens    │
└─────────────────────┘                        └─────────────────────┘
```

### Ventajas ✅
- ✅ Mantienes Oriluxchain independiente
- ✅ Acceso al ecosistema BNB (PancakeSwap, Venus, etc.)
- ✅ Liquidez de BNB Chain
- ✅ No pierdes control de tu blockchain
- ✅ Puedes tener tokens en ambas redes

### Desventajas ❌
- ⚠️ Complejidad técnica del bridge
- ⚠️ Riesgo de seguridad en el bridge
- ⚠️ Necesitas mantener dos redes
- ⚠️ Costos de gas en BNB Chain

---

## 📋 IMPLEMENTACIÓN DEL BRIDGE

### Componentes Necesarios

#### 1. Smart Contracts en BNB Chain (Solidity)

**a) Wrapped Token Contracts (BEP-20)**
```solidity
// wORX.sol - Wrapped ORX en BNB Chain
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WrappedORX is ERC20, Ownable {
    address public bridge;
    
    constructor() ERC20("Wrapped Orilux Token", "wORX") {
        bridge = msg.sender;
    }
    
    modifier onlyBridge() {
        require(msg.sender == bridge, "Only bridge can call");
        _;
    }
    
    function mint(address to, uint256 amount) external onlyBridge {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyBridge {
        _burn(from, amount);
    }
    
    function setBridge(address _bridge) external onlyOwner {
        bridge = _bridge;
    }
}

// wVRX.sol - Similar para VRX
contract WrappedVRX is ERC20, Ownable {
    // Mismo código pero para VRX
}
```

**b) Bridge Contract en BNB Chain**
```solidity
// OriluxBridge.sol
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IWrappedToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract OriluxBridge is ReentrancyGuard, AccessControl, Pausable {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    
    IWrappedToken public wORX;
    IWrappedToken public wVRX;
    
    // Tracking de depósitos
    mapping(bytes32 => bool) public processedDeposits;
    
    // Eventos
    event DepositInitiated(
        address indexed user,
        string oriluxAddress,
        uint256 amount,
        string token,
        uint256 timestamp
    );
    
    event WithdrawalCompleted(
        address indexed user,
        uint256 amount,
        string token,
        bytes32 oriluxTxHash
    );
    
    constructor(address _wORX, address _wVRX) {
        wORX = IWrappedToken(_wORX);
        wVRX = IWrappedToken(_wVRX);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
    }
    
    // Usuario deposita en BNB para recibir en Oriluxchain
    function depositToBridge(
        string memory oriluxAddress,
        uint256 amount,
        string memory token
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        
        IWrappedToken wrappedToken;
        if (keccak256(bytes(token)) == keccak256(bytes("ORX"))) {
            wrappedToken = wORX;
        } else if (keccak256(bytes(token)) == keccak256(bytes("VRX"))) {
            wrappedToken = wVRX;
        } else {
            revert("Invalid token");
        }
        
        // Quemar tokens wrapped en BNB
        wrappedToken.burn(msg.sender, amount);
        
        emit DepositInitiated(
            msg.sender,
            oriluxAddress,
            amount,
            token,
            block.timestamp
        );
    }
    
    // Relayer completa retiro desde Oriluxchain
    function completeWithdrawal(
        address user,
        uint256 amount,
        string memory token,
        bytes32 oriluxTxHash
    ) external onlyRole(RELAYER_ROLE) nonReentrant whenNotPaused {
        require(!processedDeposits[oriluxTxHash], "Already processed");
        require(amount > 0, "Amount must be > 0");
        
        processedDeposits[oriluxTxHash] = true;
        
        IWrappedToken wrappedToken;
        if (keccak256(bytes(token)) == keccak256(bytes("ORX"))) {
            wrappedToken = wORX;
        } else if (keccak256(bytes(token)) == keccak256(bytes("VRX"))) {
            wrappedToken = wVRX;
        } else {
            revert("Invalid token");
        }
        
        // Mintear tokens wrapped en BNB
        wrappedToken.mint(user, amount);
        
        emit WithdrawalCompleted(user, amount, token, oriluxTxHash);
    }
    
    // Admin functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function addRelayer(address relayer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(RELAYER_ROLE, relayer);
    }
}
```

#### 2. Bridge Service (Python/Node.js)

**bridge_relayer.py**
```python
"""
Oriluxchain <-> BNB Chain Bridge Relayer
Monitorea ambas redes y ejecuta transferencias
"""

import asyncio
from web3 import Web3
from web3.middleware import geth_poa_middleware
import requests
import json
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BridgeRelayer:
    def __init__(
        self,
        bnb_rpc: str,
        bnb_bridge_address: str,
        bnb_private_key: str,
        orilux_api: str,
        orilux_wallet_address: str
    ):
        # Conexión a BNB Chain
        self.w3 = Web3(Web3.HTTPProvider(bnb_rpc))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        self.bnb_bridge_address = self.w3.to_checksum_address(bnb_bridge_address)
        self.bnb_account = self.w3.eth.account.from_key(bnb_private_key)
        
        # Conexión a Oriluxchain
        self.orilux_api = orilux_api
        self.orilux_wallet = orilux_wallet_address
        
        # Cargar ABIs
        with open('bridge_abi.json', 'r') as f:
            bridge_abi = json.load(f)
        
        self.bridge_contract = self.w3.eth.contract(
            address=self.bnb_bridge_address,
            abi=bridge_abi
        )
        
        # Tracking
        self.processed_bnb_events = set()
        self.processed_orilux_txs = set()
    
    async def monitor_bnb_deposits(self):
        """Monitorea depósitos en BNB Chain"""
        logger.info("Monitoring BNB Chain deposits...")
        
        latest_block = self.w3.eth.block_number
        
        while True:
            try:
                current_block = self.w3.eth.block_number
                
                if current_block > latest_block:
                    # Obtener eventos de depósito
                    events = self.bridge_contract.events.DepositInitiated.get_logs(
                        fromBlock=latest_block + 1,
                        toBlock=current_block
                    )
                    
                    for event in events:
                        await self.process_bnb_deposit(event)
                    
                    latest_block = current_block
                
                await asyncio.sleep(3)  # BNB block time ~3s
                
            except Exception as e:
                logger.error(f"Error monitoring BNB: {e}")
                await asyncio.sleep(10)
    
    async def process_bnb_deposit(self, event):
        """Procesa depósito desde BNB a Oriluxchain"""
        tx_hash = event['transactionHash'].hex()
        
        if tx_hash in self.processed_bnb_events:
            return
        
        user = event['args']['user']
        orilux_address = event['args']['oriluxAddress']
        amount = event['args']['amount']
        token = event['args']['token']
        
        logger.info(f"Processing BNB deposit: {amount} {token} to {orilux_address}")
        
        try:
            # Desbloquear tokens en Oriluxchain
            response = requests.post(
                f"{self.orilux_api}/bridge/unlock",
                json={
                    'recipient': orilux_address,
                    'amount': amount,
                    'token': token,
                    'bnb_tx_hash': tx_hash,
                    'bridge_wallet': self.orilux_wallet
                }
            )
            
            if response.status_code == 200:
                self.processed_bnb_events.add(tx_hash)
                logger.info(f"✅ Unlocked {amount} {token} on Oriluxchain")
            else:
                logger.error(f"Failed to unlock on Oriluxchain: {response.text}")
                
        except Exception as e:
            logger.error(f"Error processing BNB deposit: {e}")
    
    async def monitor_orilux_deposits(self):
        """Monitorea depósitos en Oriluxchain"""
        logger.info("Monitoring Oriluxchain deposits...")
        
        last_block = 0
        
        while True:
            try:
                # Obtener últimos bloques de Oriluxchain
                response = requests.get(f"{self.orilux_api}/chain")
                chain_data = response.json()
                
                current_block = chain_data['length']
                
                if current_block > last_block:
                    # Revisar transacciones de bridge
                    for block_idx in range(last_block + 1, current_block + 1):
                        block = chain_data['chain'][block_idx]
                        
                        for tx in block['transactions']:
                            if tx.get('type') == 'BRIDGE_DEPOSIT':
                                await self.process_orilux_deposit(tx, block['hash'])
                    
                    last_block = current_block
                
                await asyncio.sleep(10)  # Oriluxchain block time ~60s
                
            except Exception as e:
                logger.error(f"Error monitoring Oriluxchain: {e}")
                await asyncio.sleep(10)
    
    async def process_orilux_deposit(self, tx: Dict, block_hash: str):
        """Procesa depósito desde Oriluxchain a BNB"""
        tx_id = f"{block_hash}:{tx['sender']}"
        
        if tx_id in self.processed_orilux_txs:
            return
        
        bnb_address = tx.get('bnb_address')
        amount = tx['amount']
        token = tx['token']
        
        logger.info(f"Processing Orilux deposit: {amount} {token} to {bnb_address}")
        
        try:
            # Mintear tokens wrapped en BNB Chain
            orilux_tx_hash = Web3.to_bytes(hexstr=block_hash)
            
            tx_data = self.bridge_contract.functions.completeWithdrawal(
                Web3.to_checksum_address(bnb_address),
                amount,
                token,
                orilux_tx_hash
            ).build_transaction({
                'from': self.bnb_account.address,
                'nonce': self.w3.eth.get_transaction_count(self.bnb_account.address),
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(
                tx_data,
                self.bnb_account.key
            )
            
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt['status'] == 1:
                self.processed_orilux_txs.add(tx_id)
                logger.info(f"✅ Minted {amount} w{token} on BNB Chain")
            else:
                logger.error(f"Transaction failed on BNB Chain")
                
        except Exception as e:
            logger.error(f"Error processing Orilux deposit: {e}")
    
    async def run(self):
        """Ejecuta el relayer"""
        logger.info("🌉 Bridge Relayer started")
        
        await asyncio.gather(
            self.monitor_bnb_deposits(),
            self.monitor_orilux_deposits()
        )


# Configuración
if __name__ == "__main__":
    relayer = BridgeRelayer(
        bnb_rpc="https://bsc-dataseed.binance.org/",
        bnb_bridge_address="0x...",  # Dirección del bridge en BNB
        bnb_private_key="YOUR_PRIVATE_KEY",
        orilux_api="http://localhost:5000",
        orilux_wallet_address="orilux_wallet_address"
    )
    
    asyncio.run(relayer.run())
```

#### 3. Endpoints en Oriluxchain

**Agregar a `api.py`:**
```python
# Bridge endpoints
@self.app.route('/bridge/lock', methods=['POST'])
def bridge_lock():
    """Bloquea tokens en Oriluxchain para transferir a BNB"""
    values = request.get_json()
    required = ['sender', 'amount', 'token', 'bnb_address']
    
    if not all(k in values for k in required):
        return jsonify({'error': 'Missing fields'}), 400
    
    try:
        # Crear transacción especial de bridge
        tx_index = self.blockchain.add_transaction(
            sender=values['sender'],
            recipient='BRIDGE_LOCK',
            amount=values['amount'],
            token=values['token']
        )
        
        # Añadir metadata de bridge
        if self.blockchain.pending_transactions:
            last_tx = self.blockchain.pending_transactions[-1]
            last_tx['type'] = 'BRIDGE_DEPOSIT'
            last_tx['bnb_address'] = values['bnb_address']
        
        return jsonify({
            'success': True,
            'message': f'Tokens locked, will be minted on BNB Chain',
            'pending_block': tx_index
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@self.app.route('/bridge/unlock', methods=['POST'])
def bridge_unlock():
    """Desbloquea tokens desde BNB a Oriluxchain"""
    values = request.get_json()
    required = ['recipient', 'amount', 'token', 'bnb_tx_hash', 'bridge_wallet']
    
    if not all(k in values for k in required):
        return jsonify({'error': 'Missing fields'}), 400
    
    try:
        # Verificar que sea el bridge autorizado
        # TODO: Agregar verificación de firma
        
        # Crear transacción de unlock
        tx_index = self.blockchain.add_transaction(
            sender='BRIDGE_UNLOCK',
            recipient=values['recipient'],
            amount=values['amount'],
            token=values['token']
        )
        
        return jsonify({
            'success': True,
            'message': 'Tokens unlocked on Oriluxchain',
            'pending_block': tx_index
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@self.app.route('/bridge/status', methods=['GET'])
def bridge_status():
    """Estado del bridge"""
    return jsonify({
        'bnb_chain': 'connected',
        'bridge_address_bnb': '0x...',
        'wORX_address': '0x...',
        'wVRX_address': '0x...',
        'total_locked_orx': 1000000,
        'total_locked_vrx': 100000
    }), 200
```

---

## 📦 DEPLOYMENT DEL BRIDGE

### Paso 1: Desplegar Contratos en BNB Chain

```bash
# Instalar Hardhat
npm install --save-dev hardhat @openzeppelin/contracts

# hardhat.config.js
module.exports = {
  solidity: "0.8.20",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [process.env.PRIVATE_KEY]
    },
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

# Desplegar
npx hardhat run scripts/deploy.js --network bscTestnet
```

**deploy.js:**
```javascript
async function main() {
  // Desplegar wORX
  const WrappedORX = await ethers.getContractFactory("WrappedORX");
  const wORX = await WrappedORX.deploy();
  await wORX.deployed();
  console.log("wORX deployed to:", wORX.address);
  
  // Desplegar wVRX
  const WrappedVRX = await ethers.getContractFactory("WrappedVRX");
  const wVRX = await WrappedVRX.deploy();
  await wVRX.deployed();
  console.log("wVRX deployed to:", wVRX.address);
  
  // Desplegar Bridge
  const OriluxBridge = await ethers.getContractFactory("OriluxBridge");
  const bridge = await OriluxBridge.deploy(wORX.address, wVRX.address);
  await bridge.deployed();
  console.log("Bridge deployed to:", bridge.address);
  
  // Configurar permisos
  await wORX.setBridge(bridge.address);
  await wVRX.setBridge(bridge.address);
  
  console.log("✅ Bridge setup complete!");
}

main();
```

### Paso 2: Ejecutar Relayer

```bash
# Instalar dependencias
pip install web3 requests asyncio

# Configurar .env
echo "BNB_RPC=https://bsc-dataseed.binance.org/" >> .env
echo "BNB_BRIDGE_ADDRESS=0x..." >> .env
echo "BNB_PRIVATE_KEY=..." >> .env

# Ejecutar relayer
python bridge_relayer.py
```

### Paso 3: Frontend para Bridge

```javascript
// bridge-ui.js
import { ethers } from 'ethers';

class BridgeUI {
  async depositToBNB(amount, token) {
    // 1. Lock en Oriluxchain
    const response = await fetch('http://localhost:5000/bridge/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: oriluxAddress,
        amount: amount,
        token: token,
        bnb_address: bnbAddress
      })
    });
    
    // 2. Esperar confirmación
    // 3. Relayer minteará wORX/wVRX en BNB
  }
  
  async depositToOrilux(amount, token) {
    // 1. Aprobar tokens
    await wrappedToken.approve(bridgeAddress, amount);
    
    // 2. Depositar en bridge
    await bridgeContract.depositToBridge(oriluxAddress, amount, token);
    
    // 3. Relayer desbloqueará en Oriluxchain
  }
}
```

---

## 💰 COSTOS ESTIMADOS

### Desarrollo
- Smart Contracts: 40-60h ($4,000 - $6,000)
- Bridge Relayer: 60-80h ($6,000 - $8,000)
- Frontend: 20-30h ($2,000 - $3,000)
- Testing: 40h ($4,000)
- **Total:** $16,000 - $21,000

### Deployment
- Gas para desplegar contratos en BNB: ~$50-100
- Gas mensual para relayer: ~$200-500
- Servidor para relayer: $50-100/mes

### Mantenimiento
- Monitoreo: $500/mes
- Soporte: $1,000/mes

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgos
1. **Hack del bridge** - Mayor riesgo
2. **Relayer offline** - Transacciones atascadas
3. **Bugs en contratos** - Pérdida de fondos
4. **Congestión de red** - Delays

### Mitigaciones
1. ✅ Auditoría de contratos
2. ✅ Multi-sig para admin
3. ✅ Límites de transferencia
4. ✅ Pausa de emergencia
5. ✅ Múltiples relayers
6. ✅ Monitoreo 24/7

---

## 📊 COMPARACIÓN DE OPCIONES

| Aspecto | Bridge | Migrar a BNB | L2 de BNB |
|---------|--------|--------------|-----------|
| Complejidad | Media | Baja | Alta |
| Tiempo | 2-3 meses | 1 mes | 6+ meses |
| Costo | $20K | $10K | $100K+ |
| Independencia | ✅ Alta | ❌ Ninguna | 🟡 Media |
| Seguridad | 🟡 Media | ✅ Alta | ✅ Alta |
| Escalabilidad | 🟡 Media | ✅ Alta | ✅ Muy Alta |

---

## ✅ RECOMENDACIÓN FINAL

**Para Oriluxchain: OPCIÓN 1 (BRIDGE) es la mejor**

**Razones:**
1. ✅ Mantienes tu blockchain independiente
2. ✅ Acceso al ecosistema BNB
3. ✅ Flexibilidad futura
4. ✅ Costo razonable
5. ✅ Tiempo de implementación aceptable

**Roadmap:**
1. **Mes 1:** Desarrollar contratos + relayer
2. **Mes 2:** Testing exhaustivo + auditoría
3. **Mes 3:** Deployment en testnet + beta
4. **Mes 4:** Mainnet launch

---

**Próximo paso:** ¿Quieres que desarrolle los contratos completos del bridge?
