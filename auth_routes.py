"""
Rutas de autenticación para Oriluxchain
Agrega login, registro, perfil y protección de rutas
"""

from flask import render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from functools import wraps
from auth import UserManager
from datetime import datetime

def init_auth(app):
    """
    Inicializa el sistema de autenticación en la app Flask
    
    Args:
        app: Instancia de Flask
    """
    # Configurar secret key para sesiones
    app.config['SECRET_KEY'] = 'oriluxchain-secret-key-2025-zoey-mama'
    
    # Inicializar Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    login_manager.login_message = 'Por favor inicia sesión para acceder.'
    
    # Inicializar gestor de usuarios
    user_manager = UserManager()
    
    @login_manager.user_loader
    def load_user(username):
        return user_manager.get_user(username)
    
    # Decorador para rutas que requieren admin
    def admin_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or not current_user.is_admin:
                flash('Acceso denegado. Se requieren permisos de administrador.', 'error')
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return decorated_function
    
    # Ruta de login
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for('index'))
        
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            user = user_manager.authenticate(username, password)
            if user:
                login_user(user)
                next_page = request.args.get('next')
                return redirect(next_page or url_for('index'))
            else:
                return render_template('login.html', error='Usuario o contraseña incorrectos')
        
        return render_template('login.html')
    
    # Ruta de registro
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if current_user.is_authenticated:
            return redirect(url_for('index'))
        
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            confirm_password = request.form.get('confirm_password')
            
            # Validaciones
            if len(username) < 3:
                return render_template('register.html', error='El usuario debe tener al menos 3 caracteres')
            
            if len(password) < 6:
                return render_template('register.html', error='La contraseña debe tener al menos 6 caracteres')
            
            if password != confirm_password:
                return render_template('register.html', error='Las contraseñas no coinciden')
            
            if user_manager.user_exists(username):
                return render_template('register.html', error='El usuario ya existe')
            
            # Crear usuario
            user = user_manager.create_user(username, password)
            if user:
                login_user(user)
                return redirect(url_for('index'))
            else:
                return render_template('register.html', error='Error al crear usuario')
        
        return render_template('register.html')
    
    # Ruta de logout
    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('login'))
    
    # Proteger todas las rutas excepto login y register
    @app.before_request
    def require_login():
        # Lista de rutas públicas (no requieren login)
        public_endpoints = ['login', 'register', 'static']
        
        # Permitir rutas públicas
        if request.endpoint in public_endpoints:
            return None
        
        # Permitir archivos estáticos
        if request.path.startswith('/static/'):
            return None
        
        # Permitir rutas de API públicas (para el dashboard)
        public_api_routes = [
            '/chain', '/wallet', '/tokens', '/nodes', '/contracts',
            '/balance/', '/block/', '/transactions', '/staking/',
            '/api/stats', '/api/info', '/api/health', '/api/blocks',
            '/api/mining-status', '/api/difficulty', '/api/wallets',
            '/api/transactions/', '/api/blockchain/', '/api/jewelry/',
            '/explorer', '/verify/', '/api/explorer/'
        ]
        for route in public_api_routes:
            if request.path.startswith(route) or request.path == route.rstrip('/'):
                return None
        
        # Requerir login para todo lo demás
        if not current_user.is_authenticated:
            return redirect(url_for('login', next=request.url))
        
        # Verificar permisos de admin para rutas sensibles
        admin_routes = ['/mine', '/transactions/new', '/wallet/new', '/nodes/register', '/contracts/deploy']
        for admin_route in admin_routes:
            if request.path.startswith(admin_route) and not current_user.is_admin:
                return redirect(url_for('index'))
    
    # Ruta de administración de usuarios (solo admin)
    @app.route('/admin/users')
    @login_required
    @admin_required
    def admin_users():
        users = user_manager.get_all_users()
        return render_template('admin_users.html', users=users)
    
    # ==================== API DE PERFIL ====================
    
    @app.route('/api/user/profile', methods=['GET'])
    @login_required
    def get_user_profile():
        """Obtiene el perfil del usuario actual"""
        return jsonify({
            'success': True,
            'profile': {
                'username': current_user.username,
                'display_name': current_user.display_name,
                'email': current_user.email,
                'avatar_url': current_user.avatar_url,
                'bio': current_user.bio,
                'wallet_address': current_user.wallet_address,
                'is_admin': current_user.is_admin,
                'created_at': current_user.created_at,
                'last_login': current_user.last_login,
                'login_count': current_user.login_count,
                'settings': current_user.settings
            }
        }), 200
    
    @app.route('/api/user/profile', methods=['PUT'])
    @login_required
    def update_user_profile():
        """Actualiza el perfil del usuario"""
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Actualizar campos permitidos
        allowed_fields = ['display_name', 'email', 'bio', 'avatar_url', 'wallet_address']
        updated_fields = []
        
        for field in allowed_fields:
            if field in data:
                current_user.update_profile(**{field: data[field]})
                updated_fields.append(field)
        
        # Guardar cambios
        user_manager.save_user(current_user)
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'updated_fields': updated_fields
        }), 200
    
    @app.route('/api/user/settings', methods=['GET'])
    @login_required
    def get_user_settings():
        """Obtiene la configuración del usuario"""
        return jsonify({
            'success': True,
            'settings': current_user.settings
        }), 200
    
    @app.route('/api/user/settings', methods=['PUT'])
    @login_required
    def update_user_settings():
        """Actualiza la configuración del usuario"""
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Actualizar settings
        current_user.update_settings(**data)
        user_manager.save_user(current_user)
        
        return jsonify({
            'success': True,
            'message': 'Settings updated successfully',
            'settings': current_user.settings
        }), 200
    
    @app.route('/api/user/password', methods=['PUT'])
    @login_required
    def change_password():
        """Cambia la contraseña del usuario"""
        data = request.get_json()
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Verificar contraseña actual
        if not current_user.check_password(current_password):
            return jsonify({'success': False, 'error': 'Current password is incorrect'}), 401
        
        # Validar nueva contraseña
        if len(new_password) < 6:
            return jsonify({'success': False, 'error': 'New password must be at least 6 characters'}), 400
        
        # Actualizar contraseña
        from auth import User
        current_user.password_hash = User.hash_password(new_password)
        user_manager.save_user(current_user)
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
    
    @app.route('/api/user/activity', methods=['GET'])
    @login_required
    def get_user_activity():
        """Obtiene el historial de actividad del usuario"""
        # Por ahora retornamos datos básicos, luego se puede expandir
        return jsonify({
            'success': True,
            'activity': {
                'last_login': current_user.last_login,
                'login_count': current_user.login_count,
                'member_since': current_user.created_at
            }
        }), 200
    
    return user_manager
