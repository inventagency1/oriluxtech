// Detectar URL base automáticamente
const API_URL = window.location.origin;

// Estado global
let state = {
    chain: [],
    nodeInfo: {},
    pendingTransactions: [],
    autoRefresh: true
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    startAutoRefresh();
});

// Inicializar aplicación
async function initializeApp() {
    await Promise.all([
        loadNodeInfo(),
        loadBlockchain(),
        loadWalletInfo()
    ]);
}

// Configurar event listeners
function setupEventListeners() {
    // Formulario de transacción
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
    
    // Botón de minería
    document.getElementById('mineBtn').addEventListener('click', handleMine);
    
    // Botón de refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadBlockchain();
        showAlert('Blockchain actualizada', 'success');
    });
    
    // Toggle auto-refresh
    document.getElementById('autoRefreshToggle').addEventListener('change', (e) => {
        state.autoRefresh = e.target.checked;
    });
}

// Auto-refresh cada 10 segundos
function startAutoRefresh() {
    setInterval(() => {
        if (state.autoRefresh) {
            loadBlockchain();
            loadNodeInfo();
        }
    }, 10000);
}

// Cargar información del nodo
async function loadNodeInfo() {
    try {
        const response = await fetch(`${API_URL}/?api=true`);
        const data = await response.json();
        state.nodeInfo = data;
        updateNodeStats(data);
    } catch (error) {
        console.error('Error loading node info:', error);
        showAlert('Error al cargar información del nodo', 'error');
    }
}

// Cargar blockchain
async function loadBlockchain() {
    try {
        const response = await fetch(`${API_URL}/chain`);
        const data = await response.json();
        state.chain = data.chain;
        state.pendingTransactions = data.pending_transactions;
        
        updateBlockchainStats(data);
        renderBlockchain(data.chain);
        renderPendingTransactions(data.pending_transactions);
    } catch (error) {
        console.error('Error loading blockchain:', error);
        showAlert('Error al cargar la blockchain', 'error');
    }
}

// Cargar información de wallet
async function loadWalletInfo() {
    try {
        const response = await fetch(`${API_URL}/wallet`);
        const data = await response.json();
        document.getElementById('walletAddress').textContent = data.address.substring(0, 20) + '...';
        document.getElementById('walletBalance').textContent = data.balance;
    } catch (error) {
        console.error('Error loading wallet info:', error);
    }
}

// Actualizar estadísticas del nodo
function updateNodeStats(data) {
    document.getElementById('chainLength').textContent = data.chain_length;
    document.getElementById('difficulty').textContent = data.difficulty;
    document.getElementById('peers').textContent = data.peers;
}

// Actualizar estadísticas de blockchain
function updateBlockchainStats(data) {
    document.getElementById('totalBlocks').textContent = data.length;
    document.getElementById('pendingTxCount').textContent = data.pending_transactions.length;
    
    // Calcular total de transacciones
    const totalTx = data.chain.reduce((sum, block) => sum + block.transactions.length, 0);
    document.getElementById('totalTransactions').textContent = totalTx;
}

// Renderizar blockchain
function renderBlockchain(chain) {
    const container = document.getElementById('blockchainContainer');
    container.innerHTML = '';
    
    // Mostrar bloques en orden inverso (más reciente primero)
    [...chain].reverse().forEach(block => {
        const blockElement = createBlockElement(block);
        container.appendChild(blockElement);
    });
}

// Crear elemento de bloque
function createBlockElement(block) {
    const div = document.createElement('div');
    div.className = 'block';
    
    const timestamp = new Date(block.timestamp * 1000).toLocaleString();
    
    div.innerHTML = `
        <div class="block-header">
            <div class="block-index">Bloque #${block.index}</div>
            <div class="block-time">${timestamp}</div>
        </div>
        <div class="block-hash">
            <strong>Hash:</strong> ${block.hash}
        </div>
        <div class="block-info">
            <div class="block-info-item">
                <strong>Previous Hash</strong>
                ${block.previous_hash.substring(0, 20)}...
            </div>
            <div class="block-info-item">
                <strong>Proof</strong>
                ${block.proof}
            </div>
            <div class="block-info-item">
                <strong>Transacciones</strong>
                ${block.transactions.length}
            </div>
            <div class="block-info-item">
                <strong>Estado</strong>
                <span class="badge badge-success">Validado</span>
            </div>
        </div>
    `;
    
    return div;
}

// Renderizar transacciones pendientes
function renderPendingTransactions(transactions) {
    const container = document.getElementById('pendingTransactions');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9ca3af;">No hay transacciones pendientes</p>';
        return;
    }
    
    container.innerHTML = '';
    transactions.forEach(tx => {
        const txElement = createTransactionElement(tx);
        container.appendChild(txElement);
    });
}

// Crear elemento de transacción
function createTransactionElement(tx) {
    const div = document.createElement('div');
    div.className = 'transaction';
    
    div.innerHTML = `
        <div class="transaction-header">
            <div class="transaction-amount">${tx.amount} VRX</div>
            <span class="badge badge-warning">Pendiente</span>
        </div>
        <div class="transaction-addresses">
            <div><strong>De:</strong> ${tx.sender.substring(0, 30)}...</div>
            <div><strong>Para:</strong> ${tx.recipient.substring(0, 30)}...</div>
        </div>
    `;
    
    return div;
}

// Manejar envío de transacción
async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const sender = document.getElementById('sender').value;
    const recipient = document.getElementById('recipient').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    if (!sender || !recipient || !amount) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/transactions/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sender, recipient, amount })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Transacción creada exitosamente', 'success');
            document.getElementById('transactionForm').reset();
            await loadBlockchain();
        } else {
            showAlert(data.error || 'Error al crear transacción', 'error');
        }
    } catch (error) {
        console.error('Error creating transaction:', error);
        showAlert('Error al crear transacción', 'error');
    }
}

// Manejar minería
async function handleMine() {
    const btn = document.getElementById('mineBtn');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Minando...';
    
    try {
        const startTime = Date.now();
        const response = await fetch(`${API_URL}/mine`, {
            method: 'POST'
        });
        
        const data = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        if (response.ok) {
            showAlert(`¡Bloque minado exitosamente en ${duration}s!`, 'success');
            await Promise.all([
                loadBlockchain(),
                loadWalletInfo()
            ]);
        } else {
            showAlert('Error al minar bloque', 'error');
        }
    } catch (error) {
        console.error('Error mining block:', error);
        showAlert('Error al minar bloque', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Mostrar alerta
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Crear nueva wallet
async function createNewWallet() {
    try {
        const response = await fetch(`${API_URL}/wallet/new`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        // Mostrar información de la wallet
        alert(`Nueva Wallet Creada!\n\nDirección: ${data.address}\n\n⚠️ Guarda tu clave privada de forma segura!`);
        
        // Opcional: descargar la clave privada
        downloadWallet(data);
    } catch (error) {
        console.error('Error creating wallet:', error);
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
