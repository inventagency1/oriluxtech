import json
from time import time
from wallet import Wallet


class Transaction:
    """
    Representa una transacción en Oriluxchain.
    Incluye remitente, destinatario, cantidad y firma digital.
    """
    
    def __init__(self, sender, recipient, amount):
        """
        Inicializa una nueva transacción.
        
        Args:
            sender (str): Dirección del remitente
            recipient (str): Dirección del destinatario
            amount (float): Cantidad a transferir
        """
        self.sender = sender
        self.recipient = recipient
        self.amount = amount
        self.timestamp = time()
        self.signature = None
    
    def to_dict(self):
        """
        Convierte la transacción a un diccionario.
        
        Returns:
            dict: Representación de la transacción
        """
        return {
            'sender': self.sender,
            'recipient': self.recipient,
            'amount': self.amount,
            'timestamp': self.timestamp,
            'signature': self.signature
        }
    
    def get_transaction_data(self):
        """
        Obtiene los datos de la transacción para firmar (sin la firma).
        
        Returns:
            str: Datos de la transacción en formato JSON
        """
        return json.dumps({
            'sender': self.sender,
            'recipient': self.recipient,
            'amount': self.amount,
            'timestamp': self.timestamp
        }, sort_keys=True)
    
    def sign_transaction(self, wallet):
        """
        Firma la transacción usando una wallet.
        
        Args:
            wallet (Wallet): Wallet del remitente
        """
        if wallet.address != self.sender:
            raise ValueError("No puedes firmar transacciones de otras wallets")
        
        transaction_data = self.get_transaction_data()
        self.signature = wallet.sign_transaction(transaction_data)
    
    def is_valid(self, public_key_str=None):
        """
        Verifica si la transacción es válida.
        
        Args:
            public_key_str (str): Clave pública del remitente (opcional)
            
        Returns:
            bool: True si la transacción es válida
        """
        # Las transacciones de minería (NETWORK) son siempre válidas
        if self.sender == 'NETWORK':
            return True
        
        # Verificar que tenga firma
        if not self.signature:
            return False
        
        # Verificar que la cantidad sea positiva
        if self.amount <= 0:
            return False
        
        # Si se proporciona clave pública, verificar la firma
        if public_key_str:
            transaction_data = self.get_transaction_data()
            return Wallet.verify_signature(
                public_key_str,
                transaction_data,
                self.signature
            )
        
        return True
    
    def __repr__(self):
        return f"Transaction(from={self.sender[:10]}..., to={self.recipient[:10]}..., amount={self.amount})"
