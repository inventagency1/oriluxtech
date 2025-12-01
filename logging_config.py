"""
ORILUXCHAIN - Logging Configuration
Configuración centralizada de logging con rotación y niveles
"""

import logging
import logging.handlers
import os
from datetime import datetime

# Crear directorio de logs si no existe
LOG_DIR = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

# Configuración de niveles
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()

def setup_logging():
    """Configura el sistema de logging"""
    
    # Formato detallado
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Handler para archivo con rotación
    file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(LOG_DIR, 'oriluxchain.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG)
    
    # Handler para errores
    error_handler = logging.handlers.RotatingFileHandler(
        os.path.join(LOG_DIR, 'errors.log'),
        maxBytes=10*1024*1024,
        backupCount=5
    )
    error_handler.setFormatter(formatter)
    error_handler.setLevel(logging.ERROR)
    
    # Handler para consola
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    ))
    console_handler.setLevel(getattr(logging, LOG_LEVEL))
    
    # Configurar root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)
    root_logger.addHandler(console_handler)
    
    # Loggers específicos
    loggers = [
        'blockchain', 'api', 'node', 'wallet', 
        'token_system', 'smart_contract', 'certificate_manager'
    ]
    
    for logger_name in loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.DEBUG)
    
    logging.info("✅ Logging system initialized")
    logging.info(f"Log directory: {LOG_DIR}")
    logging.info(f"Log level: {LOG_LEVEL}")

# Inicializar al importar
setup_logging()
