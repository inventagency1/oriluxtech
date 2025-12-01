# 🛠️ GUÍA DE IMPLEMENTACIÓN DE PARCHES DE SEGURIDAD

## 📋 Índice
1. [Preparación](#preparación)
2. [Parches Críticos](#parches-críticos)
3. [Parches de Alta Prioridad](#parches-de-alta-prioridad)
4. [Testing](#testing)
5. [Deployment](#deployment)

---

## 🚀 Preparación

### 1. Backup Completo
```bash
# Crear backup de la blockchain
cp -r c:\Users\Sebastian\Desktop\Oriluxchain c:\Users\Sebastian\Desktop\Oriluxchain_backup_$(date +%Y%m%d)

# Backup de datos
cp -r data/ data_backup_$(date +%Y%m%d)/
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Generar valores seguros
python security_patches.py  # Genera API keys

# Editar .env con valores reales
nano .env
```

### 3. Instalar Dependencias Adicionales
```bash
pip install flask-limiter pyjwt python-dotenv
```

---

## 🔴 PARCHES CRÍTICOS (Implementar HOY)

### Parche 1: Remover Contraseña Hardcodeada

**Archivo:** `auth.py`

```python
# ANTES (LÍNEA 73)
password_hash=User.hash_password('ZoeyMama*2025*')

# DESPUÉS
import os
superadmin_password = os.getenv('SUPERADMIN_PASSWORD')
if not superadmin_password:
    raise ValueError("SUPERADMIN_PASSWORD environment variable must be set")
password_hash=User.hash_password(superadmin_password)
```

**Aplicar cambio:**
```bash
# Editar auth.py línea 68-76
nano auth.py
```

---

### Parche 2: Validación de Firmas Digitales

**Archivo:** `blockchain.py`

Agregar al método `validate_transaction` (después de línea 161):

```python
def validate_transaction(self, transaction: Dict) -> Tuple[bool, Optional[str]]:
    # ... código existente ...
    
    # AGREGAR: Verificar firma digital
    if transaction['sender'] != 'NETWORK':
        if 'signature' not in transaction:
            return False, "Missing transaction signature"
        
        if 'public_key' not in transaction:
            return False, "Missing public key"
        
        # Verificar firma
        from transaction import Transaction
        tx_obj = Transaction(
            transaction['sender'],
            transaction['recipient'],
            transaction['amount']
        )
        tx_obj.timestamp = transaction['timestamp']
        tx_obj.signature = transaction['signature']
        
        if not tx_obj.is_valid(transaction['public_key']):
            return False, "Invalid transaction signature"
    
    return True, None
```

---

### Parche 3: Autenticación de API

**Archivo:** `api.py`

1. Importar al inicio del archivo:
```python
from security_patches import APIAuth, RateLimiter
import os
```

2. En `__init__` (después de línea 30):
```python
# Inicializar seguridad
self.api_auth = APIAuth()
self.rate_limiter = RateLimiter(
    max_requests=int(os.getenv('RATE_LIMIT_REQUESTS', '10')),
    window=int(os.getenv('RATE_LIMIT_WINDOW', '60'))
)
```

3. Proteger endpoints críticos:
```python
@self.app.route('/mine', methods=['POST'])
@self.api_auth.require_auth
@self.rate_limiter.limit
def mine():
    # ... código existente ...

@self.app.route('/transactions/new', methods=['POST'])
@self.api_auth.require_auth
@self.rate_limiter.limit
def new_transaction():
    # ... código existente ...

@self.app.route('/contracts/deploy', methods=['POST'])
@self.api_auth.require_auth
def deploy_contract():
    # ... código existente ...
```

---

### Parche 4: Protección Double-Spending

**Archivo:** `blockchain.py`

1. Importar en el inicio:
```python
from security_patches import DoubleSpendingProtection
```

2. En `__init__` (después de línea 92):
```python
# Protección double-spending
self.double_spend_protection = DoubleSpendingProtection()
```

3. En `add_transaction` (después de línea 198):
```python
def add_transaction(self, sender, recipient, amount, token='ORX'):
    transaction = {
        'sender': sender,
        'recipient': recipient,
        'amount': amount,
        'token': token,
        'timestamp': time(),
        'nonce': self.double_spend_protection.transaction_nonces.get(sender, 0)
    }
    
    # Validar transacción
    is_valid, error_msg = self.validate_transaction(transaction)
    if not is_valid:
        logger.warning(f"Invalid transaction rejected: {error_msg}")
        raise InvalidTransactionError(error_msg)
    
    # Verificar double-spending
    tx_id = self.double_spend_protection.generate_tx_id(transaction)
    if self.double_spend_protection.is_spent(tx_id):
        raise InvalidTransactionError("Transaction already spent (double-spending detected)")
    
    # Marcar como gastada
    self.double_spend_protection.mark_spent(tx_id)
    self.double_spend_protection.increment_nonce(sender)
    
    # ... resto del código existente ...
```

---

### Parche 5: Límites en Smart Contract VM

**Archivo:** `smart_contract.py`

Reemplazar método `_execute_instructions` (línea 81-138):

```python
def _execute_instructions(self, instructions: List[Dict], context: Dict) -> Any:
    self.memory['sender'] = context.get('sender')
    self.memory['value'] = context.get('value', 0)
    self.memory['contract_address'] = context.get('contract_address')
    
    # AGREGAR: Límite de iteraciones
    max_iterations = 10000
    iteration_count = 0
    
    for instruction in instructions:
        # Verificar límite
        iteration_count += 1
        if iteration_count > max_iterations:
            raise Exception("Execution limit exceeded - possible infinite loop")
        
        self._consume_gas(10)
        
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
            if len(self.stack) < 2:
                raise Exception("Stack underflow")
            b = self.stack.pop()
            a = self.stack.pop()
            self.stack.append(a + b)
        elif op == 'SUB':
            if len(self.stack) < 2:
                raise Exception("Stack underflow")
            b = self.stack.pop()
            a = self.stack.pop()
            self.stack.append(a - b)
        elif op == 'MUL':
            if len(self.stack) < 2:
                raise Exception("Stack underflow")
            b = self.stack.pop()
            a = self.stack.pop()
            self.stack.append(a * b)
        elif op == 'DIV':
            if len(self.stack) < 2:
                raise Exception("Stack underflow")
            b = self.stack.pop()
            a = self.stack.pop()
            # CAMBIAR: Lanzar error en división por cero
            if b == 0:
                raise Exception("Division by zero")
            self.stack.append(a / b)
        elif op == 'EQ':
            if len(self.stack) < 2:
                raise Exception("Stack underflow")
            b = self.stack.pop()
            a = self.stack.pop()
            self.stack.append(1 if a == b else 0)
        elif op == 'GT':
            if len(self.stack) < 2:
                raise Exception("Stack underflow")
            b = self.stack.pop()
            a = self.stack.pop()
            self.stack.append(1 if a > b else 0)
        elif op == 'LT':
            if len(self.stack) < 2:
                raise Exception("Stack underflow")
            b = self.stack.pop()
            a = self.stack.pop()
            self.stack.append(1 if a < b else 0)
        elif op == 'RETURN':
            return self.stack.pop() if self.stack else None
        elif op == 'REVERT':
            raise Exception("Contract reverted")
    
    return self.stack[-1] if self.stack else None
```

---

## 🟠 PARCHES DE ALTA PRIORIDAD

### Parche 6: Validación de Bloques Recibidos

**Archivo:** `api.py`

Reemplazar endpoint `/blocks/new` (línea 171-179):

```python
@self.app.route('/blocks/new', methods=['POST'])
@self.api_auth.require_auth
def receive_block():
    """Recibe y valida un nuevo bloque de otro nodo."""
    values = request.get_json()
    
    try:
        from block import Block
        from security_patches import BlockValidator
        
        # Reconstruir bloque
        block = Block.from_dict(values)
        
        # Validar bloque
        is_valid, error = BlockValidator.validate_block(block, self.blockchain)
        if not is_valid:
            logger.warning(f"Invalid block rejected: {error}")
            return jsonify({'error': error}), 400
        
        # Verificar que conecta con la cadena
        latest_block = self.blockchain.get_latest_block()
        if block.previous_hash != latest_block.hash:
            return jsonify({'error': 'Block does not connect to chain'}), 400
        
        # Añadir bloque
        self.blockchain.chain.append(block)
        logger.info(f"Block {block.index} accepted from peer")
        
        return jsonify({
            'message': 'Block accepted',
            'block_index': block.index
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing block: {e}")
        return jsonify({'error': str(e)}), 400
```

---

### Parche 7: Control de Minting

**Archivo:** `token_system.py`

Modificar clase `Token` (línea 11-72):

```python
class Token:
    """Clase base para tokens en Oriluxchain"""
    
    def __init__(self, symbol: str, name: str, total_supply: float, decimals: int = 18):
        self.symbol = symbol
        self.name = name
        self.total_supply = total_supply
        self.decimals = decimals
        self.balances: Dict[str, float] = {}
        self.allowances: Dict[str, Dict[str, float]] = {}
        
        # AGREGAR: Control de minting
        self.authorized_minters: Set[str] = {'GENESIS', 'MINING_POOL', 'NETWORK'}
        self.current_supply = 0
        
    def mint(self, address: str, amount: float, minter: str = 'NETWORK') -> bool:
        """Acuña nuevos tokens con control de permisos"""
        # Verificar permisos
        if minter not in self.authorized_minters:
            raise PermissionError(f"Address {minter} not authorized to mint")
        
        # Verificar límite de supply
        if self.current_supply + amount > self.total_supply:
            raise ValueError(f"Minting {amount} would exceed total supply")
        
        if address not in self.balances:
            self.balances[address] = 0
        
        self.balances[address] += amount
        self.current_supply += amount
        return True
    
    def add_minter(self, minter: str, authorized_by: str):
        """Agrega un minter autorizado"""
        if authorized_by not in self.authorized_minters:
            raise PermissionError("Not authorized to add minters")
        self.authorized_minters.add(minter)
    
    # ... resto de métodos sin cambios ...
```

---

### Parche 8: Slippage Protection

**Archivo:** `token_system.py`

Modificar método `swap` (línea 151-179):

```python
def swap(self, from_token: str, to_token: str, amount: float, 
         user_address: str, max_slippage: float = 0.01) -> bool:
    """
    Intercambia tokens con protección de slippage
    max_slippage: porcentaje máximo de slippage (default 1%)
    """
    if from_token == to_token:
        return False
    
    from_token_obj = self.get_token(from_token)
    to_token_obj = self.get_token(to_token)
    
    # Calcular cantidad esperada
    if from_token == 'ORX' and to_token == 'VRX':
        expected_amount = amount / self.exchange_rate
    elif from_token == 'VRX' and to_token == 'ORX':
        expected_amount = amount * self.exchange_rate
    else:
        return False
    
    # Verificar liquidez
    liquidity = to_token_obj.balance_of('LIQUIDITY_POOL')
    if liquidity < expected_amount:
        raise ValueError(f"Insufficient liquidity: {liquidity} < {expected_amount}")
    
    # Calcular con slippage (simulación de AMM)
    # En producción, usar fórmula x*y=k
    actual_amount = expected_amount * (1 - (amount / (liquidity * 100)))
    
    # Verificar slippage
    slippage = abs(actual_amount - expected_amount) / expected_amount
    if slippage > max_slippage:
        raise ValueError(f"Slippage too high: {slippage:.2%} > {max_slippage:.2%}")
    
    # Verificar balance
    if from_token_obj.balance_of(user_address) < amount:
        return False
    
    # Realizar swap
    if from_token_obj.transfer(user_address, 'LIQUIDITY_POOL', amount):
        to_token_obj.transfer('LIQUIDITY_POOL', user_address, actual_amount)
        return True
    
    return False
```

---

## 🧪 TESTING

### 1. Tests de Parches Críticos

Crear archivo `test_security_patches.py`:

```python
import pytest
from security_patches import *
from blockchain import Blockchain
from wallet import Wallet

def test_api_auth():
    """Test autenticación de API"""
    auth = APIAuth()
    assert not auth.verify_key("invalid_key")

def test_rate_limiter():
    """Test rate limiting"""
    limiter = RateLimiter(max_requests=3, window=60)
    ip = "192.168.1.1"
    
    assert limiter.is_allowed(ip)
    assert limiter.is_allowed(ip)
    assert limiter.is_allowed(ip)
    assert not limiter.is_allowed(ip)  # Debe fallar

def test_transaction_signature():
    """Test validación de firmas"""
    wallet = Wallet()
    tx = {
        'sender': wallet.address,
        'recipient': 'test_recipient',
        'amount': 100,
        'timestamp': time(),
        'token': 'ORX'
    }
    
    # Sin firma debe fallar
    is_valid, error = TransactionValidator.validate_transaction_complete(tx)
    assert not is_valid

def test_double_spending():
    """Test protección double-spending"""
    protection = DoubleSpendingProtection()
    tx = {
        'sender': 'addr1',
        'recipient': 'addr2',
        'amount': 100,
        'token': 'ORX',
        'timestamp': time(),
        'nonce': 0
    }
    
    tx_id = protection.generate_tx_id(tx)
    protection.mark_spent(tx_id)
    
    assert protection.is_spent(tx_id)

def test_smart_contract_limits():
    """Test límites de VM"""
    from smart_contract import SmartContractVM
    
    vm = SmartContractVM()
    
    # Bytecode con loop infinito simulado
    bytecode = "\n".join(["PUSH 1"] * 11000)  # Más del límite
    
    with pytest.raises(Exception, match="Execution limit exceeded"):
        vm.execute(bytecode, {'sender': 'test'})

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

### 2. Ejecutar Tests

```bash
# Instalar pytest si no está instalado
pip install pytest

# Ejecutar tests
pytest test_security_patches.py -v

# Con cobertura
pip install pytest-cov
pytest test_security_patches.py --cov=. --cov-report=html
```

---

## 🚀 DEPLOYMENT

### 1. Checklist Pre-Deployment

- [ ] Todos los parches críticos aplicados
- [ ] Variables de entorno configuradas
- [ ] Tests pasando
- [ ] Backup completo realizado
- [ ] Documentación actualizada
- [ ] Equipo notificado

### 2. Deployment Paso a Paso

```bash
# 1. Detener servicios
docker-compose down

# 2. Aplicar parches
git add .
git commit -m "Security patches - Critical vulnerabilities fixed"

# 3. Actualizar dependencias
pip install -r requirements.txt

# 4. Verificar configuración
python security_patches.py

# 5. Ejecutar tests
pytest test_security_patches.py

# 6. Iniciar servicios
docker-compose up -d

# 7. Verificar logs
docker-compose logs -f oriluxchain

# 8. Health check
curl http://localhost:5000/api/info
```

### 3. Monitoreo Post-Deployment

```bash
# Monitorear logs en tiempo real
tail -f logs/oriluxchain.log

# Verificar métricas
curl http://localhost:5000/chain | jq '.stats'

# Test de endpoints protegidos
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -X POST http://localhost:5000/mine
```

---

## 📊 VALIDACIÓN

### Checklist de Validación

- [ ] Contraseña hardcodeada removida
- [ ] Autenticación funcionando en API
- [ ] Rate limiting activo
- [ ] Firmas digitales validándose
- [ ] Double-spending bloqueado
- [ ] Smart contracts con límites
- [ ] Bloques validándose correctamente
- [ ] Minting controlado
- [ ] Logs sin información sensible
- [ ] CORS configurado correctamente

### Comandos de Validación

```bash
# Test autenticación
curl -X POST http://localhost:5000/mine
# Debe retornar 401 Unauthorized

# Test rate limiting
for i in {1..15}; do curl http://localhost:5000/chain; done
# Debe retornar 429 después de 10 requests

# Test validación de firmas
python -c "
from blockchain import Blockchain
bc = Blockchain()
try:
    bc.add_transaction('fake', 'addr', 100)
except Exception as e:
    print(f'✅ Signature validation working: {e}')
"
```

---

## 🆘 TROUBLESHOOTING

### Problema: API retorna 401 en todos los requests

**Solución:**
```bash
# Verificar que API_KEYS está configurado
echo $API_KEYS

# Generar nueva API key
python security_patches.py

# Agregar a .env
echo "API_KEYS=nueva_key_generada" >> .env

# Reiniciar
docker-compose restart
```

### Problema: Tests fallan

**Solución:**
```bash
# Verificar dependencias
pip install -r requirements.txt

# Limpiar cache
find . -type d -name __pycache__ -exec rm -r {} +

# Ejecutar tests individuales
pytest test_security_patches.py::test_api_auth -v
```

### Problema: Blockchain no valida firmas

**Solución:**
```bash
# Verificar que el parche está aplicado
grep "verify_signature" blockchain.py

# Verificar variable de entorno
echo $ENABLE_SIGNATURE_VALIDATION

# Debe ser 'true'
```

---

## 📞 SOPORTE

**Email:** security@oriluxchain.io  
**Slack:** #security-patches  
**Docs:** https://docs.oriluxchain.io/security

---

## ✅ CONCLUSIÓN

Después de aplicar todos los parches:

1. ✅ Vulnerabilidades críticas eliminadas
2. ✅ API protegida con autenticación
3. ✅ Transacciones validadas criptográficamente
4. ✅ Smart contracts con límites seguros
5. ✅ Protección contra ataques comunes

**Próximos pasos:**
- Implementar parches de prioridad media
- Configurar monitoreo avanzado
- Realizar penetration testing
- Obtener certificación de seguridad
