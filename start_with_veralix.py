"""
ORILUXCHAIN + VERALIX.IO
Script de inicio simplificado
"""

import os

# Cargar variables de entorno desde .env
from dotenv import load_dotenv
load_dotenv()

# Configurar variables de entorno
os.environ.setdefault('PORT', '5000')
os.environ.setdefault('DIFFICULTY', '3')
os.environ.setdefault('VERALIX_URL', 'http://localhost:8080')

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
print("🔐 Configurando sistema de autenticación...")

# Importar y ejecutar
from api import BlockchainAPI
from auth_routes import init_auth
from certificate_routes import init_certificate_routes

# Crear API (crea blockchain, wallet y node internamente)
api = BlockchainAPI(port=int(os.environ.get('PORT', 5000)))

# Inicializar autenticación
user_manager = init_auth(api.app)

# Inicializar rutas de certificados (Veralix integration)
cert_manager = init_certificate_routes(api.app, api.blockchain)

print("✅ Oriluxchain iniciado correctamente")
print("✅ Sistema de autenticación activo")
print("✅ Integración Veralix activa")
print(f"🌐 Servidor corriendo en http://0.0.0.0:{os.environ.get('PORT')}")
print(f"👤 Super Admin: superadm")
print(f"💎 Certificados de joyería: Habilitado")
print()

# Iniciar Flask
api.run(debug=False)
