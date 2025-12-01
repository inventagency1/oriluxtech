/**
 * Dashboard Mejorado para Oriluxchain
 * Usa el API Client con manejo robusto de errores
 */

// Estado global
const dashboardState = {
    chain: [],
    stats: {},
    miningStatus: {},
    wallet: {},
    nodes: [],
    contracts: [],
    autoRefresh: true,
    refreshInterval: 10000, // 10 segundos
    currentSection: 'overview',
    loading: {}
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Oriluxchain Dashboard...');
    initializeDashboard();
});

/**
 * Inicializa el dashboard
 */
async function initializeDashboard() {
    setupNavigation();
    setupEventListeners();
    await loadInitialData();
    startAutoRefresh();
    console.log('✅ Dashboard initialized');
}

/**
 * Carga datos iniciales
 */
async function loadInitialData() {
    showLoading('overview');
    
    try {
        await Promise.all([
            loadStats(),
            loadChain(),
            loadMiningStatus(),
            loadWallet(),
            loadNodes()
        ]);
        
        updateOverviewSection();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Error loading dashboard data', 'error');
    } finally {
        hideLoading('overview');
    }
}

/**
 * Configurar navegación entre secciones
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch section
            await switchSection(section);
        });
    });
}

/**
 * Cambia a una sección específica
 */
async function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        dashboardState.currentSection = sectionName;
        
        // Load section-specific data
        await loadSectionData(sectionName);
    }
}

/**
 * Carga datos específicos de cada sección
 */
async function loadSectionData(section) {
    showLoading(section);
    
    try {
        switch(section) {
            case 'overview':
                await loadStats();
                await loadMiningStatus();
                updateOverviewSection();
                break;
                
            case 'blockchain':
                await loadChain();
                renderBlockchainSection();
                break;
                
            case 'transactions':
                await loadTransactions();
                renderTransactionsSection();
                break;
                
            case 'wallets':
                await loadWallet();
                renderWalletsSection();
                break;
                
            case 'mining':
                await loadMiningStatus();
                renderMiningSection();
                break;
                
            case 'network':
                await loadNodes();
                renderNetworkSection();
                break;
                
            case 'contracts':
                await loadContracts();
                renderContractsSection();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${section} data:`, error);
        showNotification(`Error loading ${section} data`, 'error');
    } finally {
        hideLoading(section);
    }
}

// ==================== DATA LOADING ====================

async function loadStats() {
    try {
        dashboardState.stats = await api.getStats();
        updateStatsDisplay();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadChain() {
    try {
        const data = await api.getChain();
        dashboardState.chain = data.chain || [];
        updateChainDisplay();
    } catch (error) {
        console.error('Error loading chain:', error);
    }
}

async function loadMiningStatus() {
    try {
        dashboardState.miningStatus = await api.getMiningStatus();
        updateMiningDisplay();
    } catch (error) {
        console.error('Error loading mining status:', error);
    }
}

async function loadWallet() {
    try {
        dashboardState.wallet = await api.getWallet();
        updateWalletDisplay();
    } catch (error) {
        console.error('Error loading wallet:', error);
    }
}

async function loadNodes() {
    try {
        const data = await api.getNodes();
        dashboardState.nodes = data.nodes || [];
        updateNodesDisplay();
    } catch (error) {
        console.error('Error loading nodes:', error);
    }
}

async function loadTransactions() {
    try {
        const data = await api.getTransactions();
        dashboardState.transactions = data.pending_transactions || [];
        updateTransactionsDisplay();
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

async function loadContracts() {
    try {
        const data = await api.getContracts();
        dashboardState.contracts = data.contracts || [];
        updateContractsDisplay();
    } catch (error) {
        console.error('Error loading contracts:', error);
    }
}

// ==================== DISPLAY UPDATES ====================

function updateStatsDisplay() {
    const stats = dashboardState.stats;
    
    // Update stat cards
    updateElement('totalBlocks', stats.blocks || 0);
    updateElement('totalTransactions', stats.transactions || 0);
    updateElement('totalNodes', stats.nodes || 0);
    updateElement('currentDifficulty', stats.difficulty || 0);
    updateElement('orxSupply', formatNumber(stats.orx_supply || 0));
    updateElement('vrxSupply', formatNumber(stats.vrx_supply || 0));
    updateElement('stakingPool', formatNumber(stats.staking_pool || 0));
    updateElement('totalContracts', stats.contracts || 0);
}

function updateChainDisplay() {
    const chainLength = dashboardState.chain.length;
    updateElement('chainLength', chainLength);
    
    if (chainLength > 0) {
        const lastBlock = dashboardState.chain[chainLength - 1];
        updateElement('lastBlockHash', truncateHash(lastBlock.hash));
        updateElement('lastBlockTime', formatDate(lastBlock.timestamp));
    }
}

function updateMiningDisplay() {
    const status = dashboardState.miningStatus;
    
    updateElement('miningStatus', status.status || 'INACTIVE');
    updateElement('blocksMined', status.blocks_mined || 0);
    updateElement('pendingTx', status.pending_transactions || 0);
    
    // Update status indicator
    const indicator = document.querySelector('.mining-status-indicator');
    if (indicator) {
        indicator.className = `mining-status-indicator ${status.status === 'ACTIVE' ? 'active' : 'inactive'}`;
    }
}

function updateWalletDisplay() {
    const wallet = dashboardState.wallet;
    
    updateElement('walletAddress', truncateHash(wallet.address));
    updateElement('orxBalance', formatNumber(wallet.balances?.ORX || 0));
    updateElement('vrxBalance', formatNumber(wallet.balances?.VRX || 0));
    updateElement('topBarBalance', formatNumber(wallet.balances?.ORX || 0));
}

function updateNodesDisplay() {
    updateElement('connectedNodes', dashboardState.nodes.length);
}

function updateTransactionsDisplay() {
    const txCount = dashboardState.transactions?.length || 0;
    updateElement('pendingTransactions', txCount);
}

function updateContractsDisplay() {
    updateElement('deployedContracts', dashboardState.contracts.length);
}

// ==================== SECTION RENDERING ====================

function updateOverviewSection() {
    updateStatsDisplay();
    updateChainDisplay();
    updateMiningDisplay();
    updateWalletDisplay();
}

function renderBlockchainSection() {
    const container = document.getElementById('blockchainList');
    if (!container) return;
    
    if (dashboardState.chain.length === 0) {
        container.innerHTML = '<p class="empty-state">No blocks found</p>';
        return;
    }
    
    container.innerHTML = dashboardState.chain.map((block, index) => `
        <div class="block-card" onclick="viewBlockDetails(${index})">
            <div class="block-header">
                <span class="block-index">#${block.index}</span>
                <span class="block-time">${formatDate(block.timestamp)}</span>
            </div>
            <div class="block-hash">${truncateHash(block.hash)}</div>
            <div class="block-info">
                <span>Transactions: ${block.transactions?.length || 0}</span>
                <span>Proof: ${block.proof}</span>
            </div>
        </div>
    `).join('');
}

function renderTransactionsSection() {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    
    const transactions = dashboardState.transactions || [];
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="empty-state">No pending transactions</p>';
        return;
    }
    
    container.innerHTML = transactions.map(tx => `
        <div class="transaction-card">
            <div class="tx-header">
                <span class="tx-from">${truncateHash(tx.sender)}</span>
                <span class="tx-arrow">→</span>
                <span class="tx-to">${truncateHash(tx.recipient)}</span>
            </div>
            <div class="tx-amount">${tx.amount} ${tx.token || 'ORX'}</div>
            <div class="tx-time">${formatDate(tx.timestamp)}</div>
        </div>
    `).join('');
}

function renderWalletsSection() {
    updateWalletDisplay();
}

function renderMiningSection() {
    updateMiningDisplay();
}

function renderNetworkSection() {
    const container = document.getElementById('nodesList');
    if (!container) return;
    
    if (dashboardState.nodes.length === 0) {
        container.innerHTML = '<p class="empty-state">No nodes connected</p>';
        return;
    }
    
    container.innerHTML = dashboardState.nodes.map(node => `
        <div class="node-card">
            <div class="node-status online"></div>
            <div class="node-address">${node}</div>
        </div>
    `).join('');
}

function renderContractsSection() {
    const container = document.getElementById('contractsList');
    if (!container) return;
    
    if (dashboardState.contracts.length === 0) {
        container.innerHTML = '<p class="empty-state">No contracts deployed</p>';
        return;
    }
    
    container.innerHTML = dashboardState.contracts.map(contract => `
        <div class="contract-card" onclick="viewContractDetails('${contract.address}')">
            <div class="contract-address">${truncateHash(contract.address)}</div>
            <div class="contract-owner">Owner: ${truncateHash(contract.owner)}</div>
        </div>
    `).join('');
}

// ==================== ACTIONS ====================

async function handleMineBlock() {
    if (dashboardState.loading.mining) return;
    
    dashboardState.loading.mining = true;
    showNotification('Mining block...', 'info');
    
    try {
        const result = await api.mine();
        showNotification(`Block mined successfully! Index: ${result.index}`, 'success');
        await loadChain();
        await loadMiningStatus();
    } catch (error) {
        showNotification('Failed to mine block', 'error');
    } finally {
        dashboardState.loading.mining = false;
    }
}

async function handleCreateWallet() {
    try {
        const wallet = await api.createWallet();
        showNotification('Wallet created successfully!', 'success');
        
        // Show wallet details in modal or alert
        alert(`New Wallet Created!\n\nAddress: ${wallet.address}\n\nPublic Key: ${wallet.public_key}\n\nIMPORTANT: Save your private key securely!`);
    } catch (error) {
        showNotification('Failed to create wallet', 'error');
    }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Mine button
    const mineBtn = document.getElementById('mineButton');
    if (mineBtn) {
        mineBtn.addEventListener('click', handleMineBlock);
    }
    
    // Create wallet button
    const createWalletBtn = document.getElementById('createWalletButton');
    if (createWalletBtn) {
        createWalletBtn.addEventListener('click', handleCreateWallet);
    }
    
    // Refresh button
    const refreshBtn = document.querySelector('[onclick="refreshAll()"]');
    if (refreshBtn) {
        refreshBtn.onclick = () => loadSectionData(dashboardState.currentSection);
    }
}

// ==================== AUTO REFRESH ====================

function startAutoRefresh() {
    if (!dashboardState.autoRefresh) return;
    
    setInterval(async () => {
        if (dashboardState.autoRefresh) {
            await loadSectionData(dashboardState.currentSection);
        }
    }, dashboardState.refreshInterval);
}

function toggleAutoRefresh() {
    dashboardState.autoRefresh = !dashboardState.autoRefresh;
    showNotification(
        `Auto-refresh ${dashboardState.autoRefresh ? 'enabled' : 'disabled'}`,
        'info',
        2000
    );
}

// ==================== UTILITIES ====================

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function showLoading(section) {
    dashboardState.loading[section] = true;
    const container = document.getElementById(`${section}-section`);
    if (container) {
        container.classList.add('loading');
    }
}

function hideLoading(section) {
    dashboardState.loading[section] = false;
    const container = document.getElementById(`${section}-section`);
    if (container) {
        container.classList.remove('loading');
    }
}

function viewBlockDetails(index) {
    // TODO: Implement block details modal
    console.log('View block:', index);
}

function viewContractDetails(address) {
    // TODO: Implement contract details modal
    console.log('View contract:', address);
}

// Global refresh function
window.refreshAll = async function() {
    await loadSectionData(dashboardState.currentSection);
    showNotification('Refreshed!', 'success', 2000);
};

console.log('✅ Dashboard Improved loaded');
