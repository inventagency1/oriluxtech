"""
ORILUXCHAIN - Blockchain Core Mejorado
Versión optimizada con validaciones robustas, manejo de errores y logging
"""

import hashlib
import json
import logging
from time import time
from typing import List, Dict, Optional, Tuple
from block import Block
from token_system import TokenManager, StakingPool
from smart_contract import ContractManager

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BlockchainError(Exception):
    """Excepción base para errores de blockchain"""
    pass


class InvalidTransactionError(BlockchainError):
    """Error para transacciones inválidas"""
    pass


class InvalidBlockError(BlockchainError):
    """Error para bloques inválidos"""
    pass


class InsufficientBalanceError(BlockchainError):
    """Error para balance insuficiente"""
    pass


class Blockchain:
    """
    Implementación mejorada de la blockchain Oriluxchain.
    
    Features:
    - Validación robusta de transacciones y bloques
    - Manejo de errores comprehensivo
    - Logging detallado
    - Optimizaciones de performance
    - Sistema dual-token (ORX/VRX)
    - Smart contracts integrados
    """
    
    # Constantes
    MAX_TRANSACTIONS_PER_BLOCK = 1000
    MIN_DIFFICULTY = 1
    MAX_DIFFICULTY = 10
    BLOCK_TIME_TARGET = 60  # segundos
    
    def __init__(self, difficulty: int = 4):
        """
        Inicializa una nueva blockchain.
        
        Args:
            difficulty: Número de ceros iniciales requeridos en el hash (1-10)
            
        Raises:
            ValueError: Si la dificultad está fuera de rango
        """
        if not self.MIN_DIFFICULTY <= difficulty <= self.MAX_DIFFICULTY:
            raise ValueError(
                f"Difficulty must be between {self.MIN_DIFFICULTY} and {self.MAX_DIFFICULTY}"
            )
        
        self.chain: List[Block] = []
        self.pending_transactions: List[Dict] = []
        self.difficulty = difficulty
        self.mining_reward = 50  # 50 VRX por bloque minado
        
        # Sistema de tokens (VRX como token nativo)
        self.token_manager = TokenManager()
        self.staking_pool = StakingPool(self.token_manager)
        
        # Sistema de smart contracts
        self.contract_manager = ContractManager()
        
        # Métricas
        self.total_transactions = 0
        self.total_blocks_mined = 0
        
        # SECURITY FIX: Protección double-spending
        self.spent_transactions = set()  # IDs de transacciones ya gastadas
        self.transaction_nonces = {}  # sender -> nonce counter
        
        # Crear el bloque génesis
        self.create_genesis_block()
        
        logger.info(f"Blockchain initialized with difficulty={difficulty}")
    
    def create_genesis_block(self) -> None:
        """Crea el primer bloque de la cadena (bloque génesis)."""
        genesis_block = Block(
            index=0,
            timestamp=time(),
            transactions=[],
            proof=100,
            previous_hash="0"
        )
        self.chain.append(genesis_block)
        
        # Inicializar tokens
        self.token_manager.initialize_tokens('GENESIS')
        
        logger.info("Genesis block created")
    
    def get_latest_block(self) -> Block:
        """
        Obtiene el último bloque de la cadena.
        
        Returns:
            Último bloque en la cadena
            
        Raises:
            BlockchainError: Si la cadena está vacía
        """
        if not self.chain:
            raise BlockchainError("Blockchain is empty")
        return self.chain[-1]
    
    def _generate_transaction_id(self, transaction: Dict) -> str:
        """
        Genera un ID único para una transacción.
        
        Args:
            transaction: Diccionario con datos de la transacción
            
        Returns:
            Hash SHA-256 de la transacción
        """
        import json
        tx_string = json.dumps({
            'sender': transaction['sender'],
            'recipient': transaction['recipient'],
            'amount': transaction['amount'],
            'token': transaction['token'],
            'timestamp': transaction.get('timestamp', time()),
            'nonce': transaction.get('nonce', 0)
        }, sort_keys=True)
        
        return hashlib.sha256(tx_string.encode()).hexdigest()
    
    def _is_transaction_spent(self, tx_id: str) -> bool:
        """Verifica si una transacción ya fue gastada."""
        return tx_id in self.spent_transactions
    
    def _mark_transaction_spent(self, tx_id: str):
        """Marca una transacción como gastada."""
        self.spent_transactions.add(tx_id)
    
    def _get_next_nonce(self, sender: str) -> int:
        """Obtiene el siguiente nonce para un sender."""
        if sender not in self.transaction_nonces:
            self.transaction_nonces[sender] = 0
        return self.transaction_nonces[sender]
    
    def _increment_nonce(self, sender: str):
        """Incrementa el nonce de un sender."""
        if sender not in self.transaction_nonces:
            self.transaction_nonces[sender] = 0
        self.transaction_nonces[sender] += 1
    
    def validate_transaction(self, transaction: Dict) -> Tuple[bool, Optional[str]]:
        """
        Valida una transacción antes de añadirla.
        
        Args:
            transaction: Diccionario con datos de la transacción
            
        Returns:
            Tupla (es_válida, mensaje_error)
        """
        # Validar campos requeridos
        required_fields = ['sender', 'recipient', 'amount', 'token']
        for field in required_fields:
            if field not in transaction:
                return False, f"Missing required field: {field}"
        
        # Validar tipos
        if not isinstance(transaction['amount'], (int, float)):
            return False, "Amount must be a number"
        
        # Permitir amount=0 solo para transacciones de sistema (NETWORK)
        # Esto es necesario para eventos de certificación, transferencias de propiedad, etc.
        if transaction['amount'] < 0:
            return False, "Amount cannot be negative"
        
        if transaction['amount'] == 0 and transaction['sender'] != 'NETWORK':
            return False, "Amount must be positive for non-system transactions"
        
        # Validar token
        if transaction['token'] not in ['ORX', 'VRX']:
            return False, f"Invalid token: {transaction['token']}"
        
        # SECURITY FIX: Verificar double-spending
        if transaction['sender'] not in ['NETWORK', 'GENESIS', 'MINING_POOL', 'BRIDGE_LOCK', 'BRIDGE_UNLOCK']:
            # Agregar nonce si no existe
            if 'nonce' not in transaction:
                transaction['nonce'] = self._get_next_nonce(transaction['sender'])
            
            # Generar ID de transacción
            tx_id = self._generate_transaction_id(transaction)
            
            # Verificar si ya fue gastada
            if self._is_transaction_spent(tx_id):
                return False, "Transaction already spent (double-spending detected)"
            
            # Verificar nonce correcto
            expected_nonce = self._get_next_nonce(transaction['sender'])
            if transaction['nonce'] != expected_nonce:
                return False, f"Invalid nonce. Expected {expected_nonce}, got {transaction['nonce']}"
        
        # Validar balance (excepto transacciones de red)
        if transaction['sender'] != 'NETWORK':
            balance = self.get_balance(transaction['sender'], transaction['token'])
            if balance < transaction['amount']:
                return False, f"Insufficient balance. Has {balance}, needs {transaction['amount']}"
        
        # SECURITY FIX: Validar firma digital
        if transaction['sender'] not in ['NETWORK', 'GENESIS', 'MINING_POOL', 'BRIDGE_LOCK', 'BRIDGE_UNLOCK']:
            if 'signature' not in transaction:
                return False, "Missing transaction signature"
            
            if 'public_key' not in transaction:
                return False, "Missing public key"
            
            # Verificar firma usando Wallet
            try:
                from wallet import Wallet
                from transaction import Transaction
                
                # Reconstruir datos para verificación
                tx_data = {
                    'sender': transaction['sender'],
                    'recipient': transaction['recipient'],
                    'amount': transaction['amount'],
                    'timestamp': transaction.get('timestamp', time())
                }
                
                # Verificar firma
                import json
                data_string = json.dumps(tx_data, sort_keys=True)
                
                if not Wallet.verify_signature(
                    transaction['public_key'],
                    data_string,
                    transaction['signature']
                ):
                    return False, "Invalid transaction signature"
                    
            except Exception as e:
                logger.error(f"Signature verification failed: {e}")
                return False, f"Signature verification error: {str(e)}"
        
        return True, None
    
    def add_transaction(
        self,
        sender: str,
        recipient: str,
        amount: float,
        token: str = 'ORX',
        data: Optional[Dict] = None  # Agregado soporte para data
    ) -> int:
        """
        Añade una nueva transacción a la lista de transacciones pendientes.
        
        Args:
            sender: Dirección del remitente
            recipient: Dirección del destinatario
            amount: Cantidad a transferir
            token: Token a transferir (ORX o VRX)
            data: Datos adicionales opcionales (para certificados, smart contracts, etc.)
            
        Returns:
            Índice del bloque que contendrá esta transacción
            
        Raises:
            InvalidTransactionError: Si la transacción es inválida
        """
        transaction = {
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
            'token': token,
            'timestamp': time(),
            'data': data  # Guardar data en la transacción
        }
        
        # Validar transacción
        is_valid, error_msg = self.validate_transaction(transaction)
        if not is_valid:
            logger.warning(f"Invalid transaction rejected: {error_msg}")
            raise InvalidTransactionError(error_msg)
        
        # Verificar límite de transacciones pendientes
        if len(self.pending_transactions) >= self.MAX_TRANSACTIONS_PER_BLOCK:
            logger.warning("Max pending transactions reached, transaction queued")
        
        # SECURITY FIX: Marcar transacción como gastada e incrementar nonce
        if sender not in ['NETWORK', 'GENESIS', 'MINING_POOL', 'BRIDGE_LOCK', 'BRIDGE_UNLOCK']:
            tx_id = self._generate_transaction_id(transaction)
            self._mark_transaction_spent(tx_id)
            self._increment_nonce(sender)
        
        self.pending_transactions.append(transaction)
        self.total_transactions += 1
        
        logger.info(
            f"Transaction added: {sender[:10]}... -> {recipient[:10]}... "
            f"({amount} {token})"
        )
        
        return self.get_latest_block().index + 1
    
    def mine_pending_transactions(self, miner_address: str) -> Block:
        """
        Mina un nuevo bloque con las transacciones pendientes.
        
        Args:
            miner_address: Dirección del minero que recibirá la recompensa
            
        Returns:
            Nuevo bloque minado
            
        Raises:
            BlockchainError: Si hay un error durante la minería
        """
        if not miner_address:
            raise BlockchainError("Miner address is required")
        
        # Limitar transacciones por bloque
        transactions_to_mine = self.pending_transactions[:self.MAX_TRANSACTIONS_PER_BLOCK]
        
        logger.info(f"Starting mining with {len(transactions_to_mine)} transactions")
        
        start_time = time()
        
        # Crear el bloque
        block = Block(
            index=len(self.chain),
            timestamp=start_time,
            transactions=transactions_to_mine,
            proof=0,
            previous_hash=self.get_latest_block().hash
        )
        
        # Realizar proof of work
        block.proof = self.proof_of_work(block)
        block.hash = block.calculate_hash()
        
        # Validar bloque antes de añadirlo
        if not self.is_valid_block(block):
            raise InvalidBlockError("Mined block failed validation")
        
        # Añadir el bloque a la cadena
        self.chain.append(block)
        self.total_blocks_mined += 1
        
        # Procesar transacciones del bloque
        for tx in block.transactions:
            try:
                token_obj = self.token_manager.get_token(tx.get('token', 'ORX'))
                if tx['sender'] != 'NETWORK':
                    token_obj.transfer(tx['sender'], tx['recipient'], tx['amount'])
            except Exception as e:
                logger.error(f"Error processing transaction: {e}")
        
        # Resetear transacciones pendientes
        self.pending_transactions = self.pending_transactions[self.MAX_TRANSACTIONS_PER_BLOCK:]
        
        # Añadir recompensas de minería
        self._add_mining_rewards(miner_address)
        
        mining_time = time() - start_time
        logger.info(
            f"Block #{block.index} mined in {mining_time:.2f}s "
            f"(difficulty={self.difficulty}, proof={block.proof})"
        )
        
        # Ajustar dificultad si es necesario
        self._adjust_difficulty(mining_time)
        
        return block
    
    def _add_mining_rewards(self, miner_address: str) -> None:
        """Añade las recompensas de minería al minero (solo VRX)."""
        # Añadir transacción de recompensa VRX
        self.pending_transactions.append({
            'sender': 'NETWORK',
            'recipient': miner_address,
            'amount': self.mining_reward,
            'token': 'VRX',
            'timestamp': time()
        })
        
        # Acuñar recompensa VRX
        self.token_manager.vrx.mint(miner_address, self.mining_reward)
    
    def _adjust_difficulty(self, mining_time: float) -> None:
        """
        Ajusta la dificultad basándose en el tiempo de minería.
        
        Args:
            mining_time: Tiempo que tomó minar el último bloque
        """
        # Ajustar cada 10 bloques
        if len(self.chain) % 10 != 0:
            return
        
        if mining_time < self.BLOCK_TIME_TARGET * 0.5:
            # Demasiado rápido, aumentar dificultad
            if self.difficulty < self.MAX_DIFFICULTY:
                self.difficulty += 1
                logger.info(f"Difficulty increased to {self.difficulty}")
        elif mining_time > self.BLOCK_TIME_TARGET * 2:
            # Demasiado lento, disminuir dificultad
            if self.difficulty > self.MIN_DIFFICULTY:
                self.difficulty -= 1
                logger.info(f"Difficulty decreased to {self.difficulty}")
    
    def proof_of_work(self, block: Block) -> int:
        """
        Algoritmo de Proof of Work optimizado.
        
        Args:
            block: Bloque a minar
            
        Returns:
            Proof (nonce) que satisface la dificultad
        """
        block.proof = 0
        target = '0' * self.difficulty
        
        while True:
            computed_hash = block.calculate_hash()
            if computed_hash.startswith(target):
                return block.proof
            block.proof += 1
            
            # Log cada 100000 intentos
            if block.proof % 100000 == 0:
                logger.debug(f"Mining... proof={block.proof}")
    
    def is_valid_block(self, block: Block) -> bool:
        """
        Verifica si un bloque es válido.
        
        Args:
            block: Bloque a verificar
            
        Returns:
            True si el bloque es válido
        """
        # Verificar proof of work
        if not self.is_valid_proof(block):
            logger.warning(f"Invalid proof for block {block.index}")
            return False
        
        # Verificar hash
        if block.hash != block.calculate_hash():
            logger.warning(f"Invalid hash for block {block.index}")
            return False
        
        # Verificar enlace con bloque anterior
        if block.index > 0:
            previous_block = self.chain[block.index - 1]
            if block.previous_hash != previous_block.hash:
                logger.warning(f"Invalid previous_hash for block {block.index}")
                return False
        
        return True
    
    def is_valid_proof(self, block: Block) -> bool:
        """Verifica si el proof del bloque es válido."""
        computed_hash = block.calculate_hash()
        return computed_hash.startswith('0' * self.difficulty)
    
    def is_chain_valid(self, chain: Optional[List[Block]] = None) -> bool:
        """
        Verifica si la blockchain es válida.
        
        Args:
            chain: Cadena a validar (por defecto, la cadena actual)
            
        Returns:
            True si la cadena es válida
        """
        if chain is None:
            chain = self.chain
        
        if not chain:
            return False
        
        for i in range(1, len(chain)):
            current_block = chain[i]
            previous_block = chain[i - 1]
            
            # Verificar hash del bloque
            if current_block.hash != current_block.calculate_hash():
                logger.error(f"Invalid hash at block {i}")
                return False
            
            # Verificar enlace
            if current_block.previous_hash != previous_block.hash:
                logger.error(f"Invalid link at block {i}")
                return False
            
            # Verificar proof of work
            if not self.is_valid_proof(current_block):
                logger.error(f"Invalid proof at block {i}")
                return False
        
        logger.info("Blockchain validation passed")
        return True
    
    def get_balance(self, address: str, token: str = 'ORX') -> float:
        """
        Calcula el balance de una dirección para un token específico.
        
        Args:
            address: Dirección a consultar
            token: Token a consultar (ORX o VRX)
            
        Returns:
            Balance de la dirección
        """
        try:
            return self.token_manager.get_token(token).balance_of(address)
        except Exception as e:
            logger.error(f"Error getting balance: {e}")
            return 0.0
    
    def get_all_balances(self, address: str) -> Dict[str, float]:
        """Obtiene los balances de todos los tokens para una dirección."""
        return self.token_manager.get_balances(address)
    
    def get_stats(self) -> Dict:
        """
        Obtiene estadísticas de la blockchain.
        
        Returns:
            Diccionario con estadísticas
        """
        return {
            'total_blocks': len(self.chain),
            'total_transactions': self.total_transactions,
            'pending_transactions': len(self.pending_transactions),
            'difficulty': self.difficulty,
            'mining_reward': self.mining_reward,
            'native_token': 'VRX',
            'is_valid': self.is_chain_valid()
        }
    
    def to_dict(self) -> Dict:
        """Convierte la blockchain a un diccionario."""
        return {
            'chain': [block.to_dict() for block in self.chain],
            'pending_transactions': self.pending_transactions,
            'difficulty': self.difficulty,
            'length': len(self.chain),
            'stats': self.get_stats(),
            'contracts': self.contract_manager.to_dict()
        }
    
    def __repr__(self):
        return (
            f"Blockchain(blocks={len(self.chain)}, "
            f"difficulty={self.difficulty}, "
            f"valid={self.is_chain_valid()})"
        )
