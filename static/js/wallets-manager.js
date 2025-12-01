/**
 * ORILUXCHAIN - Wallets Manager
 * Sistema completo de gestión de wallets
 */

class WalletsManager {
    constructor() {
        this.wallets = [];
        this.activeWallet = null;
        this.refreshInterval = 20000;
        this.intervalId = null;
        this.init();
    }
    
    init() {
        console.log('💼 Initializing Wallets Manager...');
        this.loadWallets();
        this.startAutoRefresh();
    }
    
    async loadWallets() {
        try {
            const response = await fetch('/api/wallets');
            if (!response.ok) throw new Error('Failed to fetch wallets');
            
            const data = await response.json();
            this.wallets = data.wallets;
            
            if (!this.activeWallet && this.wallets.length > 0) {
                this.activeWallet = this.wallets[0].address;
            }
            
            this.renderWallets();
        } catch (error) {
            console.error('Error loading wallets:', error);
        }
    }
    
    renderWallets() {
        const container = document.getElementById('walletsGrid');
        if (!container) return;
        
        if (!this.wallets || this.wallets.length === 0) {
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);"><h3>No wallets found</h3><p>Create your first wallet to get started</p></div>';
            return;
        }
        
        container.innerHTML = this.wallets.map(wallet => this.renderWalletCard(wallet)).join('');
    }
    
    renderWalletCard(wallet) {
        const isActive = wallet.address === this.activeWallet;
        const isNodeWallet = wallet.is_node_wallet;
        
        let totalBalance = 0;
        let balanceDisplay = [];
        
        for (const [token, amount] of Object.entries(wallet.balances)) {
            if (amount > 0) {
                balanceDisplay.push(`${amount.toFixed(2)} ${token}`);
                if (token === 'ORX') totalBalance += amount;
                else if (token === 'VRX') totalBalance += amount * 0.5;
            }
        }
        
        return `<div class="wallet-card" style="background: ${isActive ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)'}; border: 2px solid ${isActive ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 16px; padding: 1.5rem;">
            ${isNodeWallet ? '<span style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; font-size: 0.75rem; color: var(--gold-primary); font-weight: 600; margin-bottom: 0.5rem;">🔑 NODE WALLET</span>' : ''}
            <div style="margin-bottom: 1rem;"><div style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.25rem;">Address</div><code style="display: block; color: var(--text-primary); font-size: 0.875rem; word-break: break-all; background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">${wallet.address}</code></div>
            <div style="margin-bottom: 1rem;"><div style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.5rem;">Balance</div>${balanceDisplay.length > 0 ? balanceDisplay.map(b => `<div style="color: var(--gold-primary); font-size: 1.25rem; font-weight: 700;">${b}</div>`).join('') : '<div style="color: var(--text-secondary);">0.00 ORX</div>'}</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                <button onclick="walletsManager.exportKeys('${wallet.address}')" class="btn btn-secondary" style="padding: 0.5rem; font-size: 0.875rem;">🔐 Export</button>
                <button onclick="walletsManager.copyAddress('${wallet.address}')" class="btn btn-outline" style="padding: 0.5rem; font-size: 0.875rem;">📋 Copy</button>
            </div>
        </div>`;
    }
    
    async exportKeys(address) {
        if (!confirm('⚠️ WARNING: Your private key will be displayed!')) return;
        
        try {
            const response = await fetch(`/api/wallet/${address}/export`);
            if (!response.ok) throw new Error('Failed');
            
            const data = await response.json();
            alert(`Private Key: ${data.private_key}\n\n⚠️ Keep this safe!`);
        } catch (error) {
            alert('Error exporting keys');
        }
    }
    
    copyAddress(address) {
        navigator.clipboard.writeText(address).then(() => {
            alert('Address copied!');
        });
    }
    
    startAutoRefresh() {
        this.intervalId = setInterval(() => this.loadWallets(), this.refreshInterval);
    }
}

function createNewWallet() {
    if (confirm('Create a new wallet?')) {
        fetch('/wallet/create', { method: 'POST' })
            .then(r => r.json())
            .then(data => {
                alert(`New Wallet Created!\n\nAddress: ${data.address}\n\nPrivate Key: ${data.private_key}\n\n⚠️ Save your private key securely!`);
                if (window.walletsManager) window.walletsManager.loadWallets();
            });
    }
}

function importWallet() {
    const privateKey = prompt('Enter your private key:');
    if (!privateKey) return;
    
    fetch('/api/wallet/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ private_key: privateKey })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert(`Wallet imported!\n\nAddress: ${data.address}`);
            if (window.walletsManager) window.walletsManager.loadWallets();
        } else {
            alert('Error: ' + data.error);
        }
    });
}

function initWalletsManager() {
    if (!window.walletsManager) {
        window.walletsManager = new WalletsManager();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('wallets-section');
    if (section) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    initWalletsManager();
                }
            });
        });
        observer.observe(section, { attributes: true, attributeFilter: ['class'] });
        if (section.classList.contains('active')) initWalletsManager();
    }
});
