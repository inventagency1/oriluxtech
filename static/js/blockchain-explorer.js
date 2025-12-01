/**
 * ORILUXCHAIN - Blockchain Explorer
 * Explorador completo de bloques y transacciones
 */

class BlockchainExplorer {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.selectedBlock = null;
        this.searchTimeout = null;
        
        this.init();
    }
    
    init() {
        console.log('🔍 Initializing Blockchain Explorer...');
        this.setupEventListeners();
        this.loadBlocks();
    }
    
    setupEventListeners() {
        // Botón de refresh
        const refreshBtn = document.querySelector('[onclick="loadBlockchain()"]');
        if (refreshBtn) {
            refreshBtn.onclick = (e) => {
                e.preventDefault();
                this.loadBlocks();
            };
        }
        
        // Botón de export
        const exportBtn = document.querySelector('[onclick="exportBlockchain()"]');
        if (exportBtn) {
            exportBtn.onclick = (e) => {
                e.preventDefault();
                this.exportBlockchain();
            };
        }
        
        // Búsqueda
        const searchInput = document.getElementById('blockSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.searchBlock(e.target.value);
                }, 500);
            });
        }
    }
    
    async loadBlocks(page = 1) {
        try {
            this.currentPage = page;
            const response = await fetch(`/api/blocks?page=${page}&per_page=${this.perPage}`);
            
            if (!response.ok) throw new Error('Failed to fetch blocks');
            
            const data = await response.json();
            this.renderBlocks(data);
            this.renderPagination(data);
            
            console.log(`✅ Loaded ${data.blocks.length} blocks (page ${page})`);
        } catch (error) {
            console.error('Error loading blocks:', error);
            this.showError('Error loading blockchain');
        }
    }
    
    renderBlocks(data) {
        const container = document.getElementById('blockchainVisualization');
        if (!container) return;
        
        if (!data.blocks || data.blocks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <h3>No blocks found</h3>
                    <p>Mine your first block to get started</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = data.blocks.map(block => this.renderBlockCard(block)).join('');
        
        // Agregar event listeners a los bloques
        container.querySelectorAll('.block-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                this.showBlockDetails(index);
            });
        });
    }
    
    renderBlockCard(block) {
        const date = new Date(block.timestamp * 1000);
        const timeAgo = this.getTimeAgo(block.timestamp);
        
        return `
            <div class="block-card" data-index="${block.index}" style="
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.borderColor='rgba(255, 215, 0, 0.5)'; this.style.transform='translateY(-2px)'" 
               onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'; this.style.transform='translateY(0)'">
                <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 1.5rem; align-items: center;">
                    <!-- Block Number -->
                    <div style="text-align: center;">
                        <div style="
                            width: 60px;
                            height: 60px;
                            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05));
                            border: 2px solid rgba(255, 215, 0, 0.3);
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.25rem;
                            font-weight: 700;
                            color: var(--gold-primary);
                        ">
                            #${block.index}
                        </div>
                    </div>
                    
                    <!-- Block Info -->
                    <div>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">
                            <h3 style="color: var(--text-primary); font-size: 1rem; font-weight: 600; margin: 0;">
                                Block ${block.index}
                            </h3>
                            <span style="
                                padding: 0.25rem 0.75rem;
                                background: rgba(34, 197, 94, 0.1);
                                border: 1px solid rgba(34, 197, 94, 0.3);
                                border-radius: 12px;
                                font-size: 0.75rem;
                                color: #22c55e;
                                font-weight: 600;
                            ">CONFIRMED</span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.875rem;">
                            <div>
                                <span style="color: var(--text-secondary);">Hash:</span>
                                <code style="color: var(--gold-primary); margin-left: 0.5rem;">${block.hash.substring(0, 16)}...</code>
                            </div>
                            <div>
                                <span style="color: var(--text-secondary);">Transactions:</span>
                                <strong style="color: var(--text-primary); margin-left: 0.5rem;">${block.transactions}</strong>
                            </div>
                            <div>
                                <span style="color: var(--text-secondary);">Nonce:</span>
                                <strong style="color: var(--text-primary); margin-left: 0.5rem;">${block.nonce}</strong>
                            </div>
                            <div>
                                <span style="color: var(--text-secondary);">Difficulty:</span>
                                <strong style="color: var(--text-primary); margin-left: 0.5rem;">${block.difficulty}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Time -->
                    <div style="text-align: right;">
                        <div style="color: var(--text-secondary); font-size: 0.875rem;">${timeAgo}</div>
                        <div style="color: var(--text-tertiary); font-size: 0.75rem; margin-top: 0.25rem;">
                            ${date.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPagination(data) {
        const container = document.getElementById('blockchainVisualization');
        if (!container || data.total_pages <= 1) return;
        
        const pagination = document.createElement('div');
        pagination.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-top: 2rem;
        `;
        
        // Previous button
        if (data.page > 1) {
            pagination.appendChild(this.createPaginationButton('← Previous', () => this.loadBlocks(data.page - 1)));
        }
        
        // Page numbers
        const startPage = Math.max(1, data.page - 2);
        const endPage = Math.min(data.total_pages, data.page + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === data.page;
            pagination.appendChild(this.createPaginationButton(i, () => this.loadBlocks(i), isActive));
        }
        
        // Next button
        if (data.page < data.total_pages) {
            pagination.appendChild(this.createPaginationButton('Next →', () => this.loadBlocks(data.page + 1)));
        }
        
        container.appendChild(pagination);
    }
    
    createPaginationButton(text, onClick, isActive = false) {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClick;
        button.style.cssText = `
            padding: 0.5rem 1rem;
            background: ${isActive ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
            border: 1px solid ${isActive ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
            border-radius: 8px;
            color: ${isActive ? 'var(--gold-primary)' : 'var(--text-primary)'};
            cursor: pointer;
            font-weight: ${isActive ? '600' : '400'};
            transition: all 0.2s;
        `;
        
        if (!isActive) {
            button.onmouseover = () => {
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.style.borderColor = 'rgba(255, 215, 0, 0.3)';
            };
            button.onmouseout = () => {
                button.style.background = 'rgba(255, 255, 255, 0.05)';
                button.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            };
        }
        
        return button;
    }
    
    async showBlockDetails(index) {
        try {
            const response = await fetch(`/block/${index}`);
            if (!response.ok) throw new Error('Block not found');
            
            const block = await response.json();
            this.renderBlockModal(block);
        } catch (error) {
            console.error('Error loading block details:', error);
            this.showError('Error loading block details');
        }
    }
    
    renderBlockModal(block) {
        const modal = document.createElement('div');
        modal.id = 'blockDetailsModal';
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
        
        const date = new Date(block.timestamp * 1000);
        
        modal.innerHTML = `
            <div style="
                background: rgba(18, 18, 26, 0.95);
                backdrop-filter: blur(20px);
                border: 2px solid var(--gold-primary);
                border-radius: 20px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);
            ">
                <!-- Header -->
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--gold-primary); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: rgba(18, 18, 26, 0.95); z-index: 1;">
                    <h2 style="color: var(--gold-primary); font-family: 'Orbitron', sans-serif; margin: 0;">
                        BLOCK #${block.index}
                    </h2>
                    <button onclick="document.getElementById('blockDetailsModal').remove()" style="
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
                    <!-- Block Info Grid -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                        <div class="detail-item">
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Index</div>
                            <div style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600;">#${block.index}</div>
                        </div>
                        <div class="detail-item">
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Timestamp</div>
                            <div style="color: var(--text-primary); font-size: 1rem;">${date.toLocaleString()}</div>
                        </div>
                        <div class="detail-item">
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Nonce</div>
                            <div style="color: var(--text-primary); font-size: 1rem; font-family: monospace;">${block.nonce}</div>
                        </div>
                        <div class="detail-item">
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Difficulty</div>
                            <div style="color: var(--text-primary); font-size: 1rem;">${block.difficulty}</div>
                        </div>
                    </div>
                    
                    <!-- Hashes -->
                    <div style="margin-bottom: 2rem;">
                        <div style="margin-bottom: 1rem;">
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Block Hash</div>
                            <code style="
                                display: block;
                                padding: 0.75rem;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 215, 0, 0.3);
                                border-radius: 8px;
                                color: var(--gold-primary);
                                word-break: break-all;
                                font-size: 0.875rem;
                            ">${block.hash}</code>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Previous Hash</div>
                            <code style="
                                display: block;
                                padding: 0.75rem;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                border-radius: 8px;
                                color: var(--text-primary);
                                word-break: break-all;
                                font-size: 0.875rem;
                            ">${block.previous_hash}</code>
                        </div>
                    </div>
                    
                    <!-- Transactions -->
                    <div>
                        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">
                            Transactions (${block.transactions.length})
                        </h3>
                        ${block.transactions.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                ${block.transactions.map((tx, idx) => `
                                    <div style="
                                        padding: 1rem;
                                        background: rgba(255, 255, 255, 0.03);
                                        border: 1px solid rgba(255, 255, 255, 0.1);
                                        border-radius: 8px;
                                    ">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                            <span style="color: var(--gold-primary); font-weight: 600;">TX #${idx + 1}</span>
                                            <span style="color: var(--text-primary); font-weight: 600;">${tx.amount} ${tx.token || 'VRX'}</span>
                                        </div>
                                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                            <div>From: <code>${tx.sender.substring(0, 20)}...</code></div>
                                            <div>To: <code>${tx.recipient.substring(0, 20)}...</code></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                                No transactions in this block
                            </p>
                        `}
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
    
    async searchBlock(query) {
        if (!query || query.trim() === '') {
            this.loadBlocks();
            return;
        }
        
        try {
            // Try to search by index first
            if (!isNaN(query)) {
                const index = parseInt(query);
                await this.showBlockDetails(index);
                return;
            }
            
            // Search by hash
            const response = await fetch(`/api/block/hash/${query}`);
            if (response.ok) {
                const block = await response.json();
                this.renderBlockModal(block);
            } else {
                this.showError('Block not found');
            }
        } catch (error) {
            console.error('Error searching block:', error);
            this.showError('Error searching block');
        }
    }
    
    async exportBlockchain() {
        try {
            const response = await fetch('/api/blockchain/export');
            if (!response.ok) throw new Error('Export failed');
            
            const data = await response.json();
            
            // Create download
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `oriluxchain-export-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Blockchain exported successfully');
        } catch (error) {
            console.error('Error exporting blockchain:', error);
            this.showError('Error exporting blockchain');
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

// Initialize when section is active
function initBlockchainExplorer() {
    if (!window.blockchainExplorer) {
        window.blockchainExplorer = new BlockchainExplorer();
    }
}

// Global functions for compatibility
function loadBlockchain() {
    if (window.blockchainExplorer) {
        window.blockchainExplorer.loadBlocks();
    } else {
        initBlockchainExplorer();
    }
}

function exportBlockchain() {
    if (window.blockchainExplorer) {
        window.blockchainExplorer.exportBlockchain();
    }
}

// Auto-initialize when blockchain section becomes active
document.addEventListener('DOMContentLoaded', () => {
    const blockchainSection = document.getElementById('blockchain-section');
    if (blockchainSection) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    initBlockchainExplorer();
                }
            });
        });
        
        observer.observe(blockchainSection, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Initialize if already active
        if (blockchainSection.classList.contains('active')) {
            initBlockchainExplorer();
        }
    }
});
