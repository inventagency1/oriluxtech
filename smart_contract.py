"""
ORILUXCHAIN - Smart Contract System
Sistema de contratos inteligentes con lenguaje de scripting propio
"""

import hashlib
import json
from time import time
from typing import Dict, List, Any, Optional
import re


class SmartContractVM:
    """
    Virtual Machine para ejecutar smart contracts
    Implementa un lenguaje de scripting simple pero poderoso
    """
    
    def __init__(self):
        self.gas_limit = 1000000
        self.gas_used = 0
        self.gas_price = 1  # 1 ORX por unidad de gas
        self.storage = {}
        self.stack = []
        self.memory = {}
        
    def execute(self, bytecode: str, context: Dict) -> Dict:
        """
        Ejecuta el bytecode del contrato
        
        Args:
            bytecode: Código a ejecutar
            context: Contexto de ejecución (sender, value, etc.)
            
        Returns:
            Resultado de la ejecución
        """
        self.gas_used = 0
        result = {
            'success': False,
            'return_value': None,
            'gas_used': 0,
            'logs': [],
            'error': None
        }
        
        try:
            # Parsear y ejecutar instrucciones
            instructions = self._parse_bytecode(bytecode)
            return_value = self._execute_instructions(instructions, context)
            
            result['success'] = True
            result['return_value'] = return_value
            result['gas_used'] = self.gas_used
            
        except Exception as e:
            result['error'] = str(e)
            result['gas_used'] = self.gas_used
            
        return result
    
    def _parse_bytecode(self, bytecode: str) -> List[Dict]:
        """Parsea el bytecode en instrucciones"""
        instructions = []
        lines = bytecode.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
                
            parts = line.split()
            if len(parts) > 0:
                instructions.append({
                    'op': parts[0],
                    'args': parts[1:] if len(parts) > 1 else []
                })
        
        return instructions
    
    def _execute_instructions(self, instructions: List[Dict], context: Dict) -> Any:
        """Ejecuta las instrucciones del contrato"""
        self.memory['sender'] = context.get('sender')
        self.memory['value'] = context.get('value', 0)
        self.memory['contract_address'] = context.get('contract_address')
        
        # SECURITY FIX: Límite de iteraciones para prevenir loops infinitos
        MAX_ITERATIONS = 10000
        iteration_count = 0
        
        for instruction in instructions:
            # Verificar límite de iteraciones
            iteration_count += 1
            if iteration_count > MAX_ITERATIONS:
                raise Exception(
                    f"Execution limit exceeded: {MAX_ITERATIONS} iterations. "
                    "Possible infinite loop detected."
                )
            self._consume_gas(10)  # Gas base por instrucción
            
            op = instruction['op']
            args = instruction['args']
            
            if op == 'PUSH':
                self.stack.append(self._parse_value(args[0]))
            elif op == 'POP':
                if self.stack:
                    self.stack.pop()
            elif op == 'STORE':
                key = args[0]
                value = self.stack.pop() if self.stack else None
                self.storage[key] = value
            elif op == 'LOAD':
                key = args[0]
                self.stack.append(self.storage.get(key))
            elif op == 'ADD':
                # SECURITY FIX: Validar stack underflow
                if len(self.stack) < 2:
                    raise Exception("Stack underflow: ADD requires 2 values")
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(a + b)
            elif op == 'SUB':
                if len(self.stack) < 2:
                    raise Exception("Stack underflow: SUB requires 2 values")
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(a - b)
            elif op == 'MUL':
                if len(self.stack) < 2:
                    raise Exception("Stack underflow: MUL requires 2 values")
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(a * b)
            elif op == 'DIV':
                if len(self.stack) < 2:
                    raise Exception("Stack underflow: DIV requires 2 values")
                b = self.stack.pop()
                a = self.stack.pop()
                # SECURITY FIX: Lanzar error en división por cero
                if b == 0:
                    raise Exception("Division by zero")
                self.stack.append(a / b)
            elif op == 'EQ':
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(1 if a == b else 0)
            elif op == 'GT':
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(1 if a > b else 0)
            elif op == 'LT':
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(1 if a < b else 0)
            elif op == 'RETURN':
                return self.stack.pop() if self.stack else None
            elif op == 'REVERT':
                raise Exception("Contract reverted")
            
        return self.stack[-1] if self.stack else None
    
    def _parse_value(self, value: str) -> Any:
        """Parsea un valor del bytecode"""
        # Intentar parsear como número
        try:
            if '.' in value:
                return float(value)
            return int(value)
        except:
            # Es una variable o string
            if value.startswith('$'):
                return self.memory.get(value[1:])
            return value
    
    def _consume_gas(self, amount: int):
        """Consume gas de la ejecución"""
        self.gas_used += amount
        if self.gas_used > self.gas_limit:
            raise Exception("Out of gas")


class SmartContract:
    """Clase base para smart contracts"""
    
    def __init__(self, address: str, owner: str, bytecode: str, abi: Dict):
        self.address = address
        self.owner = owner
        self.bytecode = bytecode
        self.abi = abi
        self.storage = {}
        self.balance = {'ORX': 0, 'VRX': 0}
        self.created_at = time()
        self.last_executed = None
        self.execution_count = 0
        
    def execute(self, function_name: str, params: Dict, context: Dict) -> Dict:
        """
        Ejecuta una función del contrato
        
        Args:
            function_name: Nombre de la función a ejecutar
            params: Parámetros de la función
            context: Contexto de ejecución
            
        Returns:
            Resultado de la ejecución
        """
        # Verificar que la función existe en el ABI
        if function_name not in self.abi.get('functions', {}):
            return {'success': False, 'error': 'Function not found'}
        
        # Crear VM y ejecutar
        vm = SmartContractVM()
        vm.storage = self.storage
        
        # Añadir parámetros al contexto
        context['params'] = params
        context['contract_address'] = self.address
        
        result = vm.execute(self.bytecode, context)
        
        # Actualizar storage si la ejecución fue exitosa
        if result['success']:
            self.storage = vm.storage
            self.last_executed = time()
            self.execution_count += 1
        
        return result
    
    def to_dict(self) -> Dict:
        """Convierte el contrato a diccionario"""
        return {
            'address': self.address,
            'owner': self.owner,
            'abi': self.abi,
            'storage': self.storage,
            'balance': self.balance,
            'created_at': self.created_at,
            'last_executed': self.last_executed,
            'execution_count': self.execution_count
        }


class ContractTemplates:
    """Templates de contratos predefinidos"""
    
    @staticmethod
    def erc20_token(name: str, symbol: str, total_supply: int) -> Dict:
        """Template de token ERC-20"""
        bytecode = f"""
# ERC-20 Token: {name} ({symbol})
# Total Supply: {total_supply}

# Initialize
PUSH {total_supply}
STORE total_supply

PUSH $sender
STORE owner

# Transfer balance to owner
PUSH {total_supply}
STORE balance_owner

RETURN 1
"""
        
        abi = {
            'name': name,
            'type': 'ERC-20',
            'functions': {
                'transfer': {
                    'params': ['to', 'amount'],
                    'returns': 'bool'
                },
                'balanceOf': {
                    'params': ['address'],
                    'returns': 'uint256'
                },
                'approve': {
                    'params': ['spender', 'amount'],
                    'returns': 'bool'
                },
                'transferFrom': {
                    'params': ['from', 'to', 'amount'],
                    'returns': 'bool'
                }
            }
        }
        
        return {'bytecode': bytecode, 'abi': abi}
    
    @staticmethod
    def multisig_wallet(owners: List[str], required_confirmations: int) -> Dict:
        """Template de wallet multisig"""
        bytecode = f"""
# MultiSig Wallet
# Owners: {len(owners)}
# Required Confirmations: {required_confirmations}

PUSH {len(owners)}
STORE owner_count

PUSH {required_confirmations}
STORE required_confirmations

RETURN 1
"""
        
        abi = {
            'name': 'MultiSig Wallet',
            'type': 'MultiSig',
            'functions': {
                'submitTransaction': {
                    'params': ['to', 'amount', 'data'],
                    'returns': 'uint256'
                },
                'confirmTransaction': {
                    'params': ['txId'],
                    'returns': 'bool'
                },
                'executeTransaction': {
                    'params': ['txId'],
                    'returns': 'bool'
                },
                'revokeConfirmation': {
                    'params': ['txId'],
                    'returns': 'bool'
                }
            }
        }
        
        return {'bytecode': bytecode, 'abi': abi}
    
    @staticmethod
    def escrow_contract(buyer: str, seller: str, arbiter: str) -> Dict:
        """Template de contrato escrow"""
        bytecode = f"""
# Escrow Contract
# Buyer: {buyer}
# Seller: {seller}
# Arbiter: {arbiter}

PUSH {buyer}
STORE buyer

PUSH {seller}
STORE seller

PUSH {arbiter}
STORE arbiter

PUSH 0
STORE released

RETURN 1
"""
        
        abi = {
            'name': 'Escrow Contract',
            'type': 'Escrow',
            'functions': {
                'deposit': {
                    'params': [],
                    'returns': 'bool',
                    'payable': True
                },
                'release': {
                    'params': [],
                    'returns': 'bool'
                },
                'refund': {
                    'params': [],
                    'returns': 'bool'
                },
                'dispute': {
                    'params': ['winner'],
                    'returns': 'bool'
                }
            }
        }
        
        return {'bytecode': bytecode, 'abi': abi}
    
    @staticmethod
    def nft_contract(name: str, symbol: str) -> Dict:
        """Template de contrato NFT (ERC-721)"""
        bytecode = f"""
# NFT Contract: {name} ({symbol})

PUSH {name}
STORE name

PUSH {symbol}
STORE symbol

PUSH 0
STORE total_minted

PUSH $sender
STORE owner

RETURN 1
"""
        
        abi = {
            'name': name,
            'type': 'ERC-721',
            'functions': {
                'mint': {
                    'params': ['to', 'tokenId', 'metadata'],
                    'returns': 'bool'
                },
                'transfer': {
                    'params': ['to', 'tokenId'],
                    'returns': 'bool'
                },
                'ownerOf': {
                    'params': ['tokenId'],
                    'returns': 'address'
                },
                'approve': {
                    'params': ['to', 'tokenId'],
                    'returns': 'bool'
                },
                'setApprovalForAll': {
                    'params': ['operator', 'approved'],
                    'returns': 'bool'
                }
            }
        }
        
        return {'bytecode': bytecode, 'abi': abi}
    
    @staticmethod
    def staking_contract(token: str, reward_rate: float) -> Dict:
        """Template de contrato de staking"""
        bytecode = f"""
# Staking Contract
# Token: {token}
# Reward Rate: {reward_rate}%

PUSH {token}
STORE token

PUSH {reward_rate}
STORE reward_rate

PUSH 0
STORE total_staked

RETURN 1
"""
        
        abi = {
            'name': f'{token} Staking',
            'type': 'Staking',
            'functions': {
                'stake': {
                    'params': ['amount'],
                    'returns': 'bool'
                },
                'unstake': {
                    'params': ['amount'],
                    'returns': 'bool'
                },
                'claimRewards': {
                    'params': [],
                    'returns': 'uint256'
                },
                'getStake': {
                    'params': ['address'],
                    'returns': 'uint256'
                },
                'getRewards': {
                    'params': ['address'],
                    'returns': 'uint256'
                }
            }
        }
        
        return {'bytecode': bytecode, 'abi': abi}


class ContractManager:
    """Gestor de smart contracts"""
    
    def __init__(self):
        self.contracts: Dict[str, SmartContract] = {}
        self.contract_counter = 0
        
    def deploy_contract(self, owner: str, bytecode: str, abi: Dict, 
                       constructor_params: Dict = None) -> SmartContract:
        """
        Despliega un nuevo contrato
        
        Args:
            owner: Dirección del propietario
            bytecode: Código del contrato
            abi: Interface del contrato
            constructor_params: Parámetros del constructor
            
        Returns:
            Contrato desplegado
        """
        # Generar dirección del contrato
        contract_address = self._generate_contract_address(owner)
        
        # Crear contrato
        contract = SmartContract(
            address=contract_address,
            owner=owner,
            bytecode=bytecode,
            abi=abi
        )
        
        # Ejecutar constructor si hay parámetros
        if constructor_params:
            context = {'sender': owner, 'value': 0}
            contract.execute('constructor', constructor_params, context)
        
        # Guardar contrato
        self.contracts[contract_address] = contract
        self.contract_counter += 1
        
        return contract
    
    def deploy_from_template(self, owner: str, template_name: str, 
                            params: Dict) -> SmartContract:
        """Despliega un contrato desde un template"""
        templates = {
            'erc20': ContractTemplates.erc20_token,
            'multisig': ContractTemplates.multisig_wallet,
            'escrow': ContractTemplates.escrow_contract,
            'nft': ContractTemplates.nft_contract,
            'staking': ContractTemplates.staking_contract
        }
        
        if template_name not in templates:
            raise ValueError(f"Template '{template_name}' no encontrado")
        
        template_func = templates[template_name]
        template_data = template_func(**params)
        
        return self.deploy_contract(
            owner=owner,
            bytecode=template_data['bytecode'],
            abi=template_data['abi']
        )
    
    def call_contract(self, contract_address: str, function_name: str,
                     params: Dict, sender: str, value: int = 0) -> Dict:
        """
        Llama a una función de un contrato
        
        Args:
            contract_address: Dirección del contrato
            function_name: Nombre de la función
            params: Parámetros de la función
            sender: Dirección del llamador
            value: Valor enviado (para funciones payable)
            
        Returns:
            Resultado de la ejecución
        """
        if contract_address not in self.contracts:
            return {'success': False, 'error': 'Contract not found'}
        
        contract = self.contracts[contract_address]
        context = {
            'sender': sender,
            'value': value,
            'timestamp': time()
        }
        
        return contract.execute(function_name, params, context)
    
    def get_contract(self, contract_address: str) -> Optional[SmartContract]:
        """Obtiene un contrato por su dirección"""
        return self.contracts.get(contract_address)
    
    def get_all_contracts(self) -> List[Dict]:
        """Obtiene todos los contratos"""
        return [contract.to_dict() for contract in self.contracts.values()]
    
    def _generate_contract_address(self, owner: str) -> str:
        """Genera una dirección única para el contrato"""
        data = f"{owner}{self.contract_counter}{time()}"
        hash_obj = hashlib.sha256(data.encode())
        return '0x' + hash_obj.hexdigest()[:40]
    
    def to_dict(self) -> Dict:
        """Convierte el manager a diccionario"""
        return {
            'total_contracts': len(self.contracts),
            'contracts': self.get_all_contracts()
        }
