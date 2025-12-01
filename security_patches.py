"""
ORILUXCHAIN - Security Patches
Parches de seguridad críticos - Aplicar INMEDIATAMENTE
"""

import os
import functools
import hashlib
import json
import re
from time import time
from typing import Dict, Optional, Set
from flask import request, jsonify
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class APIAuth:
    """Sistema de autenticación para API"""
    
    def __init__(self):
        self.api_keys: Set[str] = set()
        self.load_api_keys()
    
    def load_api_keys(self):
        """Carga API keys desde variable de entorno"""
        keys = os.getenv('API_KEYS', '').split(',')
        self.api_keys = set(k.strip() for k in keys if k.strip())
        
        if not self.api_keys:
            logger.warning("No API keys configured! Set API_KEYS environment variable")
    
    def verify_key(self, key: str) -> bool:
        """Verifica si una API key es válida"""
        return key in self.api_keys
    
    def require_auth(self, f):
        """Decorador para requerir autenticación"""
        @functools.wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'error': 'Missing authorization header'}), 401
            
            if not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Invalid authorization format'}), 401
            
            token = auth_header.split(' ')[1]
            
            if not self.verify_key(token):
                logger.warning(f"Invalid API key attempt from {request.remote_addr}")
                return jsonify({'error': 'Invalid API key'}), 401
            
            return f(*args, **kwargs)
        return decorated


class RateLimiter:
    """Rate limiter simple basado en IP"""
    
    def __init__(self, max_requests: int = 10, window: int = 60):
        self.max_requests = max_requests
        self.window = window
        self.requests: Dict[str, list] = {}
    
    def is_allowed(self, ip: str) -> bool:
        """Verifica si una IP puede hacer más requests"""
        now = time()
        
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Limpiar requests antiguos
        self.requests[ip] = [t for t in self.requests[ip] if now - t < self.window]
        
        if len(self.requests[ip]) >= self.max_requests:
            logger.warning(f"Rate limit exceeded for IP: {ip}")
            return False
        
        self.requests[ip].append(now)
        return True
    
    def limit(self, f):
        """Decorador para aplicar rate limiting"""
        @functools.wraps(f)
        def decorated(*args, **kwargs):
            ip = request.remote_addr
            
            if not self.is_allowed(ip):
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retry_after': self.window
                }), 429
            
            return f(*args, **kwargs)
        return decorated


class TransactionValidator:
    """Validador de transacciones con verificación de firma"""
    
    @staticmethod
    def validate_signature(transaction: Dict, public_key: str) -> bool:
        """Valida la firma digital de una transacción"""
        if transaction.get('sender') == 'NETWORK':
            return True
        
        if 'signature' not in transaction:
            logger.error("Transaction missing signature")
            return False
        
        # Reconstruir datos de transacción
        tx_data = {
            'sender': transaction['sender'],
            'recipient': transaction['recipient'],
            'amount': transaction['amount'],
            'timestamp': transaction['timestamp']
        }
        
        try:
            from wallet import Wallet
            return Wallet.verify_signature(
                public_key,
                json.dumps(tx_data, sort_keys=True),
                transaction['signature']
            )
        except Exception as e:
            logger.error(f"Signature verification failed: {e}")
            return False
    
    @staticmethod
    def validate_transaction_complete(transaction: Dict) -> tuple[bool, Optional[str]]:
        """Validación completa de transacción"""
        # Validar campos requeridos
        required = ['sender', 'recipient', 'amount', 'token', 'timestamp']
        for field in required:
            if field not in transaction:
                return False, f"Missing field: {field}"
        
        # Validar tipos
        if not isinstance(transaction['amount'], (int, float)):
            return False, "Amount must be numeric"
        
        if transaction['amount'] <= 0:
            return False, "Amount must be positive"
        
        # Validar token
        if transaction['token'] not in ['ORX', 'VRX']:
            return False, f"Invalid token: {transaction['token']}"
        
        # Validar direcciones
        if not InputSanitizer.is_valid_address(transaction['sender']):
            return False, "Invalid sender address"
        
        if not InputSanitizer.is_valid_address(transaction['recipient']):
            return False, "Invalid recipient address"
        
        # Validar firma (excepto NETWORK)
        if transaction['sender'] != 'NETWORK':
            if 'signature' not in transaction or 'public_key' not in transaction:
                return False, "Missing signature or public key"
            
            if not TransactionValidator.validate_signature(
                transaction, 
                transaction['public_key']
            ):
                return False, "Invalid signature"
        
        return True, None


class BlockValidator:
    """Validador comprehensivo de bloques"""
    
    @staticmethod
    def validate_block(block, blockchain) -> tuple[bool, Optional[str]]:
        """Validación completa de un bloque"""
        # Verificar proof of work
        if not blockchain.is_valid_proof(block):
            return False, "Invalid proof of work"
        
        # Verificar hash
        if block.hash != block.calculate_hash():
            return False, "Invalid block hash"
        
        # Verificar enlace con bloque anterior
        if block.index > 0:
            if block.index - 1 >= len(blockchain.chain):
                return False, "Block index out of range"
            
            prev_block = blockchain.chain[block.index - 1]
            if block.previous_hash != prev_block.hash:
                return False, "Invalid previous hash"
        
        # Verificar timestamp
        if block.index > 0:
            prev_block = blockchain.chain[block.index - 1]
            if block.timestamp < prev_block.timestamp:
                return False, "Block timestamp before previous block"
        
        # Verificar tamaño del bloque
        block_size = len(json.dumps(block.to_dict()).encode())
        MAX_BLOCK_SIZE = 1_000_000  # 1 MB
        if block_size > MAX_BLOCK_SIZE:
            return False, f"Block too large: {block_size} bytes"
        
        # Verificar número de transacciones
        if len(block.transactions) > blockchain.MAX_TRANSACTIONS_PER_BLOCK:
            return False, "Too many transactions in block"
        
        # Verificar todas las transacciones
        for tx in block.transactions:
            if isinstance(tx, dict):
                is_valid, error = TransactionValidator.validate_transaction_complete(tx)
                if not is_valid:
                    return False, f"Invalid transaction: {error}"
        
        return True, None


class InputSanitizer:
    """Sanitizador de inputs para prevenir inyecciones"""
    
    @staticmethod
    def sanitize_string(s: str, max_length: int = 100) -> str:
        """Sanitiza strings para prevenir inyecciones"""
        if not isinstance(s, str):
            raise ValueError("Input must be string")
        
        # Remover caracteres peligrosos
        s = re.sub(r'[<>\"\'%;()&+]', '', s)
        
        # Limitar longitud
        return s[:max_length].strip()
    
    @staticmethod
    def is_valid_address(address: str) -> bool:
        """Valida formato de dirección"""
        if not isinstance(address, str):
            return False
        
        # Permitir direcciones especiales
        if address in ['NETWORK', 'GENESIS', 'VERALIX', 'MINING_POOL', 
                       'STAKING_POOL', 'TREASURY', 'LIQUIDITY_POOL']:
            return True
        
        # Validar formato hexadecimal
        if address.startswith('0x'):
            # Dirección de contrato
            return len(address) == 42 and all(c in '0123456789abcdefABCDEF' for c in address[2:])
        
        # Dirección de wallet (40 caracteres hex)
        return len(address) == 40 and all(c in '0123456789abcdefABCDEF' for c in address)
    
    @staticmethod
    def is_valid_url(url: str) -> bool:
        """Valida formato de URL"""
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        return url_pattern.match(url) is not None
    
    @staticmethod
    def sanitize_certificate_data(cert_data: Dict) -> Dict:
        """Sanitiza datos de certificado"""
        sanitized = {}
        
        # Sanitizar strings
        string_fields = ['certificate_id', 'jewelry_type', 'material', 'weight']
        for field in string_fields:
            if field in cert_data:
                sanitized[field] = InputSanitizer.sanitize_string(cert_data[field])
        
        # Validar imágenes
        if 'images' in cert_data:
            if not isinstance(cert_data['images'], list):
                raise ValueError("Images must be a list")
            
            if len(cert_data['images']) > 10:
                raise ValueError("Too many images (max 10)")
            
            sanitized['images'] = [
                url for url in cert_data['images']
                if InputSanitizer.is_valid_url(url)
            ]
        
        # Copiar objetos complejos
        for field in ['jeweler', 'owner', 'nft_data', 'stones', 'metadata']:
            if field in cert_data:
                sanitized[field] = cert_data[field]
        
        return sanitized


class DoubleSpendingProtection:
    """Protección contra double-spending"""
    
    def __init__(self):
        self.spent_transactions: Set[str] = set()
        self.transaction_nonces: Dict[str, int] = {}
    
    def generate_tx_id(self, transaction: Dict) -> str:
        """Genera ID único para transacción"""
        tx_string = json.dumps({
            'sender': transaction['sender'],
            'recipient': transaction['recipient'],
            'amount': transaction['amount'],
            'token': transaction['token'],
            'timestamp': transaction['timestamp'],
            'nonce': transaction.get('nonce', 0)
        }, sort_keys=True)
        
        return hashlib.sha256(tx_string.encode()).hexdigest()
    
    def is_spent(self, tx_id: str) -> bool:
        """Verifica si una transacción ya fue gastada"""
        return tx_id in self.spent_transactions
    
    def mark_spent(self, tx_id: str):
        """Marca una transacción como gastada"""
        self.spent_transactions.add(tx_id)
    
    def verify_nonce(self, sender: str, nonce: int) -> bool:
        """Verifica que el nonce sea correcto"""
        expected_nonce = self.transaction_nonces.get(sender, 0)
        return nonce == expected_nonce
    
    def increment_nonce(self, sender: str):
        """Incrementa el nonce de un sender"""
        if sender not in self.transaction_nonces:
            self.transaction_nonces[sender] = 0
        self.transaction_nonces[sender] += 1


class SecurityConfig:
    """Configuración de seguridad centralizada"""
    
    @staticmethod
    def load_from_env():
        """Carga configuración desde variables de entorno"""
        return {
            'api_keys': os.getenv('API_KEYS', '').split(','),
            'superadmin_password': os.getenv('SUPERADMIN_PASSWORD'),
            'jwt_secret': os.getenv('JWT_SECRET'),
            'rate_limit_requests': int(os.getenv('RATE_LIMIT_REQUESTS', '10')),
            'rate_limit_window': int(os.getenv('RATE_LIMIT_WINDOW', '60')),
            'max_block_size': int(os.getenv('MAX_BLOCK_SIZE', '1000000')),
            'max_reorg_depth': int(os.getenv('MAX_REORG_DEPTH', '10')),
            'enable_signature_validation': os.getenv('ENABLE_SIGNATURE_VALIDATION', 'true').lower() == 'true',
            'enable_rate_limiting': os.getenv('ENABLE_RATE_LIMITING', 'true').lower() == 'true',
        }
    
    @staticmethod
    def validate_config(config: Dict) -> bool:
        """Valida que la configuración sea segura"""
        errors = []
        
        if not config.get('superadmin_password'):
            errors.append("SUPERADMIN_PASSWORD not set")
        
        if not config.get('jwt_secret'):
            errors.append("JWT_SECRET not set")
        
        if not config.get('api_keys') or not any(config['api_keys']):
            errors.append("API_KEYS not set")
        
        if errors:
            logger.error("Security configuration errors:")
            for error in errors:
                logger.error(f"  - {error}")
            return False
        
        return True


# Funciones de utilidad

def generate_secure_api_key() -> str:
    """Genera una API key segura"""
    import secrets
    return secrets.token_urlsafe(32)


def hash_password_secure(password: str) -> str:
    """Hash de contraseña con bcrypt"""
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password_secure(password: str, password_hash: str) -> bool:
    """Verifica contraseña con bcrypt"""
    import bcrypt
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


# Ejemplo de uso

if __name__ == "__main__":
    print("🔒 Oriluxchain Security Patches")
    print("=" * 50)
    
    # Verificar configuración
    config = SecurityConfig.load_from_env()
    
    if SecurityConfig.validate_config(config):
        print("✅ Security configuration valid")
    else:
        print("❌ Security configuration invalid - check logs")
    
    # Generar API key de ejemplo
    api_key = generate_secure_api_key()
    print(f"\n🔑 Example API Key: {api_key}")
    print("\nAdd to .env file:")
    print(f"API_KEYS={api_key}")
    
    print("\n⚠️  Remember to set all required environment variables:")
    print("  - SUPERADMIN_PASSWORD")
    print("  - JWT_SECRET")
    print("  - API_KEYS")
