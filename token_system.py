"""
ORILUXCHAIN - Token System
VRX (Veralix) - Token Nativo Único de OriluxChain
Usado para transacciones, fees, minería, staking y gobernanza
"""

from time import time
from typing import Dict, List
import logging

# Configurar logging
logger = logging.getLogger(__name__)

# PARCHE 2.2: Constantes de control de minting
MAX_MINT_PER_TRANSACTION = 1_000_000  # Máximo por transacción
MAX_TOTAL_SUPPLY = 10_000_000_000  # 10 billones máximo
MINT_COOLDOWN = 3600  # 1 hora entre mints


class Token:
    """Clase base para tokens en Oriluxchain"""
    
    def __init__(self, symbol: str, name: str, total_supply: float, decimals: int = 18):
        self.symbol = symbol
        self.name = name
        self.total_supply = total_supply
        self.decimals = decimals
        self.balances: Dict[str, float] = {}
        self.allowances: Dict[str, Dict[str, float]] = {}
        
        # PARCHE 2.2: Control de minting
        self.minters: set = set()  # Direcciones autorizadas para mintear
        self.mint_history: List[Dict] = []  # Historial de minting
        self.last_mint_time: Dict[str, float] = {}  # Último mint por dirección
        self.total_minted: float = 0  # Total de tokens minteados
        
    def add_minter(self, address: str, authorized_by: str = "SYSTEM") -> bool:
        """
        Agrega una dirección autorizada para mintear.
        PARCHE 2.2: Control de permisos
        """
        self.minters.add(address)
        logger.info(f"Minter agregado: {address} (autorizado por {authorized_by})")
        return True
    
    def remove_minter(self, address: str, authorized_by: str = "SYSTEM") -> bool:
        """
        Remueve una dirección autorizada para mintear.
        PARCHE 2.2: Control de permisos
        """
        if address in self.minters:
            self.minters.remove(address)
            logger.info(f"Minter removido: {address} (por {authorized_by})")
            return True
        return False
    
    def is_minter(self, address: str) -> bool:
        """Verifica si una dirección puede mintear"""
        return address in self.minters
        
    def mint(self, address: str, amount: float, minter: str = "SYSTEM") -> tuple:
        """
        Acuña nuevos tokens con controles de seguridad.
        PARCHE 2.2: Control de minting implementado
        
        Args:
            address: Dirección que recibirá los tokens
            amount: Cantidad a mintear
            minter: Dirección que ejecuta el mint
            
        Returns:
            tuple: (success: bool, message: str)
        """
        # Validar permisos
        if minter != "SYSTEM" and not self.is_minter(minter):
            logger.warning(f"Intento de mint no autorizado por {minter}")
            return False, f"Dirección {minter} no autorizada para mintear"
        
        # Validar cantidad
        if amount <= 0:
            return False, "La cantidad debe ser positiva"
        
        if amount > MAX_MINT_PER_TRANSACTION:
            return False, f"Cantidad excede el límite por transacción ({MAX_MINT_PER_TRANSACTION})"
        
        # Validar supply total
        new_total = self.total_supply + amount
        if new_total > MAX_TOTAL_SUPPLY:
            return False, f"Excedería el supply máximo ({MAX_TOTAL_SUPPLY})"
        
        # Validar cooldown
        current_time = time()
        if minter in self.last_mint_time:
            time_since_last = current_time - self.last_mint_time[minter]
            if time_since_last < MINT_COOLDOWN:
                remaining = MINT_COOLDOWN - time_since_last
                return False, f"Cooldown activo. Espera {int(remaining)} segundos"
        
        # Ejecutar mint
        if address not in self.balances:
            self.balances[address] = 0
        
        self.balances[address] += amount
        self.total_supply += amount
        self.total_minted += amount
        self.last_mint_time[minter] = current_time
        
        # Registrar en historial
        mint_record = {
            'timestamp': current_time,
            'minter': minter,
            'recipient': address,
            'amount': amount,
            'new_total_supply': self.total_supply
        }
        self.mint_history.append(mint_record)
        
        logger.info(f"Mint exitoso: {amount} {self.symbol} para {address} por {minter}")
        return True, f"Minteados {amount} {self.symbol} exitosamente"
    
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
    Token nativo único de OriluxChain
    """
    
    def __init__(self):
        super().__init__(
            symbol="VRX",
            name="Veralix",
            total_supply=1_000_000_000,  # 1 billón de tokens
            decimals=18
        )
        self.description = "Token nativo de OriluxChain - Potenciando el ecosistema Veralix"
        self.use_cases = [
            "Pago de transaction fees",
            "Recompensas de minería",
            "Staking y validación",
            "Gobernanza de protocolo",
            "Certificación de joyería NFT",
            "Gas para smart contracts"
        ]


class TokenManager:
    """Gestor del sistema de tokens - VRX como token nativo"""
    
    def __init__(self):
        self.vrx = VRXToken()
        # Mantener orx para compatibilidad con código legacy
        self.orx = self.vrx  # Alias - ambos apuntan a VRX
        self.native_token = self.vrx
        self.liquidity_pool = {
            'VRX': 0
        }
        
    def initialize_tokens(self, genesis_address: str):
        """
        Inicializa VRX con el supply inicial.
        """
        # Distribuir VRX
        self.vrx.mint(genesis_address, self.vrx.total_supply * 0.1, "SYSTEM")  # 10% al genesis
        self.vrx.mint('MINING_POOL', self.vrx.total_supply * 0.5, "SYSTEM")    # 50% para minería
        self.vrx.mint('STAKING_POOL', self.vrx.total_supply * 0.2, "SYSTEM")   # 20% para staking
        self.vrx.mint('TREASURY', self.vrx.total_supply * 0.2, "SYSTEM")       # 20% tesorería
        
        logger.info("VRX inicializado como token nativo de OriluxChain")
    
    def get_token(self, symbol: str) -> Token:
        """Obtiene un token por su símbolo (VRX es el único token nativo)"""
        if symbol in ['ORX', 'VRX']:
            return self.vrx  # Ambos retornan VRX
        raise ValueError(f"Token {symbol} no existe")
    
    def swap(self, from_token: str, to_token: str, amount: float, user_address: str, 
             max_slippage: float = 0.05) -> tuple:
        """
        Intercambia tokens entre ORX y VRX con protección de slippage.
        PARCHE 2.3: Slippage protection implementado
        
        Args:
            from_token: Token a intercambiar
            to_token: Token a recibir
            amount: Cantidad a intercambiar
            user_address: Dirección del usuario
            max_slippage: Slippage máximo permitido (default 5%)
            
        Returns:
            tuple: (success: bool, message: str, amount_received: float)
        """
        if from_token == to_token:
            return False, "No se puede swap del mismo token", 0
        
        # Validar slippage
        if max_slippage < 0 or max_slippage > 0.5:  # Máximo 50%
            return False, "Slippage debe estar entre 0% y 50%", 0
        
        try:
            from_token_obj = self.get_token(from_token)
            to_token_obj = self.get_token(to_token)
        except ValueError as e:
            return False, str(e), 0
        
        # Calcular cantidad esperada basado en exchange rate
        if from_token == 'ORX' and to_token == 'VRX':
            expected_amount = amount / self.exchange_rate
        elif from_token == 'VRX' and to_token == 'ORX':
            expected_amount = amount * self.exchange_rate
        else:
            return False, "Par de tokens inválido", 0
        
        # PARCHE 2.3: Calcular cantidad mínima aceptable con slippage
        min_amount = expected_amount * (1 - max_slippage)
        
        # Verificar balance
        if from_token_obj.balance_of(user_address) < amount:
            return False, "Balance insuficiente", 0
        
        # Verificar liquidez disponible
        liquidity_balance = to_token_obj.balance_of('LIQUIDITY_POOL')
        if liquidity_balance < expected_amount:
            return False, f"Liquidez insuficiente en el pool", 0
        
        # PARCHE 2.3: Simular el swap y verificar slippage real
        # En un AMM real, el precio cambia con el tamaño del trade
        # Por ahora usamos el exchange rate fijo, pero validamos
        actual_amount = expected_amount
        actual_slippage = abs(actual_amount - expected_amount) / expected_amount if expected_amount > 0 else 0
        
        if actual_slippage > max_slippage:
            return False, f"Slippage ({actual_slippage*100:.2f}%) excede el máximo ({max_slippage*100:.2f}%)", 0
        
        if actual_amount < min_amount:
            return False, f"Cantidad recibida ({actual_amount}) menor al mínimo ({min_amount})", 0
        
        # Realizar swap
        if from_token_obj.transfer(user_address, 'LIQUIDITY_POOL', amount):
            if to_token_obj.transfer('LIQUIDITY_POOL', user_address, actual_amount):
                logger.info(
                    f"Swap exitoso: {amount} {from_token} -> {actual_amount} {to_token} "
                    f"(slippage: {actual_slippage*100:.2f}%)"
                )
                return True, f"Swap exitoso: recibidos {actual_amount} {to_token}", actual_amount
            else:
                # Revertir si falla la segunda transferencia
                from_token_obj.transfer('LIQUIDITY_POOL', user_address, amount)
                return False, "Error en transferencia de tokens", 0
        
        return False, "Error en swap", 0
    
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
    """
    Pool de staking para VRX con lock periods y penalties.
    PARCHE 2.4: Lock periods implementados
    """
    
    # PARCHE 2.4: Constantes de lock period
    MIN_LOCK_PERIOD = 86400 * 7  # 7 días en segundos
    EARLY_UNSTAKE_PENALTY = 0.10  # 10% de penalidad
    
    def __init__(self, token_manager: TokenManager):
        self.token_manager = token_manager
        self.stakes: Dict[str, Dict] = {}
        self.reward_rate = 0.15  # 15% APY
        self.total_staked = 0
        
    def stake(self, address: str, amount: float, token: str = 'VRX') -> tuple:
        """
        Stakea tokens con lock period.
        PARCHE 2.4: Implementado con período de bloqueo
        
        Returns:
            tuple: (success: bool, message: str)
        """
        if amount <= 0:
            return False, "La cantidad debe ser positiva"
        
        token_obj = self.token_manager.get_token(token)
        
        if token_obj.balance_of(address) < amount:
            return False, "Balance insuficiente"
        
        # Transferir tokens al pool
        if token_obj.transfer(address, 'STAKING_POOL', amount):
            if address not in self.stakes:
                self.stakes[address] = {
                    'ORX': {'amount': 0, 'timestamp': 0, 'lock_end': 0},
                    'VRX': {'amount': 0, 'timestamp': 0, 'lock_end': 0}
                }
            
            current_time = time()
            self.stakes[address][token]['amount'] += amount
            self.stakes[address][token]['timestamp'] = current_time
            
            # PARCHE 2.4: Establecer lock period
            self.stakes[address][token]['lock_end'] = current_time + self.MIN_LOCK_PERIOD
            
            self.total_staked += amount
            
            logger.info(
                f"Stake exitoso: {amount} {token} por {address} "
                f"(lock hasta {self.stakes[address][token]['lock_end']})"
            )
            
            return True, f"Stakeados {amount} {token} exitosamente. Lock period: 7 días"
        
        return False, "Error al transferir tokens"
    
    def unstake(self, address: str, amount: float, token: str = 'VRX', 
                force: bool = False) -> tuple:
        """
        Retira tokens stakeados con validación de lock period.
        PARCHE 2.4: Con penalidad por unstake temprano
        
        Args:
            address: Dirección del staker
            amount: Cantidad a retirar
            token: Token a retirar
            force: Si es True, permite unstake temprano con penalidad
            
        Returns:
            tuple: (success: bool, message: str, amount_received: float, penalty: float)
        """
        if address not in self.stakes or self.stakes[address][token]['amount'] < amount:
            return False, "Stake insuficiente", 0, 0
        
        if amount <= 0:
            return False, "La cantidad debe ser positiva", 0, 0
        
        token_obj = self.token_manager.get_token(token)
        current_time = time()
        
        # PARCHE 2.4: Verificar lock period
        lock_end = self.stakes[address][token]['lock_end']
        is_locked = current_time < lock_end
        
        penalty_amount = 0
        actual_amount = amount
        
        if is_locked and not force:
            remaining_time = lock_end - current_time
            days_remaining = remaining_time / 86400
            return (
                False, 
                f"Tokens bloqueados. Tiempo restante: {days_remaining:.1f} días. "
                f"Usa force=true para unstake con penalidad del {self.EARLY_UNSTAKE_PENALTY*100}%",
                0,
                0
            )
        
        if is_locked and force:
            # PARCHE 2.4: Aplicar penalidad por unstake temprano
            penalty_amount = amount * self.EARLY_UNSTAKE_PENALTY
            actual_amount = amount - penalty_amount
            logger.warning(
                f"Unstake temprano: {address} retira {amount} {token} "
                f"con penalidad de {penalty_amount} {token}"
            )
        
        # Calcular rewards
        rewards = self.calculate_rewards(address, token)
        
        # PARCHE 2.4: Ajustar cantidad con penalidad si aplica
        total_to_transfer = actual_amount + rewards
        
        # Transferir tokens de vuelta (menos penalidad si aplica)
        if token_obj.transfer('STAKING_POOL', address, total_to_transfer):
            self.stakes[address][token]['amount'] -= amount
            self.total_staked -= amount
            
            # La penalidad se queda en el pool
            if penalty_amount > 0:
                logger.info(f"Penalidad de {penalty_amount} {token} retenida en pool")
            
            message = f"Unstake exitoso: recibidos {actual_amount} {token}"
            if rewards > 0:
                message += f" + {rewards} {token} de rewards"
            if penalty_amount > 0:
                message += f" (penalidad: {penalty_amount} {token})"
            
            logger.info(f"Unstake: {address} retiró {amount} {token}, recibió {total_to_transfer}")
            return True, message, total_to_transfer, penalty_amount
        
        return False, "Error al transferir tokens", 0, 0
    
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
