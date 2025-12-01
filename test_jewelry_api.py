"""
Script de prueba para API de certificación de joyería
Prueba todos los endpoints del sistema
"""

import requests
import json
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:5000"
API_URL = f"{BASE_URL}/api/jewelry"

def print_response(title, response):
    """Imprime una respuesta formateada"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def test_certify_jewelry():
    """Prueba la creación de un certificado"""
    print("\n🔷 TEST 1: Crear Certificado de Joyería")
    
    data = {
        "item_id": "RING-001",
        "jewelry_type": "ring",
        "material": "gold",
        "purity": "18k",
        "weight": 5.5,
        "stones": [
            {
                "type": "diamond",
                "carats": 0.5,
                "clarity": "VS1",
                "color": "D"
            }
        ],
        "jeweler": "Joyería Premium S.A.",
        "manufacturer": "Premium Manufacturers",
        "origin_country": "Colombia",
        "creation_date": datetime.now().isoformat(),
        "description": "Anillo de compromiso en oro 18k con diamante central de 0.5ct",
        "images": [
            "https://example.com/ring-front.jpg",
            "https://example.com/ring-side.jpg"
        ],
        "estimated_value": 5000.00,
        "owner": "0x1234567890abcdef",
        "issuer": "0xabcdef1234567890"
    }
    
    response = requests.post(f"{API_URL}/certify", json=data)
    print_response("Crear Certificado", response)
    
    if response.status_code == 201:
        return response.json()['certificate']['certificate_id']
    return None

def test_verify_certificate(certificate_id):
    """Prueba la verificación de un certificado"""
    print("\n🔷 TEST 2: Verificar Certificado")
    
    response = requests.get(f"{API_URL}/verify/{certificate_id}")
    print_response("Verificar Certificado", response)

def test_get_history(certificate_id):
    """Prueba obtener el historial"""
    print("\n🔷 TEST 3: Obtener Historial")
    
    response = requests.get(f"{API_URL}/history/{certificate_id}")
    print_response("Historial del Certificado", response)

def test_transfer_ownership(certificate_id):
    """Prueba transferir propiedad"""
    print("\n🔷 TEST 4: Transferir Propiedad")
    
    data = {
        "certificate_id": certificate_id,
        "current_owner": "0x1234567890abcdef",
        "new_owner": "0xfedcba0987654321"
    }
    
    response = requests.post(f"{API_URL}/transfer", json=data)
    print_response("Transferir Propiedad", response)

def test_create_nft(certificate_id):
    """Prueba crear NFT"""
    print("\n🔷 TEST 5: Crear NFT")
    
    response = requests.post(f"{API_URL}/nft/{certificate_id}")
    print_response("Crear NFT", response)

def test_search():
    """Prueba búsqueda de certificados"""
    print("\n🔷 TEST 6: Buscar Certificados")
    
    params = {
        "jewelry_type": "ring",
        "material": "gold"
    }
    
    response = requests.get(f"{API_URL}/search", params=params)
    print_response("Buscar Certificados", response)

def test_jeweler_certificates():
    """Prueba obtener certificados de un joyero"""
    print("\n🔷 TEST 7: Certificados por Joyero")
    
    jeweler = "Joyería Premium S.A."
    response = requests.get(f"{API_URL}/jeweler/{jeweler}")
    print_response("Certificados del Joyero", response)

def test_owner_certificates():
    """Prueba obtener certificados de un propietario"""
    print("\n🔷 TEST 8: Certificados por Propietario")
    
    owner = "0x1234567890abcdef"
    response = requests.get(f"{API_URL}/owner/{owner}")
    print_response("Certificados del Propietario", response)

def test_report_lost(certificate_id):
    """Prueba reportar joya perdida"""
    print("\n🔷 TEST 9: Reportar Joya Perdida")
    
    data = {
        "certificate_id": certificate_id,
        "owner": "0xfedcba0987654321",
        "status": "lost"
    }
    
    response = requests.post(f"{API_URL}/report", json=data)
    print_response("Reportar Joya", response)

def test_statistics():
    """Prueba obtener estadísticas"""
    print("\n🔷 TEST 10: Estadísticas del Sistema")
    
    response = requests.get(f"{API_URL}/stats")
    print_response("Estadísticas", response)

def run_all_tests():
    """Ejecuta todos los tests"""
    print("\n" + "="*60)
    print("  🧪 PRUEBAS DE API DE CERTIFICACIÓN DE JOYERÍA")
    print("="*60)
    
    try:
        # Test 1: Crear certificado
        certificate_id = test_certify_jewelry()
        
        if not certificate_id:
            print("\n❌ Error: No se pudo crear el certificado")
            return
        
        print(f"\n✅ Certificado creado: {certificate_id}")
        
        # Test 2: Verificar
        test_verify_certificate(certificate_id)
        
        # Test 3: Historial
        test_get_history(certificate_id)
        
        # Test 4: Transferir
        test_transfer_ownership(certificate_id)
        
        # Test 5: Crear NFT
        test_create_nft(certificate_id)
        
        # Test 6: Búsqueda
        test_search()
        
        # Test 7: Certificados por joyero
        test_jeweler_certificates()
        
        # Test 8: Certificados por propietario
        test_owner_certificates()
        
        # Test 9: Reportar perdida
        test_report_lost(certificate_id)
        
        # Test 10: Estadísticas
        test_statistics()
        
        print("\n" + "="*60)
        print("  ✅ TODAS LAS PRUEBAS COMPLETADAS")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: No se puede conectar al servidor")
        print("   Asegúrate de que el servidor esté corriendo en http://localhost:5000")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")

if __name__ == "__main__":
    run_all_tests()
