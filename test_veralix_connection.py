"""
Script de prueba para verificar la conexión entre Oriluxchain y Veralix
"""
import requests
import json

print("=" * 60)
print("PRUEBA DE CONEXIÓN: ORILUXCHAIN ↔️ VERALIX")
print("=" * 60)

# 1. Verificar que Oriluxchain esté corriendo
print("\n1. Verificando Oriluxchain (localhost:5000)...")
try:
    response = requests.get("http://localhost:5000/")
    if response.status_code == 200:
        print("   ✅ Oriluxchain está corriendo")
    else:
        print(f"   ❌ Error: Status code {response.status_code}")
except Exception as e:
    print(f"   ❌ Error conectando a Oriluxchain: {e}")

# 2. Verificar que Veralix esté corriendo
print("\n2. Verificando Veralix (localhost:8080)...")
try:
    response = requests.get("http://localhost:8080/", timeout=5)
    if response.status_code == 200:
        print("   ✅ Veralix está corriendo")
        print(f"   Content-Type: {response.headers.get('content-type', 'N/A')}")
    else:
        print(f"   ❌ Error: Status code {response.status_code}")
except requests.exceptions.ConnectionError:
    print("   ❌ No se pudo conectar a Veralix en localhost:8080")
    print("   ℹ️  Asegúrate de que Veralix esté corriendo")
except Exception as e:
    print(f"   ❌ Error: {e}")

# 3. Verificar API de Oriluxchain
print("\n3. Verificando API de Oriluxchain...")
try:
    # Intentar obtener información de la blockchain
    endpoints = [
        "/api/blockchain/info",
        "/api/info",
        "/chain",
        "/api/chain"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:5000{endpoint}")
            if response.status_code == 200:
                print(f"   ✅ Endpoint {endpoint} disponible")
                try:
                    data = response.json()
                    print(f"      Datos: {json.dumps(data, indent=2)[:200]}...")
                except:
                    print(f"      Respuesta no es JSON")
                break
        except:
            continue
    else:
        print("   ⚠️  No se encontraron endpoints de API disponibles")
        
except Exception as e:
    print(f"   ❌ Error: {e}")

# 4. Información de configuración
print("\n4. Configuración actual:")
print("   - Oriluxchain: http://localhost:5000")
print("   - Veralix: http://localhost:8080")
print("   - Variables de entorno cargadas desde .env")

print("\n" + "=" * 60)
print("SIGUIENTE PASO:")
print("=" * 60)
print("Para conectar Oriluxchain con Veralix, necesitas:")
print("1. Asegurarte de que Veralix esté corriendo en localhost:8080")
print("2. Configurar la integración en Veralix para conectarse a Oriluxchain")
print("3. O usar el bridge API si está disponible")
print("=" * 60)
