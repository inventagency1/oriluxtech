import hashlib
import json
from time import time
from block import Block
from token_system import TokenManager, StakingPool
from smart_contract import ContractManager


class Blockchain:
    """
    Implementación de la blockchain Oriluxchain.
    Maneja la cadena de bloques, transacciones pendientes, minería y validación.
    """
    
    def __init__(self, difficulty=4):
        """
        Inicializa una nueva blockchain.
        
        Args:
            difficulty (int): Número de ceros iniciales requeridos en el hash (dificultad de minería)
        """
        self.chain = []
        self.pending_transactions = []
        self.difficulty = difficulty
        self.mining_reward_orx = 50  # Recompensa en ORX por minar un bloque
        self.mining_reward_vrx = 5   # Recompensa en VRX por minar un bloque
        
        # Sistema dual-token
        self.token_manager = TokenManager()
        self.staking_pool = StakingPool(self.token_manager)
        
        # Sistema de smart contracts
        self.contract_manager = ContractManager()
        
        # Crear el bloque génesis
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """
        Crea el primer bloque de la cadena (bloque génesis).
        """
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
    
    def get_latest_block(self):
        """
        Obtiene el último bloque de la cadena.
        
        Returns:
            Block: Último bloque en la cadena
        """
        return self.chain[-1]
    
    def add_transaction(self, sender, recipient, amount, token='ORX'):
        """
        Añade una nueva transacción a la lista de transacciones pendientes.
        
        Args:
            sender (str): Dirección del remitente
            recipient (str): Dirección del destinatario
            amount (float): Cantidad a transferir
            token (str): Token a transferir (ORX o VRX)
            
        Returns:
            int: Índice del bloque que contendrá esta transacción
        """
        transaction = {
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
            'token': token,
            'timestamp': time()
        }
        
        self.pending_transactions.append(transaction)
        return self.get_latest_block().index + 1
    
    def mine_pending_transactions(self, miner_address):
        """
        Mina un nuevo bloque con las transacciones pendientes.
        
        Args:
            miner_address (str): Dirección del minero que recibirá la recompensa
            
        Returns:
            Block: Nuevo bloque minado
        """
        # Crear el bloque con las transacciones pendientes
        block = Block(
            index=len(self.chain),
            timestamp=time(),
            transactions=self.pending_transactions,
            proof=0,
            previous_hash=self.get_latest_block().hash
        )
        
        # Realizar proof of work
        block.proof = self.proof_of_work(block)
        block.hash = block.calculate_hash()
        
        # Añadir el bloque a la cadena
        self.chain.append(block)
        
        # Procesar transacciones del bloque
        for tx in block.transactions:
            token_obj = self.token_manager.get_token(tx.get('token', 'ORX'))
            if tx['sender'] != 'NETWORK':
                token_obj.transfer(tx['sender'], tx['recipient'], tx['amount'])
        
        # Resetear transacciones pendientes y añadir recompensas de minería
        self.pending_transactions = [
            {
                'sender': 'NETWORK',
                'recipient': miner_address,
                'amount': self.mining_reward_orx,
                'token': 'ORX',
                'timestamp': time()
            },
            {
                'sender': 'NETWORK',
                'recipient': miner_address,
                'amount': self.mining_reward_vrx,
                'token': 'VRX',
                'timestamp': time()
            }
        ]
        
        # Acuñar recompensas
        self.token_manager.orx.mint(miner_address, self.mining_reward_orx)
        self.token_manager.vrx.mint(miner_address, self.mining_reward_vrx)
        
        return block
    
    def proof_of_work(self, block):
        """
        Algoritmo de Proof of Work.
        Encuentra un número (nonce) que al ser hasheado con los datos del bloque,
        produce un hash con N ceros al inicio (donde N es la dificultad).
        
        Args:
            block (Block): Bloque a minar
            
        Returns:
            int: Proof (nonce) que satisface la dificultad
        """
        block.proof = 0
        computed_hash = block.calculate_hash()
        
        while not computed_hash.startswith('0' * self.difficulty):
            block.proof += 1
            computed_hash = block.calculate_hash()
        
        return block.proof
    
    def is_valid_proof(self, block):
        """
        Verifica si el proof del bloque es válido.
        
        Args:
            block (Block): Bloque a verificar
            
        Returns:
            bool: True si el proof es válido, False en caso contrario
        """
        computed_hash = block.calculate_hash()
        return computed_hash.startswith('0' * self.difficulty)
    
    def is_chain_valid(self, chain=None):
        """
        Verifica si la blockchain es válida.
        Comprueba que cada bloque tenga el hash correcto y que esté enlazado correctamente.
        
        Args:
            chain (list): Cadena a validar (por defecto, la cadena actual)
            
        Returns:
            bool: True si la cadena es válida, False en caso contrario
        """
        if chain is None:
            chain = self.chain
        
        for i in range(1, len(chain)):
            current_block = chain[i]
            previous_block = chain[i - 1]
            
            # Verificar que el hash del bloque sea correcto
            if current_block.hash != current_block.calculate_hash():
                print(f"Hash inválido en bloque {i}")
                return False
            
            # Verificar que el previous_hash sea correcto
            if current_block.previous_hash != previous_block.hash:
                print(f"Enlace inválido en bloque {i}")
                return False
            
            # Verificar el proof of work
            if not self.is_valid_proof(current_block):
                print(f"Proof of work inválido en bloque {i}")
                return False
        
        return True
    
    def get_balance(self, address, token='ORX'):
        """
        Calcula el balance de una dirección para un token específico.
        
        Args:
            address (str): Dirección a consultar
            token (str): Token a consultar (ORX o VRX)
            
        Returns:
            float: Balance de la dirección
        """
        return self.token_manager.get_token(token).balance_of(address)
    
    def get_all_balances(self, address):
        """
        Obtiene los balances de todos los tokens para una dirección.
        
        Args:
            address (str): Dirección a consultar
            
        Returns:
            dict: Balances de ORX y VRX
        """
        return self.token_manager.get_balances(address)
    
    def deploy_contract(self, owner, bytecode, abi, constructor_params=None):
        """
        Despliega un smart contract en la blockchain.
        
        Args:
            owner: Dirección del propietario
            bytecode: Código del contrato
            abi: Interface del contrato
            constructor_params: Parámetros del constructor
            
        Returns:
            SmartContract: Contrato desplegado
        """
        return self.contract_manager.deploy_contract(owner, bytecode, abi, constructor_params)
    
    def deploy_contract_from_template(self, owner, template_name, params):
        """
        Despliega un contrato desde un template.
        
        Args:
            owner: Dirección del propietario
            template_name: Nombre del template
            params: Parámetros del template
            
        Returns:
            SmartContract: Contrato desplegado
        """
        return self.contract_manager.deploy_from_template(owner, template_name, params)
    
    def call_contract(self, contract_address, function_name, params, sender, value=0):
        """
        Llama a una función de un smart contract.
        
        Args:
            contract_address: Dirección del contrato
            function_name: Nombre de la función
            params: Parámetros de la función
            sender: Dirección del llamador
            value: Valor enviado
            
        Returns:
            dict: Resultado de la ejecución
        """
        return self.contract_manager.call_contract(contract_address, function_name, params, sender, value)
    
    def to_dict(self):
        """
        Convierte la blockchain a un diccionario.
        
        Returns:
            dict: Representación de la blockchain
        """
        return {
            'chain': [block.to_dict() for block in self.chain],
            'pending_transactions': self.pending_transactions,
            'difficulty': self.difficulty,
            'length': len(self.chain),
            'contracts': self.contract_manager.to_dict()
        }
    
    def __repr__(self):
        return f"Blockchain(length={len(self.chain)}, difficulty={self.difficulty})"
