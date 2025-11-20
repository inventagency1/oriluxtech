"""
ORILUXCHAIN + VERALIX.IO
Script de inicio con integración completa
"""

import sys
import argparse
import threading
from api import OriluxchainAPI
from veralix_integration import VeralixAPI, VeralixConnector, VeralixBridge
from blockchain import Blockchain
from wallet import Wallet
from p2p import P2PNode


def print_banner():
    """Imprime el banner de inicio"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║         ORILUXCHAIN + VERALIX.IO INTEGRATION             ║
    ║                                                           ║
    ║         Blockchain Dual-Token con Smart Contracts        ║
    ║         Conectado a Veralix.io Cloud Platform            ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)


def start_oriluxchain(port=5000, difficulty=3):
    """Inicia el nodo de Oriluxchain"""
    print(f"\n🔗 Iniciando Oriluxchain en puerto {port}...")
    
    # Crear blockchain
    blockchain = Blockchain(difficulty=difficulty)
    
    # Crear wallet
    wallet = Wallet()
    
    # Crear nodo P2P
    node = P2PNode(port=port + 1000)
    
    # Crear API
    api = OriluxchainAPI(blockchain, wallet, node, port=port)
    
    print(f"✅ Oriluxchain iniciado correctamente")
    print(f"   - Blockchain: {len(blockchain.chain)} bloques")
    print(f"   - Wallet: {wallet.address}")
    print(f"   - API: http://localhost:{port}")
    
    return blockchain, wallet, node, api


def start_veralix_bridge(blockchain, port=5001, veralix_url=None, api_key=None):
    """Inicia el bridge de Veralix"""
    print(f"\n🌉 Iniciando Veralix Bridge en puerto {port}...")
    
    # Crear API Gateway
    veralix_api = VeralixAPI(blockchain, port=port)
    
    # Si se proporcionó URL y API key, conectar automáticamente
    if veralix_url and api_key:
        print(f"🔌 Conectando a {veralix_url}...")
        connector = VeralixConnector(veralix_url, api_key)
        
        if connector.connect():
            print(f"✅ Conectado a Veralix.io")
            
            # Registrar blockchain
            blockchain_info = {
                'network_id': 'orilux-mainnet',
                'rpc_url': f'http://localhost:{port-1}',
                'explorer_url': f'http://localhost:{port-1}/explorer'
            }
            result = connector.register_blockchain(blockchain_info)
            print(f"📝 Blockchain registrado: {result.get('message', 'OK')}")
            
            # Crear y habilitar bridge
            bridge = VeralixBridge(blockchain, connector)
            bridge.enable_sync()
            print(f"🔄 Sincronización automática habilitada")
            
            veralix_api.connector = connector
            veralix_api.bridge = bridge
        else:
            print(f"⚠️  No se pudo conectar a Veralix.io")
            print(f"   Puedes conectar manualmente después")
    
    print(f"✅ Veralix Bridge iniciado")
    print(f"   - API Gateway: http://localhost:{port}")
    print(f"   - WebSocket: ws://localhost:{port}")
    
    return veralix_api


def print_info(orilux_port, veralix_port, veralix_url=None):
    """Imprime información de acceso"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                    INFORMACIÓN DE ACCESO                  ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    print(f"    🌐 Oriluxchain Dashboard:")
    print(f"       http://localhost:{orilux_port}")
    print(f"")
    print(f"    🔗 Oriluxchain API:")
    print(f"       http://localhost:{orilux_port}/api/info")
    print(f"")
    print(f"    🌉 Veralix Bridge API:")
    print(f"       http://localhost:{veralix_port}/api/veralix/health")
    print(f"")
    
    if veralix_url:
        print(f"    ☁️  Veralix.io:")
        print(f"       {veralix_url}")
        print(f"")
    
    print(f"    📊 Tokens:")
    print(f"       - ORX (Orilux Tech Token)")
    print(f"       - VRX (Veralix Token)")
    print(f"")
    print(f"    📜 Smart Contracts:")
    print(f"       - ERC-20, MultiSig, Escrow, NFT, Staking")
    print(f"")
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                    COMANDOS ÚTILES                        ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    print(f"    Conectar a Veralix.io:")
    print(f"    curl -X POST http://localhost:{veralix_port}/api/veralix/connect \\")
    print(f"      -H 'Content-Type: application/json' \\")
    print(f"      -d '{{'veralix_url': 'https://veralix.io', 'api_key': 'tu_key'}}'")
    print(f"")
    print(f"    Sincronizar manualmente:")
    print(f"    curl -X POST http://localhost:{veralix_port}/api/veralix/sync")
    print(f"")
    print(f"    Ver estado:")
    print(f"    curl http://localhost:{veralix_port}/api/veralix/status")
    print(f"")


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Oriluxchain + Veralix.io Integration')
    parser.add_argument('--port', type=int, default=5000, help='Puerto de Oriluxchain (default: 5000)')
    parser.add_argument('--bridge-port', type=int, default=5001, help='Puerto del Bridge (default: 5001)')
    parser.add_argument('--difficulty', type=int, default=3, help='Dificultad de minería (default: 3)')
    parser.add_argument('--veralix-url', type=str, default=None, help='URL de Veralix.io')
    parser.add_argument('--api-key', type=str, default=None, help='API Key de Veralix.io')
    parser.add_argument('--no-bridge', action='store_true', help='No iniciar Veralix Bridge')
    
    args = parser.parse_args()
    
    # Imprimir banner
    print_banner()
    
    try:
        # Iniciar Oriluxchain
        blockchain, wallet, node, orilux_api = start_oriluxchain(
            port=args.port,
            difficulty=args.difficulty
        )
        
        # Iniciar Veralix Bridge (si no está deshabilitado)
        veralix_api = None
        if not args.no_bridge:
            veralix_api = start_veralix_bridge(
                blockchain,
                port=args.bridge_port,
                veralix_url=args.veralix_url,
                api_key=args.api_key
            )
        
        # Imprimir información
        print_info(args.port, args.bridge_port, args.veralix_url)
        
        # Iniciar servidores en threads separados
        print("\n🚀 Iniciando servidores...\n")
        
        # Thread para Oriluxchain
        orilux_thread = threading.Thread(
            target=orilux_api.run,
            daemon=True
        )
        orilux_thread.start()
        
        # Thread para Veralix Bridge
        if veralix_api:
            veralix_thread = threading.Thread(
                target=veralix_api.run,
                daemon=True
            )
            veralix_thread.start()
        
        print("✅ Todos los servicios están corriendo")
        print("   Presiona Ctrl+C para detener\n")
        
        # Mantener el programa corriendo
        try:
            while True:
                pass
        except KeyboardInterrupt:
            print("\n\n⏹️  Deteniendo servicios...")
            print("👋 ¡Hasta pronto!")
            sys.exit(0)
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
