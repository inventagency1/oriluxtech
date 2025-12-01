"""
Script para crear un usuario admin con contraseña simple
"""
import json
import bcrypt
from datetime import datetime

# Credenciales simples
username = "admin"
password = "admin123"

print("="*60)
print("CREANDO USUARIO ADMIN SIMPLE")
print("="*60)

# Generar hash
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Actualizar archivo de usuarios
users_file = 'data/users.json'

try:
    # Leer usuarios existentes
    with open(users_file, 'r') as f:
        users = json.load(f)
    
    # Agregar nuevo admin
    users[username] = {
        'username': username,
        'password_hash': password_hash,
        'is_admin': True,
        'created_at': datetime.now().isoformat()
    }
    
    # Guardar cambios
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=2)
    
    print("\n✅ USUARIO ADMIN CREADO EXITOSAMENTE")
    print("\n" + "="*60)
    print("CREDENCIALES DE ACCESO:")
    print("="*60)
    print(f"\n  URL: http://localhost:5000")
    print(f"  Usuario: {username}")
    print(f"  Contraseña: {password}")
    print("\n" + "="*60)
    print("\nTambién puedes usar:")
    print("  Usuario: superadm")
    print("  Contraseña: OriluxSecure2025!@#$%^&*()_+")
    print("="*60)
    
except Exception as e:
    print(f"❌ Error: {e}")
