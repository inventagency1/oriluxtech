import hashlib
import json
from time import time


class Block:
    """
    Representa un bloque individual en la blockchain.
    Cada bloque contiene un índice, timestamp, transacciones, proof y el hash del bloque anterior.
    """
    
    def __init__(self, index, timestamp, transactions, proof, previous_hash):
        """
        Inicializa un nuevo bloque.
        
        Args:
            index (int): Posición del bloque en la cadena
            timestamp (float): Momento de creación del bloque
            transactions (list): Lista de transacciones incluidas en el bloque
            proof (int): Proof of work (nonce)
            previous_hash (str): Hash del bloque anterior
        """
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.proof = proof
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        """
        Calcula el hash SHA-256 del bloque.
        
        Returns:
            str: Hash hexadecimal del bloque
        """
        block_string = json.dumps({
            'index': self.index,
            'timestamp': self.timestamp,
            'transactions': self.transactions,
            'proof': self.proof,
            'previous_hash': self.previous_hash
        }, sort_keys=True)
        
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self):
        """
        Convierte el bloque a un diccionario.
        
        Returns:
            dict: Representación del bloque como diccionario
        """
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'transactions': self.transactions,
            'proof': self.proof,
            'previous_hash': self.previous_hash,
            'hash': self.hash
        }
    
    @staticmethod
    def from_dict(block_dict):
        """
        Crea un bloque desde un diccionario.
        
        Args:
            block_dict (dict): Diccionario con los datos del bloque
            
        Returns:
            Block: Instancia de Block
        """
        return Block(
            index=block_dict['index'],
            timestamp=block_dict['timestamp'],
            transactions=block_dict['transactions'],
            proof=block_dict['proof'],
            previous_hash=block_dict['previous_hash']
        )
    
    def __repr__(self):
        return f"Block(index={self.index}, hash={self.hash[:10]}..., transactions={len(self.transactions)})"
