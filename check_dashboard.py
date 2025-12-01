import requests
import sys

print("🔍 Verificando disponibilidad del Dashboard de Simbiosis...")

try:
    # Verificar que el servidor responde
    response = requests.get('http://localhost:5000/veralix-integration')
    
    if response.status_code == 200:
        print("✅ ¡ÉXITO! El dashboard está disponible.")
        print("🔗 Abre: http://localhost:5000/veralix-integration")
    elif response.status_code == 404:
        print("❌ ERROR 404: La ruta no existe.")
        print("👉 CAUSA: El servidor no se ha reiniciado con los últimos cambios.")
        print("👉 SOLUCIÓN: Detén el proceso (CTRL+C) y ejecuta 'python start_with_veralix.py' de nuevo.")
    else:
        print(f"⚠️ Estado inesperado: {response.status_code}")

except requests.exceptions.ConnectionError:
    print("❌ ERROR: No se puede conectar a localhost:5000")
    print("👉 El servidor Oriluxchain NO está corriendo.")
    print("👉 Ejecuta: python start_with_veralix.py")
except Exception as e:
    print(f"❌ Error: {e}")
