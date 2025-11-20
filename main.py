import argparse
from api import BlockchainAPI


def main():
    """
    Punto de entrada principal de Oriluxchain.
    Inicia un nodo de la blockchain con API REST.
    """
    parser = argparse.ArgumentParser(description='Oriluxchain Node')
    parser.add_argument('--port', type=int, default=5000, help='Puerto para la API REST')
    parser.add_argument('--difficulty', type=int, default=4, help='Dificultad de minería')
    
    args = parser.parse_args()
    
    print(f"""
    ╔═══════════════════════════════════════╗
    ║         ORILUXCHAIN NODE              ║
    ║         Blockchain v1.0.0             ║
    ╚═══════════════════════════════════════╝
    
    Puerto: {args.port}
    Dificultad: {args.difficulty}
    
    Iniciando nodo...
    """)
    
    # Crear y ejecutar API
    api = BlockchainAPI(port=args.port)
    api.blockchain.difficulty = args.difficulty
    
    print(f"✓ Nodo iniciado en http://localhost:{args.port}")
    print(f"✓ Wallet del nodo: {api.wallet.address}\n")
    
    api.run(debug=False)


if __name__ == '__main__':
    main()
