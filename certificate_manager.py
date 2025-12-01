"""
ORILUXCHAIN - Certificate Manager
Sistema de gestión de certificados de joyería desde Veralix.io
PARCHE 2.6: Validación robusta de certificados
"""

import hashlib
import json
import logging
import re
from time import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PARCHE 2.6: Constantes de validación
MAX_STRING_LENGTH = 500
MAX_WEIGHT_VALUE = 10000  # gramos
VALID_JEWELRY_TYPES = ['ring', 'necklace', 'bracelet', 'earring', 'pendant', 'watch', 'other']
VALID_MATERIALS = ['gold', 'silver', 'platinum', 'palladium', 'titanium', 'steel', 'other']


class JewelryCertificate:
    """Representa un certificado de joyería"""
    
    def __init__(
        self,
        certificate_id: str,
        jewelry_type: str,
        material: str,
        weight: str,
        jeweler: Dict,
        owner: Dict,
        nft_data: Dict = None,
        stones: List[Dict] = None,
        images: List[str] = None,
        metadata: Dict = None
    ):
        self.certificate_id = certificate_id
        self.jewelry_type = jewelry_type
        self.material = material
        self.weight = weight
        self.jeweler = jeweler
        self.owner = owner
        self.nft_data = nft_data or {}
        self.stones = stones or []
        self.images = images or []
        self.metadata = metadata or {}
        self.timestamp = time()
        self.blockchain_tx = None
        self.block_number = None
        self.verified = False
        
    def calculate_hash(self) -> str:
        """Calcula el hash del certificado"""
        cert_string = json.dumps({
            'certificate_id': self.certificate_id,
            'jewelry_type': self.jewelry_type,
            'material': self.material,
            'weight': self.weight,
            'jeweler': self.jeweler,
            'owner': self.owner,
            'stones': self.stones,
            'timestamp': self.timestamp
        }, sort_keys=True)
        
        return hashlib.sha256(cert_string.encode()).hexdigest()
    
    def to_dict(self) -> Dict:
        """Convierte el certificado a diccionario"""
        return {
            'certificate_id': self.certificate_id,
            'jewelry_type': self.jewelry_type,
            'material': self.material,
            'weight': self.weight,
            'jeweler': self.jeweler,
            'owner': self.owner,
            'nft_data': self.nft_data,
            'stones': self.stones,
            'images': self.images,
            'metadata': self.metadata,
            'timestamp': self.timestamp,
            'blockchain': {
                'tx_hash': self.blockchain_tx,
                'block_number': self.block_number,
                'verified': self.verified,
                'hash': self.calculate_hash()
            }
        }
    
    @staticmethod
    def validate_certificate_data(payload: Dict) -> Tuple[bool, str]:
        """
        Valida los datos de un certificado.
        PARCHE 2.6: Validación robusta implementada
        
        Returns:
            tuple: (is_valid: bool, error_message: str)
        """
        # Validar campos requeridos
        required_fields = ['certificate_id', 'jewelry_type', 'material', 'weight']
        for field in required_fields:
            if field not in payload or not payload[field]:
                return False, f"Campo requerido faltante: {field}"
        
        # Validar certificate_id
        cert_id = str(payload['certificate_id'])
        if len(cert_id) > MAX_STRING_LENGTH:
            return False, f"certificate_id demasiado largo (max: {MAX_STRING_LENGTH})"
        if not re.match(r'^[a-zA-Z0-9_-]+$', cert_id):
            return False, "certificate_id contiene caracteres inválidos"
        
        # Validar jewelry_type
        jewelry_type = str(payload['jewelry_type']).lower()
        if jewelry_type not in VALID_JEWELRY_TYPES:
            return False, f"jewelry_type inválido. Debe ser uno de: {VALID_JEWELRY_TYPES}"
        
        # Validar material
        material = str(payload['material']).lower()
        if material not in VALID_MATERIALS:
            return False, f"material inválido. Debe ser uno de: {VALID_MATERIALS}"
        
        # Validar weight
        try:
            weight_value = float(str(payload['weight']).replace('g', '').strip())
            if weight_value <= 0 or weight_value > MAX_WEIGHT_VALUE:
                return False, f"weight debe estar entre 0 y {MAX_WEIGHT_VALUE}g"
        except ValueError:
            return False, "weight debe ser un número válido"
        
        # Validar jeweler (si existe)
        if 'jeweler' in payload and payload['jeweler']:
            jeweler = payload['jeweler']
            if not isinstance(jeweler, dict):
                return False, "jeweler debe ser un objeto"
            if 'name' in jeweler and len(str(jeweler['name'])) > MAX_STRING_LENGTH:
                return False, "jeweler.name demasiado largo"
        
        # Validar owner (si existe)
        if 'owner' in payload and payload['owner']:
            owner = payload['owner']
            if not isinstance(owner, dict):
                return False, "owner debe ser un objeto"
            if 'name' in owner and len(str(owner['name'])) > MAX_STRING_LENGTH:
                return False, "owner.name demasiado largo"
        
        # Validar stones (si existe)
        if 'stones' in payload and payload['stones']:
            if not isinstance(payload['stones'], list):
                return False, "stones debe ser una lista"
            if len(payload['stones']) > 100:
                return False, "Demasiadas piedras (max: 100)"
        
        # Validar images (si existe)
        if 'images' in payload and payload['images']:
            if not isinstance(payload['images'], list):
                return False, "images debe ser una lista"
            if len(payload['images']) > 20:
                return False, "Demasiadas imágenes (max: 20)"
            for img in payload['images']:
                if not isinstance(img, str) or len(img) > 1000:
                    return False, "URL de imagen inválida"
        
        return True, "Certificado válido"
    
    @staticmethod
    def from_veralix_payload(payload: Dict) -> Tuple[Optional['JewelryCertificate'], str]:
        """
        Crea un certificado desde el payload de Veralix.
        PARCHE 2.6: Con validación completa
        
        Returns:
            tuple: (certificate: JewelryCertificate | None, error_message: str)
        """
        # PARCHE 2.6: Validar datos antes de crear
        is_valid, error_msg = JewelryCertificate.validate_certificate_data(payload)
        if not is_valid:
            logger.warning(f"Certificado inválido: {error_msg}")
            return None, error_msg
        
        try:
            cert = JewelryCertificate(
                certificate_id=str(payload['certificate_id']),
                jewelry_type=str(payload['jewelry_type']).lower(),
                material=str(payload['material']).lower(),
                weight=str(payload['weight']),
                jeweler=payload.get('jeweler', {}),
                owner=payload.get('owner', {}),
                nft_data=payload.get('nft', {}),
                stones=payload.get('stones', []),
                images=payload.get('images', []),
                metadata=payload.get('metadata', {})
            )
            return cert, "Certificado creado exitosamente"
        except Exception as e:
            logger.error(f"Error creando certificado: {e}")
            return None, f"Error creando certificado: {str(e)}"


class CertificateManager:
    """Gestor de certificados de joyería"""
    
    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.certificates: Dict[str, JewelryCertificate] = {}
        logger.info("Certificate Manager initialized")
    
    def register_certificate(self, certificate: JewelryCertificate) -> Dict:
        """
        Registra un certificado en la blockchain
        
        Args:
            certificate: Certificado a registrar
            
        Returns:
            Resultado del registro con TX hash y block number
        """
        try:
            # Calcular hash del certificado
            cert_hash = certificate.calculate_hash()
            
            # Crear transacción especial para certificado
            tx_index = self.blockchain.add_transaction(
                sender='VERALIX',
                recipient=certificate.owner.get('wallet_address', 'UNASSIGNED'),
                amount=0,  # Certificados no transfieren valor
                token='VRX'  # Usar VRX para certificados premium
            )
            
            # Añadir metadata del certificado a la transacción
            if self.blockchain.pending_transactions:
                last_tx = self.blockchain.pending_transactions[-1]
                last_tx['certificate'] = {
                    'id': certificate.certificate_id,
                    'type': 'JEWELRY_CERTIFICATE',
                    'hash': cert_hash,
                    'jewelry_type': certificate.jewelry_type,
                    'material': certificate.material,
                    'jeweler': certificate.jeweler.get('name'),
                    'nft_token_id': certificate.nft_data.get('token_id')
                }
            
            # Guardar certificado
            self.certificates[certificate.certificate_id] = certificate
            
            logger.info(f"Certificate {certificate.certificate_id} registered, pending mining")
            
            return {
                'success': True,
                'certificate_id': certificate.certificate_id,
                'hash': cert_hash,
                'pending_block': tx_index,
                'status': 'pending_mining'
            }
            
        except Exception as e:
            logger.error(f"Error registering certificate: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_certificate(self, certificate_id: str) -> Optional[Dict]:
        """
        Verifica un certificado en la blockchain
        
        Args:
            certificate_id: ID del certificado
            
        Returns:
            Información de verificación o None si no existe
        """
        certificate = self.certificates.get(certificate_id)
        
        if not certificate:
            # Buscar en la blockchain
            for block in self.blockchain.chain:
                for tx in block.transactions:
                    if isinstance(tx, dict) and tx.get('certificate', {}).get('id') == certificate_id:
                        return {
                            'found': True,
                            'verified': True,
                            'block_number': block.index,
                            'timestamp': block.timestamp,
                            'tx_hash': block.hash,
                            'certificate_data': tx.get('certificate')
                        }
            
            return None
        
        # Buscar en qué bloque está el certificado
        for block in self.blockchain.chain:
            for tx in block.transactions:
                if isinstance(tx, dict) and tx.get('certificate', {}).get('id') == certificate_id:
                    certificate.blockchain_tx = block.hash
                    certificate.block_number = block.index
                    certificate.verified = True
                    
                    return {
                        'found': True,
                        'verified': True,
                        'certificate': certificate.to_dict(),
                        'block_number': block.index,
                        'block_hash': block.hash,
                        'timestamp': block.timestamp
                    }
        
        # Certificado registrado pero no minado aún
        return {
            'found': True,
            'verified': False,
            'certificate': certificate.to_dict(),
            'status': 'pending_mining'
        }
    
    def get_certificate(self, certificate_id: str) -> Optional[JewelryCertificate]:
        """Obtiene un certificado por ID"""
        return self.certificates.get(certificate_id)
    
    def get_certificates_by_owner(self, wallet_address: str) -> List[Dict]:
        """Obtiene todos los certificados de un propietario"""
        owner_certs = []
        
        for cert in self.certificates.values():
            if cert.owner.get('wallet_address') == wallet_address:
                owner_certs.append(cert.to_dict())
        
        return owner_certs
    
    def get_certificates_by_jeweler(self, jeweler_name: str) -> List[Dict]:
        """Obtiene todos los certificados de una joyería"""
        jeweler_certs = []
        
        for cert in self.certificates.values():
            if cert.jeweler.get('name') == jeweler_name:
                jeweler_certs.append(cert.to_dict())
        
        return jeweler_certs
    
    def get_recent_certificates(self, limit: int = 10) -> List[Dict]:
        """Obtiene los certificados más recientes"""
        sorted_certs = sorted(
            self.certificates.values(),
            key=lambda x: x.timestamp,
            reverse=True
        )
        
        return [cert.to_dict() for cert in sorted_certs[:limit]]
    
    def get_stats(self) -> Dict:
        """Obtiene estadísticas de certificados"""
        total = len(self.certificates)
        verified = sum(1 for cert in self.certificates.values() if cert.verified)
        
        # Contar por tipo de joyería
        by_type = {}
        for cert in self.certificates.values():
            jewelry_type = cert.jewelry_type
            by_type[jewelry_type] = by_type.get(jewelry_type, 0) + 1
        
        return {
            'total_certificates': total,
            'verified_certificates': verified,
            'pending_certificates': total - verified,
            'by_jewelry_type': by_type
        }
    
    def to_dict(self) -> Dict:
        """Convierte el manager a diccionario"""
        return {
            'certificates': {
                cert_id: cert.to_dict()
                for cert_id, cert in self.certificates.items()
            },
            'stats': self.get_stats()
        }
