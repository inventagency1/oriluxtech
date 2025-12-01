"""
Script para crear wallets compatibles con Crestchain (ECDSA secp256k1)
Compatible con MetaMask, ethers.js y todo el ecosistema Ethereum
"""

from eth_account import Account
import secrets
import json
from datetime import datetime

def create_crestchain_wallet():
    """
    Crea una nueva wallet compatible con Crestchain.
    
    Returns:
        dict: Información de la wallet (address, private_key, public_key)
    """
    # Generar private key aleatoria (32 bytes = 256 bits)
    private_key = "0x" + secrets.token_hex(32)
    
    # Crear account desde private key
    account = Account.from_key(private_key)
    
    wallet_data = {
        "address": account.address,
        "private_key": private_key,
        "public_key": account._key_obj.public_key.to_hex(),
        "created_at": datetime.now().isoformat(),
        "network": "Crestchain",
        "chain_id": 85523
    }
    
    return wallet_data

def save_wallet(wallet_data, filename="crestchain_wallet.json"):
    """
    Guarda wallet en archivo JSON.
    
    Args:
        wallet_data (dict): Datos de la wallet
        filename (str): Nombre del archivo
    """
    with open(filename, 'w') as f:
        json.dump(wallet_data, f, indent=2)
    print(f"✅ Wallet guardada en {filename}")
    print(f"⚠️  IMPORTANTE: Guarda este archivo de forma segura!")
    print(f"⚠️  NO lo subas a Git ni lo compartas!")

def print_wallet_info(wallet_data):
    """Imprime información de la wallet de forma legible."""
    print("\n" + "="*60)
    print("🔐 WALLET CREADA PARA CRESTCHAIN")
    print("="*60)
    print(f"\n📋 Información de la Wallet:")
    print(f"   Address:     {wallet_data['address']}")
    print(f"   Private Key: {wallet_data['private_key']}")
    print(f"   Public Key:  {wallet_data['public_key'][:50]}...")
    print(f"   Created:     {wallet_data['created_at']}")
    print(f"   Network:     {wallet_data['network']}")
    print(f"   Chain ID:    {wallet_data['chain_id']}")
    print("\n" + "="*60)
    print("⚠️  SEGURIDAD:")
    print("="*60)
    print("   ❌ NUNCA compartas tu private key")
    print("   ❌ NO la subas a Git")
    print("   ❌ NO la envíes por email/chat")
    print("   ✅ Guárdala en un lugar seguro")
    print("   ✅ Haz backups encriptados")
    print("="*60 + "\n")

def create_multiple_wallets(count=3):
    """
    Crea múltiples wallets.
    
    Args:
        count (int): Número de wallets a crear
        
    Returns:
        list: Lista de wallets creadas
    """
    wallets = []
    for i in range(count):
        wallet = create_crestchain_wallet()
        wallets.append(wallet)
        print(f"✅ Wallet {i+1}/{count} creada: {wallet['address']}")
    return wallets

def save_multiple_wallets(wallets, filename="crestchain_wallets.json"):
    """Guarda múltiples wallets en un archivo."""
    data = {
        "wallets": wallets,
        "count": len(wallets),
        "created_at": datetime.now().isoformat()
    }
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\n✅ {len(wallets)} wallets guardadas en {filename}")

if __name__ == "__main__":
    import sys
    
    print("🚀 GENERADOR DE WALLETS PARA CRESTCHAIN")
    print("="*60)
    
    # Menú de opciones
    print("\nOpciones:")
    print("1. Crear 1 wallet (Sistema)")
    print("2. Crear 3 wallets (Sistema + Testing)")
    print("3. Crear N wallets (Custom)")
    
    try:
        choice = input("\nSelecciona opción (1-3): ").strip()
        
        if choice == "1":
            # Crear wallet del sistema
            print("\n🔐 Creando wallet del sistema...")
            wallet = create_crestchain_wallet()
            print_wallet_info(wallet)
            save_wallet(wallet, "system_wallet.json")
            
            print("\n📝 Próximos pasos:")
            print("   1. Guarda system_wallet.json de forma segura")
            print("   2. Obtén ~1.5 TCT tokens")
            print("   3. Envía TCT a:", wallet['address'])
            print("   4. Agrega SYSTEM_PRIVATE_KEY en Supabase:")
            print(f"      SYSTEM_PRIVATE_KEY={wallet['private_key']}")
            
        elif choice == "2":
            # Crear 3 wallets
            print("\n🔐 Creando 3 wallets...")
            wallets = create_multiple_wallets(3)
            
            print("\n📋 Wallets creadas:")
            for i, wallet in enumerate(wallets, 1):
                print(f"\n   Wallet {i}:")
                print(f"   Address: {wallet['address']}")
                print(f"   Private Key: {wallet['private_key']}")
            
            save_multiple_wallets(wallets)
            
            print("\n📝 Uso sugerido:")
            print(f"   Wallet 1 (Sistema):  {wallets[0]['address']}")
            print(f"   Wallet 2 (Testing):  {wallets[1]['address']}")
            print(f"   Wallet 3 (Backup):   {wallets[2]['address']}")
            
        elif choice == "3":
            # Crear N wallets
            count = int(input("\n¿Cuántas wallets crear? "))
            if count < 1 or count > 100:
                print("❌ Error: Número debe estar entre 1 y 100")
                sys.exit(1)
            
            print(f"\n🔐 Creando {count} wallets...")
            wallets = create_multiple_wallets(count)
            save_multiple_wallets(wallets)
            
        else:
            print("❌ Opción inválida")
            sys.exit(1)
        
        print("\n✅ ¡Proceso completado exitosamente!")
        print("\n⚠️  RECUERDA: Guarda tus private keys de forma segura")
        
    except KeyboardInterrupt:
        print("\n\n❌ Proceso cancelado por el usuario")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
