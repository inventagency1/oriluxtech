import requests
from urllib.parse import urlparse
import logging
import time

# Configurar logging
logger = logging.getLogger(__name__)

# Constantes de seguridad
MAX_REORG_DEPTH = 10  # Máximo de bloques para reorganización
MAX_BLOCK_SIZE = 1000000  # 1MB
MAX_TRANSACTIONS_PER_BLOCK = 1000

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
    
    def validate_received_block(self, block_data):
        """
        Valida un bloque recibido de otro nodo antes de agregarlo.
        
        Args:
            block_data (dict): Datos del bloque recibido
            
        Returns:
            tuple: (bool, str) - (es_válido, mensaje_error)
        """
        try:
            # Validar que tenga todos los campos requeridos
            required_fields = ['index', 'timestamp', 'transactions', 'proof', 'previous_hash', 'hash']
            for field in required_fields:
                if field not in block_data:
                    return False, f"Campo requerido faltante: {field}"
            
            # Validar tipos de datos
            if not isinstance(block_data['index'], int) or block_data['index'] < 0:
                return False, "Índice inválido"
            
            if not isinstance(block_data['timestamp'], (int, float)) or block_data['timestamp'] < 0:
                return False, "Timestamp inválido"
            
            if not isinstance(block_data['transactions'], list):
                return False, "Transacciones deben ser una lista"
            
            # Validar límites de seguridad
            if len(block_data['transactions']) > MAX_TRANSACTIONS_PER_BLOCK:
                return False, f"Demasiadas transacciones ({len(block_data['transactions'])} > {MAX_TRANSACTIONS_PER_BLOCK})"
            
            # Validar tamaño del bloque
            import json
            block_size = len(json.dumps(block_data).encode('utf-8'))
            if block_size > MAX_BLOCK_SIZE:
                return False, f"Bloque demasiado grande ({block_size} > {MAX_BLOCK_SIZE} bytes)"
            
            # Validar timestamp (no puede ser del futuro)
            current_time = time.time()
            if block_data['timestamp'] > current_time + 300:  # 5 minutos de tolerancia
                return False, "Timestamp del futuro"
            
            # Validar que el índice sea el siguiente esperado
            expected_index = len(self.blockchain.chain)
            if block_data['index'] != expected_index:
                return False, f"Índice incorrecto (esperado: {expected_index}, recibido: {block_data['index']})"
            
            # Validar previous_hash
            if len(self.blockchain.chain) > 0:
                last_block = self.blockchain.chain[-1]
                if block_data['previous_hash'] != last_block.hash:
                    return False, "Previous hash no coincide"
            
            # Reconstruir bloque y validar hash
            from block import Block
            block = Block.from_dict(block_data)
            calculated_hash = block.calculate_hash()
            
            if calculated_hash != block_data['hash']:
                return False, "Hash del bloque inválido"
            
            # Validar proof of work
            if not self.blockchain.valid_proof(block_data['proof'], block_data['previous_hash']):
                return False, "Proof of work inválido"
            
            # Validar todas las transacciones del bloque
            for tx_data in block_data['transactions']:
                is_valid, error_msg = self.blockchain.validate_transaction(tx_data)
                if not is_valid:
                    return False, f"Transacción inválida: {error_msg}"
            
            logger.info(f"Bloque #{block_data['index']} validado correctamente")
            return True, "Bloque válido"
            
        except Exception as e:
            logger.error(f"Error validando bloque: {e}")
            return False, f"Error de validación: {str(e)}"
    
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
                logger.warning(f"Error al transmitir a {peer}: {e}")
    
    def sync_chain(self):
        """
        Sincroniza la blockchain con los peers.
        Implementa el algoritmo de consenso (cadena más larga) con protección contra reorgs profundas.
        
        Returns:
            bool: True si la cadena fue reemplazada
        """
        longest_chain = None
        max_length = len(self.blockchain.chain)
        current_length = len(self.blockchain.chain)
        
        # Consultar todos los peers
        for peer in self.peers:
            try:
                url = f"http://{peer}/chain"
                response = requests.get(url, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    length = data['length']
                    chain_data = data['chain']
                    
                    # Verificar si la cadena es más larga
                    if length > max_length:
                        # SEGURIDAD: Protección contra reorganizaciones profundas
                        reorg_depth = abs(length - current_length)
                        if reorg_depth > MAX_REORG_DEPTH:
                            logger.warning(
                                f"Reorganización rechazada: profundidad {reorg_depth} > límite {MAX_REORG_DEPTH}"
                            )
                            continue
                        
                        # Reconstruir la cadena desde los datos
                        from block import Block
                        chain = [Block.from_dict(block_dict) for block_dict in chain_data]
                        
                        # Validar la cadena completa
                        if self.blockchain.is_chain_valid(chain):
                            # Validar cada bloque individualmente
                            all_valid = True
                            for i, block_dict in enumerate(chain_data):
                                if i == 0:  # Skip genesis
                                    continue
                                # Validación básica de cada bloque
                                if not isinstance(block_dict.get('index'), int):
                                    all_valid = False
                                    break
                                if not isinstance(block_dict.get('hash'), str):
                                    all_valid = False
                                    break
                            
                            if all_valid:
                                max_length = length
                                longest_chain = chain
                                logger.info(f"Cadena válida encontrada de longitud {length}")
                            else:
                                logger.warning(f"Cadena de {peer} contiene bloques inválidos")
                        else:
                            logger.warning(f"Cadena de {peer} no es válida")
            
            except requests.exceptions.RequestException as e:
                logger.warning(f"Error al sincronizar con {peer}: {e}")
            except Exception as e:
                logger.error(f"Error inesperado sincronizando con {peer}: {e}")
        
        # Reemplazar la cadena si encontramos una más larga y válida
        if longest_chain:
            logger.info(f"Reemplazando cadena: {current_length} -> {max_length} bloques")
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
