/**
 * API Client para Oriluxchain Dashboard
 * Maneja todas las peticiones a la API con error handling robusto
 */

class OriluxAPIClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.apiKey = localStorage.getItem('orilux_api_key') || '';
    }

    /**
     * Realiza una petición fetch con manejo de errores
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            }
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            // Manejar diferentes códigos de estado
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment.');
            }
            
            if (response.status === 401 || response.status === 403) {
                throw new Error('Authentication required. Please set your API key.');
            }
            
            if (response.status === 404) {
                throw new Error(`Endpoint not found: ${endpoint}`);
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            
            // Mostrar notificación de error si existe la función
            if (typeof showNotification === 'function') {
                showNotification(error.message, 'error');
            }
            
            throw error;
        }
    }

    // ==================== BLOCKCHAIN ====================
    
    async getChain() {
        return this.request('/chain');
    }

    async getBlock(index) {
        return this.request(`/block/${index}`);
    }

    async getStats() {
        return this.request('/api/stats');
    }

    async getHealth() {
        return this.request('/api/health');
    }

    // ==================== MINING ====================
    
    async mine() {
        return this.request('/mine', { method: 'POST' });
    }

    async getMiningStatus() {
        return this.request('/api/mining-status');
    }

    async getDifficulty() {
        return this.request('/api/difficulty');
    }

    // ==================== TRANSACTIONS ====================
    
    async getTransactions() {
        return this.request('/transactions');
    }

    async createTransaction(sender, recipient, amount, token = 'ORX') {
        return this.request('/transactions/new', {
            method: 'POST',
            body: JSON.stringify({ sender, recipient, amount, token })
        });
    }

    // ==================== WALLETS ====================
    
    async getWallet() {
        return this.request('/wallet');
    }

    async getBalance(address) {
        return this.request(`/balance/${address}`);
    }

    async getTokenBalance(address, token) {
        return this.request(`/balance/${address}/${token}`);
    }

    async createWallet() {
        return this.request('/wallet/create', { method: 'POST' });
    }

    // ==================== NODES ====================
    
    async getNodes() {
        return this.request('/nodes');
    }

    async registerNode(address) {
        return this.request('/nodes/register', {
            method: 'POST',
            body: JSON.stringify({ nodes: [address] })
        });
    }

    async resolveConflicts() {
        return this.request('/nodes/resolve');
    }

    // ==================== TOKENS ====================
    
    async getTokens() {
        return this.request('/tokens');
    }

    async swapTokens(address, fromToken, toToken, amount) {
        return this.request('/tokens/swap', {
            method: 'POST',
            body: JSON.stringify({ address, from_token: fromToken, to_token: toToken, amount })
        });
    }

    // ==================== STAKING ====================
    
    async stakeTokens(address, amount) {
        return this.request('/staking/stake', {
            method: 'POST',
            body: JSON.stringify({ address, amount })
        });
    }

    async unstakeTokens(address, amount) {
        return this.request('/staking/unstake', {
            method: 'POST',
            body: JSON.stringify({ address, amount })
        });
    }

    async getStakingInfo(address) {
        return this.request(`/staking/${address}`);
    }

    // ==================== SMART CONTRACTS ====================
    
    async getContracts() {
        return this.request('/contracts');
    }

    async getContract(address) {
        return this.request(`/contracts/${address}`);
    }

    async deployContract(owner, code, initialState = {}) {
        return this.request('/contracts/deploy', {
            method: 'POST',
            body: JSON.stringify({ owner, code, initial_state: initialState })
        });
    }

    async deployContractTemplate(owner, templateName, params = {}) {
        return this.request('/contracts/deploy/template', {
            method: 'POST',
            body: JSON.stringify({ owner, template_name: templateName, params })
        });
    }

    async callContract(contractAddress, functionName, params = {}, caller = '') {
        return this.request(`/contracts/${contractAddress}/call`, {
            method: 'POST',
            body: JSON.stringify({ function: functionName, params, caller })
        });
    }

    // ==================== UTILITIES ====================
    
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('orilux_api_key', key);
    }

    clearApiKey() {
        this.apiKey = '';
        localStorage.removeItem('orilux_api_key');
    }

    hasApiKey() {
        return !!this.apiKey;
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Muestra una notificación en el dashboard
 */
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('alertContainer');
    if (!container) {
        console.warn('Alert container not found');
        return;
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        padding: 1rem 1.5rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        background: ${type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                     type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
                     type === 'warning' ? 'rgba(251, 191, 36, 0.1)' : 
                     'rgba(59, 130, 246, 0.1)'};
        border: 1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 
                           type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 
                           type === 'warning' ? 'rgba(251, 191, 36, 0.3)' : 
                           'rgba(59, 130, 246, 0.3)'};
        color: ${type === 'error' ? '#ef4444' : 
                type === 'success' ? '#22c55e' : 
                type === 'warning' ? '#fbbf24' : 
                '#3b82f6'};
        animation: slideIn 0.3s ease-out;
    `;
    
    alert.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: inherit;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0 0.5rem;
            ">×</button>
        </div>
    `;

    container.appendChild(alert);

    // Auto-remove después del duration
    if (duration > 0) {
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }, duration);
    }
}

/**
 * Formatea un número con separadores de miles
 */
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Formatea una fecha/timestamp
 */
function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Trunca un hash/address para mostrar
 */
function truncateHash(hash, startChars = 8, endChars = 8) {
    if (!hash || hash.length <= startChars + endChars) return hash;
    return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

/**
 * Copia texto al clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success', 2000);
    } catch (error) {
        console.error('Failed to copy:', error);
        showNotification('Failed to copy to clipboard', 'error');
    }
}

/**
 * Valida una dirección de wallet
 */
function isValidAddress(address) {
    // Básico: verificar que no esté vacío y tenga longitud razonable
    return address && address.length > 10;
}

/**
 * Valida un monto
 */
function isValidAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
}

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Exportar instancia global
const api = new OriluxAPIClient();

// Hacer disponible globalmente
window.api = api;
window.showNotification = showNotification;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
window.truncateHash = truncateHash;
window.copyToClipboard = copyToClipboard;
window.isValidAddress = isValidAddress;
window.isValidAmount = isValidAmount;

console.log('✅ Orilux API Client loaded');
