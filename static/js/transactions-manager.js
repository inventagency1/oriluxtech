/**
 * ORILUXCHAIN - Transactions Manager
 * Sistema completo de gestión de transacciones
 */

class TransactionsManager {
    constructor() {
        this.currentTab = 'pending';
        this.currentPage = 1;
        this.perPage = 20;
        this.refreshInterval = 15000; // 15 segundos
        this.intervalId = null;
        this.walletAddress = null;
        
        this.init();
    }
    
    init() {
        console.log('💸 Initializing Transactions Manager...');
        this.loadWalletAddress();
        this.setupEventListeners();
        this.loadTransactions();
        this.startAutoRefresh();
    }
    
    async loadWalletAddress() {
        try {
            const response = await fetch('/wallet');
            if (response.ok) {
                const data = await response.json();
                this.walletAddress = data.address;
            }
        } catch (error) {
            console.error('Error loading wallet address:', error);
        }
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                if (tab && ['pending', 'confirmed', 'all'].includes(tab)) {
                    this.switchTab(tab);
                }
            });
        });
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        this.currentPage = 1;
        
        // Update button styles
        document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
                btn.style.borderBottom = '2px solid var(--gold-primary)';
                btn.style.color = 'var(--gold-primary)';
            } else {
                btn.classList.remove('active');
                btn.style.borderBottom = '2px solid transparent';
                btn.style.color = 'var(--text-secondary)';
            }
        });
        
        this.loadTransactions();
    }
    
    async loadTransactions() {
        try {
            let transactions = [];
            
            if (this.currentTab === 'pending') {
                transactions = await this.loadPendingTransactions();
            } else if (this.currentTab === 'confirmed') {
                transactions = await this.loadConfirmedTransactions();
            } else {
                transactions = await this.loadAllTransactions();
            }
            
            this.renderTransactions(transactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showError('Error loading transactions');
        }
    }
    
    async loadPendingTransactions() {
        const response = await fetch('/api/transactions/pending');
        if (!response.ok) throw new Error('Failed to fetch pending transactions');
        const data = await response.json();
        return data.transactions.map(tx => ({ ...tx, confirmed: false }));
    }
    
    async loadConfirmedTransactions() {
        const response = await fetch(`/api/transactions/history?page=${this.currentPage}&per_page=${this.perPage}`);
        if (!response.ok) throw new Error('Failed to fetch confirmed transactions');
        const data = await response.json();
        return data.transactions;
    }
    
    async loadAllTransactions() {
        const [pending, confirmed] = await Promise.all([
            this.loadPendingTransactions(),
            this.loadConfirmedTransactions()
        ]);
        return [...pending, ...confirmed];
    }
    
    renderTransactions(transactions) {
        const container = document.getElementById('transactionsList');
        if (!container) return;
        
        if (!transactions || transactions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <svg style="width: 64px; height: 64px; margin-bottom: 1rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                    <h3>No transactions found</h3>
                    <p>Create your first transaction to get started</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = transactions.map(tx => this.renderTransactionCard(tx)).join('');
        
        // Add click listeners
        container.querySelectorAll('.tx-card').forEach(card => {
            card.addEventListener('click', () => {
                const txData = JSON.parse(card.dataset.tx);
                this.showTransactionDetails(txData);
            });
        });
    }
    
    renderTransactionCard(tx) {
        const isConfirmed = tx.confirmed !== false;
        const isSent = this.walletAddress && tx.sender === this.walletAddress;
        const isReceived = this.walletAddress && tx.recipient === this.walletAddress;
        const date = new Date(tx.timestamp * 1000);
        
        return `
            <div class="tx-card" data-tx='${JSON.stringify(tx)}' style="
                padding: 1.25rem;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                margin-bottom: 0.75rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.borderColor='rgba(255, 215, 0, 0.5)'; this.style.background='rgba(255, 255, 255, 0.05)'" 
               onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'; this.style.background='rgba(255, 255, 255, 0.03)'">
                <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: center;">
                    <!-- Icon -->
                    <div style="
                        width: 48px;
                        height: 48px;
                        background: ${isSent ? 'rgba(239, 68, 68, 0.1)' : isReceived ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 215, 0, 0.1)'};
                        border: 2px solid ${isSent ? 'rgba(239, 68, 68, 0.3)' : isReceived ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 215, 0, 0.3)'};
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.5rem;
                    ">
                        ${isSent ? '↗️' : isReceived ? '↙️' : '↔️'}
                    </div>
                    
                    <!-- Info -->
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <span style="
                                color: ${isSent ? '#ef4444' : isReceived ? '#22c55e' : 'var(--text-primary)'};
                                font-weight: 600;
                                font-size: 1rem;
                            ">
                                ${isSent ? 'Sent' : isReceived ? 'Received' : 'Transaction'}
                            </span>
                            <span style="
                                padding: 0.25rem 0.75rem;
                                background: ${isConfirmed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 193, 7, 0.1)'};
                                border: 1px solid ${isConfirmed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 193, 7, 0.3)'};
                                border-radius: 12px;
                                font-size: 0.75rem;
                                color: ${isConfirmed ? '#22c55e' : '#ffc107'};
                                font-weight: 600;
                            ">
                                ${isConfirmed ? '✓ CONFIRMED' : '⏳ PENDING'}
                            </span>
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            <div>From: <code style="color: var(--text-primary);">${tx.sender.substring(0, 16)}...</code></div>
                            <div>To: <code style="color: var(--text-primary);">${tx.recipient.substring(0, 16)}...</code></div>
                        </div>
                    </div>
                    
                    <!-- Amount & Time -->
                    <div style="text-align: right;">
                        <div style="
                            font-size: 1.25rem;
                            font-weight: 700;
                            color: ${isSent ? '#ef4444' : isReceived ? '#22c55e' : 'var(--gold-primary)'};
                            margin-bottom: 0.25rem;
                        ">
                            ${isSent ? '-' : isReceived ? '+' : ''}${tx.amount} ${tx.token || 'VRX'}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">
                            ${this.getTimeAgo(tx.timestamp)}
                        </div>
                        ${isConfirmed && tx.block_index !== undefined ? `
                            <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.25rem;">
                                Block #${tx.block_index}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    showTransactionDetails(tx) {
        const isConfirmed = tx.confirmed !== false;
        const date = new Date(tx.timestamp * 1000);
        
        const modal = document.createElement('div');
        modal.id = 'txDetailsModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        `;
        
        modal.innerHTML = `
            <div style="
                background: rgba(18, 18, 26, 0.95);
                backdrop-filter: blur(20px);
                border: 2px solid var(--gold-primary);
                border-radius: 20px;
                width: 90%;
                max-width: 600px;
                box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);
            ">
                <!-- Header -->
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--gold-primary); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="color: var(--gold-primary); font-family: 'Orbitron', sans-serif; margin: 0;">
                        TRANSACTION DETAILS
                    </h2>
                    <button onclick="document.getElementById('txDetailsModal').remove()" style="
                        background: none;
                        border: none;
                        font-size: 2rem;
                        color: var(--gold-primary);
                        cursor: pointer;
                        line-height: 1;
                    ">&times;</button>
                </div>
                
                <!-- Content -->
                <div style="padding: 1.5rem;">
                    <!-- Status Badge -->
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <span style="
                            padding: 0.5rem 1.5rem;
                            background: ${isConfirmed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 193, 7, 0.1)'};
                            border: 2px solid ${isConfirmed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 193, 7, 0.3)'};
                            border-radius: 16px;
                            font-size: 1rem;
                            color: ${isConfirmed ? '#22c55e' : '#ffc107'};
                            font-weight: 700;
                        ">
                            ${isConfirmed ? '✓ CONFIRMED' : '⏳ PENDING'}
                        </span>
                    </div>
                    
                    <!-- Amount -->
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="font-size: 2.5rem; font-weight: 700; color: var(--gold-primary);">
                            ${tx.amount} ${tx.token || 'VRX'}
                        </div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">
                            ${date.toLocaleString()}
                        </div>
                    </div>
                    
                    <!-- Details Grid -->
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">From</div>
                            <code style="
                                display: block;
                                padding: 0.75rem;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 8px;
                                color: var(--text-primary);
                                word-break: break-all;
                                font-size: 0.875rem;
                            ">${tx.sender}</code>
                        </div>
                        
                        <div style="text-align: center; color: var(--gold-primary); font-size: 1.5rem;">
                            ↓
                        </div>
                        
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">To</div>
                            <code style="
                                display: block;
                                padding: 0.75rem;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 8px;
                                color: var(--text-primary);
                                word-break: break-all;
                                font-size: 0.875rem;
                            ">${tx.recipient}</code>
                        </div>
                        
                        ${isConfirmed && tx.block_index !== undefined ? `
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                                <div>
                                    <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Block</div>
                                    <div style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600;">#${tx.block_index}</div>
                                </div>
                                ${tx.block_hash ? `
                                    <div>
                                        <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Block Hash</div>
                                        <code style="color: var(--gold-primary); font-size: 0.75rem;">${tx.block_hash.substring(0, 16)}...</code>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    startAutoRefresh() {
        this.intervalId = setInterval(() => {
            this.loadTransactions();
        }, this.refreshInterval);
    }
    
    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    getTimeAgo(timestamp) {
        const seconds = Math.floor(Date.now() / 1000 - timestamp);
        
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('alertContainer');
        if (!container) return;
        
        const alert = document.createElement('div');
        alert.style.cssText = `
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
            border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
            color: ${type === 'success' ? '#22c55e' : '#ef4444'};
            animation: slideIn 0.3s ease-out;
        `;
        alert.textContent = message;
        
        container.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
}

// New Transaction Modal Handler
class NewTransactionModal {
    constructor(transactionsManager) {
        this.manager = transactionsManager;
    }
    
    show() {
        const modal = document.getElementById('modalOverlay');
        const form = document.getElementById('newTransactionForm');
        
        if (!modal || !form) return;
        
        // Reset form
        form.reset();
        
        // Set sender to current wallet
        if (this.manager.walletAddress) {
            document.getElementById('txSender').value = this.manager.walletAddress;
        }
        
        // Show modal
        modal.style.display = 'flex';
        
        // Setup form submit
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.submitTransaction();
        };
    }
    
    async submitTransaction() {
        const sender = document.getElementById('txSender').value;
        const recipient = document.getElementById('txRecipient').value;
        const amount = parseFloat(document.getElementById('txAmount').value);
        
        if (!sender || !recipient || !amount) {
            this.manager.showError('Please fill all fields');
            return;
        }
        
        try {
            const response = await fetch('/api/transaction/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender,
                    recipient,
                    amount,
                    token: 'ORX'
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.manager.showSuccess('Transaction created successfully!');
                this.close();
                this.manager.loadTransactions();
            } else {
                this.manager.showError(data.error || 'Failed to create transaction');
            }
        } catch (error) {
            console.error('Error creating transaction:', error);
            this.manager.showError('Error creating transaction');
        }
    }
    
    close() {
        const modal = document.getElementById('modalOverlay');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Initialize when section is active
function initTransactionsManager() {
    if (!window.transactionsManager) {
        window.transactionsManager = new TransactionsManager();
        window.newTransactionModal = new NewTransactionModal(window.transactionsManager);
    }
}

// Global function for modal
function showNewTransactionModal() {
    if (!window.transactionsManager) {
        initTransactionsManager();
    }
    if (window.newTransactionModal) {
        window.newTransactionModal.show();
    }
}

function closeModal() {
    if (window.newTransactionModal) {
        window.newTransactionModal.close();
    }
}

// Auto-initialize when transactions section becomes active
document.addEventListener('DOMContentLoaded', () => {
    const txSection = document.getElementById('transactions-section');
    if (txSection) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    initTransactionsManager();
                }
            });
        });
        
        observer.observe(txSection, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Initialize if already active
        if (txSection.classList.contains('active')) {
            initTransactionsManager();
        }
    }
});
