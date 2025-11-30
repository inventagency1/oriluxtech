"""
ORILUXCHAIN - JEWELRY CERTIFICATION SYSTEM
Sistema de certificación de joyería integrado con Veralix.io
"""

import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import qrcode
from io import BytesIO
import base64


@dataclass
class JewelryItem:
    """Representa una pieza de joyería"""
    item_id: str
    jewelry_type: str  # ring, necklace, bracelet, earrings, etc.
    material: str  # gold, silver, platinum, etc.
    purity: str  # 24k, 18k, 925, etc.
    weight: float  # gramos
    stones: List[Dict]  # [{type: "diamond", carats: 0.5, clarity: "VS1"}]
    jeweler: str  # Nombre del joyero/marca
    manufacturer: str  # Fabricante
    origin_country: str
    creation_date: str
    description: str
    images: List[str]  # URLs de imágenes
    estimated_value: float  # USD
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    def calculate_hash(self) -> str:
        """Calcula hash único de la pieza"""
        data = json.dumps(self.to_dict(), sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()


@dataclass
class JewelryCertificate:
    """Certificado blockchain de joyería"""
    certificate_id: str
    item: JewelryItem
    owner: str  # Wallet address
    issuer: str  # Joyería/Certificador
    issue_date: str
    blockchain_tx: str  # Transaction hash
    veralix_id: Optional[str]  # ID en Veralix.io
    nft_token_id: Optional[str]  # NFT asociado
    status: str  # active, transferred, lost, stolen
    verification_url: str
    qr_code: Optional[str]  # Base64 QR code
    
    def to_dict(self) -> Dict:
        data = asdict(self)
        data['item'] = self.item.to_dict()
        return data
    
    def generate_qr_code(self) -> str:
        """Genera código QR para verificación"""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(self.verification_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"


class JewelryCertificationSystem:
    """Sistema de certificación de joyería"""
    
    def __init__(self, blockchain, veralix_connector=None):
        self.blockchain = blockchain
        self.veralix_connector = veralix_connector
        self.certificates = {}  # certificate_id -> JewelryCertificate
        self.item_to_cert = {}  # item_id -> certificate_id
        
    def create_certificate(
        self,
        item: JewelryItem,
        owner: str,
        issuer: str
    ) -> JewelryCertificate:
        """Crea un nuevo certificado de joyería"""
        
        # Generar IDs
        certificate_id = f"CERT-{datetime.now().strftime('%Y%m%d')}-{item.calculate_hash()[:8]}"
        issue_date = datetime.now().isoformat()
        
        # Crear transacción en blockchain
        tx_data = {
            'type': 'jewelry_certification',
            'certificate_id': certificate_id,
            'item_hash': item.calculate_hash(),
            'owner': owner,
            'issuer': issuer,
            'timestamp': issue_date
        }
        
        # Agregar transacción a blockchain (como evento de sistema)
        block_index = self.blockchain.add_transaction(
            sender='NETWORK',
            recipient=owner,
            amount=0.0,
            token='ORX',
            data=tx_data
        )
        
        # Generar hash de transacción basado en los datos
        tx_hash = hashlib.sha256(json.dumps(tx_data, sort_keys=True).encode()).hexdigest()
        tx_hash = f"0x{tx_hash}"
        
        # URL de verificación
        verification_url = f"https://oriluxchain.io/verify/{certificate_id}"
        
        # Crear certificado
        certificate = JewelryCertificate(
            certificate_id=certificate_id,
            item=item,
            owner=owner,
            issuer=issuer,
            issue_date=issue_date,
            blockchain_tx=tx_hash,
            veralix_id=None,
            nft_token_id=None,
            status='active',
            verification_url=verification_url,
            qr_code=None
        )
        
        # Generar QR code
        certificate.qr_code = certificate.generate_qr_code()
        
        # Guardar certificado
        self.certificates[certificate_id] = certificate
        self.item_to_cert[item.item_id] = certificate_id
        
        # Sincronizar con Veralix si está conectado
        if self.veralix_connector:
            veralix_id = self._sync_to_veralix(certificate)
            certificate.veralix_id = veralix_id
        
        return certificate
    
    def verify_certificate(self, certificate_id: str) -> Optional[Dict]:
        """Verifica un certificado"""
        certificate = self.certificates.get(certificate_id)
        
        if not certificate:
            return None
        
        # Verificar en blockchain
        blockchain_valid = self._verify_in_blockchain(certificate)
        
        # Verificar en Veralix
        veralix_valid = False
        if self.veralix_connector and certificate.veralix_id:
            veralix_valid = self._verify_in_veralix(certificate)
        
        return {
            'certificate': certificate.to_dict(),
            'valid': blockchain_valid,
            'blockchain_verified': blockchain_valid,
            'veralix_verified': veralix_valid,
            'verification_date': datetime.now().isoformat()
        }
    
    def transfer_ownership(
        self,
        certificate_id: str,
        new_owner: str,
        current_owner: str
    ) -> bool:
        """Transfiere la propiedad de una joya certificada"""
        certificate = self.certificates.get(certificate_id)
        
        if not certificate:
            return False
        
        if certificate.owner != current_owner:
            return False
        
        # Crear transacción de transferencia
        tx_data = {
            'type': 'jewelry_transfer',
            'certificate_id': certificate_id,
            'from': current_owner,
            'to': new_owner,
            'timestamp': datetime.now().isoformat()
        }
        
        tx_hash = self.blockchain.add_transaction(
            sender='NETWORK',
            recipient=new_owner,
            amount=0.0,
            token='ORX',
            data=tx_data
        )
        
        # Actualizar certificado
        certificate.owner = new_owner
        certificate.blockchain_tx = tx_hash
        
        # Sincronizar con Veralix
        if self.veralix_connector:
            self._sync_transfer_to_veralix(certificate, current_owner, new_owner)
        
        return True
    
    def report_lost_or_stolen(
        self,
        certificate_id: str,
        owner: str,
        status: str  # 'lost' or 'stolen'
    ) -> bool:
        """Reporta una joya como perdida o robada"""
        certificate = self.certificates.get(certificate_id)
        
        if not certificate or certificate.owner != owner:
            return False
        
        # Actualizar estado
        certificate.status = status
        
        # Crear transacción de reporte
        tx_data = {
            'type': 'jewelry_report',
            'certificate_id': certificate_id,
            'status': status,
            'reporter': owner,
            'timestamp': datetime.now().isoformat()
        }
        
        self.blockchain.add_transaction(
            sender='NETWORK',
            recipient=owner,
            amount=0.0,
            token='ORX',
            data=tx_data
        )
        
        # Notificar a Veralix
        if self.veralix_connector:
            self._notify_veralix_status_change(certificate)
        
        return True
    
    def get_certificate_history(self, certificate_id: str) -> List[Dict]:
        """Obtiene el historial completo de un certificado"""
        history = []
        
        # Buscar todas las transacciones relacionadas en blockchain
        for block in self.blockchain.chain:
            for tx in block.transactions:
                if isinstance(tx, dict) and tx.get('data'):
                    data = tx['data']
                    if data.get('certificate_id') == certificate_id:
                        history.append({
                            'block': block.index,
                            'timestamp': block.timestamp,
                            'transaction': tx,
                            'type': data.get('type')
                        })
        
        return sorted(history, key=lambda x: x['timestamp'])
    
    def create_nft(self, certificate_id: str) -> Optional[str]:
        """Crea un NFT asociado al certificado"""
        certificate = self.certificates.get(certificate_id)
        
        if not certificate:
            return None
        
        # Crear NFT metadata
        nft_metadata = {
            'name': f"{certificate.item.jewelry_type} - {certificate.item.jeweler}",
            'description': certificate.item.description,
            'image': certificate.item.images[0] if certificate.item.images else None,
            'attributes': [
                {'trait_type': 'Material', 'value': certificate.item.material},
                {'trait_type': 'Purity', 'value': certificate.item.purity},
                {'trait_type': 'Weight', 'value': f"{certificate.item.weight}g"},
                {'trait_type': 'Jeweler', 'value': certificate.item.jeweler},
                {'trait_type': 'Origin', 'value': certificate.item.origin_country},
                {'trait_type': 'Certificate ID', 'value': certificate_id}
            ],
            'certificate_url': certificate.verification_url,
            'blockchain': 'Oriluxchain'
        }
        
        # Mintear NFT (implementar según tu sistema de NFTs)
        # nft_token_id = self.blockchain.nft_manager.mint(...)
        nft_token_id = f"NFT-{certificate_id}"
        
        certificate.nft_token_id = nft_token_id
        
        return nft_token_id
    
    def get_jeweler_certificates(self, jeweler: str) -> List[JewelryCertificate]:
        """Obtiene todos los certificados de un joyero"""
        return [
            cert for cert in self.certificates.values()
            if cert.item.jeweler == jeweler
        ]
    
    def get_owner_certificates(self, owner: str) -> List[JewelryCertificate]:
        """Obtiene todos los certificados de un propietario"""
        return [
            cert for cert in self.certificates.values()
            if cert.owner == owner and cert.status == 'active'
        ]
    
    def search_certificates(self, **filters) -> List[JewelryCertificate]:
        """Busca certificados por filtros"""
        results = []
        
        for cert in self.certificates.values():
            match = True
            
            for key, value in filters.items():
                if key == 'jewelry_type' and cert.item.jewelry_type != value:
                    match = False
                elif key == 'material' and cert.item.material != value:
                    match = False
                elif key == 'jeweler' and cert.item.jeweler != value:
                    match = False
                elif key == 'min_value' and cert.item.estimated_value < value:
                    match = False
                elif key == 'max_value' and cert.item.estimated_value > value:
                    match = False
            
            if match:
                results.append(cert)
        
        return results
    
    # Métodos privados para integración con Veralix
    
    def _sync_to_veralix(self, certificate: JewelryCertificate) -> Optional[str]:
        """Sincroniza certificado con Veralix.io"""
        try:
            response = self.veralix_connector.session.post(
                f"{self.veralix_connector.veralix_url}/api/certificates/create",
                json=certificate.to_dict()
            )
            if response.status_code == 200:
                return response.json().get('veralix_id')
        except Exception as e:
            print(f"Error sincronizando con Veralix: {e}")
        return None
    
    def _verify_in_blockchain(self, certificate: JewelryCertificate) -> bool:
        """Verifica certificado en blockchain"""
        # Buscar transacción original
        for block in self.blockchain.chain:
            for tx in block.transactions:
                if isinstance(tx, dict) and tx.get('data'):
                    data = tx['data']
                    if data.get('certificate_id') == certificate.certificate_id:
                        return True
        return False
    
    def _verify_in_veralix(self, certificate: JewelryCertificate) -> bool:
        """Verifica certificado en Veralix.io"""
        try:
            response = self.veralix_connector.session.get(
                f"{self.veralix_connector.veralix_url}/api/certificates/{certificate.veralix_id}/verify"
            )
            return response.status_code == 200 and response.json().get('valid', False)
        except:
            return False
    
    def _sync_transfer_to_veralix(
        self,
        certificate: JewelryCertificate,
        from_owner: str,
        to_owner: str
    ):
        """Sincroniza transferencia con Veralix"""
        try:
            self.veralix_connector.session.post(
                f"{self.veralix_connector.veralix_url}/api/certificates/{certificate.veralix_id}/transfer",
                json={
                    'from': from_owner,
                    'to': to_owner,
                    'timestamp': datetime.now().isoformat()
                }
            )
        except Exception as e:
            print(f"Error sincronizando transferencia: {e}")
    
    def _notify_veralix_status_change(self, certificate: JewelryCertificate):
        """Notifica cambio de estado a Veralix"""
        try:
            self.veralix_connector.session.post(
                f"{self.veralix_connector.veralix_url}/api/certificates/{certificate.veralix_id}/status",
                json={
                    'status': certificate.status,
                    'timestamp': datetime.now().isoformat()
                }
            )
        except Exception as e:
            print(f"Error notificando a Veralix: {e}")
    
    def export_certificate_pdf(self, certificate_id: str) -> bytes:
        """Exporta certificado como PDF"""
        # Implementar generación de PDF
        # Usar reportlab o similar
        pass
    
    def get_statistics(self) -> Dict:
        """Obtiene estadísticas del sistema"""
        total_certs = len(self.certificates)
        active_certs = len([c for c in self.certificates.values() if c.status == 'active'])
        total_value = sum(c.item.estimated_value for c in self.certificates.values())
        
        jewelers = set(c.item.jeweler for c in self.certificates.values())
        owners = set(c.owner for c in self.certificates.values())
        
        return {
            'total_certificates': total_certs,
            'active_certificates': active_certs,
            'lost_or_stolen': total_certs - active_certs,
            'total_estimated_value': total_value,
            'unique_jewelers': len(jewelers),
            'unique_owners': len(owners),
            'veralix_synced': len([c for c in self.certificates.values() if c.veralix_id])
        }
