from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
import binascii


class Wallet:
    """
    Representa una wallet (billetera) en Oriluxchain.
    Genera pares de claves pública/privada y puede firmar transacciones.
    """
    
    def __init__(self):
        """
        Inicializa una nueva wallet generando un par de claves RSA.
        """
        self.private_key = None
        self.public_key = None
        self.address = None
        self.generate_keys()
    
    def generate_keys(self):
        """
        Genera un nuevo par de claves RSA (2048 bits).
        """
        key = RSA.generate(2048)
        self.private_key = key
        self.public_key = key.publickey()
        
        # La dirección es la representación hexadecimal de la clave pública
        self.address = binascii.hexlify(
            self.public_key.export_key(format='DER')
        ).decode('ascii')[:40]  # Primeros 40 caracteres como dirección
    
    def sign_transaction(self, transaction_data):
        """
        Firma una transacción usando la clave privada.
        
        Args:
            transaction_data (str): Datos de la transacción a firmar
            
        Returns:
            str: Firma digital en formato hexadecimal
        """
        if self.private_key is None:
            raise ValueError("No se puede firmar sin clave privada")
        
        # Crear hash de los datos
        h = SHA256.new(transaction_data.encode('utf-8'))
        
        # Firmar el hash
        signature = pkcs1_15.new(self.private_key).sign(h)
        
        return binascii.hexlify(signature).decode('ascii')
    
    @staticmethod
    def verify_signature(public_key_str, transaction_data, signature):
        """
        Verifica la firma de una transacción.
        
        Args:
            public_key_str (str): Clave pública en formato PEM
            transaction_data (str): Datos de la transacción
            signature (str): Firma en formato hexadecimal
            
        Returns:
            bool: True si la firma es válida, False en caso contrario
        """
        try:
            # Importar la clave pública
            public_key = RSA.import_key(public_key_str)
            
            # Crear hash de los datos
            h = SHA256.new(transaction_data.encode('utf-8'))
            
            # Convertir firma de hex a bytes
            signature_bytes = binascii.unhexlify(signature)
            
            # Verificar la firma
            pkcs1_15.new(public_key).verify(h, signature_bytes)
            return True
        except (ValueError, TypeError):
            return False
    
    def export_keys(self):
        """
        Exporta las claves en formato PEM.
        
        Returns:
            dict: Diccionario con las claves privada y pública
        """
        return {
            'private_key': self.private_key.export_key().decode('utf-8'),
            'public_key': self.public_key.export_key().decode('utf-8'),
            'address': self.address
        }
    
    def import_keys(self, private_key_pem):
        """
        Importa una clave privada desde formato PEM.
        
        Args:
            private_key_pem (str): Clave privada en formato PEM
        """
        self.private_key = RSA.import_key(private_key_pem)
        self.public_key = self.private_key.publickey()
        
        self.address = binascii.hexlify(
            self.public_key.export_key(format='DER')
        ).decode('ascii')[:40]
    
    def __repr__(self):
        return f"Wallet(address={self.address})"
