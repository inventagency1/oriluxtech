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
import api
