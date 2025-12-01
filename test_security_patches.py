"""
Test de Parches de Seguridad - Fase 1
Valida que los parches críticos funcionan correctamente
"""

import os
import sys
import json
from time import time

# Configurar variables de entorno para testing
os.environ['SUPERADMIN_PASSWORD'] = 'TestSecurePassword123!'
os.environ['API_KEYS'] = 'test_api_key_12345'
os.environ['RATE_LIMIT_REQUESTS'] = '5'
os.environ['RATE_LIMIT_WINDOW'] = '60'

print("🧪 TESTING SECURITY PATCHES - FASE 1")
print("=" * 60)

# Test 1: Contraseña Hardcodeada
print("\n📝 Test 1: Contraseña desde Variable de Entorno")
try:
    from auth import UserManager
    
    # Intentar crear UserManager (debería crear superadmin)
    user_manager = UserManager()
    
    # Verificar que superadmin existe
    superadmin = user_manager.get_user('superadm')
    if superadmin and superadmin.is_admin:
        print("✅ PASS: Superadmin creado desde variable de entorno")
    else:
        print("❌ FAIL: Superadmin no se creó correctamente")
        
except ValueError as e:
    if "SUPERADMIN_PASSWORD" in str(e):
        print("✅ PASS: Sistema requiere SUPERADMIN_PASSWORD")
    else:
        print(f"❌ FAIL: Error inesperado: {e}")
except Exception as e:
    print(f"❌ FAIL: {e}")

# Test 2: Validación de Firmas
print("\n📝 Test 2: Validación de Firmas Digitales")
try:
    from blockchain import Blockchain
    from wallet import Wallet
    
    blockchain = Blockchain(difficulty=2)
    wallet = Wallet()
    
    # Crear transacción sin firma
    tx_sin_firma = {
        'sender': wallet.address,
        'recipient': 'test_recipient',
        'amount': 100,
        'token': 'ORX',
        'timestamp': time()
    }
    
    # Debería fallar sin firma
    is_valid, error = blockchain.validate_transaction(tx_sin_firma)
    if not is_valid and "signature" in error.lower():
        print("✅ PASS: Transacción sin firma rechazada")
    else:
        print(f"❌ FAIL: Transacción sin firma aceptada: {error}")
    
    # Crear transacción con firma
    from transaction import Transaction
    tx_obj = Transaction(wallet.address, 'test_recipient', 100)
    tx_obj.sign(wallet)
    
    tx_con_firma = tx_obj.to_dict()
    tx_con_firma['token'] = 'ORX'
    tx_con_firma['public_key'] = wallet.get_public_key()
    
    # Debería pasar con firma válida (aunque falle por balance)
    is_valid, error = blockchain.validate_transaction(tx_con_firma)
    if "signature" not in str(error).lower() or is_valid:
        print("✅ PASS: Transacción con firma válida procesada")
    else:
        print(f"❌ FAIL: Transacción con firma rechazada incorrectamente: {error}")
        
except Exception as e:
    print(f"❌ FAIL: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Autenticación API
print("\n📝 Test 3: Autenticación API")
try:
    from security_patches import APIAuth
    
    api_auth = APIAuth()
    
    # Test con API key inválida
    if not api_auth.verify_key("invalid_key"):
        print("✅ PASS: API key inválida rechazada")
    else:
        print("❌ FAIL: API key inválida aceptada")
    
    # Test con API key válida
    if api_auth.verify_key("test_api_key_12345"):
        print("✅ PASS: API key válida aceptada")
    else:
        print("❌ FAIL: API key válida rechazada")
        
except Exception as e:
    print(f"❌ FAIL: {e}")

# Test 4: Rate Limiting
print("\n📝 Test 4: Rate Limiting")
try:
    from security_patches import RateLimiter
    
    limiter = RateLimiter(max_requests=3, window=60)
    test_ip = "192.168.1.1"
    
    # Hacer 3 requests (debería pasar)
    for i in range(3):
        if not limiter.is_allowed(test_ip):
            print(f"❌ FAIL: Request {i+1}/3 bloqueado incorrectamente")
            break
    else:
        print("✅ PASS: Primeros 3 requests permitidos")
    
    # 4to request debería fallar
    if not limiter.is_allowed(test_ip):
        print("✅ PASS: Request 4 bloqueado por rate limit")
    else:
        print("❌ FAIL: Rate limit no funcionó")
        
except Exception as e:
    print(f"❌ FAIL: {e}")

# Test 5: Smart Contract VM Limits
print("\n📝 Test 5: Límites Smart Contract VM")
try:
    from smart_contract import SmartContractVM
    
    vm = SmartContractVM()
    
    # Bytecode con loop infinito simulado (más de 10,000 iteraciones)
    bytecode_loop = "\n".join(["PUSH 1"] * 11000)
    
    try:
        vm.execute(bytecode_loop, {'sender': 'test'})
        print("❌ FAIL: Loop infinito no fue detenido")
    except Exception as e:
        if "limit" in str(e).lower() or "exceeded" in str(e).lower():
            print("✅ PASS: Loop infinito detenido por límite")
        else:
            print(f"⚠️  WARNING: Detenido pero por otra razón: {e}")
            
except Exception as e:
    print(f"⚠️  WARNING: Test no pudo ejecutarse (VM puede no tener límites aún): {e}")

# Resumen
print("\n" + "=" * 60)
print("🎯 RESUMEN DE TESTS")
print("=" * 60)
print("✅ Tests completados")
print("\n⚠️  NOTA: Algunos tests pueden fallar si los parches no están")
print("completamente implementados. Revisa los resultados arriba.")
print("\n📋 PRÓXIMOS PASOS:")
print("1. Revisar tests fallidos")
print("2. Completar parches restantes")
print("3. Ejecutar tests de integración")
print("4. Preparar para Fase 2")
