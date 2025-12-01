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
    """Modelo de usuario para Flask-Login con perfil completo"""
    
    def __init__(self, username, password_hash=None, is_admin=False, created_at=None,
                 email=None, display_name=None, avatar_url=None, bio=None,
                 wallet_address=None, settings=None, last_login=None, 
                 login_count=0, notifications_enabled=True, theme='dark'):
        self.id = username
        self.username = username
        self.password_hash = password_hash
        self.is_admin = is_admin
        self.created_at = created_at or datetime.now().isoformat()
        
        # Perfil extendido
        self.email = email
        self.display_name = display_name or username
        self.avatar_url = avatar_url
        self.bio = bio
        self.wallet_address = wallet_address
        
        # Configuración
        self.settings = settings or {
            'notifications_enabled': notifications_enabled,
            'theme': theme,
            'language': 'es',
            'currency': 'USD',
            'timezone': 'America/Bogota'
        }
        
        # Estadísticas
        self.last_login = last_login
        self.login_count = login_count
    
    def check_password(self, password):
        """Verifica si la contraseña es correcta"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @staticmethod
    def hash_password(password):
        """Genera hash de contraseña"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def update_login(self):
        """Actualiza estadísticas de login"""
        self.last_login = datetime.now().isoformat()
        self.login_count += 1
    
    def update_profile(self, **kwargs):
        """Actualiza campos del perfil"""
        allowed_fields = ['email', 'display_name', 'avatar_url', 'bio', 'wallet_address']
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(self, field, value)
    
    def update_settings(self, **kwargs):
        """Actualiza configuración del usuario"""
        allowed_settings = ['notifications_enabled', 'theme', 'language', 'currency', 'timezone']
        for key, value in kwargs.items():
            if key in allowed_settings:
                self.settings[key] = value
    
    def get_public_profile(self):
        """Retorna perfil público (sin datos sensibles)"""
        return {
            'username': self.username,
            'display_name': self.display_name,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'is_admin': self.is_admin,
            'created_at': self.created_at,
            'wallet_address': self.wallet_address
        }
    
    def to_dict(self):
        """Convierte usuario a diccionario"""
        return {
            'username': self.username,
            'password_hash': self.password_hash,
            'is_admin': self.is_admin,
            'created_at': self.created_at,
            'email': self.email,
            'display_name': self.display_name,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'wallet_address': self.wallet_address,
            'settings': self.settings,
            'last_login': self.last_login,
            'login_count': self.login_count
        }
    
    @staticmethod
    def from_dict(data):
        """Crea usuario desde diccionario"""
        return User(
            username=data['username'],
            password_hash=data['password_hash'],
            is_admin=data.get('is_admin', False),
            created_at=data.get('created_at'),
            email=data.get('email'),
            display_name=data.get('display_name'),
            avatar_url=data.get('avatar_url'),
            bio=data.get('bio'),
            wallet_address=data.get('wallet_address'),
            settings=data.get('settings'),
            last_login=data.get('last_login'),
            login_count=data.get('login_count', 0)
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
        import os
        
        # SECURITY FIX: Obtener contraseña desde variable de entorno
        superadmin_password = os.getenv('SUPERADMIN_PASSWORD')
        
        if not superadmin_password:
            raise ValueError(
                "CRITICAL: SUPERADMIN_PASSWORD environment variable must be set. "
                "Please set it in your .env file or environment."
            )
        
        if not self.get_user('superadm'):
            superadmin = User(
                username='superadm',
                password_hash=User.hash_password(superadmin_password),
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
