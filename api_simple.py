"""
ORILUXCHAIN - API SIMPLE PARA DESARROLLO
API sin autenticación para integración con Veralix
"""

from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS
from blockchain import Blockchain
from node import Node
from wallet import Wallet
from jewelry_certification import JewelryCertificationSystem, JewelryItem, JewelryCertificate
import os

app = Flask(__name__)

# CORS permisivo para desarrollo
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

# Inicializar blockchain
blockchain = Blockchain(difficulty=4)
node = Node(blockchain)
wallet = Wallet()
jewelry_system = JewelryCertificationSystem(blockchain)

print("✅ Oriluxchain API Simple iniciada")
print("✅ Sistema de certificación de joyería listo")
print("⚠️  MODO DESARROLLO - Sin autenticación")

# ============================================================================
# LAYOUT BASE Y SISTEMA DE DISEÑO
# ============================================================================

def create_base_layout(title, content, active_tab='dashboard'):
    """
    Crea el layout base con header, navegación y sistema de diseño futurista.
    
    Args:
        title: Título de la página
        content: Contenido HTML del tab
        active_tab: Tab activo ('dashboard', 'blocks', 'transactions', 'certificates', 'network', 'explorer')
    """
    
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title} | Oriluxchain</title>
        <style>
            /* ============================================
               SISTEMA DE DISEÑO - Variables CSS
               ============================================ */
            :root {{
                /* Colores */
                --primary-bg: #000000;
                --secondary-bg: #0a0a0a;
                --surface: #111111;
                --surface-elevated: #1a1a1a;
                
                --primary-text: #ffffff;
                --secondary-text: #999999;
                --tertiary-text: #666666;
                
                --accent: #ffffff;
                --border: #222222;
                --border-hover: #333333;
                
                --success: #00ff00;
                --warning: #ffff00;
                --error: #ff0000;
                --info: #00ffff;
                
                /* Tipografía */
                --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
                --font-mono: 'SF Mono', 'Courier New', monospace;
                
                /* Espaciado */
                --space-1: 4px;
                --space-2: 8px;
                --space-3: 12px;
                --space-4: 16px;
                --space-6: 24px;
                --space-8: 32px;
                --space-12: 48px;
                --space-16: 64px;
            }}
            
            /* ============================================
               RESET Y BASE
               ============================================ */
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: var(--font-primary);
                background: var(--primary-bg);
                color: var(--primary-text);
                line-height: 1.5;
                -webkit-font-smoothing: antialiased;
            }}
            
            /* ============================================
               HEADER
               ============================================ */
            .header {{
                background: var(--primary-bg);
                border-bottom: 1px solid var(--border);
                position: sticky;
                top: 0;
                z-index: 1000;
            }}
            
            .header-content {{
                max-width: 1400px;
                margin: 0 auto;
                padding: var(--space-4) var(--space-8);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            
            /* Logo */
            .logo {{
                display: flex;
                align-items: center;
                gap: var(--space-3);
                text-decoration: none;
            }}
            
            .logo-icon {{
                width: 32px;
                height: 32px;
            }}
            
            .logo-text {{
                font-size: 20px;
                font-weight: 700;
                letter-spacing: -0.5px;
                color: var(--primary-text);
            }}
            
            /* Network Status */
            .network-status {{
                display: flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2) var(--space-4);
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 20px;
                font-size: 12px;
                color: var(--secondary-text);
            }}
            
            .status-dot {{
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--success);
                animation: pulse 2s ease-in-out infinite;
            }}
            
            @keyframes pulse {{
                0%, 100% {{ opacity: 1; }}
                50% {{ opacity: 0.5; }}
            }}
            
            /* ============================================
               NAVIGATION
               ============================================ */
            .nav {{
                background: var(--primary-bg);
                border-bottom: 1px solid var(--border);
            }}
            
            .nav-content {{
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 var(--space-8);
                display: flex;
                gap: var(--space-2);
            }}
            
            .nav-link {{
                padding: var(--space-4) var(--space-6);
                color: var(--secondary-text);
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                border-bottom: 2px solid transparent;
                transition: all 0.2s ease;
                position: relative;
            }}
            
            .nav-link:hover {{
                color: var(--primary-text);
            }}
            
            .nav-link.active {{
                color: var(--primary-text);
                border-bottom-color: var(--primary-text);
            }}
            
            /* ============================================
               MAIN CONTENT
               ============================================ */
            .main {{
                max-width: 1400px;
                margin: 0 auto;
                padding: var(--space-8);
                min-height: calc(100vh - 120px);
            }}
            
            /* ============================================
               COMPONENTES REUTILIZABLES
               ============================================ */
            
            /* Cards */
            .card {{
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: var(--space-6);
                transition: all 0.2s ease;
            }}
            
            .card:hover {{
                border-color: var(--border-hover);
            }}
            
            /* Buttons */
            .btn {{
                padding: var(--space-3) var(--space-6);
                background: transparent;
                border: 1px solid var(--primary-text);
                color: var(--primary-text);
                font-size: 14px;
                font-weight: 500;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-block;
            }}
            
            .btn:hover {{
                background: var(--primary-text);
                color: var(--primary-bg);
            }}
            
            .btn-sm {{
                padding: var(--space-2) var(--space-4);
                font-size: 12px;
            }}
            
            /* Stats Grid */
            .stats-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: var(--space-6);
                margin-bottom: var(--space-8);
            }}
            
            .stat-card {{
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: var(--space-6);
                transition: all 0.2s ease;
            }}
            
            .stat-card:hover {{
                border-color: var(--border-hover);
                transform: translateY(-2px);
            }}
            
            .stat-label {{
                font-size: 12px;
                color: var(--secondary-text);
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: var(--space-2);
            }}
            
            .stat-value {{
                font-size: 32px;
                font-weight: 700;
                color: var(--primary-text);
                margin-bottom: var(--space-1);
            }}
            
            .stat-change {{
                font-size: 12px;
                color: var(--success);
            }}
            
            /* Table */
            .table {{
                width: 100%;
                border-collapse: collapse;
            }}
            
            .table th {{
                text-align: left;
                padding: var(--space-4);
                font-size: 12px;
                color: var(--secondary-text);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid var(--border);
            }}
            
            .table td {{
                padding: var(--space-4);
                border-bottom: 1px solid var(--border);
                color: var(--primary-text);
                font-size: 14px;
            }}
            
            .table tr:hover {{
                background: var(--surface);
            }}
            
            /* Hash/Mono */
            .hash {{
                font-family: var(--font-mono);
                font-size: 13px;
                color: var(--secondary-text);
            }}
            
            /* Badge */
            .badge {{
                display: inline-block;
                padding: var(--space-1) var(--space-3);
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-radius: 4px;
                border: 1px solid;
            }}
            
            .badge-success {{
                color: var(--success);
                border-color: var(--success);
            }}
            
            .badge-warning {{
                color: var(--warning);
                border-color: var(--warning);
            }}
            
            .badge-error {{
                color: var(--error);
                border-color: var(--error);
            }}
            
            /* Section */
            .section {{
                margin-bottom: var(--space-12);
            }}
            
            .section-header {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-6);
            }}
            
            .section-title {{
                font-size: 24px;
                font-weight: 700;
                color: var(--primary-text);
            }}
            
            /* Empty State */
            .empty-state {{
                text-align: center;
                padding: var(--space-16);
                color: var(--tertiary-text);
            }}
            
            .empty-icon {{
                font-size: 48px;
                margin-bottom: var(--space-4);
                opacity: 0.3;
            }}
        </style>
    </head>
    <body>
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <a href="/" class="logo">
                    <svg class="logo-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="shine-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                                <stop offset="50%" style="stop-color:#ddd;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#fff;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <polygon points="50,10 85,40 50,90 15,40" fill="url(#shine-gradient)" />
                        <polygon points="50,10 65,30 50,40" fill="#fff" opacity="0.9"/>
                        <polygon points="50,10 35,30 50,40" fill="#fff" opacity="0.7"/>
                        <polygon points="50,40 65,30 75,60" fill="#ddd" opacity="0.8"/>
                        <polygon points="50,40 35,30 25,60" fill="#eee" opacity="0.8"/>
                        <line x1="50" y1="10" x2="50" y2="40" stroke="#000" stroke-width="1" opacity="0.3"/>
                        <line x1="35" y1="30" x2="65" y2="30" stroke="#000" stroke-width="0.5" opacity="0.2"/>
                    </svg>
                    <span class="logo-text">ORILUX</span>
                </a>
                
                <div class="network-status">
                    <span class="status-dot"></span>
                    <span>Network Live</span>
                </div>
            </div>
        </header>
        
        <!-- Navigation -->
        <nav class="nav">
            <div class="nav-content">
                <a href="/" class="nav-link {'active' if active_tab == 'dashboard' else ''}">Dashboard</a>
                <a href="/blocks" class="nav-link {'active' if active_tab == 'blocks' else ''}">Blocks</a>
                <a href="/transactions" class="nav-link {'active' if active_tab == 'transactions' else ''}">Transactions</a>
                <a href="/certificates" class="nav-link {'active' if active_tab == 'certificates' else ''}">Certificates</a>
                <a href="/dual-verification" class="nav-link {'active' if active_tab == 'dual-verification' else ''}">Dual Verification</a>
                <a href="/network" class="nav-link {'active' if active_tab == 'network' else ''}">Network</a>
                <a href="/explorer" class="nav-link {'active' if active_tab == 'explorer' else ''}">Explorer</a>
            </div>
        </nav>
        
        <!-- Main Content -->
        <main class="main">
            {content}
        </main>
    </body>
    </html>
    """

# ============================================================================
# BLOCKCHAIN EXPLORER (WEB UI)
# ============================================================================

@app.route('/explorer/<certificate_id>')
def explorer(certificate_id):
    """Visualizador gráfico de Blockchain (Block Explorer)"""
    # Obtener datos
    history = jewelry_system.get_certificate_history(certificate_id)
    try:
        verify_result = jewelry_system.verify_certificate(certificate_id)
        if verify_result and verify_result.get('valid'):
            raw_cert = verify_result.get('certificate')
            # Mapear al formato esperado por el template
            cert_dict = {
                'id': raw_cert.get('certificate_id'),
                'item_id': raw_cert.get('item', 'N/A'),
                'owner': raw_cert.get('owner'),
                'is_active': raw_cert.get('status', 'active'),
                'current_holder': raw_cert.get('owner'),
                'item_hash': raw_cert.get('nft_token_id', 'N/A')
            }
        else:
            cert_dict = None
    except Exception as e:
        print(f"Error getting certificate: {e}")
        cert_dict = None

    # Template HTML embebido (Estilo Dark Cyberpunk)
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Oriluxchain Explorer | {{ cert.id if cert else 'Not Found' }}</title>
        <style>
            body { font-family: 'Segoe UI', 'Courier New', monospace; background: #0f172a; color: #e2e8f0; padding: 0; margin: 0; }
            .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
            .header { border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
            .logo { color: #00ff9d; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
            .badge { background: #334155; padding: 5px 10px; border-radius: 4px; font-size: 0.8em; }
            
            .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); }
            h2 { margin-top: 0; color: #fff; font-size: 1.2em; border-bottom: 1px solid #334155; padding-bottom: 10px; }
            
            .row { display: flex; margin-bottom: 10px; }
            .label { width: 140px; color: #94a3b8; font-weight: 600; }
            .value { flex: 1; color: #f8fafc; word-break: break-all; }
            .hash { font-family: 'Courier New', monospace; color: #00ff9d; }
            
            .timeline { position: relative; padding-left: 30px; margin-top: 30px; }
            .timeline::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #334155; }
            .event { position: relative; margin-bottom: 30px; }
            .event::before { content: ''; position: absolute; left: -35px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #00ff9d; border: 2px solid #0f172a; }
            
            .status-verified { color: #00ff9d; }
            .btn { display: inline-block; background: #00ff9d; color: #0f172a; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
            .btn:hover { background: #00cc7d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">⛓️ Oriluxchain Explorer</div>
                <div class="badge">Mainnet Beta</div>
            </div>

            {% if cert %}
            <div class="card">
                <h2>💎 Digital Asset Details</h2>
                <div class="row"><span class="label">Certificate ID:</span> <span class="value">{{ cert.id }}</span></div>
                <div class="row"><span class="label">Item ID:</span> <span class="value">{{ cert.item_id }}</span></div>
                <div class="row"><span class="label">Owner:</span> <span class="value">{{ cert.owner }}</span></div>
                <div class="row"><span class="label">Status:</span> <span class="value status-verified">✔ {{ cert.is_active }}</span></div>
                <div class="row"><span class="label">Current Holder:</span> <span class="value">{{ cert.current_holder }}</span></div>
                <div class="row"><span class="label">Metadata Hash:</span> <span class="value hash">{{ cert.item_hash }}</span></div>
            </div>

            <h3>📜 Chain of Custody (Immutable History)</h3>
            <div class="timeline">
                {% for event in history %}
                <div class="event">
                    <div class="timestamp" style="color: #64748b; font-size: 0.9em; margin-bottom: 5px;">{{ event.timestamp }}</div>
                    <div class="card" style="margin-bottom: 0;">
                        <div class="row"><span class="label">Action:</span> <span class="value" style="text-transform: uppercase; font-weight: bold;">{{ event.action }}</span></div>
                        <div class="row"><span class="label">Tx Hash:</span> <span class="value hash">{{ event.tx_hash }}</span></div>
                        <div class="row"><span class="label">Block Height:</span> <span class="value">#{{ event.block_index }}</span></div>
                        <div class="row"><span class="label">Actor:</span> <span class="value">{{ event.actor }}</span></div>
                        {% if event.details %}
                        <div class="row"><span class="label">Details:</span> <span class="value">{{ event.details }}</span></div>
                        {% endif %}
                    </div>
                </div>
                {% endfor %}
            </div>
            
            <div style="text-align: center; margin-top: 50px; color: #64748b;">
                <p>🔒 Cryptographically secured by Oriluxchain Proof-of-Work</p>
                <p>Node: novella-nonmiscible-thatcher</p>
            </div>

            {% else %}
            <div class="card">
                <h2>❌ Certificate Not Found</h2>
                <p>The requested certificate ID does not exist in the current blockchain state.</p>
            </div>
            {% endif %}
        </div>
    </body>
    </html>
    """
    return render_template_string(html, cert=cert_dict, history=history)

@app.route('/dashboard')
def dashboard():
    """Dashboard profesional tipo DEX para visualizar todo el historial de Veralix en Oriluxchain"""
    
    # Obtener estadísticas
    total_blocks = len(blockchain.chain)
    total_transactions = sum(len(block.transactions) for block in blockchain.chain)
    pending_transactions = len(blockchain.pending_transactions)
    
    # Obtener todos los certificados
    all_certificates = jewelry_system.get_statistics()
    
    # Preparar datos de bloques (más recientes primero)
    blocks_data = []
    for block in reversed(blockchain.chain):
        blocks_data.append({
            'index': block.index,
            'timestamp': block.timestamp,
            'hash': block.hash,
            'previous_hash': block.previous_hash,
            'proof': block.proof,
            'transactions': block.transactions,
            'tx_count': len(block.transactions)
        })
    
    # Template HTML del Dashboard
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Oriluxchain Dashboard | Veralix Network</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                color: #e2e8f0; 
                padding: 0; 
                margin: 0;
                min-height: 100vh;
            }
            
            /* Header */
            .header {
                background: rgba(26, 26, 46, 0.8);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                padding: 20px 40px;
                position: sticky;
                top: 0;
                z-index: 100;
            }
            .header-content {
                max-width: 1400px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .logo {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .logo-icon {
                font-size: 32px;
            }
            .logo-text {
                font-size: 24px;
                font-weight: 700;
                background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .network-badge {
                background: rgba(212, 175, 55, 0.1);
                border: 1px solid rgba(212, 175, 55, 0.3);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                color: #d4af37;
                font-weight: 600;
            }
            
            /* Container */
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 40px 40px 80px;
            }
            
            /* Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }
            .stat-card {
                background: rgba(30, 41, 59, 0.6);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s ease;
            }
            .stat-card:hover {
                transform: translateY(-4px);
                border-color: rgba(212, 175, 55, 0.5);
                box-shadow: 0 8px 24px rgba(212, 175, 55, 0.15);
            }
            .stat-label {
                font-size: 14px;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
            }
            .stat-value {
                font-size: 36px;
                font-weight: 700;
                color: #d4af37;
                margin-bottom: 4px;
            }
            .stat-change {
                font-size: 12px;
                color: #10b981;
            }
            
            /* Section */
            .section {
                margin-bottom: 40px;
            }
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .section-title {
                font-size: 24px;
                font-weight: 700;
                color: #fff;
            }
            
            /* Blocks List */
            .blocks-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .block-card {
                background: rgba(30, 41, 59, 0.6);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(51, 65, 85, 0.5);
                border-radius: 12px;
                padding: 24px;
                transition: all 0.3s ease;
            }
            .block-card:hover {
                border-color: rgba(212, 175, 55, 0.5);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1);
            }
            .block-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(51, 65, 85, 0.5);
            }
            .block-number {
                font-size: 20px;
                font-weight: 700;
                color: #d4af37;
            }
            .block-time {
                font-size: 14px;
                color: #94a3b8;
            }
            .block-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 16px;
            }
            .info-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .info-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .info-value {
                font-size: 14px;
                color: #e2e8f0;
                font-family: 'Courier New', monospace;
                word-break: break-all;
            }
            .hash {
                color: #10b981;
            }
            
            /* Transactions */
            .transactions {
                margin-top: 16px;
            }
            .tx-header {
                font-size: 14px;
                font-weight: 600;
                color: #94a3b8;
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .tx-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .tx-item {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(51, 65, 85, 0.3);
                border-radius: 8px;
                padding: 12px 16px;
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: 16px;
                align-items: center;
                font-size: 13px;
            }
            .tx-type {
                background: rgba(212, 175, 55, 0.1);
                color: #d4af37;
                padding: 4px 12px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .tx-details {
                color: #94a3b8;
                font-family: 'Courier New', monospace;
            }
            .tx-amount {
                color: #10b981;
                font-weight: 600;
            }
            
            /* Empty State */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #64748b;
            }
            .empty-icon {
                font-size: 64px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            
            /* Refresh Button */
            .refresh-btn {
                background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%);
                color: #0a0a0a;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .refresh-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="header-content">
                <div class="logo">
                    <span class="logo-icon">⛓️</span>
                    <span class="logo-text">ORILUXCHAIN</span>
                </div>
                <div class="network-badge">
                    🟢 Veralix Network • Live
                </div>
            </div>
        </div>
        
        <div class="container">
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Blocks</div>
                    <div class="stat-value">{{ total_blocks }}</div>
                    <div class="stat-change">↗ Active Chain</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Transactions</div>
                    <div class="stat-value">{{ total_transactions }}</div>
                    <div class="stat-change">↗ All Time</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Pending Transactions</div>
                    <div class="stat-value">{{ pending_transactions }}</div>
                    <div class="stat-change">⏳ Mempool</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Certificates Issued</div>
                    <div class="stat-value">{{ all_certificates.total_certificates }}</div>
                    <div class="stat-change">✓ Verified</div>
                </div>
            </div>
            
            <!-- Blocks Section -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">📦 Recent Blocks</h2>
                    <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
                </div>
                
                <div class="blocks-list">
                    {% if blocks_data %}
                        {% for block in blocks_data %}
                        <div class="block-card">
                            <div class="block-header">
                                <div class="block-number">Block #{{ block.index }}</div>
                                <div class="block-time">{{ block.timestamp | int }} seconds ago</div>
                            </div>
                            
                            <div class="block-info">
                                <div class="info-item">
                                    <div class="info-label">Block Hash</div>
                                    <div class="info-value hash">{{ block.hash[:16] }}...{{ block.hash[-8:] }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Previous Hash</div>
                                    <div class="info-value">{{ block.previous_hash[:16] }}...{{ block.previous_hash[-8:] if block.previous_hash != '0' else '0' }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Proof (Nonce)</div>
                                    <div class="info-value">{{ block.proof }}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Transactions</div>
                                    <div class="info-value">{{ block.tx_count }} tx</div>
                                </div>
                            </div>
                            
                            {% if block.transactions %}
                            <div class="transactions">
                                <div class="tx-header">Transactions ({{ block.tx_count }})</div>
                                <div class="tx-list">
                                    {% for tx in block.transactions %}
                                    <div class="tx-item">
                                        <div class="tx-type">
                                            {% if tx.data and tx.data.type %}
                                                {{ tx.data.type.replace('jewelry_', '').replace('_', ' ').title() }}
                                            {% else %}
                                                Transfer
                                            {% endif %}
                                        </div>
                                        <div class="tx-details">
                                            {{ tx.sender[:12] }}... → {{ tx.recipient[:12] }}...
                                            {% if tx.data and tx.data.certificate_id %}
                                            • <a href="/explorer/{{ tx.data.certificate_id }}" style="color: #d4af37; text-decoration: none;">{{ tx.data.certificate_id }}</a>
                                            {% endif %}
                                        </div>
                                        <div class="tx-amount">{{ tx.amount }} {{ tx.token }}</div>
                                    </div>
                                    {% endfor %}
                                </div>
                            </div>
                            {% endif %}
                        </div>
                        {% endfor %}
                    {% else %}
                        <div class="empty-state">
                            <div class="empty-icon">📭</div>
                            <div>No blocks mined yet. Start by creating a certificate in Veralix!</div>
                        </div>
                    {% endif %}
                </div>
            </div>
        </div>
        
        <script>
            // Auto-refresh every 30 seconds
            setTimeout(() => location.reload(), 30000);
        </script>
    </body>
    </html>
    """
    
    return render_template_string(
        html, 
        total_blocks=total_blocks,
        total_transactions=total_transactions,
        pending_transactions=pending_transactions,
        all_certificates=all_certificates,
        blocks_data=blocks_data
    )

# ============================================================================
# ENDPOINTS DE BLOCKCHAIN
# ============================================================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Estadísticas de la blockchain"""
    return jsonify({
        'success': True,
        'blocks': len(blockchain.chain),
        'transactions': len(blockchain.pending_transactions),
        'difficulty': blockchain.difficulty,
        'nodes': len(node.peers)
    }), 200

@app.route('/api/chain', methods=['GET'])
def get_chain():
    """Obtiene la cadena completa"""
    chain_data = []
    for block in blockchain.chain:
        chain_data.append({
            'index': block.index,
            'timestamp': block.timestamp,
            'transactions': block.transactions,
            'previous_hash': block.previous_hash,
            'hash': block.hash,
            'nonce': block.proof
        })
    
    return jsonify({
        'success': True,
        'length': len(chain_data),
        'chain': chain_data
    }), 200

# ============================================================================
# ENDPOINTS DE CERTIFICACIÓN DE JOYERÍA
# ============================================================================

@app.route('/api/jewelry/certify', methods=['POST'])
def certify_jewelry():
    """Crea un nuevo certificado de joyería"""
    try:
        data = request.get_json()
        
        print(f"📝 Creando certificado para: {data.get('item_id')}")
        
        # Crear item de joyería
        item = JewelryItem(
            item_id=data.get('item_id'),
            jewelry_type=data.get('jewelry_type', 'ring'),
            material=data.get('material', 'gold'),
            purity=data.get('purity', '18k'),
            weight=float(data.get('weight', 0)),
            stones=data.get('stones', []),
            jeweler=data.get('jeweler', 'Veralix'),
            manufacturer=data.get('manufacturer', 'Unknown'),
            origin_country=data.get('origin_country', 'Colombia'),
            creation_date=data.get('creation_date', ''),
            description=data.get('description', ''),
            images=data.get('images', []),
            estimated_value=float(data.get('estimated_value', 0))
        )
        
        # Crear certificado
        certificate = jewelry_system.create_certificate(
            item=item,
            owner=data.get('owner', wallet.address),
            issuer=data.get('issuer', 'Veralix System')
        )
        
        print(f"✅ Certificado creado: {certificate.certificate_id}")
        print(f"📝 TX Hash: {certificate.blockchain_tx}")
        
        return jsonify({
            'success': True,
            'certificate_id': certificate.certificate_id,
            'blockchain_tx': certificate.blockchain_tx,
            'qr_code': certificate.qr_code,
            'verification_url': certificate.verification_url,
            'certificate': certificate.to_dict()
        }), 201
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/jewelry/verify/<certificate_id>', methods=['GET'])
def verify_jewelry(certificate_id):
    """Verifica un certificado de joyería"""
    result = jewelry_system.verify_certificate(certificate_id)
    
    if result:
        return jsonify({
            'success': True,
            'certificate_id': certificate_id,
            'valid': result['valid'],
            'certificate': result['certificate'],
            'verification_date': result['verification_date']
        }), 200
    else:
        return jsonify({
            'success': False,
            'error': 'Certificado no encontrado'
        }), 404

@app.route('/api/jewelry/nft/<certificate_id>', methods=['POST'])
def create_jewelry_nft(certificate_id):
    """Crea un NFT para una joya certificada"""
    try:
        nft_token_id = jewelry_system.create_nft(certificate_id)
        
        if nft_token_id:
            print(f"🎨 NFT creado: {nft_token_id}")
            return jsonify({
                'success': True,
                'nft_token_id': nft_token_id,
                'certificate_id': certificate_id
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudo crear el NFT'
            }), 400
    except Exception as e:
        print(f"❌ Error creando NFT: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/jewelry/history/<certificate_id>', methods=['GET'])
def jewelry_history(certificate_id):
    """Obtiene el historial completo de un certificado"""
    history = jewelry_system.get_certificate_history(certificate_id)
    
    return jsonify({
        'success': True,
        'certificate_id': certificate_id,
        'history': history
    }), 200

@app.route('/api/jewelry/transfer', methods=['POST'])
def transfer_jewelry():
    """Transfiere la propiedad de una joya certificada"""
    try:
        data = request.get_json()
        
        success = jewelry_system.transfer_ownership(
            certificate_id=data.get('certificate_id'),
            new_owner=data.get('new_owner'),
            current_owner=data.get('current_owner')
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Transferencia exitosa',
                'certificate_id': data.get('certificate_id'),
                'new_owner': data.get('new_owner')
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudo transferir el certificado'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/jewelry/stats', methods=['GET'])
def jewelry_stats():
    """Obtiene estadísticas del sistema de certificación"""
    stats = jewelry_system.get_statistics()
    
    return jsonify({
        'success': True,
        'stats': stats
    }), 200

@app.route('/api/jewelry/owner/<owner>', methods=['GET'])
def owner_certificates(owner):
    """Obtiene todos los certificados de un propietario"""
    certificates = jewelry_system.get_owner_certificates(owner)
    
    return jsonify({
        'success': True,
        'owner': owner,
        'count': len(certificates),
        'certificates': [cert.to_dict() for cert in certificates]
    }), 200

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'Oriluxchain API',
        'version': '1.0.0',
        'jewelry_system': 'active'
    }), 200

@app.route('/', methods=['GET'])
def index():
    """Dashboard principal - Vista general de Oriluxchain"""
    
    # Obtener estadísticas
    total_blocks = len(blockchain.chain)
    total_transactions = sum(len(block.transactions) for block in blockchain.chain)
    pending_transactions = len(blockchain.pending_transactions)
    all_certificates = jewelry_system.get_statistics()
    
    # Obtener bloques recientes (últimos 5)
    recent_blocks = []
    for block in reversed(blockchain.chain[-5:]):
        recent_blocks.append({
            'index': block.index,
            'timestamp': block.timestamp,
            'hash': block.hash,
            'tx_count': len(block.transactions)
        })
    
    # Obtener transacciones recientes (últimas 10)
    recent_transactions = []
    for block in reversed(blockchain.chain):
        for tx in reversed(block.transactions):
            if len(recent_transactions) >= 10:
                break
            recent_transactions.append({
                'sender': tx['sender'],
                'recipient': tx['recipient'],
                'amount': tx['amount'],
                'token': tx['token'],
                'type': tx.get('data', {}).get('type', 'transfer') if isinstance(tx.get('data'), dict) else 'transfer',
                'certificate_id': tx.get('data', {}).get('certificate_id') if isinstance(tx.get('data'), dict) else None
            })
        if len(recent_transactions) >= 10:
            break
    
    # Contenido del dashboard
    content = f"""
    <div class="section">
        <h1 class="section-title">Dashboard</h1>
    </div>
    
    <!-- Stats Grid -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-label">Total Blocks</div>
            <div class="stat-value">{total_blocks}</div>
            <div class="stat-change">↗ Active Chain</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Transactions</div>
            <div class="stat-value">{total_transactions}</div>
            <div class="stat-change">↗ All Time</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Pending Transactions</div>
            <div class="stat-value">{pending_transactions}</div>
            <div class="stat-change">⏳ Mempool</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Certificates Issued</div>
            <div class="stat-value">{all_certificates['total_certificates']}</div>
            <div class="stat-change">✓ Verified</div>
        </div>
    </div>
    
    <!-- Recent Blocks -->
    <div class="section">
        <div class="section-header">
            <h2 class="section-title">Recent Blocks</h2>
            <a href="/blocks" class="btn btn-sm">View All</a>
        </div>
        
        {'<table class="table"><thead><tr><th>Block</th><th>Hash</th><th>Transactions</th><th>Time</th></tr></thead><tbody>' if recent_blocks else ''}
        {''.join([f'''
            <tr>
                <td><span class="badge badge-success">#{block['index']}</span></td>
                <td><span class="hash">{block['hash'][:16]}...{block['hash'][-8:]}</span></td>
                <td>{block['tx_count']} tx</td>
                <td>{int(block['timestamp'])}s ago</td>
            </tr>
        ''' for block in recent_blocks])}
        {'</tbody></table>' if recent_blocks else '<div class="empty-state"><div class="empty-icon">📦</div><div>No blocks mined yet</div></div>'}
    </div>
    
    <!-- Recent Transactions -->
    <div class="section">
        <div class="section-header">
            <h2 class="section-title">Recent Transactions</h2>
            <a href="/transactions" class="btn btn-sm">View All</a>
        </div>
        
        {'<table class="table"><thead><tr><th>Type</th><th>From → To</th><th>Amount</th><th>Certificate</th></tr></thead><tbody>' if recent_transactions else ''}
        {''.join([f'''
            <tr>
                <td><span class="badge badge-success">{tx['type'].replace('jewelry_', '').replace('_', ' ').title()}</span></td>
                <td><span class="hash">{tx['sender'][:12]}... → {tx['recipient'][:12]}...</span></td>
                <td>{tx['amount']} {tx['token']}</td>
                <td>{'<a href="/explorer/' + tx['certificate_id'] + '" style="color: var(--primary-text);">' + tx['certificate_id'] + '</a>' if tx['certificate_id'] else '-'}</td>
            </tr>
        ''' for tx in recent_transactions])}
        {'</tbody></table>' if recent_transactions else '<div class="empty-state"><div class="empty-icon">💳</div><div>No transactions yet</div></div>'}
    </div>
    """
    
    return create_base_layout('Dashboard', content, 'dashboard')

@app.route('/blocks')
def blocks_page():
    """Tab de Blocks - Lista completa de bloques de la blockchain"""
    
    # Obtener todos los bloques (más recientes primero)
    all_blocks = []
    for block in reversed(blockchain.chain):
        all_blocks.append({
            'index': block.index,
            'timestamp': block.timestamp,
            'hash': block.hash,
            'previous_hash': block.previous_hash,
            'proof': block.proof,
            'transactions': block.transactions,
            'tx_count': len(block.transactions)
        })
    
    # Contenido del tab Blocks
    content = f"""
    <div class="section">
        <div class="section-header">
            <h1 class="section-title">Blocks</h1>
            <div style="display: flex; gap: var(--space-4); align-items: center;">
                <span style="color: var(--secondary-text); font-size: 14px;">
                    {len(all_blocks)} blocks in chain
                </span>
                <button class="btn btn-sm" onclick="location.reload()">🔄 Refresh</button>
            </div>
        </div>
        
        {''.join([f'''
        <div class="card" style="margin-bottom: var(--space-6);">
            <!-- Block Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-4); border-bottom: 1px solid var(--border);">
                <div>
                    <h3 style="font-size: 20px; font-weight: 700; color: var(--primary-text); margin-bottom: var(--space-1);">
                        Block #{block['index']}
                    </h3>
                    <span style="color: var(--secondary-text); font-size: 12px;">
                        {int(block['timestamp'])} seconds ago
                    </span>
                </div>
                <span class="badge badge-success">{block['tx_count']} Transactions</span>
            </div>
            
            <!-- Block Info Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-6);">
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--space-2);">
                        Block Hash
                    </div>
                    <div class="hash" style="word-break: break-all;">
                        {block['hash']}
                    </div>
                </div>
                
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--space-2);">
                        Previous Hash
                    </div>
                    <div class="hash" style="word-break: break-all;">
                        {block['previous_hash'] if block['previous_hash'] != '0' else 'Genesis Block'}
                    </div>
                </div>
                
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--space-2);">
                        Proof (Nonce)
                    </div>
                    <div style="font-family: var(--font-mono); color: var(--primary-text);">
                        {block['proof']}
                    </div>
                </div>
                
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--space-2);">
                        Timestamp
                    </div>
                    <div style="font-family: var(--font-mono); color: var(--primary-text);">
                        {block['timestamp']}
                    </div>
                </div>
            </div>
            
            <!-- Transactions -->
            {f"""
            <div>
                <div style="font-size: 14px; font-weight: 600; color: var(--primary-text); margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border);">
                    Transactions ({block['tx_count']})
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                    {''.join([f'''
                    <div style="background: var(--primary-bg); border: 1px solid var(--border); border-radius: 4px; padding: var(--space-4); display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-4); align-items: center;">
                        <span class="badge badge-success" style="font-size: 10px;">
                            {tx.get('data', {}).get('type', 'transfer').replace('jewelry_', '').replace('_', ' ').title() if isinstance(tx.get('data'), dict) else 'Transfer'}
                        </span>
                        <div class="hash" style="font-size: 12px;">
                            {tx['sender'][:16]}... → {tx['recipient'][:16]}...
                            {f'<br><a href="/explorer/{tx.get("data", {}).get("certificate_id")}" style="color: var(--primary-text); text-decoration: underline;">{tx.get("data", {}).get("certificate_id")}</a>' if isinstance(tx.get('data'), dict) and tx.get('data', {}).get('certificate_id') else ''}
                        </div>
                        <span style="color: var(--success); font-weight: 600; font-size: 14px;">
                            {tx['amount']} {tx['token']}
                        </span>
                    </div>
                    ''' for tx in block['transactions']])}
                </div>
            </div>
            """ if block['tx_count'] > 0 else '<div style="text-align: center; padding: var(--space-8); color: var(--tertiary-text);">No transactions in this block</div>'}
        </div>
        ''' for block in all_blocks]) if all_blocks else '<div class="empty-state"><div class="empty-icon">📦</div><div>No blocks mined yet</div></div>'}
    </div>
    
    <style>
        /* Animación suave para las cards */
        .card {{
            animation: fadeIn 0.3s ease-in-out;
        }}
        
        @keyframes fadeIn {{
            from {{
                opacity: 0;
                transform: translateY(10px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
    </style>
    """
    
    return create_base_layout('Blocks', content, 'blocks')

@app.route('/transactions')
def transactions_page():
    """Tab de Transactions - Historial completo de transacciones"""
    
    # Obtener todas las transacciones (más recientes primero)
    all_transactions = []
    for block in reversed(blockchain.chain):
        for tx in reversed(block.transactions):
            tx_copy = tx.copy()
            tx_copy['block_index'] = block.index
            tx_copy['block_timestamp'] = block.timestamp
            all_transactions.append(tx_copy)
    
    # Generar filas de la tabla
    rows_html = ""
    for tx in all_transactions:
        tx_type = 'Transfer'
        cert_id = None
        if isinstance(tx.get('data'), dict):
            tx_type = tx['data'].get('type', 'transfer').replace('jewelry_', '').replace('_', ' ').title()
            cert_id = tx['data'].get('certificate_id')
        
        cert_link = f'<a href="/explorer/{cert_id}" style="color: var(--primary-text);">{cert_id}</a>' if cert_id else '-'
        
        rows_html += f'''
        <tr>
            <td><span class="hash">{tx['hash'][:10]}...{tx['hash'][-6:]}</span></td>
            <td><a href="/blocks" style="color: var(--primary-text);">#{tx['block_index']}</a></td>
            <td><span class="badge badge-success">{tx_type}</span></td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span class="hash">{tx['sender'][:14]}...</span>
                    <span style="color: var(--tertiary-text);">↓</span>
                    <span class="hash">{tx['recipient'][:14]}...</span>
                </div>
            </td>
            <td style="font-weight: 600; color: var(--success);">{tx['amount']}</td>
            <td>{tx['token']}</td>
            <td>{cert_link}</td>
        </tr>
        '''
    
    if not rows_html:
        rows_html = '<tr><td colspan="7" style="text-align: center; padding: var(--space-8); color: var(--tertiary-text);">No transactions yet</td></tr>'
    
    content = f"""
    <div class="section">
        <div class="section-header">
            <h1 class="section-title">Transactions</h1>
            <div style="display: flex; gap: var(--space-4); align-items: center;">
                <span style="color: var(--secondary-text); font-size: 14px;">
                    {len(all_transactions)} transactions
                </span>
                <button class="btn btn-sm" onclick="location.reload()">↻ Refresh</button>
            </div>
        </div>
        
        <!-- Tabla de Transacciones -->
        <div class="card" style="padding: 0; overflow: hidden;">
            <table class="table">
                <thead>
                    <tr>
                        <th>Tx Hash</th>
                        <th>Block</th>
                        <th>Type</th>
                        <th>From / To</th>
                        <th>Value</th>
                        <th>Token</th>
                        <th>Certificate</th>
                    </tr>
                </thead>
                <tbody>
                    {rows_html}
                </tbody>
            </table>
        </div>
    </div>
    """
    
    return create_base_layout('Transactions', content, 'transactions')

@app.route('/certificates')
def certificates_page():
    """Tab de Certificates - Grid de certificados de joyería"""
    
    # Obtener todos los certificados
    all_certs = jewelry_system.certificates
    stats = jewelry_system.get_statistics()
    
    # Generar cards de certificados
    cards_html = ""
    for cert_id, cert in all_certs.items():
        status_badge = 'badge-success' if cert.is_active else 'badge-error'
        status_text = 'Active' if cert.is_active else 'Inactive'
        
        cards_html += f'''
        <a href="/explorer/{cert_id}" class="cert-card">
            <div class="cert-header">
                <span class="cert-id">{cert_id}</span>
                <span class="badge {status_badge}">{status_text}</span>
            </div>
            <div class="cert-body">
                <div class="cert-item">
                    <span class="cert-label">Item</span>
                    <span class="cert-value">{cert.item.name}</span>
                </div>
                <div class="cert-item">
                    <span class="cert-label">Type</span>
                    <span class="cert-value">{cert.item.item_type}</span>
                </div>
                <div class="cert-item">
                    <span class="cert-label">Material</span>
                    <span class="cert-value">{cert.item.material}</span>
                </div>
                <div class="cert-item">
                    <span class="cert-label">Owner</span>
                    <span class="cert-value hash">{cert.current_holder[:16]}...</span>
                </div>
            </div>
            <div class="cert-footer">
                <span>View Details →</span>
            </div>
        </a>
        '''
    
    if not cards_html:
        cards_html = '''
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">💎</div>
            <div>No certificates issued yet</div>
            <p style="margin-top: var(--space-4); color: var(--tertiary-text);">
                Certificates will appear here when jewelry items are certified on the blockchain.
            </p>
        </div>
        '''
    
    content = f"""
    <div class="section">
        <div class="section-header">
            <h1 class="section-title">Certificates</h1>
            <div style="display: flex; gap: var(--space-4); align-items: center;">
                <span style="color: var(--secondary-text); font-size: 14px;">
                    {stats['total_certificates']} certificates issued
                </span>
                <button class="btn btn-sm" onclick="location.reload()">↻ Refresh</button>
            </div>
        </div>
        
        <!-- Stats -->
        <div class="stats-grid" style="margin-bottom: var(--space-8);">
            <div class="stat-card">
                <div class="stat-label">Total Certificates</div>
                <div class="stat-value">{stats['total_certificates']}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Active</div>
                <div class="stat-value" style="color: var(--success);">{stats['active_certificates']}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Lost/Stolen</div>
                <div class="stat-value">{stats['lost_or_stolen']}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Unique Owners</div>
                <div class="stat-value">{stats['unique_owners']}</div>
            </div>
        </div>
        
        <!-- Grid de Certificados -->
        <div class="cert-grid">
            {cards_html}
        </div>
    </div>
    
    <style>
        .cert-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: var(--space-6);
        }}
        
        .cert-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: var(--space-6);
            text-decoration: none;
            color: var(--primary-text);
            transition: all 0.2s ease;
            display: block;
        }}
        
        .cert-card:hover {{
            border-color: var(--border-hover);
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }}
        
        .cert-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-4);
            padding-bottom: var(--space-4);
            border-bottom: 1px solid var(--border);
        }}
        
        .cert-id {{
            font-family: var(--font-mono);
            font-size: 14px;
            font-weight: 600;
        }}
        
        .cert-body {{
            display: flex;
            flex-direction: column;
            gap: var(--space-3);
        }}
        
        .cert-item {{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .cert-label {{
            font-size: 12px;
            color: var(--secondary-text);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        
        .cert-value {{
            font-size: 14px;
            color: var(--primary-text);
        }}
        
        .cert-footer {{
            margin-top: var(--space-4);
            padding-top: var(--space-4);
            border-top: 1px solid var(--border);
            text-align: right;
            font-size: 13px;
            color: var(--secondary-text);
        }}
        
        .cert-card:hover .cert-footer {{
            color: var(--primary-text);
        }}
    </style>
    """
    
    return create_base_layout('Certificates', content, 'certificates')

@app.route('/network')
def network_page():
    """Tab de Network - Estadísticas y salud de la red"""
    
    # Obtener estadísticas
    total_blocks = len(blockchain.chain)
    total_transactions = sum(len(block.transactions) for block in blockchain.chain)
    pending_tx = len(blockchain.pending_transactions)
    chain_valid = blockchain.is_chain_valid()
    
    content = f"""
    <div class="section">
        <div class="section-header">
            <h1 class="section-title">Network</h1>
            <div style="display: flex; gap: var(--space-4); align-items: center;">
                <span class="badge {'badge-success' if chain_valid else 'badge-error'}">
                    {'Chain Valid' if chain_valid else 'Chain Invalid'}
                </span>
                <button class="btn btn-sm" onclick="location.reload()">↻ Refresh</button>
            </div>
        </div>
        
        <!-- Network Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Chain Height</div>
                <div class="stat-value">{total_blocks}</div>
                <div class="stat-change">blocks</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Transactions</div>
                <div class="stat-value">{total_transactions}</div>
                <div class="stat-change">confirmed</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pending Transactions</div>
                <div class="stat-value">{pending_tx}</div>
                <div class="stat-change">in mempool</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Difficulty</div>
                <div class="stat-value">{blockchain.difficulty}</div>
                <div class="stat-change">leading zeros</div>
            </div>
        </div>
        
        <!-- Network Info -->
        <div class="card" style="margin-top: var(--space-8);">
            <h3 style="font-size: 18px; margin-bottom: var(--space-6);">Network Information</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6);">
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; margin-bottom: var(--space-2);">
                        Network Name
                    </div>
                    <div style="font-size: 16px; font-weight: 600;">ORILUXCHAIN</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; margin-bottom: var(--space-2);">
                        Consensus
                    </div>
                    <div style="font-size: 16px; font-weight: 600;">Proof of Work (PoW)</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; margin-bottom: var(--space-2);">
                        Native Token
                    </div>
                    <div style="font-size: 16px; font-weight: 600;">ORX</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; margin-bottom: var(--space-2);">
                        Chain Status
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: var(--success);">● Online</div>
                </div>
            </div>
        </div>
        
        <!-- Genesis Block -->
        <div class="card" style="margin-top: var(--space-6);">
            <h3 style="font-size: 18px; margin-bottom: var(--space-6);">Genesis Block</h3>
            
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; margin-bottom: var(--space-2);">
                        Hash
                    </div>
                    <div class="hash" style="word-break: break-all;">{blockchain.chain[0].hash}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--secondary-text); text-transform: uppercase; margin-bottom: var(--space-2);">
                        Timestamp
                    </div>
                    <div class="hash">{blockchain.chain[0].timestamp}</div>
                </div>
            </div>
        </div>
        
        <!-- API Endpoints -->
        <div class="card" style="margin-top: var(--space-6);">
            <h3 style="font-size: 18px; margin-bottom: var(--space-6);">API Endpoints</h3>
            
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                <div style="display: flex; justify-content: space-between; padding: var(--space-3); background: var(--primary-bg); border-radius: 4px;">
                    <span class="badge badge-success">GET</span>
                    <span class="hash" style="flex: 1; margin-left: var(--space-4);">/api/stats</span>
                    <span style="color: var(--secondary-text);">Blockchain stats</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: var(--space-3); background: var(--primary-bg); border-radius: 4px;">
                    <span class="badge badge-success">GET</span>
                    <span class="hash" style="flex: 1; margin-left: var(--space-4);">/api/chain</span>
                    <span style="color: var(--secondary-text);">Full chain</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: var(--space-3); background: var(--primary-bg); border-radius: 4px;">
                    <span class="badge badge-warning">POST</span>
                    <span class="hash" style="flex: 1; margin-left: var(--space-4);">/api/jewelry/certify</span>
                    <span style="color: var(--secondary-text);">Create certificate</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: var(--space-3); background: var(--primary-bg); border-radius: 4px;">
                    <span class="badge badge-success">GET</span>
                    <span class="hash" style="flex: 1; margin-left: var(--space-4);">/api/jewelry/verify/:id</span>
                    <span style="color: var(--secondary-text);">Verify certificate</span>
                </div>
            </div>
        </div>
    </div>
    """
    
    return create_base_layout('Network', content, 'network')

@app.route('/explorer')
def explorer_search():
    """Tab de Explorer - Búsqueda de certificados"""
    
    content = """
    <div class="section">
        <div class="section-header">
            <h1 class="section-title">Explorer</h1>
        </div>
        
        <!-- Search Box -->
        <div class="card" style="text-align: center; padding: var(--space-12);">
            <h2 style="font-size: 28px; margin-bottom: var(--space-4);">Search the Blockchain</h2>
            <p style="color: var(--secondary-text); margin-bottom: var(--space-8);">
                Enter a certificate ID, transaction hash, or wallet address
            </p>
            
            <form action="/explorer/search" method="get" style="display: flex; gap: var(--space-4); max-width: 600px; margin: 0 auto;">
                <input 
                    type="text" 
                    name="q" 
                    placeholder="CERT-XXXXXXXX-XXXXXXXX" 
                    style="flex: 1; background: var(--primary-bg); border: 1px solid var(--border); border-radius: 4px; padding: var(--space-4); color: var(--primary-text); font-size: 16px;"
                >
                <button type="submit" class="btn">Search</button>
            </form>
        </div>
        
        <!-- Quick Links -->
        <div style="margin-top: var(--space-8);">
            <h3 style="font-size: 18px; margin-bottom: var(--space-4);">Quick Links</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
                <a href="/blocks" class="card" style="text-align: center; padding: var(--space-6);">
                    <div style="font-size: 32px; margin-bottom: var(--space-2);">📦</div>
                    <div>View Blocks</div>
                </a>
                <a href="/transactions" class="card" style="text-align: center; padding: var(--space-6);">
                    <div style="font-size: 32px; margin-bottom: var(--space-2);">💳</div>
                    <div>View Transactions</div>
                </a>
                <a href="/certificates" class="card" style="text-align: center; padding: var(--space-6);">
                    <div style="font-size: 32px; margin-bottom: var(--space-2);">💎</div>
                    <div>View Certificates</div>
                </a>
                <a href="/network" class="card" style="text-align: center; padding: var(--space-6);">
                    <div style="font-size: 32px; margin-bottom: var(--space-2);">🌐</div>
                    <div>Network Status</div>
                </a>
            </div>
        </div>
    </div>
    """
    
    return create_base_layout('Explorer', content, 'explorer')

@app.route('/dual-verification')
def dual_verification_page():
    """Tab de Dual Verification - Certificados verificados en ambas blockchains"""
    
    # Aquí iríamos a buscar certificados desde Supabase, pero por ahora simulamos
    # En producción, haríamos una llamada a Supabase API
    
    # Simular algunos certificados dual-verified
    dual_certs = [
        {
            'certificate_id': 'VRX-TEST-001',
            'oriluxchain_tx': 'abc123...',
            'oriluxchain_url': '/explorer/VRX-TEST-001',
            'crestchain_tx': '0xdef456...',
            'crestchain_url': 'https://scan.crestchain.pro/tx/0xdef456',
            'dual_status': 'verified',
            'timestamp': '2025-11-26 12:30:00'
        }
    ]
    
    # Generar filas de la tabla
    rows_html = ""
    for cert in dual_certs:
        status_badge = 'badge-success' if cert['dual_status'] == 'verified' else 'badge-warning'
        
        rows_html += f'''
        <tr>
            <td>
                <span class="hash">{cert['certificate_id']}</span>
            </td>
            <td>
                <a href="{cert['oriluxchain_url']}" class="hash" style="color: var(--primary-text);">✓ Oriluxchain</a>
                <br>
                <span class="hash" style="font-size: 11px;">{cert['oriluxchain_tx']}</span>
            </td>
            <td>
                <a href="{cert['crestchain_url']}" target="_blank" class="hash" style="color: var(--primary-text);">✓ Crestchain</a>
                <br>
                <span class="hash" style="font-size: 11px;">{cert['crestchain_tx']}</span>
            </td>
            <td>
                <span class="badge {status_badge}">Dual Verified</span>
            </td>
            <td>{cert['timestamp']}</td>
        </tr>
        '''
    
    if not rows_html:
        rows_html = '<tr><td colspan="5" style="text-align: center; padding: var(--space-8); color: var(--tertiary-text);">No dual-verified certificates yet</td></tr>'
    
    content = f"""
    <div class="section">
        <div class="section-header">
            <h1 class="section-title">Dual Verification</h1>
            <div style="display: flex; gap: var(--space-4); align-items: center;">
                <span style="color: var(--secondary-text); font-size: 14px;">
                    Oriluxchain + Crestchain verified certificates
                </span>
                <button class="btn btn-sm" onclick="location.reload()">↻ Refresh</button>
            </div>
        </div>
        
        <!-- Info sobre dual verification -->
        <div class="card" style="margin-bottom: var(--space-8);">
            <h3 style="font-size: 18px; margin-bottom: var(--space-4);">🔗 Dual Blockchain Verification</h3>
            <p style="color: var(--secondary-text); margin-bottom: var(--space-4);">
                Certificates verified on both Oriluxchain (fast, private) and Crestchain (public, decentralized) for maximum security and transparency.
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
                <div style="padding: var(--space-4); background: var(--primary-bg); border-radius: 4px;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: var(--space-2);">Oriluxchain</div>
                    <div style="color: var(--secondary-text); font-size: 12px;">Private blockchain for jewelry certification</div>
                </div>
                <div style="padding: var(--space-4); background: var(--primary-bg); border-radius: 4px;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: var(--space-2);">Crestchain</div>
                    <div style="color: var(--secondary-text); font-size: 12px;">Public EVM blockchain for NFT verification</div>
                </div>
            </div>
        </div>
        
        <!-- Tabla de certificados dual-verified -->
        <div class="card" style="padding: 0; overflow: hidden;">
            <table class="table">
                <thead>
                    <tr>
                        <th>Certificate ID</th>
                        <th>Oriluxchain</th>
                        <th>Crestchain</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {rows_html}
                </tbody>
            </table>
        </div>
    </div>
    """
    
    return create_base_layout('Dual Verification', content, 'dual-verification')

@app.route('/api/mine', methods=['GET'])
def mine_block():
    """Fuerza el minado de un bloque (para desarrollo)"""
    try:
        # Minar bloque
        block = blockchain.mine_pending_transactions(miner_address=wallet.address)
        
        return jsonify({
            'success': True,
            'message': 'Bloque minado exitosamente',
            'block_index': block.index,
            'transactions': len(block.transactions),
            'hash': block.hash
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 ORILUXCHAIN API SIMPLE")
    print("="*60)
    print("📍 URL: http://127.0.0.1:5001")
    print("📍 Health: http://127.0.0.1:5001/health")
    print("📍 Jewelry API: http://127.0.0.1:5001/api/jewelry/*")
    print("⚠️  MODO DESARROLLO - Sin autenticación")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
