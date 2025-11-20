"""
ORILUXCHAIN - Dual Token System
ORX (Orilux Tech) - Token Principal de Utilidad
VRX (Veralix) - Token de Gobernanza y Staking
"""

from time import time
from typing import Dict, List


class Token:
    """Clase base para tokens en Oriluxchain"""
    
    def __init__(self, symbol: str, name: str, total_supply: float, decimals: int = 18):
        self.symbol = symbol
        self.name = name
        self.total_supply = total_supply
        self.decimals = decimals
        self.balances: Dict[str, float] = {}
        self.allowances: Dict[str, Dict[str, float]] = {}
        
    def mint(self, address: str, amount: float) -> bool:
        """Acuña nuevos tokens"""
        if address not in self.balances:
            self.balances[address] = 0
        self.balances[address] += amount
        return True
    
    def burn(self, address: str, amount: float) -> bool:
        """Quema tokens"""
        if address not in self.balances or self.balances[address] < amount:
            return False
        self.balances[address] -= amount
        return True
    
    def transfer(self, from_address: str, to_address: str, amount: float) -> bool:
        """Transfiere tokens entre direcciones"""
        if from_address not in self.balances or self.balances[from_address] < amount:
            return False
        
        if to_address not in self.balances:
            self.balances[to_address] = 0
        
        self.balances[from_address] -= amount
        self.balances[to_address] += amount
        return True
    
    def balance_of(self, address: str) -> float:
        """Obtiene el balance de una dirección"""
        return self.balances.get(address, 0)
    
    def approve(self, owner: str, spender: str, amount: float) -> bool:
        """Aprueba a un spender para gastar tokens"""
        if owner not in self.allowances:
            self.allowances[owner] = {}
        self.allowances[owner][spender] = amount
        return True
    
    def allowance(self, owner: str, spender: str) -> float:
        """Obtiene la cantidad aprobada"""
        return self.allowances.get(owner, {}).get(spender, 0)
    
    def transfer_from(self, spender: str, from_address: str, to_address: str, amount: float) -> bool:
        """Transfiere tokens usando allowance"""
        allowed = self.allowance(from_address, spender)
        if allowed < amount:
            return False
        
        if self.transfer(from_address, to_address, amount):
            self.allowances[from_address][spender] -= amount
            return True
        return False


class ORXToken(Token):
    """
    ORX - Orilux Tech Token
    Token principal de utilidad para transacciones y fees
    """
    
    def __init__(self):
        super().__init__(
            symbol="ORX",
            name="Orilux Tech Token",
            total_supply=1_000_000_000,  # 1 billón de tokens
            decimals=18
        )
        self.description = "Token de utilidad principal de Oriluxchain"
        self.use_cases = [
            "Pago de transaction fees",
            "Recompensas de minería",
            "Staking para validadores",
            "Governance voting power"
        ]


class VRXToken(Token):
    """
    VRX - Veralix Token
    Token de gobernanza y staking premium
    """
    
    def __init__(self):
        super().__init__(
            symbol="VRX",
            name="Veralix Token",
            total_supply=100_000_000,  # 100 millones de tokens (más escaso)
            decimals=18
        )
        self.description = "Token de gobernanza premium de Oriluxchain"
        self.use_cases = [
            "Gobernanza de protocolo",
            "Staking premium con mayores rewards",
            "Acceso a features exclusivas",
            "Descuentos en transaction fees"
        ]


class TokenManager:
    """Gestor del sistema dual-token"""
    
    def __init__(self):
        self.orx = ORXToken()
        self.vrx = VRXToken()
        self.exchange_rate = 10.0  # 1 VRX = 10 ORX
        self.liquidity_pool = {
            'ORX': 0,
            'VRX': 0
        }
        
    def initialize_tokens(self, genesis_address: str):
        """Inicializa los tokens con el supply inicial"""
        # Distribuir ORX
        self.orx.mint(genesis_address, self.orx.total_supply * 0.2)  # 20% al genesis
        self.orx.mint('MINING_POOL', self.orx.total_supply * 0.5)    # 50% para minería
        self.orx.mint('TREASURY', self.orx.total_supply * 0.3)       # 30% tesorería
        
        # Distribuir VRX
        self.vrx.mint(genesis_address, self.vrx.total_supply * 0.1)  # 10% al genesis
        self.vrx.mint('STAKING_POOL', self.vrx.total_supply * 0.6)   # 60% para staking
        self.vrx.mint('TREASURY', self.vrx.total_supply * 0.3)       # 30% tesorería
    
    def get_token(self, symbol: str) -> Token:
        """Obtiene un token por su símbolo"""
        if symbol == 'ORX':
            return self.orx
        elif symbol == 'VRX':
            return self.vrx
        raise ValueError(f"Token {symbol} no existe")
    
    def swap(self, from_token: str, to_token: str, amount: float, user_address: str) -> bool:
        """
        Intercambia tokens entre ORX y VRX
        Usa un AMM (Automated Market Maker) simple
        """
        if from_token == to_token:
            return False
        
        from_token_obj = self.get_token(from_token)
        to_token_obj = self.get_token(to_token)
        
        # Calcular cantidad a recibir basado en exchange rate
        if from_token == 'ORX' and to_token == 'VRX':
            to_amount = amount / self.exchange_rate
        elif from_token == 'VRX' and to_token == 'ORX':
            to_amount = amount * self.exchange_rate
        else:
            return False
        
        # Verificar balance
        if from_token_obj.balance_of(user_address) < amount:
            return False
        
        # Realizar swap
        if from_token_obj.transfer(user_address, 'LIQUIDITY_POOL', amount):
            to_token_obj.transfer('LIQUIDITY_POOL', user_address, to_amount)
            return True
        
        return False
    
    def get_balances(self, address: str) -> Dict[str, float]:
        """Obtiene los balances de ambos tokens para una dirección"""
        return {
            'ORX': self.orx.balance_of(address),
            'VRX': self.vrx.balance_of(address)
        }
    
    def get_total_value(self, address: str) -> float:
        """Calcula el valor total en ORX de una dirección"""
        orx_balance = self.orx.balance_of(address)
        vrx_balance = self.vrx.balance_of(address)
        return orx_balance + (vrx_balance * self.exchange_rate)
    
    def to_dict(self) -> dict:
        """Convierte el estado del token manager a diccionario"""
        return {
            'tokens': {
                'ORX': {
                    'name': self.orx.name,
                    'symbol': self.orx.symbol,
                    'total_supply': self.orx.total_supply,
                    'decimals': self.orx.decimals,
                    'description': self.orx.description,
                    'use_cases': self.orx.use_cases
                },
                'VRX': {
                    'name': self.vrx.name,
                    'symbol': self.vrx.symbol,
                    'total_supply': self.vrx.total_supply,
                    'decimals': self.vrx.decimals,
                    'description': self.vrx.description,
                    'use_cases': self.vrx.use_cases
                }
            },
            'exchange_rate': self.exchange_rate,
            'liquidity_pool': self.liquidity_pool
        }


class StakingPool:
    """Pool de staking para VRX"""
    
    def __init__(self, token_manager: TokenManager):
        self.token_manager = token_manager
        self.stakes: Dict[str, Dict] = {}
        self.reward_rate = 0.15  # 15% APY
        
    def stake(self, address: str, amount: float, token: str = 'VRX') -> bool:
        """Stakea tokens"""
        token_obj = self.token_manager.get_token(token)
        
        if token_obj.balance_of(address) < amount:
            return False
        
        # Transferir tokens al pool
        if token_obj.transfer(address, 'STAKING_POOL', amount):
            if address not in self.stakes:
                self.stakes[address] = {
                    'ORX': {'amount': 0, 'timestamp': 0},
                    'VRX': {'amount': 0, 'timestamp': 0}
                }
            
            self.stakes[address][token]['amount'] += amount
            self.stakes[address][token]['timestamp'] = time()
            return True
        
        return False
    
    def unstake(self, address: str, amount: float, token: str = 'VRX') -> bool:
        """Retira tokens stakeados"""
        if address not in self.stakes or self.stakes[address][token]['amount'] < amount:
            return False
        
        token_obj = self.token_manager.get_token(token)
        
        # Calcular rewards
        rewards = self.calculate_rewards(address, token)
        
        # Transferir tokens de vuelta
        if token_obj.transfer('STAKING_POOL', address, amount + rewards):
            self.stakes[address][token]['amount'] -= amount
            return True
        
        return False
    
    def calculate_rewards(self, address: str, token: str) -> float:
        """Calcula las recompensas de staking"""
        if address not in self.stakes:
            return 0
        
        stake_info = self.stakes[address][token]
        if stake_info['amount'] == 0:
            return 0
        
        # Calcular tiempo stakeado en años
        time_staked = (time() - stake_info['timestamp']) / (365 * 24 * 60 * 60)
        
        # Calcular rewards
        # VRX tiene mayor reward rate
        rate = self.reward_rate * (1.5 if token == 'VRX' else 1.0)
        rewards = stake_info['amount'] * rate * time_staked
        
        return rewards
    
    def get_stake_info(self, address: str) -> Dict:
        """Obtiene información de staking de una dirección"""
        if address not in self.stakes:
            return {'ORX': {'amount': 0, 'rewards': 0}, 'VRX': {'amount': 0, 'rewards': 0}}
        
        return {
            'ORX': {
                'amount': self.stakes[address]['ORX']['amount'],
                'rewards': self.calculate_rewards(address, 'ORX')
            },
            'VRX': {
                'amount': self.stakes[address]['VRX']['amount'],
                'rewards': self.calculate_rewards(address, 'VRX')
            }
        }
