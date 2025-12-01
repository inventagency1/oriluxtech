"""
Script para resetear la contraseña del superadmin
"""
import os
import json
import bcrypt
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener contraseña del .env
password = os.getenv('SUPERADMIN_PASSWORD')

if not password:
    print("❌ Error: SUPERADMIN_PASSWORD no está definida en .env")
    exit(1)

print(f"📝 Contraseña del .env: {password}")

# Generar hash
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Actualizar archivo de usuarios
users_file = 'data/users.json'

try:
    # Leer usuarios existentes
    with open(users_file, 'r') as f:
        users = json.load(f)
    
    # Actualizar superadmin
    if 'superadm' in users:
        users['superadm']['password_hash'] = password_hash
        print("✅ Usuario 'superadm' encontrado, actualizando contraseña...")
    else:
        # Crear superadmin si no existe
        from datetime import datetime
        users['superadm'] = {
            'username': 'superadm',
            'password_hash': password_hash,
            'is_admin': True,
            'created_at': datetime.now().isoformat()
        }
        print("✅ Usuario 'superadm' creado...")
    
    # Guardar cambios
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=2)
    
    print("\n" + "="*60)
    print("✅ CONTRASEÑA ACTUALIZADA EXITOSAMENTE")
    print("="*60)
    print(f"\nCredenciales de acceso:")
    print(f"  URL: http://localhost:5000")
    print(f"  Usuario: superadm")
    print(f"  Contraseña: {password}")
    print("\n" + "="*60)
    
except FileNotFoundError:
    print(f"❌ Error: No se encontró el archivo {users_file}")
    print("   Asegúrate de que la carpeta 'data' existe")
except Exception as e:
    print(f"❌ Error: {e}")
