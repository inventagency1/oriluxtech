"""
ORILUXCHAIN - Input Validation Module
PARCHE 2.8: Validaciones centralizadas de inputs
"""

import re
from typing import Any, Tuple
import logging

logger = logging.getLogger(__name__)

# Constantes de validación
MAX_ADDRESS_LENGTH = 256
MAX_AMOUNT = 1_000_000_000_000  # 1 trillion
MIN_AMOUNT = 0.000001
MAX_STRING_LENGTH = 1000
MAX_LIST_LENGTH = 1000


def sanitize_string(value: str, max_length: int = MAX_STRING_LENGTH) -> str:
    """
    Sanitiza un string removiendo caracteres peligrosos.
    
    Args:
        value: String a sanitizar
        max_length: Longitud máxima permitida
        
    Returns:
        String sanitizado
    """
    if not isinstance(value, str):
        value = str(value)
    
    # Remover caracteres de control y null bytes
    value = ''.join(char for char in value if ord(char) >= 32 or char in '\n\r\t')
    
    # Truncar a longitud máxima
    value = value[:max_length]
    
    # Remover espacios al inicio y final
    value = value.strip()
    
    return value


def validate_address(address: Any) -> Tuple[bool, str]:
    """
    Valida una dirección de wallet.
    
    Args:
        address: Dirección a validar
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if not address:
        return False, "Dirección no puede estar vacía"
    
    address = str(address)
    
    if len(address) > MAX_ADDRESS_LENGTH:
        return False, f"Dirección demasiado larga (max: {MAX_ADDRESS_LENGTH})"
    
    if len(address) < 10:
        return False, "Dirección demasiado corta (min: 10)"
    
    # Validar caracteres permitidos (alfanuméricos y algunos símbolos)
    if not re.match(r'^[a-zA-Z0-9_\-\.]+$', address):
        return False, "Dirección contiene caracteres inválidos"
    
    return True, ""


def validate_amount(amount: Any, allow_zero: bool = False) -> Tuple[bool, str, float]:
    """
    Valida una cantidad numérica.
    
    Args:
        amount: Cantidad a validar
        allow_zero: Si se permite el valor 0
        
    Returns:
        tuple: (is_valid: bool, error_message: str, validated_amount: float)
    """
    try:
        amount_float = float(amount)
    except (ValueError, TypeError):
        return False, "Cantidad debe ser un número", 0
    
    if not allow_zero and amount_float <= 0:
        return False, "Cantidad debe ser mayor a 0", 0
    
    if allow_zero and amount_float < 0:
        return False, "Cantidad no puede ser negativa", 0
    
    if amount_float < MIN_AMOUNT and amount_float != 0:
        return False, f"Cantidad demasiado pequeña (min: {MIN_AMOUNT})", 0
    
    if amount_float > MAX_AMOUNT:
        return False, f"Cantidad demasiado grande (max: {MAX_AMOUNT})", 0
    
    return True, "", amount_float


def validate_token_symbol(symbol: Any) -> Tuple[bool, str]:
    """
    Valida un símbolo de token.
    
    Args:
        symbol: Símbolo a validar
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if not symbol:
        return False, "Símbolo de token no puede estar vacío"
    
    symbol = str(symbol).upper()
    
    if len(symbol) < 2 or len(symbol) > 10:
        return False, "Símbolo debe tener entre 2 y 10 caracteres"
    
    if not re.match(r'^[A-Z0-9]+$', symbol):
        return False, "Símbolo solo puede contener letras y números"
    
    return True, ""


def validate_list(items: Any, max_length: int = MAX_LIST_LENGTH) -> Tuple[bool, str]:
    """
    Valida una lista.
    
    Args:
        items: Lista a validar
        max_length: Longitud máxima permitida
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if not isinstance(items, list):
        return False, "Debe ser una lista"
    
    if len(items) > max_length:
        return False, f"Lista demasiado larga (max: {max_length})"
    
    return True, ""


def validate_dict(data: Any, required_keys: list = None) -> Tuple[bool, str]:
    """
    Valida un diccionario.
    
    Args:
        data: Diccionario a validar
        required_keys: Lista de claves requeridas
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if not isinstance(data, dict):
        return False, "Debe ser un objeto"
    
    if required_keys:
        for key in required_keys:
            if key not in data:
                return False, f"Campo requerido faltante: {key}"
    
    return True, ""


def validate_url(url: Any) -> Tuple[bool, str]:
    """
    Valida una URL.
    
    Args:
        url: URL a validar
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if not url:
        return False, "URL no puede estar vacía"
    
    url = str(url)
    
    if len(url) > 2000:
        return False, "URL demasiado larga (max: 2000)"
    
    # Validar formato básico de URL
    url_pattern = re.compile(
        r'^https?://'  # http:// o https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # dominio
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
        r'(?::\d+)?'  # puerto opcional
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url_pattern.match(url):
        return False, "Formato de URL inválido"
    
    return True, ""


def validate_hash(hash_value: Any, expected_length: int = 64) -> Tuple[bool, str]:
    """
    Valida un hash (SHA-256 por defecto).
    
    Args:
        hash_value: Hash a validar
        expected_length: Longitud esperada (64 para SHA-256)
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if not hash_value:
        return False, "Hash no puede estar vacío"
    
    hash_value = str(hash_value)
    
    if len(hash_value) != expected_length:
        return False, f"Hash debe tener {expected_length} caracteres"
    
    if not re.match(r'^[a-fA-F0-9]+$', hash_value):
        return False, "Hash debe ser hexadecimal"
    
    return True, ""


def validate_integer(value: Any, min_value: int = None, max_value: int = None) -> Tuple[bool, str, int]:
    """
    Valida un entero.
    
    Args:
        value: Valor a validar
        min_value: Valor mínimo permitido
        max_value: Valor máximo permitido
        
    Returns:
        tuple: (is_valid: bool, error_message: str, validated_value: int)
    """
    try:
        int_value = int(value)
    except (ValueError, TypeError):
        return False, "Debe ser un número entero", 0
    
    if min_value is not None and int_value < min_value:
        return False, f"Valor debe ser al menos {min_value}", 0
    
    if max_value is not None and int_value > max_value:
        return False, f"Valor debe ser como máximo {max_value}", 0
    
    return True, "", int_value


def validate_percentage(value: Any) -> Tuple[bool, str, float]:
    """
    Valida un porcentaje (0-1 o 0-100).
    
    Args:
        value: Valor a validar
        
    Returns:
        tuple: (is_valid: bool, error_message: str, validated_value: float)
    """
    try:
        float_value = float(value)
    except (ValueError, TypeError):
        return False, "Porcentaje debe ser un número", 0
    
    # Normalizar a 0-1 si está en 0-100
    if float_value > 1:
        float_value = float_value / 100
    
    if float_value < 0 or float_value > 1:
        return False, "Porcentaje debe estar entre 0 y 100", 0
    
    return True, "", float_value


def validate_transaction_data(data: dict) -> Tuple[bool, str]:
    """
    Valida datos de una transacción completa.
    
    Args:
        data: Datos de la transacción
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    # Validar que sea un diccionario
    is_valid, error = validate_dict(data, required_keys=['sender', 'recipient', 'amount'])
    if not is_valid:
        return False, error
    
    # Validar sender
    is_valid, error = validate_address(data['sender'])
    if not is_valid:
        return False, f"Sender inválido: {error}"
    
    # Validar recipient
    is_valid, error = validate_address(data['recipient'])
    if not is_valid:
        return False, f"Recipient inválido: {error}"
    
    # Validar amount
    is_valid, error, _ = validate_amount(data['amount'])
    if not is_valid:
        return False, f"Amount inválido: {error}"
    
    # Validar token si existe
    if 'token' in data:
        is_valid, error = validate_token_symbol(data['token'])
        if not is_valid:
            return False, f"Token inválido: {error}"
    
    return True, ""


# Funciones de sanitización
def sanitize_dict(data: dict, max_depth: int = 10, current_depth: int = 0) -> dict:
    """
    Sanitiza recursivamente un diccionario.
    
    Args:
        data: Diccionario a sanitizar
        max_depth: Profundidad máxima de recursión
        current_depth: Profundidad actual
        
    Returns:
        Diccionario sanitizado
    """
    if current_depth >= max_depth:
        return {}
    
    sanitized = {}
    for key, value in data.items():
        # Sanitizar la clave
        clean_key = sanitize_string(str(key), 100)
        
        # Sanitizar el valor según su tipo
        if isinstance(value, str):
            sanitized[clean_key] = sanitize_string(value)
        elif isinstance(value, dict):
            sanitized[clean_key] = sanitize_dict(value, max_depth, current_depth + 1)
        elif isinstance(value, list):
            sanitized[clean_key] = [
                sanitize_string(item) if isinstance(item, str) else item
                for item in value[:MAX_LIST_LENGTH]
            ]
        else:
            sanitized[clean_key] = value
    
    return sanitized


logger.info("✅ Input Validation Module loaded")
