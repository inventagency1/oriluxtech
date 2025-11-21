"""
ORILUXCHAIN + VERALIX.IO
Script de inicio con integración completa
"""

import os
import sys

# Configurar variables de entorno
os.environ.setdefault('PORT', '5000')
os.environ.setdefault('DIFFICULTY', '3')
os.environ.setdefault('VERALIX_URL', 'https://veralix.io')

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

print(f"🔗 Iniciando Oriluxchain...")
print(f"   - Puerto: {os.environ.get('PORT')}")
print(f"   - Dificultad: {os.environ.get('DIFFICULTY')}")
print(f"   - Veralix URL: {os.environ.get('VERALIX_URL')}")
print()

# Importar módulos necesarios
from api import BlockchainAPI
from blockchain import Blockchain
from wallet import Wallet
from p2p import P2PNode

# Crear instancias
print("🔧 Creando blockchain...")
blockchain = Blockchain(difficulty=int(os.environ.get('DIFFICULTY', 3)))

print("💼 Creando wallet...")
wallet = Wallet()

print("🌐 Creando nodo P2P...")
node = P2PNode(port=int(os.environ.get('PORT', 5000)) + 1000)

print("🚀 Iniciando API...")
api = BlockchainAPI(
    blockchain=blockchain,
    wallet=wallet,
    node=node,
    port=int(os.environ.get('PORT', 5000))
)

print("✅ Oriluxchain iniciado correctamente")
print(f"🌐 Oriluxchain Dashboard: http://0.0.0.0:{os.environ.get('PORT')}")
print()

# Iniciar el servidor Flask
api.run(debug=False)
