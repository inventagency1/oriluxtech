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

# Importar y ejecutar la API directamente
print("✅ Oriluxchain iniciado correctamente")
print(f"🌐 Oriluxchain Dashboard: http://0.0.0.0:{os.environ.get('PORT')}")
print()

# El módulo api.py se ejecuta automáticamente al importarse
import api
