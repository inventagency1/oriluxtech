"""
ORILUXCHAIN - Certificate Manager
Sistema de gestión de certificados de joyería desde Veralix.io
"""

import hashlib
import json
import logging
from time import time
from typing import Dict, List, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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
    def from_veralix_payload(payload: Dict) -> 'JewelryCertificate':
        """Crea un certificado desde el payload de Veralix"""
        return JewelryCertificate(
            certificate_id=payload.get('certificate_id'),
            jewelry_type=payload.get('jewelry_type'),
            material=payload.get('material'),
            weight=payload.get('weight'),
            jeweler=payload.get('jeweler', {}),
            owner=payload.get('owner', {}),
            nft_data=payload.get('nft', {}),
            stones=payload.get('stones', []),
            images=payload.get('images', []),
            metadata=payload.get('metadata', {})
        )


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
