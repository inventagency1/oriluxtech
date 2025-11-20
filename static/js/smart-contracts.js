/**
 * ORILUXCHAIN - Smart Contracts UI
 * Interface para desplegar e interactuar con smart contracts
 */

class SmartContractsUI {
    constructor() {
        this.contracts = [];
        this.selectedContract = null;
        this.templates = {
            'erc20': {
                name: 'ERC-20 Token',
                icon: '🪙',
                description: 'Crea tu propio token fungible',
                params: [
                    { name: 'name', label: 'Nombre del Token', type: 'text', placeholder: 'Mi Token' },
                    { name: 'symbol', label: 'Símbolo', type: 'text', placeholder: 'MTK' },
                    { name: 'total_supply', label: 'Supply Total', type: 'number', placeholder: '1000000' }
                ]
            },
            'multisig': {
                name: 'MultiSig Wallet',
                icon: '🔐',
                description: 'Wallet con múltiples firmas',
                params: [
                    { name: 'owners', label: 'Propietarios (separados por coma)', type: 'text', placeholder: 'addr1,addr2,addr3' },
                    { name: 'required_confirmations', label: 'Confirmaciones Requeridas', type: 'number', placeholder: '2' }
                ]
            },
            'escrow': {
                name: 'Escrow Contract',
                icon: '🤝',
                description: 'Garantía para transacciones seguras',
                params: [
                    { name: 'buyer', label: 'Comprador', type: 'text', placeholder: 'buyer_address' },
                    { name: 'seller', label: 'Vendedor', type: 'text', placeholder: 'seller_address' },
                    { name: 'arbiter', label: 'Árbitro', type: 'text', placeholder: 'arbiter_address' }
                ]
            },
            'nft': {
                name: 'NFT Collection',
                icon: '🎨',
                description: 'Colección de NFTs únicos',
                params: [
                    { name: 'name', label: 'Nombre de la Colección', type: 'text', placeholder: 'Mi Colección NFT' },
                    { name: 'symbol', label: 'Símbolo', type: 'text', placeholder: 'MNFT' }
                ]
            },
            'staking': {
                name: 'Staking Pool',
                icon: '💎',
                description: 'Pool de staking con recompensas',
                params: [
                    { name: 'token', label: 'Token', type: 'select', options: ['ORX', 'VRX'] },
                    { name: 'reward_rate', label: 'Tasa de Recompensa (%)', type: 'number', placeholder: '15' }
                ]
            }
        };
    }
    
    init() {
        this.loadContracts();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.showDeployForm(template);
            });
        });
        
        // Deploy form
        const deployForm = document.getElementById('deployContractForm');
        if (deployForm) {
            deployForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.deployContract();
            });
        }
        
        // Contract interaction
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('call-function-btn')) {
                const contractAddress = e.target.dataset.contract;
                const functionName = e.target.dataset.function;
                this.showFunctionCallModal(contractAddress, functionName);
            }
        });
    }
    
    async loadContracts() {
        try {
            const response = await fetch('/contracts');
            const data = await response.json();
            this.contracts = data.contracts || [];
            this.renderContracts();
        } catch (error) {
            console.error('Error loading contracts:', error);
            showAlert('Error al cargar contratos', 'error');
        }
    }
    
    renderContracts() {
        const container = document.getElementById('contractsList');
        if (!container) return;
        
        if (this.contracts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📜</div>
                    <h3>No hay contratos desplegados</h3>
                    <p>Despliega tu primer smart contract para comenzar</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.contracts.map(contract => `
            <div class="contract-card" data-address="${contract.address}">
                <div class="contract-header">
                    <div>
                        <h3>${this.getContractIcon(contract.abi.type)} ${contract.abi.name}</h3>
                        <div class="contract-address">${this.shortenAddress(contract.address)}</div>
                    </div>
                    <div class="contract-status">
                        <span class="badge badge-success">ACTIVE</span>
                    </div>
                </div>
                
                <div class="contract-stats">
                    <div class="stat">
                        <div class="stat-label">Owner</div>
                        <div class="stat-value">${this.shortenAddress(contract.owner)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Executions</div>
                        <div class="stat-value">${contract.execution_count}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Balance</div>
                        <div class="stat-value">${contract.balance.ORX} ORX</div>
                    </div>
                </div>
                
                <div class="contract-functions">
                    <h4>Functions</h4>
                    ${this.renderFunctions(contract)}
                </div>
                
                <div class="contract-actions">
                    <button class="btn btn-secondary btn-sm" onclick="smartContractsUI.viewContractDetails('${contract.address}')">
                        📋 Details
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="smartContractsUI.interactWithContract('${contract.address}')">
                        ⚡ Interact
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderFunctions(contract) {
        const functions = Object.keys(contract.abi.functions || {});
        if (functions.length === 0) {
            return '<p style="color: var(--text-secondary); font-size: 0.9rem;">No public functions</p>';
        }
        
        return functions.slice(0, 3).map(funcName => `
            <div class="function-item">
                <span class="function-name">${funcName}</span>
                <button class="btn btn-xs call-function-btn" data-contract="${contract.address}" data-function="${funcName}">
                    Call
                </button>
            </div>
        `).join('');
    }
    
    showDeployForm(template) {
        const templateData = this.templates[template];
        const modal = document.getElementById('deployModal');
        const form = document.getElementById('deployContractForm');
        
        document.getElementById('modalTitle').textContent = `Deploy ${templateData.name}`;
        document.getElementById('modalIcon').textContent = templateData.icon;
        document.getElementById('modalDescription').textContent = templateData.description;
        
        // Generate form fields
        const paramsContainer = document.getElementById('contractParams');
        paramsContainer.innerHTML = templateData.params.map(param => {
            if (param.type === 'select') {
                return `
                    <div class="form-group">
                        <label>${param.label}</label>
                        <select name="${param.name}" required class="form-control">
                            ${param.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
            return `
                <div class="form-group">
                    <label>${param.label}</label>
                    <input type="${param.type}" name="${param.name}" placeholder="${param.placeholder}" required class="form-control">
                </div>
            `;
        }).join('');
        
        form.dataset.template = template;
        modal.style.display = 'flex';
    }
    
    async deployContract() {
        const form = document.getElementById('deployContractForm');
        const template = form.dataset.template;
        const formData = new FormData(form);
        
        // Build params object
        const params = {};
        for (let [key, value] of formData.entries()) {
            // Convert to appropriate type
            if (key === 'owners') {
                params[key] = value.split(',').map(s => s.trim());
            } else if (key === 'total_supply' || key === 'required_confirmations' || key === 'reward_rate') {
                params[key] = parseFloat(value);
            } else {
                params[key] = value;
            }
        }
        
        const deployBtn = form.querySelector('button[type="submit"]');
        const originalText = deployBtn.textContent;
        deployBtn.textContent = '⏳ Deploying...';
        deployBtn.disabled = true;
        
        try {
            const response = await fetch('/contracts/deploy/template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner: await this.getWalletAddress(),
                    template: template,
                    params: params
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showAlert(`✅ ${data.message}`, 'success');
                this.closeModal('deployModal');
                this.loadContracts();
                
                // Show success animation
                this.showDeploySuccess(data.contract);
            } else {
                showAlert(`❌ ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Error deploying contract:', error);
            showAlert('Error al desplegar contrato', 'error');
        } finally {
            deployBtn.textContent = originalText;
            deployBtn.disabled = false;
        }
    }
    
    showDeploySuccess(contract) {
        const successDiv = document.createElement('div');
        successDiv.className = 'deploy-success-animation';
        successDiv.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✅</div>
                <h2>Contract Deployed!</h2>
                <p>Address: ${contract.address}</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Continue
                </button>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => successDiv.classList.add('show'), 100);
    }
    
    async showFunctionCallModal(contractAddress, functionName) {
        const contract = this.contracts.find(c => c.address === contractAddress);
        if (!contract) return;
        
        const funcData = contract.abi.functions[functionName];
        const modal = document.getElementById('functionCallModal');
        
        document.getElementById('functionModalTitle').textContent = `Call ${functionName}`;
        document.getElementById('functionModalContract').textContent = this.shortenAddress(contractAddress);
        
        // Generate parameter inputs
        const paramsContainer = document.getElementById('functionParams');
        const params = funcData.params || [];
        
        if (params.length === 0) {
            paramsContainer.innerHTML = '<p style="color: var(--text-secondary);">No parameters required</p>';
        } else {
            paramsContainer.innerHTML = params.map(param => `
                <div class="form-group">
                    <label>${param}</label>
                    <input type="text" name="${param}" class="form-control" placeholder="Enter ${param}">
                </div>
            `).join('');
        }
        
        // Setup call button
        const callBtn = document.getElementById('callFunctionBtn');
        callBtn.onclick = () => this.callContractFunction(contractAddress, functionName);
        
        modal.style.display = 'flex';
    }
    
    async callContractFunction(contractAddress, functionName) {
        const form = document.getElementById('functionCallForm');
        const formData = new FormData(form);
        
        const params = {};
        for (let [key, value] of formData.entries()) {
            params[key] = value;
        }
        
        const callBtn = document.getElementById('callFunctionBtn');
        const originalText = callBtn.textContent;
        callBtn.textContent = '⏳ Calling...';
        callBtn.disabled = true;
        
        try {
            const response = await fetch(`/contracts/${contractAddress}/call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: functionName,
                    params: params,
                    sender: await this.getWalletAddress()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert(`✅ Function executed successfully! Gas used: ${result.gas_used}`, 'success');
                document.getElementById('functionResult').innerHTML = `
                    <div class="result-success">
                        <h4>✅ Success</h4>
                        <p><strong>Return Value:</strong> ${JSON.stringify(result.return_value)}</p>
                        <p><strong>Gas Used:</strong> ${result.gas_used}</p>
                    </div>
                `;
            } else {
                showAlert(`❌ ${result.error}`, 'error');
                document.getElementById('functionResult').innerHTML = `
                    <div class="result-error">
                        <h4>❌ Error</h4>
                        <p>${result.error}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error calling function:', error);
            showAlert('Error al llamar función', 'error');
        } finally {
            callBtn.textContent = originalText;
            callBtn.disabled = false;
        }
    }
    
    async viewContractDetails(address) {
        const contract = this.contracts.find(c => c.address === address);
        if (!contract) return;
        
        const modal = document.getElementById('contractDetailsModal');
        document.getElementById('detailsContent').innerHTML = `
            <div class="contract-details">
                <h3>${this.getContractIcon(contract.abi.type)} ${contract.abi.name}</h3>
                
                <div class="detail-section">
                    <h4>📍 Address</h4>
                    <code>${contract.address}</code>
                </div>
                
                <div class="detail-section">
                    <h4>👤 Owner</h4>
                    <code>${contract.owner}</code>
                </div>
                
                <div class="detail-section">
                    <h4>💰 Balance</h4>
                    <p>${contract.balance.ORX} ORX | ${contract.balance.VRX} VRX</p>
                </div>
                
                <div class="detail-section">
                    <h4>📊 Statistics</h4>
                    <p>Created: ${new Date(contract.created_at * 1000).toLocaleString()}</p>
                    <p>Executions: ${contract.execution_count}</p>
                    ${contract.last_executed ? `<p>Last Executed: ${new Date(contract.last_executed * 1000).toLocaleString()}</p>` : ''}
                </div>
                
                <div class="detail-section">
                    <h4>🔧 Functions</h4>
                    <ul>
                        ${Object.keys(contract.abi.functions || {}).map(func => `
                            <li><code>${func}</code></li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4>💾 Storage</h4>
                    <pre>${JSON.stringify(contract.storage, null, 2)}</pre>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
    
    async interactWithContract(address) {
        this.selectedContract = this.contracts.find(c => c.address === address);
        if (!this.selectedContract) return;
        
        // Switch to interaction tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tab="interact"]').classList.add('active');
        
        this.renderInteractionUI();
    }
    
    renderInteractionUI() {
        const container = document.getElementById('interactionContainer');
        if (!container || !this.selectedContract) return;
        
        const functions = Object.entries(this.selectedContract.abi.functions || {});
        
        container.innerHTML = `
            <div class="interaction-panel">
                <h3>Interact with ${this.selectedContract.abi.name}</h3>
                <p class="contract-address">${this.selectedContract.address}</p>
                
                <div class="functions-list">
                    ${functions.map(([funcName, funcData]) => `
                        <div class="function-card">
                            <h4>${funcName}</h4>
                            <p class="function-description">
                                ${funcData.params ? `Params: ${funcData.params.join(', ')}` : 'No parameters'}
                            </p>
                            <button class="btn btn-primary call-function-btn" 
                                    data-contract="${this.selectedContract.address}" 
                                    data-function="${funcName}">
                                Execute
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    async getWalletAddress() {
        try {
            const response = await fetch('/wallet');
            const data = await response.json();
            return data.address;
        } catch (error) {
            console.error('Error getting wallet address:', error);
            return 'unknown';
        }
    }
    
    getContractIcon(type) {
        const icons = {
            'ERC-20': '🪙',
            'MultiSig': '🔐',
            'Escrow': '🤝',
            'ERC-721': '🎨',
            'Staking': '💎'
        };
        return icons[type] || '📜';
    }
    
    shortenAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
}

// Initialize
let smartContractsUI;
document.addEventListener('DOMContentLoaded', () => {
    smartContractsUI = new SmartContractsUI();
    smartContractsUI.init();
});

// Helper function for alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        z-index: 3000;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        background: ${type === 'success' ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
        border: 1px solid ${type === 'success' ? '#00ff64' : '#ff0000'};
        color: ${type === 'success' ? '#00ff64' : '#ff0000'};
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}
