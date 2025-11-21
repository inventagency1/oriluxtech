"""
Rutas de autenticación para Oriluxchain
Agrega login, registro y protección de rutas
"""

from flask import render_template, request, redirect, url_for, flash, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from functools import wraps
from auth import UserManager

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
    
    return user_manager
