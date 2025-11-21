"""
Sistema de Autenticación para Oriluxchain
Gestiona usuarios, login, registro y sesiones
"""

import json
import os
import bcrypt
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin):
    """Modelo de usuario para Flask-Login"""
    
    def __init__(self, username, password_hash=None, is_admin=False, created_at=None):
        self.id = username
        self.username = username
        self.password_hash = password_hash
        self.is_admin = is_admin
        self.created_at = created_at or datetime.now().isoformat()
    
    def check_password(self, password):
        """Verifica si la contraseña es correcta"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @staticmethod
    def hash_password(password):
        """Genera hash de contraseña"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def to_dict(self):
        """Convierte usuario a diccionario"""
        return {
            'username': self.username,
            'password_hash': self.password_hash,
            'is_admin': self.is_admin,
            'created_at': self.created_at
        }
    
    @staticmethod
    def from_dict(data):
        """Crea usuario desde diccionario"""
        return User(
            username=data['username'],
            password_hash=data['password_hash'],
            is_admin=data.get('is_admin', False),
            created_at=data.get('created_at')
        )


class UserManager:
    """Gestor de usuarios - Base de datos simple en JSON"""
    
    def __init__(self, db_path='data/users.json'):
        self.db_path = db_path
        self._ensure_db_exists()
        self._create_superadmin()
    
    def _ensure_db_exists(self):
        """Asegura que el archivo de base de datos existe"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        if not os.path.exists(self.db_path):
            with open(self.db_path, 'w') as f:
                json.dump({}, f)
    
    def _create_superadmin(self):
        """Crea el usuario superadmin si no existe"""
        if not self.get_user('superadm'):
            superadmin = User(
                username='superadm',
                password_hash=User.hash_password('ZoeyMama*2025*'),
                is_admin=True
            )
            self.save_user(superadmin)
            print("✅ Super Admin creado: superadm")
    
    def _load_users(self):
        """Carga usuarios desde el archivo JSON"""
        try:
            with open(self.db_path, 'r') as f:
                data = json.load(f)
                return {username: User.from_dict(user_data) 
                       for username, user_data in data.items()}
        except Exception as e:
            print(f"Error cargando usuarios: {e}")
            return {}
    
    def _save_users(self, users):
        """Guarda usuarios en el archivo JSON"""
        try:
            data = {username: user.to_dict() 
                   for username, user in users.items()}
            with open(self.db_path, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error guardando usuarios: {e}")
    
    def get_user(self, username):
        """Obtiene un usuario por username"""
        users = self._load_users()
        return users.get(username)
    
    def save_user(self, user):
        """Guarda o actualiza un usuario"""
        users = self._load_users()
        users[user.username] = user
        self._save_users(users)
    
    def user_exists(self, username):
        """Verifica si un usuario existe"""
        return self.get_user(username) is not None
    
    def create_user(self, username, password, is_admin=False):
        """Crea un nuevo usuario"""
        if self.user_exists(username):
            return None
        
        user = User(
            username=username,
            password_hash=User.hash_password(password),
            is_admin=is_admin
        )
        self.save_user(user)
        return user
    
    def authenticate(self, username, password):
        """Autentica un usuario"""
        user = self.get_user(username)
        if user and user.check_password(password):
            return user
        return None
    
    def get_all_users(self):
        """Obtiene todos los usuarios (sin contraseñas)"""
        users = self._load_users()
        return [{
            'username': user.username,
            'is_admin': user.is_admin,
            'created_at': user.created_at
        } for user in users.values()]
