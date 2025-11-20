"""
Script de prueba para Oriluxchain.
Demuestra las funcionalidades principales de la blockchain.
"""
import requests
import json
import time

BASE_URL = "http://localhost:5000"


def print_section(title):
    """Imprime un separador de sección."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def test_node_info():
    """Obtiene información del nodo."""
    print_section("1. INFORMACIÓN DEL NODO")
    response = requests.get(f"{BASE_URL}/")
    data = response.json()
    print(f"Nombre: {data['name']}")
    print(f"Versión: {data['version']}")
    print(f"Longitud de cadena: {data['chain_length']}")
    print(f"Dificultad: {data['difficulty']}")
    print(f"Wallet del nodo: {data['wallet_address']}")


def test_view_chain():
    """Visualiza la blockchain completa."""
    print_section("2. BLOCKCHAIN ACTUAL")
    response = requests.get(f"{BASE_URL}/chain")
    data = response.json()
    
    print(f"Longitud de la cadena: {data['length']}")
    print(f"Transacciones pendientes: {len(data['pending_transactions'])}")
    print(f"\nBloques:")
    
    for block in data['chain']:
        print(f"\n  Bloque #{block['index']}")
        print(f"  Hash: {block['hash'][:20]}...")
        print(f"  Hash anterior: {block['previous_hash'][:20]}...")
        print(f"  Proof: {block['proof']}")
        print(f"  Transacciones: {len(block['transactions'])}")


def test_create_wallet():
    """Crea una nueva wallet."""
    print_section("3. CREAR NUEVA WALLET")
    response = requests.post(f"{BASE_URL}/wallet/new")
    wallet = response.json()
    
    print(f"✓ Wallet creada exitosamente")
    print(f"Dirección: {wallet['address']}")
    print(f"\nClave privada (guárdala de forma segura):")
    print(wallet['private_key'][:100] + "...")
    
    return wallet['address']


def test_create_transaction(sender, recipient, amount):
    """Crea una nueva transacción."""
    print_section("4. CREAR TRANSACCIÓN")
    
    transaction = {
        'sender': sender,
        'recipient': recipient,
        'amount': amount
    }
    
    response = requests.post(
        f"{BASE_URL}/transactions/new",
        json=transaction,
        headers={'Content-Type': 'application/json'}
    )
    
    data = response.json()
    print(f"✓ Transacción creada: {sender[:10]}... → {recipient[:10]}...")
    print(f"  Cantidad: {amount} OLX")
    print(f"  {data['message']}")


def test_mine_block():
    """Mina un nuevo bloque."""
    print_section("5. MINAR BLOQUE")
    print("Minando... (esto puede tomar unos segundos)")
    
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/mine")
    end_time = time.time()
    
    data = response.json()
    block = data['block']
    
    print(f"\n✓ Bloque minado exitosamente!")
    print(f"  Tiempo de minado: {end_time - start_time:.2f} segundos")
    print(f"  Bloque #{block['index']}")
    print(f"  Hash: {block['hash']}")
    print(f"  Proof: {block['proof']}")
    print(f"  Transacciones incluidas: {len(block['transactions'])}")


def test_check_balance(address):
    """Verifica el balance de una dirección."""
    print_section("6. VERIFICAR BALANCES")
    
    response = requests.get(f"{BASE_URL}/balance/{address}")
    data = response.json()
    
    print(f"Dirección: {address[:20]}...")
    print(f"Balance: {data['balance']} OLX")


def test_node_wallet():
    """Obtiene información de la wallet del nodo."""
    response = requests.get(f"{BASE_URL}/wallet")
    data = response.json()
    return data['address']


def run_full_test():
    """Ejecuta todas las pruebas."""
    try:
        print("\n" + "="*60)
        print("  🚀 PRUEBA COMPLETA DE ORILUXCHAIN")
        print("="*60)
        
        # 1. Info del nodo
        test_node_info()
        
        # 2. Ver cadena inicial
        test_view_chain()
        
        # 3. Crear wallets
        wallet1 = test_create_wallet()
        time.sleep(0.5)
        
        # 4. Obtener wallet del nodo
        node_wallet = test_node_wallet()
        
        # 5. Crear transacciones
        test_create_transaction("Alice", "Bob", 10)
        test_create_transaction("Bob", "Charlie", 5)
        test_create_transaction("Charlie", wallet1, 3)
        
        # 6. Minar bloque
        test_mine_block()
        
        # 7. Crear más transacciones
        test_create_transaction(node_wallet, wallet1, 25)
        
        # 8. Minar otro bloque
        test_mine_block()
        
        # 9. Verificar balances
        test_check_balance(wallet1)
        test_check_balance(node_wallet)
        test_check_balance("Alice")
        
        # 10. Ver cadena final
        test_view_chain()
        
        print_section("✅ PRUEBA COMPLETADA EXITOSAMENTE")
        print("La blockchain Oriluxchain está funcionando correctamente!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: No se puede conectar al nodo.")
        print("Asegúrate de que el servidor esté corriendo en http://localhost:5000")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    run_full_test()
