/**
 * ORILUXCHAIN SDK
 * SDK de JavaScript para integrar Oriluxchain con Veralix.io
 * 
 * @version 1.0.0
 * @author Orilux Tech
 */

class OriluxchainSDK {
    /**
     * Inicializa el SDK
     * @param {Object} config - Configuración
     * @param {string} config.rpcUrl - URL del nodo RPC
     * @param {string} config.apiKey - API Key (opcional)
     * @param {number} config.timeout - Timeout en ms (default: 30000)
     */
    constructor(config = {}) {
        this.rpcUrl = config.rpcUrl || 'https://blockchain.veralix.io';
        this.apiKey = config.apiKey || null;
        this.timeout = config.timeout || 30000;
        this.ws = null;
        this.eventHandlers = {};
        
        // Headers por defecto
        this.headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.apiKey) {
            this.headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
    }
    
    /**
     * Realiza una petición HTTP
     * @private
     */
    async _request(endpoint, options = {}) {
        const url = `${this.rpcUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers
            },
            signal: AbortSignal.timeout(this.timeout)
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Oriluxchain SDK Error: ${error.message}`);
            throw error;
        }
    }
    
    // ==================== BLOCKCHAIN INFO ====================
    
    /**
     * Obtiene información general de la blockchain
     */
    async getInfo() {
        return this._request('/api/info');
    }
    
    /**
     * Obtiene la cadena completa
     */
    async getChain() {
        return this._request('/chain');
    }
    
    /**
     * Obtiene un bloque específico
     * @param {number} index - Índice del bloque
     */
    async getBlock(index) {
        return this._request(`/api/block/${index}`);
    }
    
    /**
     * Obtiene el último bloque
     */
    async getLatestBlock() {
        const chain = await this.getChain();
        return chain.chain[chain.length - 1];
    }
    
    // ==================== TRANSACCIONES ====================
    
    /**
     * Crea una nueva transacción
     * @param {Object} transaction
     * @param {string} transaction.sender - Dirección del remitente
     * @param {string} transaction.recipient - Dirección del destinatario
     * @param {number} transaction.amount - Cantidad
     * @param {string} transaction.token - Token (ORX o VRX)
     */
    async createTransaction(transaction) {
        return this._request('/transactions/new', {
            method: 'POST',
            body: JSON.stringify(transaction)
        });
    }
    
    /**
     * Obtiene transacciones pendientes
     */
    async getPendingTransactions() {
        return this._request('/transactions/pending');
    }
    
    // ==================== TOKENS ====================
    
    /**
     * Obtiene información de los tokens
     */
    async getTokensInfo() {
        return this._request('/tokens');
    }
    
    /**
     * Obtiene el balance de una dirección
     * @param {string} address - Dirección
     * @param {string} token - Token específico (opcional)
     */
    async getBalance(address, token = null) {
        const endpoint = token 
            ? `/balance/${address}/${token}`
            : `/balance/${address}`;
        return this._request(endpoint);
    }
    
    /**
     * Intercambia tokens (swap)
     * @param {Object} swap
     * @param {string} swap.address - Dirección
     * @param {string} swap.from_token - Token origen
     * @param {string} swap.to_token - Token destino
     * @param {number} swap.amount - Cantidad
     */
    async swapTokens(swap) {
        return this._request('/tokens/swap', {
            method: 'POST',
            body: JSON.stringify(swap)
        });
    }
    
    // ==================== STAKING ====================
    
    /**
     * Stakea tokens
     * @param {Object} stake
     * @param {string} stake.address - Dirección
     * @param {string} stake.token - Token (ORX o VRX)
     * @param {number} stake.amount - Cantidad
     */
    async stake(stake) {
        return this._request('/staking/stake', {
            method: 'POST',
            body: JSON.stringify(stake)
        });
    }
    
    /**
     * Retira tokens stakeados
     * @param {Object} unstake
     * @param {string} unstake.address - Dirección
     * @param {string} unstake.token - Token
     * @param {number} unstake.amount - Cantidad
     */
    async unstake(unstake) {
        return this._request('/staking/unstake', {
            method: 'POST',
            body: JSON.stringify(unstake)
        });
    }
    
    /**
     * Obtiene información de staking de una dirección
     * @param {string} address - Dirección
     */
    async getStakingInfo(address) {
        return this._request(`/staking/${address}`);
    }
    
    // ==================== SMART CONTRACTS ====================
    
    /**
     * Obtiene todos los contratos desplegados
     */
    async getContracts() {
        return this._request('/contracts');
    }
    
    /**
     * Obtiene un contrato específico
     * @param {string} address - Dirección del contrato
     */
    async getContract(address) {
        return this._request(`/contracts/${address}`);
    }
    
    /**
     * Despliega un contrato desde template
     * @param {Object} contract
     * @param {string} contract.owner - Propietario
     * @param {string} contract.template - Template (erc20, multisig, escrow, nft, staking)
     * @param {Object} contract.params - Parámetros del template
     */
    async deployContract(contract) {
        return this._request('/contracts/deploy/template', {
            method: 'POST',
            body: JSON.stringify(contract)
        });
    }
    
    /**
     * Llama a una función de un contrato
     * @param {string} address - Dirección del contrato
     * @param {Object} call
     * @param {string} call.function - Nombre de la función
     * @param {Object} call.params - Parámetros
     * @param {string} call.sender - Dirección del llamador
     * @param {number} call.value - Valor enviado (opcional)
     */
    async callContract(address, call) {
        return this._request(`/contracts/${address}/call`, {
            method: 'POST',
            body: JSON.stringify(call)
        });
    }
    
    // ==================== MINERÍA ====================
    
    /**
     * Mina un nuevo bloque
     * @param {string} minerAddress - Dirección del minero
     */
    async mine(minerAddress) {
        return this._request('/mine', {
            method: 'POST',
            body: JSON.stringify({ miner_address: minerAddress })
        });
    }
    
    // ==================== WALLET ====================
    
    /**
     * Obtiene información del wallet del nodo
     */
    async getWallet() {
        return this._request('/wallet');
    }
    
    // ==================== WEBSOCKET ====================
    
    /**
     * Conecta al WebSocket para eventos en tiempo real
     */
    connectWebSocket() {
        const wsUrl = this.rpcUrl.replace('https://', 'wss://').replace('http://', 'ws://');
        this.ws = new WebSocket(`${wsUrl}/ws`);
        
        this.ws.onopen = () => {
            console.log('Oriluxchain WebSocket conectado');
            this._emit('connected');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this._emit(data.event, data.payload);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this._emit('error', error);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket desconectado');
            this._emit('disconnected');
        };
    }
    
    /**
     * Suscribe a un evento
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Manejador del evento
     */
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }
    
    /**
     * Desuscribe de un evento
     * @param {string} event - Nombre del evento
     * @param {Function} handler - Manejador a remover
     */
    off(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        }
    }
    
    /**
     * Emite un evento
     * @private
     */
    _emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }
    
    /**
     * Cierra la conexión WebSocket
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    
    // ==================== UTILIDADES ====================
    
    /**
     * Verifica si el nodo está online
     */
    async isOnline() {
        try {
            await this.getInfo();
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Obtiene estadísticas de la blockchain
     */
    async getStats() {
        const info = await this.getInfo();
        const chain = await this.getChain();
        const pending = await this.getPendingTransactions();
        const contracts = await this.getContracts();
        
        return {
            blocks: chain.length,
            pendingTransactions: pending.length,
            contracts: contracts.total || 0,
            difficulty: info.difficulty,
            peers: info.peers || 0
        };
    }
}

// Export para diferentes entornos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OriluxchainSDK;
}

// Ejemplo de uso:
/*
const orilux = new OriluxchainSDK({
    rpcUrl: 'https://blockchain.veralix.io',
    apiKey: 'tu_api_key_opcional'
});

// Obtener info
const info = await orilux.getInfo();
console.log('Blockchain info:', info);

// Crear transacción
const tx = await orilux.createTransaction({
    sender: 'wallet1',
    recipient: 'wallet2',
    amount: 100,
    token: 'ORX'
});

// Desplegar contrato
const contract = await orilux.deployContract({
    owner: 'wallet1',
    template: 'erc20',
    params: {
        name: 'Mi Token',
        symbol: 'MTK',
        total_supply: 1000000
    }
});

// WebSocket para eventos en tiempo real
orilux.connectWebSocket();
orilux.on('new_block', (block) => {
    console.log('Nuevo bloque:', block);
});
*/
