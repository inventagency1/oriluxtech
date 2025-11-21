"""
ORILUXCHAIN + VERALIX.IO
Script de inicio simplificado
"""

import os

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

# Ejecutar api.py directamente
print("🚀 Iniciando servidor Flask...")

# Importar y ejecutar
from api import BlockchainAPI
from blockchain import Blockchain
from wallet import Wallet

# Crear instancias básicas
blockchain = Blockchain(difficulty=int(os.environ.get('DIFFICULTY', 3)))
wallet = Wallet()

# Crear API (sin P2P por ahora)
api = BlockchainAPI(
    blockchain=blockchain,
    wallet=wallet,
    node=None,  # Sin P2P por ahora
    port=int(os.environ.get('PORT', 5000))
)

print("✅ Oriluxchain iniciado correctamente")
print(f"🌐 Servidor corriendo en http://0.0.0.0:{os.environ.get('PORT')}")
print()

# Iniciar Flask
api.run(debug=False)
