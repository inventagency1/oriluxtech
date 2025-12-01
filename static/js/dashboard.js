// Detectar URL base automáticamente
const API_URL = window.location.origin;

// Estado global
let state = {
    chain: [],
    nodeInfo: {},
    pendingTransactions: [],
    wallets: [],
    nodes: [],
    autoRefresh: true,
    currentSection: 'overview',
    miningInProgress: false,
    charts: {}
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    setupNavigation();
    startAutoRefresh();
});

// Inicializar aplicación
async function initializeApp() {
    await Promise.all([
        loadNodeInfo(),
        loadBlockchain(),
        loadWalletInfo(),
        loadNodes()
    ]);
    
    initializeCharts();
    loadRecentActivity();
}

// Configurar navegación
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Cambiar sección
function switchSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionName;
        
        // Cargar datos específicos de la sección
        loadSectionData(sectionName);
    }
}

// Cargar datos de sección
async function loadSectionData(section) {
    switch(section) {
        case 'blockchain':
            await loadBlockchain();
            renderBlockchainVisualization();
            break;
        case 'transactions':
            await loadBlockchain();
            renderTransactions();
            break;
        case 'wallets':
            renderWallets();
            break;
        case 'network':
            await loadNodes();
            renderNodes();
            break;
        case 'mining':
            updateMiningStats();
            break;
    }
}

// Event listeners
function setupEventListeners() {
    // Transaction form
    const txForm = document.getElementById('newTransactionForm');
    if (txForm) {
        txForm.addEventListener('submit', handleTransactionSubmit);
    }
    
    // Tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            filterTransactions(tab);
        });
    });
}

// Auto-refresh
function startAutoRefresh() {
    setInterval(async () => {
        if (state.autoRefresh) {
            await loadNodeInfo();
            await loadBlockchain();
            
            if (state.currentSection === 'overview') {
                updateCharts();
                loadRecentActivity();
            }
        }
    }, 10000);
}

// Cargar información del nodo
async function loadNodeInfo() {
    try {
        const response = await fetch(`${API_URL}/?api=true`);
        const data = await response.json();
        state.nodeInfo = data;
        
        // Update top bar
        document.getElementById('topBarBalance').textContent = data.chain_length * 50;
        
        // Update metrics
        document.getElementById('totalBlocks').textContent = data.chain_length;
        document.getElementById('difficultyMetric').textContent = data.difficulty;
        document.getElementById('currentDifficulty').textContent = data.difficulty;
        document.getElementById('nodeWalletAddress').textContent = data.wallet_address;
        
    } catch (error) {
        console.error('Error loading node info:', error);
    }
}

// Cargar blockchain
async function loadBlockchain() {
    try {
        const response = await fetch(`${API_URL}/chain`);
        const data = await response.json();
        state.chain = data.chain;
        state.pendingTransactions = data.pending_transactions;
        
        // Update metrics
        document.getElementById('pendingCount').textContent = data.pending_transactions.length;
        document.getElementById('miningPending').textContent = data.pending_transactions.length;
        
        const totalTx = data.chain.reduce((sum, block) => sum + block.transactions.length, 0);
        document.getElementById('totalTransactions').textContent = totalTx;
        
    } catch (error) {
        console.error('Error loading blockchain:', error);
    }
}

// Cargar wallet info
async function loadWalletInfo() {
    try {
        const response = await fetch(`${API_URL}/wallet`);
        const data = await response.json();
        
        document.getElementById('totalBalance').textContent = data.balance;
        
        // Add to wallets list
        state.wallets = [{
            address: data.address,
            balance: data.balance,
            isNode: true
        }];
        
    } catch (error) {
        console.error('Error loading wallet info:', error);
    }
}

// Cargar nodos
async function loadNodes() {
    try {
        const response = await fetch(`${API_URL}/nodes`);
        const data = await response.json();
        state.nodes = data.nodes || [];
        
        document.getElementById('connectedNodes').textContent = data.total || 0;
        
    } catch (error) {
        console.error('Error loading nodes:', error);
    }
}

// Inicializar gráficos
function initializeCharts() {
    // Blocks chart
    const blocksCtx = document.getElementById('blocksChart');
    if (blocksCtx) {
        state.charts.blocks = new Chart(blocksCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Bloques Minados',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Transactions chart
    const txCtx = document.getElementById('transactionsChart');
    if (txCtx) {
        state.charts.transactions = new Chart(txCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Transacciones',
                    data: [],
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    updateCharts();
}

// Actualizar gráficos
function updateCharts() {
    if (!state.chain.length) return;
    
    // Update blocks chart
    if (state.charts.blocks) {
        const labels = state.chain.map((_, i) => `Bloque ${i}`);
        const data = state.chain.map((_, i) => i + 1);
        
        state.charts.blocks.data.labels = labels.slice(-10);
        state.charts.blocks.data.datasets[0].data = data.slice(-10);
        state.charts.blocks.update();
    }
    
    // Update transactions chart
    if (state.charts.transactions) {
        const labels = state.chain.map((_, i) => `#${i}`);
        const data = state.chain.map(block => block.transactions.length);
        
        state.charts.transactions.data.labels = labels.slice(-10);
        state.charts.transactions.data.datasets[0].data = data.slice(-10);
        state.charts.transactions.update();
    }
}

// Cargar actividad reciente
function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    container.innerHTML = '';
    
    const activities = [];
    
    // Add recent blocks
    state.chain.slice(-5).reverse().forEach(block => {
        activities.push({
            icon: '🔗',
            title: `Bloque #${block.index} minado`,
            time: new Date(block.timestamp * 1000).toLocaleString(),
            type: 'block'
        });
    });
    
    // Add pending transactions
    state.pendingTransactions.slice(-3).forEach(tx => {
        activities.push({
            icon: '💸',
            title: `Nueva transacción: ${tx.amount} VRX`,
            time: new Date(tx.timestamp * 1000).toLocaleString(),
            type: 'transaction'
        });
    });
    
    activities.slice(0, 8).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Renderizar blockchain
function renderBlockchainVisualization() {
    const container = document.getElementById('blockchainVisualization');
    if (!container) return;
    
    container.innerHTML = '';
    
    [...state.chain].reverse().forEach(block => {
        const blockEl = document.createElement('div');
        blockEl.className = 'block-item';
        
        const timestamp = new Date(block.timestamp * 1000).toLocaleString();
        
        blockEl.innerHTML = `
            <div class="block-header">
                <div class="block-index">Bloque #${block.index}</div>
                <div>${timestamp}</div>
            </div>
            <div class="block-hash">
                <strong>Hash:</strong> ${block.hash}
            </div>
            <div class="block-info">
                <div class="block-info-item">
                    <strong>Previous Hash</strong><br>
                    ${block.previous_hash.substring(0, 20)}...
                </div>
                <div class="block-info-item">
                    <strong>Proof</strong><br>
                    ${block.proof}
                </div>
                <div class="block-info-item">
                    <strong>Transacciones</strong><br>
                    ${block.transactions.length}
                </div>
            </div>
        `;
        
        container.appendChild(blockEl);
    });
}

// Renderizar transacciones
function renderTransactions(filter = 'all') {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    let transactions = [];
    
    if (filter === 'pending') {
        transactions = state.pendingTransactions;
    } else if (filter === 'confirmed') {
        state.chain.forEach(block => {
            transactions.push(...block.transactions.map(tx => ({...tx, confirmed: true, block: block.index})));
        });
    } else {
        // All transactions
        state.chain.forEach(block => {
            transactions.push(...block.transactions.map(tx => ({...tx, confirmed: true, block: block.index})));
        });
        transactions.push(...state.pendingTransactions.map(tx => ({...tx, confirmed: false})));
    }
    
    if (transactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No hay transacciones</p>';
        return;
    }
    
    transactions.reverse().forEach(tx => {
        const txEl = document.createElement('div');
        txEl.className = 'transaction-item';
        
        const status = tx.confirmed ? 
            `<span class="badge badge-success">Confirmada - Bloque #${tx.block}</span>` :
            `<span class="badge badge-warning">Pendiente</span>`;
        
        txEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">
                    ${tx.amount} VRX
                </div>
                ${status}
            </div>
            <div style="font-size: 0.875rem; color: #6b7280; font-family: 'Courier New', monospace;">
                <div><strong>De:</strong> ${tx.sender.substring(0, 30)}...</div>
                <div><strong>Para:</strong> ${tx.recipient.substring(0, 30)}...</div>
            </div>
        `;
        
        container.appendChild(txEl);
    });
}

// Filtrar transacciones
function filterTransactions(tab) {
    renderTransactions(tab);
}

// Renderizar wallets
function renderWallets() {
    const container = document.getElementById('walletsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    state.wallets.forEach(wallet => {
        const walletEl = document.createElement('div');
        walletEl.className = 'wallet-card';
        
        const badge = wallet.isNode ? '<span class="badge badge-success">Nodo</span>' : '';
        
        walletEl.innerHTML = `
            <div class="wallet-header">
                <div class="wallet-icon">💼</div>
                ${badge}
            </div>
            <div class="wallet-address">${wallet.address}</div>
            <div class="wallet-balance">${wallet.balance} VRX</div>
        `;
        
        container.appendChild(walletEl);
    });
}

// Renderizar nodos
function renderNodes() {
    const container = document.getElementById('nodesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (state.nodes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No hay nodos conectados</p>';
        return;
    }
    
    state.nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node-item';
        
        nodeEl.innerHTML = `
            <div>
                <div style="font-weight: 600;">${node}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Conectado</div>
            </div>
            <span class="badge badge-success">Activo</span>
        `;
        
        container.appendChild(nodeEl);
    });
}

// Manejar envío de transacción
async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const sender = document.getElementById('txSender').value;
    const recipient = document.getElementById('txRecipient').value;
    const amount = parseFloat(document.getElementById('txAmount').value);
    
    try {
        const response = await fetch(`${API_URL}/transactions/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender, recipient, amount })
        });
        
        if (response.ok) {
            showAlert('Transacción creada exitosamente', 'success');
            closeModal();
            await loadBlockchain();
            loadRecentActivity();
        } else {
            showAlert('Error al crear transacción', 'error');
        }
    } catch (error) {
        showAlert('Error al crear transacción', 'error');
    }
}

// Minería
async function startMining() {
    if (state.miningInProgress) return;
    
    const btn = document.getElementById('mineButton');
    const statusIcon = document.querySelector('.status-icon');
    const statusText = document.querySelector('.status-text');
    
    state.miningInProgress = true;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Minando...';
    statusIcon.textContent = '⛏️';
    statusText.textContent = 'Minando...';
    
    try {
        const startTime = Date.now();
        const response = await fetch(`${API_URL}/mine`, { method: 'POST' });
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        if (response.ok) {
            showAlert(`¡Bloque minado en ${duration}s!`, 'success');
            document.getElementById('lastMiningTime').textContent = `${duration}s`;
            
            await Promise.all([
                loadBlockchain(),
                loadWalletInfo(),
                loadNodeInfo()
            ]);
            
            updateMiningStats();
            loadRecentActivity();
            updateCharts();
        }
    } catch (error) {
        showAlert('Error al minar bloque', 'error');
    } finally {
        state.miningInProgress = false;
        btn.disabled = false;
        btn.innerHTML = '⛏️ Iniciar Minería';
        statusIcon.textContent = '⏸️';
        statusText.textContent = 'Inactivo';
    }
}

// Actualizar estadísticas de minería
function updateMiningStats() {
    const minedBlocks = state.chain.length - 1; // Exclude genesis
    const totalRewards = minedBlocks * 50;
    
    document.getElementById('minedBlocks').textContent = minedBlocks;
    document.getElementById('totalRewards').textContent = totalRewards;
}

// Crear nueva wallet
async function createNewWallet() {
    try {
        const response = await fetch(`${API_URL}/wallet/new`, { method: 'POST' });
        const data = await response.json();
        
        showAlert('Nueva wallet creada exitosamente', 'success');
        
        // Add to wallets list
        state.wallets.push({
            address: data.address,
            balance: 0,
            isNode: false
        });
        
        renderWallets();
        
        // Download wallet file
        downloadWallet(data);
    } catch (error) {
        showAlert('Error al crear wallet', 'error');
    }
}

// Descargar wallet
function downloadWallet(walletData) {
    const dataStr = JSON.stringify(walletData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oriluxchain-wallet-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Importar wallet
function importWallet() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const wallet = JSON.parse(event.target.result);
                state.wallets.push({
                    address: wallet.address,
                    balance: 0,
                    isNode: false
                });
                renderWallets();
                showAlert('Wallet importada exitosamente', 'success');
            } catch (error) {
                showAlert('Error al importar wallet', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Exportar blockchain
function exportBlockchain() {
    const dataStr = JSON.stringify(state.chain, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oriluxchain-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Blockchain exportada exitosamente', 'success');
}

// Buscar en blockchain
function searchBlockchain() {
    const query = document.getElementById('explorerSearch').value.trim();
    const resultsContainer = document.getElementById('explorerResults');
    
    if (!query) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p>Ingresa un hash de bloque, dirección o ID de transacción para buscar</p>
            </div>
        `;
        return;
    }
    
    // Search in blocks
    const block = state.chain.find(b => b.hash.includes(query) || b.index.toString() === query);
    
    if (block) {
        resultsContainer.innerHTML = `
            <div class="block-item">
                <div class="block-header">
                    <div class="block-index">Bloque #${block.index}</div>
                    <div>${new Date(block.timestamp * 1000).toLocaleString()}</div>
                </div>
                <div class="block-hash">
                    <strong>Hash:</strong> ${block.hash}
                </div>
                <div class="block-info">
                    <div class="block-info-item">
                        <strong>Previous Hash</strong><br>${block.previous_hash}
                    </div>
                    <div class="block-info-item">
                        <strong>Proof</strong><br>${block.proof}
                    </div>
                    <div class="block-info-item">
                        <strong>Transacciones</strong><br>${block.transactions.length}
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">❌</div>
            <p>No se encontraron resultados para "${query}"</p>
        </div>
    `;
}

// Modales
function showNewTransactionModal() {
    document.getElementById('modalOverlay').classList.add('active');
}

function showAddNodeModal() {
    // Implementar modal para añadir nodo
    const node = prompt('Ingresa la dirección del nodo (ej: http://localhost:5001)');
    if (node) {
        addNode(node);
    }
}

async function addNode(nodeAddress) {
    try {
        const response = await fetch(`${API_URL}/nodes/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes: [nodeAddress] })
        });
        
        if (response.ok) {
            showAlert('Nodo añadido exitosamente', 'success');
            await loadNodes();
            renderNodes();
        }
    } catch (error) {
        showAlert('Error al añadir nodo', 'error');
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('newTransactionForm').reset();
}

// Actualizar todo
async function refreshAll() {
    showAlert('Actualizando...', 'info');
    await initializeApp();
    showAlert('Actualización completada', 'success');
}

// Mostrar alerta
function showAlert(message, type) {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

// Loading spinner
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loadingStyle);
