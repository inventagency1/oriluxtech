/**
 * ORILUXCHAIN - Real-time Dashboard
 * Actualización automática de estadísticas y datos
 */

class RealtimeDashboard {
    constructor() {
        this.refreshInterval = 10000; // 10 segundos
        this.intervalId = null;
        this.charts = {};
        this.isUpdating = false;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Realtime Dashboard...');
        
        // Cargar datos iniciales
        this.loadAllData();
        
        // Inicializar gráficos
        this.initCharts();
        
        // Iniciar actualización automática
        this.startAutoRefresh();
        
        // Event listeners
        this.setupEventListeners();
    }
    
    async loadAllData() {
        if (this.isUpdating) return;
        this.isUpdating = true;
        
        try {
            await Promise.all([
                this.updateStats(),
                this.updateRecentBlocks(),
                this.updateRecentActivity()
            ]);
            
            this.showNotification('✅ Dashboard updated', 'success');
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('❌ Error updating dashboard', 'error');
        } finally {
            this.isUpdating = false;
        }
    }
    
    async updateStats() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            
            const data = await response.json();
            
            // Actualizar métricas principales
            this.updateElement('totalBlocks', data.blocks);
            this.updateElement('totalBalance', data.wallet_balance.toFixed(2));
            this.updateElement('pendingCount', data.transactions);
            this.updateElement('difficultyMetric', data.difficulty);
            
            // Actualizar gráficos
            if (data.recent_blocks && data.recent_blocks.length > 0) {
                this.updateBlocksChart(data.recent_blocks);
                this.updateTransactionsChart(data.recent_blocks);
            }
            
            return data;
        } catch (error) {
            console.error('Error updating stats:', error);
            throw error;
        }
    }
    
    async updateRecentBlocks() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Failed to fetch blocks');
            
            const data = await response.json();
            const tbody = document.getElementById('recentBlocksTable');
            
            if (!tbody) return;
            
            if (!data.recent_blocks || data.recent_blocks.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No blocks yet</td></tr>';
                return;
            }
            
            tbody.innerHTML = data.recent_blocks.reverse().map(block => `
                <tr>
                    <td><strong>#${block.index}</strong></td>
                    <td><code>${block.hash}</code></td>
                    <td>${block.transactions}</td>
                    <td>${this.formatTimestamp(block.timestamp)}</td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error updating recent blocks:', error);
        }
    }
    
    async updateRecentActivity() {
        try {
            const response = await fetch('/transactions');
            if (!response.ok) throw new Error('Failed to fetch transactions');
            
            const data = await response.json();
            const container = document.getElementById('recentActivity');
            
            if (!container) return;
            
            if (!data.pending_transactions || data.pending_transactions.length === 0) {
                container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: var(--space-8);">No recent activity</p>';
                return;
            }
            
            container.innerHTML = data.pending_transactions.slice(0, 5).map(tx => `
                <div style="padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: var(--gold-primary); font-weight: 600;">Transaction</span>
                        <span style="color: var(--text-secondary); font-size: 0.875rem;">${this.formatTimestamp(tx.timestamp)}</span>
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.875rem;">
                        From: <code>${tx.sender.substring(0, 10)}...</code><br>
                        To: <code>${tx.recipient.substring(0, 10)}...</code><br>
                        Amount: <strong>${tx.amount} ${tx.token || 'VRX'}</strong>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error updating recent activity:', error);
        }
    }
    
    initCharts() {
        // Blocks Chart
        const blocksCtx = document.getElementById('blocksChart');
        if (blocksCtx) {
            this.charts.blocks = new Chart(blocksCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Blocks',
                        data: [],
                        borderColor: '#FFD700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#999'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#999'
                            }
                        }
                    }
                }
            });
        }
        
        // Transactions Chart
        const txCtx = document.getElementById('transactionsChart');
        if (txCtx) {
            this.charts.transactions = new Chart(txCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Transactions',
                        data: [],
                        backgroundColor: 'rgba(255, 215, 0, 0.6)',
                        borderColor: '#FFD700',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#999',
                                stepSize: 1
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#999'
                            }
                        }
                    }
                }
            });
        }
    }
    
    updateBlocksChart(blocks) {
        if (!this.charts.blocks) return;
        
        const labels = blocks.map(b => `#${b.index}`);
        const data = blocks.map((b, idx) => idx + 1);
        
        this.charts.blocks.data.labels = labels;
        this.charts.blocks.data.datasets[0].data = data;
        this.charts.blocks.update('none'); // Sin animación para mejor performance
    }
    
    updateTransactionsChart(blocks) {
        if (!this.charts.transactions) return;
        
        const labels = blocks.map(b => `#${b.index}`);
        const data = blocks.map(b => b.transactions);
        
        this.charts.transactions.data.labels = labels;
        this.charts.transactions.data.datasets[0].data = data;
        this.charts.transactions.update('none');
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Animación de cambio
            element.style.transition = 'color 0.3s';
            element.style.color = '#FFD700';
            element.textContent = value;
            
            setTimeout(() => {
                element.style.color = '';
            }, 300);
        }
    }
    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    }
    
    startAutoRefresh() {
        console.log(`🔄 Auto-refresh enabled (every ${this.refreshInterval / 1000}s)`);
        
        this.intervalId = setInterval(() => {
            this.loadAllData();
        }, this.refreshInterval);
    }
    
    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏸️ Auto-refresh disabled');
        }
    }
    
    setupEventListeners() {
        // Botón de refresh manual
        const refreshBtn = document.querySelector('[onclick="refreshAll()"]');
        if (refreshBtn) {
            refreshBtn.onclick = (e) => {
                e.preventDefault();
                this.loadAllData();
            };
        }
        
        // Pausar actualización cuando la pestaña no está visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                this.startAutoRefresh();
                this.loadAllData();
            }
        });
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('alertContainer');
        if (!container) return;
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
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

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.realtimeDashboard = new RealtimeDashboard();
    });
} else {
    window.realtimeDashboard = new RealtimeDashboard();
}

// Función global para compatibilidad
function refreshAll() {
    if (window.realtimeDashboard) {
        window.realtimeDashboard.loadAllData();
    }
}
