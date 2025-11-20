import requests
from urllib.parse import urlparse


class Node:
    """
    Representa un nodo en la red P2P de Oriluxchain.
    Maneja la comunicación con otros nodos y el consenso.
    """
    
    def __init__(self, blockchain):
        """
        Inicializa un nuevo nodo.
        
        Args:
            blockchain (Blockchain): Instancia de la blockchain
        """
        self.blockchain = blockchain
        self.peers = set()  # Conjunto de nodos conectados
    
    def register_peer(self, address):
        """
        Registra un nuevo nodo peer en la red.
        
        Args:
            address (str): URL del nodo (ej: http://localhost:5001)
            
        Returns:
            bool: True si se registró correctamente
        """
        parsed_url = urlparse(address)
        if parsed_url.netloc:
            self.peers.add(parsed_url.netloc)
            return True
        elif parsed_url.path:
            # Si no tiene scheme, asumimos http
            self.peers.add(parsed_url.path)
            return True
        return False
    
    def get_peers(self):
        """
        Obtiene la lista de peers conectados.
        
        Returns:
            list: Lista de direcciones de peers
        """
        return list(self.peers)
    
    def broadcast_block(self, block):
        """
        Transmite un nuevo bloque a todos los peers.
        
        Args:
            block (Block): Bloque a transmitir
        """
        for peer in self.peers:
            try:
                url = f"http://{peer}/blocks/new"
                requests.post(url, json=block.to_dict(), timeout=5)
            except requests.exceptions.RequestException as e:
                print(f"Error al transmitir a {peer}: {e}")
    
    def sync_chain(self):
        """
        Sincroniza la blockchain con los peers.
        Implementa el algoritmo de consenso (cadena más larga).
        
        Returns:
            bool: True si la cadena fue reemplazada
        """
        longest_chain = None
        max_length = len(self.blockchain.chain)
        
        # Consultar todos los peers
        for peer in self.peers:
            try:
                url = f"http://{peer}/chain"
                response = requests.get(url, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    length = data['length']
                    chain_data = data['chain']
                    
                    # Verificar si la cadena es más larga y válida
                    if length > max_length:
                        # Reconstruir la cadena desde los datos
                        from block import Block
                        chain = [Block.from_dict(block_dict) for block_dict in chain_data]
                        
                        if self.blockchain.is_chain_valid(chain):
                            max_length = length
                            longest_chain = chain
            
            except requests.exceptions.RequestException as e:
                print(f"Error al sincronizar con {peer}: {e}")
        
        # Reemplazar la cadena si encontramos una más larga
        if longest_chain:
            self.blockchain.chain = longest_chain
            return True
        
        return False
    
    def resolve_conflicts(self):
        """
        Resuelve conflictos entre nodos usando el consenso de cadena más larga.
        
        Returns:
            bool: True si la cadena fue reemplazada
        """
        return self.sync_chain()
    
    def __repr__(self):
        return f"Node(peers={len(self.peers)}, chain_length={len(self.blockchain.chain)})"
