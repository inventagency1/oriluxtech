from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from blockchain import Blockchain
from node import Node
from wallet import Wallet
from transaction import Transaction
from jewelry_certification import JewelryCertificationSystem, JewelryItem, JewelryCertificate
from evm_rpc import create_evm_rpc_blueprint, get_evm_config
import os

# SECURITY FIX: Importar módulos de seguridad
try:
    from security_patches import APIAuth, RateLimiter
    SECURITY_ENABLED = True
except ImportError:
    print("⚠️  WARNING: security_patches.py not found. API running without authentication!")
    SECURITY_ENABLED = False


class BlockchainAPI:
    """
    API REST para interactuar con Oriluxchain.
    Proporciona endpoints para minar, crear transacciones, ver la cadena, etc.
    """
    
    def __init__(self, port=5000):
        """
        Inicializa la API.
        
        Args:
            port (int): Puerto en el que correrá la API
        """
        # Configurar Flask con rutas de templates y static
        template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
        static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
        
        self.app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
        
        # PARCHE 2.5: CORS - Permitir Supabase Edge Functions y Veralix
        default_origins = ','.join([
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            'https://hykegpmjnpaupvwptxtl.supabase.co',
            'https://hykegpmjnpaupvwptxtl.functions.supabase.co',
            'https://veralix.io',
            'https://www.veralix.io',
            'https://veralix.pages.dev'
        ])
        allowed_origins = os.getenv('ALLOWED_ORIGINS', default_origins).split(',')
        
        # Validar y limpiar orígenes
        validated_origins = []
        for origin in allowed_origins:
            origin = origin.strip()
            if origin and (origin.startswith('http://') or origin.startswith('https://')):
                validated_origins.append(origin)
        
        # Si no hay orígenes válidos, usar defaults seguros
        if not validated_origins:
            validated_origins = ["http://localhost:5000", "http://127.0.0.1:5000"]
        
        # Configurar CORS restrictivo
        CORS(self.app, resources={
            r"/*": {
                "origins": validated_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "X-API-Key"],
                "expose_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "max_age": 3600  # Cache preflight por 1 hora
            }
        })
        
        print(f"✅ CORS configurado con orígenes: {validated_origins}")
        
        self.port = port
        self.blockchain = Blockchain(difficulty=4)
        self.node = Node(self.blockchain)
        self.wallet = Wallet()  # Wallet del nodo
        
        # Sistema de certificación de joyería
        self.jewelry_system = JewelryCertificationSystem(self.blockchain)
        
        # SECURITY FIX: Inicializar seguridad
        if SECURITY_ENABLED:
            self.api_auth = APIAuth()
            self.rate_limiter = RateLimiter(
                max_requests=int(os.getenv('RATE_LIMIT_REQUESTS', '10')),
                window=int(os.getenv('RATE_LIMIT_WINDOW', '60'))
            )
            print("✅ API Security enabled: Authentication + Rate Limiting")
        else:
            self.api_auth = None
            self.rate_limiter = None
            print("⚠️  API Security DISABLED - Not recommended for production!")
        
        # Registrar rutas
        self.register_routes()
        self.setup_jewelry_routes()
        
        # Registrar EVM JSON-RPC Blueprint
        evm_blueprint = create_evm_rpc_blueprint(self.blockchain, self.wallet)
        self.app.register_blueprint(evm_blueprint)
        
        print("✅ Sistema de certificación de joyería inicializado")
        print(f"✅ EVM JSON-RPC habilitado - Chain ID: {get_evm_config()['chain_id']}")
    
    def register_routes(self):
        """
        Registra todas las rutas de la API.
        """
        
        @self.app.route('/mine', methods=['POST'])
        def mine():
            """Mina un nuevo bloque."""
            # SECURITY FIX: Proteger endpoint crítico
            if SECURITY_ENABLED:
                # Verificar autenticación
                auth_result = self.api_auth.require_auth(lambda: None)()
                if auth_result:
                    return auth_result
                
                # Verificar rate limit
                if not self.rate_limiter.is_allowed(request.remote_addr):
                    return jsonify({
                        'error': 'Rate limit exceeded',
                        'retry_after': self.rate_limiter.window
                    }), 429
            # Minar bloque con la dirección de la wallet del nodo
            block = self.blockchain.mine_pending_transactions(self.wallet.address)
            
            # Transmitir el bloque a los peers
            self.node.broadcast_block(block)
            
            response = {
                'message': 'Nuevo bloque minado',
                'block': block.to_dict()
            }
            return jsonify(response), 200
        
        @self.app.route('/transactions/new', methods=['POST'])
        def new_transaction():
            """Crea una nueva transacción."""
            values = request.get_json()
            
            # Verificar campos requeridos
            required = ['sender', 'recipient', 'amount']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            # Obtener token (por defecto ORX)
            token = values.get('token', 'ORX')
            
            # Crear transacción
            index = self.blockchain.add_transaction(
                sender=values['sender'],
                recipient=values['recipient'],
                amount=values['amount'],
                token=token
            )
            
            response = {
                'message': f'Transacción de {values["amount"]} {token} será añadida al bloque {index}'
            }
            return jsonify(response), 201
        
        @self.app.route('/chain', methods=['GET'])
        def get_chain():
            """Obtiene la cadena completa."""
            response = self.blockchain.to_dict()
            return jsonify(response), 200
        
        @self.app.route('/balance/<address>', methods=['GET'])
        def get_balance(address):
            """Obtiene los balances de todos los tokens de una dirección."""
            balances = self.blockchain.get_all_balances(address)
            response = {
                'address': address,
                'balances': balances,
                'total_value_orx': self.blockchain.token_manager.get_total_value(address)
            }
            return jsonify(response), 200
        
        @self.app.route('/balance/<address>/<token>', methods=['GET'])
        def get_token_balance(address, token):
            """Obtiene el balance de un token específico."""
            balance = self.blockchain.get_balance(address, token.upper())
            response = {
                'address': address,
                'token': token.upper(),
                'balance': balance
            }
            return jsonify(response), 200
        
        @self.app.route('/wallet', methods=['GET'])
        def get_wallet():
            """Obtiene información de la wallet del nodo."""
            balances = self.blockchain.get_all_balances(self.wallet.address)
            response = {
                'address': self.wallet.address,
                'balances': balances
            }
            return jsonify(response), 200
        
        @self.app.route('/wallet/new', methods=['POST'])
        def create_wallet():
            """Crea una nueva wallet."""
            new_wallet = Wallet()
            response = new_wallet.export_keys()
            return jsonify(response), 201
        
        @self.app.route('/nodes/register', methods=['POST'])
        def register_nodes():
            """Registra nuevos nodos en la red."""
            values = request.get_json()
            nodes = values.get('nodes')
            
            if nodes is None:
                return jsonify({'error': 'Por favor proporciona una lista de nodos'}), 400
            
            for node in nodes:
                self.node.register_peer(node)
            
            response = {
                'message': 'Nuevos nodos añadidos',
                'total_nodes': list(self.node.peers)
            }
            return jsonify(response), 201
        
        @self.app.route('/nodes/resolve', methods=['GET'])
        def consensus():
            """Resuelve conflictos y sincroniza con la red."""
            replaced = self.node.resolve_conflicts()
            
            if replaced:
                response = {
                    'message': 'Nuestra cadena fue reemplazada',
                    'new_chain': self.blockchain.to_dict()
                }
            else:
                response = {
                    'message': 'Nuestra cadena es autoritativa',
                    'chain': self.blockchain.to_dict()
                }
            
            return jsonify(response), 200
        
        @self.app.route('/nodes', methods=['GET'])
        def get_nodes():
            """Obtiene la lista de nodos conectados."""
            response = {
                'nodes': self.node.get_peers(),
                'total': len(self.node.peers)
            }
            return jsonify(response), 200
        
        @self.app.route('/blocks/new', methods=['POST'])
        def receive_block():
            """
            Recibe un nuevo bloque de otro nodo.
            PARCHE 2.1: Validación completa de bloques recibidos
            """
            values = request.get_json()
            
            if not values:
                return jsonify({'error': 'No se recibieron datos'}), 400
            
            # Validar el bloque recibido
            is_valid, error_msg = self.node.validate_received_block(values)
            
            if not is_valid:
                return jsonify({
                    'error': 'Bloque inválido',
                    'reason': error_msg
                }), 400
            
            # Si es válido, agregarlo a la blockchain
            try:
                from block import Block
                block = Block.from_dict(values)
                self.blockchain.chain.append(block)
                
                response = {
                    'message': 'Bloque aceptado y agregado',
                    'block_index': block.index
                }
                return jsonify(response), 201
                
            except Exception as e:
                return jsonify({
                    'error': 'Error al agregar bloque',
                    'reason': str(e)
                }), 500
        
        @self.app.route('/tokens', methods=['GET'])
        def get_tokens():
            """Obtiene información de los tokens."""
            response = self.blockchain.token_manager.to_dict()
            return jsonify(response), 200
        
        @self.app.route('/tokens/swap', methods=['POST'])
        def swap_tokens():
            """
            Intercambia tokens entre ORX y VRX.
            PARCHE 2.3: Con protección de slippage
            """
            values = request.get_json()
            required = ['from_token', 'to_token', 'amount', 'address']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            # PARCHE 2.3: Obtener max_slippage del request (default 5%)
            max_slippage = values.get('max_slippage', 0.05)
            
            success, message, amount_received = self.blockchain.token_manager.swap(
                from_token=values['from_token'].upper(),
                to_token=values['to_token'].upper(),
                amount=values['amount'],
                user_address=values['address'],
                max_slippage=max_slippage
            )
            
            if success:
                response = {
                    'message': message,
                    'success': True,
                    'amount_sent': values['amount'],
                    'amount_received': amount_received,
                    'from_token': values['from_token'].upper(),
                    'to_token': values['to_token'].upper()
                }
                return jsonify(response), 200
            else:
                return jsonify({
                    'error': message,
                    'success': False
                }), 400
        
        @self.app.route('/staking/stake', methods=['POST'])
        def stake_tokens():
            """
            Stakea tokens.
            PARCHE 2.4: Con lock period de 7 días
            """
            values = request.get_json()
            required = ['address', 'amount', 'token']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            success, message = self.blockchain.staking_pool.stake(
                address=values['address'],
                amount=values['amount'],
                token=values['token'].upper()
            )
            
            if success:
                response = {
                    'message': message,
                    'success': True,
                    'lock_period_days': 7
                }
                return jsonify(response), 200
            else:
                return jsonify({'error': message, 'success': False}), 400
        
        @self.app.route('/staking/unstake', methods=['POST'])
        def unstake_tokens():
            """
            Retira tokens stakeados.
            PARCHE 2.4: Con validación de lock period y penalidad
            """
            values = request.get_json()
            required = ['address', 'amount', 'token']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            # PARCHE 2.4: Obtener parámetro force
            force = values.get('force', False)
            
            success, message, amount_received, penalty = self.blockchain.staking_pool.unstake(
                address=values['address'],
                amount=values['amount'],
                token=values['token'].upper(),
                force=force
            )
            
            if success:
                response = {
                    'message': message,
                    'success': True,
                    'amount_received': amount_received,
                    'penalty': penalty
                }
                return jsonify(response), 200
            else:
                return jsonify({'error': message, 'success': False}), 400
        
        @self.app.route('/staking/<address>', methods=['GET'])
        def get_staking_info(address):
            """Obtiene información de staking de una dirección."""
            stake_info = self.blockchain.staking_pool.get_stake_info(address)
            response = {
                'address': address,
                'stakes': stake_info
            }
            return jsonify(response), 200
        
        @self.app.route('/contracts', methods=['GET'])
        def get_contracts():
            """Obtiene todos los contratos desplegados."""
            contracts = self.blockchain.contract_manager.get_all_contracts()
            response = {
                'total': len(contracts),
                'contracts': contracts
            }
            return jsonify(response), 200
        
        @self.app.route('/contracts/deploy', methods=['POST'])
        def deploy_contract():
            """Despliega un nuevo smart contract."""
            values = request.get_json()
            required = ['owner', 'bytecode', 'abi']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            try:
                contract = self.blockchain.deploy_contract(
                    owner=values['owner'],
                    bytecode=values['bytecode'],
                    abi=values['abi'],
                    constructor_params=values.get('constructor_params')
                )
                response = {
                    'message': 'Contrato desplegado exitosamente',
                    'contract': contract.to_dict()
                }
                return jsonify(response), 201
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        
        @self.app.route('/contracts/deploy/template', methods=['POST'])
        def deploy_contract_template():
            """Despliega un contrato desde un template."""
            values = request.get_json()
            required = ['owner', 'template', 'params']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            try:
                contract = self.blockchain.deploy_contract_from_template(
                    owner=values['owner'],
                    template_name=values['template'],
                    params=values['params']
                )
                response = {
                    'message': f'Contrato {values["template"]} desplegado exitosamente',
                    'contract': contract.to_dict()
                }
                return jsonify(response), 201
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        
        @self.app.route('/contracts/<contract_address>', methods=['GET'])
        def get_contract(contract_address):
            """Obtiene información de un contrato."""
            contract = self.blockchain.contract_manager.get_contract(contract_address)
            if contract:
                return jsonify(contract.to_dict()), 200
            return jsonify({'error': 'Contrato no encontrado'}), 404
        
        @self.app.route('/contracts/<contract_address>/call', methods=['POST'])
        def call_contract(contract_address):
            """Llama a una función de un contrato."""
            values = request.get_json()
            required = ['function', 'params', 'sender']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            result = self.blockchain.call_contract(
                contract_address=contract_address,
                function_name=values['function'],
                params=values['params'],
                sender=values['sender'],
                value=values.get('value', 0)
            )
            return jsonify(result), 200
        
        @self.app.route('/', methods=['GET'])
        def index():
            """Sirve el dashboard futurista."""
            # Detectar si es una petición de API (Accept: application/json)
            if request.headers.get('Accept') == 'application/json' or request.args.get('api') == 'true':
                response = {
                    'name': 'Oriluxchain Node',
                    'version': '1.0.0',
                    'chain_length': len(self.blockchain.chain),
                    'difficulty': self.blockchain.difficulty,
                    'peers': len(self.node.peers),
                    'wallet_address': self.wallet.address
                }
                return jsonify(response), 200
            else:
                return render_template('futuristic.html')
        
        @self.app.route('/dark', methods=['GET'])
        def dark_dashboard():
            """Sirve el dashboard oscuro."""
            return render_template('dashboard.html')
        
        @self.app.route('/simple', methods=['GET'])
        def simple_dashboard():
            """Sirve el dashboard simple."""
            return render_template('index.html')
        
        @self.app.route('/veralix-integration', methods=['GET'])
        def veralix_dashboard():
            """Muestra el dashboard de integración y simbiosis con Veralix."""
            return render_template('veralix_dashboard.html')

        @self.app.route('/api/users/packages', methods=['GET'])
        def check_packages():
            """Endpoint simulado para verificar paquetes de usuario."""
            return jsonify({
                'has_package': True,
                'package_type': 'Gold Member',
                'credits': 15,
                'priority': 'High'
            }), 200

        @self.app.route('/api/info', methods=['GET'])
        def api_info():
            """Endpoint de API con información del nodo."""
            response = {
                'name': 'Oriluxchain Node',
                'version': '1.0.0',
                'chain_length': len(self.blockchain.chain),
                'difficulty': self.blockchain.difficulty,
                'peers': len(self.node.peers),
                'wallet_address': self.wallet.address
            }
            return jsonify(response), 200
        
        @self.app.route('/api/stats', methods=['GET'])
        def get_stats():
            """Obtiene estadísticas generales de la blockchain."""
            # Obtener tokens correctamente
            orx = self.blockchain.token_manager.get_token('ORX')
            vrx = self.blockchain.token_manager.get_token('VRX')
            
            # Obtener balance de la wallet principal
            wallet_balance = self.blockchain.get_balance(self.wallet.address, 'ORX')
            
            # Obtener últimos bloques para el gráfico
            recent_blocks = []
            chain_length = len(self.blockchain.chain)
            start_idx = max(0, chain_length - 10)
            for i in range(start_idx, chain_length):
                block = self.blockchain.chain[i]
                recent_blocks.append({
                    'index': block.index,
                    'hash': block.hash[:16] + '...',
                    'transactions': len(block.transactions),
                    'timestamp': block.timestamp
                })
            
            response = {
                'blocks': chain_length,
                'transactions': len(self.blockchain.pending_transactions),
                'nodes': len(self.node.peers),
                'difficulty': self.blockchain.difficulty,
                'wallet_balance': wallet_balance,
                'wallet_address': self.wallet.address,
                'orx_supply': orx.total_supply if orx else 0,
                'vrx_supply': vrx.total_supply if vrx else 0,
                'staking_pool': self.blockchain.staking_pool.total_staked if hasattr(self.blockchain.staking_pool, 'total_staked') else 0,
                'contracts': len(self.blockchain.contract_manager.contracts),
                'recent_blocks': recent_blocks,
                'last_block_time': self.blockchain.chain[-1].timestamp if self.blockchain.chain else 0
            }
            return jsonify(response), 200
        
        @self.app.route('/api/mining-status', methods=['GET'])
        def mining_status():
            """Obtiene el estado actual de minería."""
            response = {
                'status': 'INACTIVE',
                'blocks_mined': len(self.blockchain.chain) - 1,
                'pending_transactions': len(self.blockchain.pending_transactions),
                'difficulty': self.blockchain.difficulty,
                'last_block_time': self.blockchain.chain[-1].timestamp if self.blockchain.chain else 0
            }
            return jsonify(response), 200
        
        @self.app.route('/api/evm-config', methods=['GET'])
        def evm_config():
            """Obtiene la configuración EVM para MetaMask."""
            config = get_evm_config()
            return jsonify({
                'chainId': hex(config['chain_id']),
                'chainIdDecimal': config['chain_id'],
                'chainName': config['chain_name'],
                'nativeCurrency': config['native_currency'],
                'rpcUrls': [config['rpc_url']],
                'blockExplorerUrls': [config['block_explorer']],
                'gasPrice': config['gas_price'],
                'gasLimit': config['gas_limit'],
                'metamaskConfig': {
                    'chainId': hex(config['chain_id']),
                    'chainName': config['chain_name'],
                    'nativeCurrency': config['native_currency'],
                    'rpcUrls': [config['rpc_url']],
                    'blockExplorerUrls': [config['block_explorer']]
                }
            }), 200
        
        @self.app.route('/api/difficulty', methods=['GET'])
        def get_difficulty():
            """Obtiene la dificultad actual."""
            response = {
                'difficulty': self.blockchain.difficulty,
                'target_time': 10,
                'avg_block_time': self._calculate_avg_block_time()
            }
            return jsonify(response), 200
        
        @self.app.route('/transactions', methods=['GET'])
        def get_transactions():
            """Obtiene las transacciones pendientes."""
            response = {
                'pending_transactions': [tx.to_dict() for tx in self.blockchain.pending_transactions],
                'count': len(self.blockchain.pending_transactions)
            }
            return jsonify(response), 200
        
        @self.app.route('/block/<int:index>', methods=['GET'])
        def get_block(index):
            """Obtiene un bloque específico por índice."""
            if 0 <= index < len(self.blockchain.chain):
                block = self.blockchain.chain[index]
                response = block.to_dict()
                return jsonify(response), 200
            return jsonify({'error': 'Bloque no encontrado'}), 404
        
        @self.app.route('/api/blocks', methods=['GET'])
        def get_all_blocks():
            """Obtiene todos los bloques con paginación."""
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            
            total_blocks = len(self.blockchain.chain)
            start_idx = max(0, total_blocks - (page * per_page))
            end_idx = total_blocks - ((page - 1) * per_page)
            
            blocks = []
            for i in range(end_idx - 1, start_idx - 1, -1):
                if 0 <= i < total_blocks:
                    block = self.blockchain.chain[i]
                    blocks.append({
                        'index': block.index,
                        'hash': block.hash,
                        'previous_hash': block.previous_hash,
                        'timestamp': block.timestamp,
                        'transactions': len(block.transactions),
                        'proof': block.proof
                    })
            
            response = {
                'blocks': blocks,
                'total': total_blocks,
                'page': page,
                'per_page': per_page,
                'total_pages': (total_blocks + per_page - 1) // per_page
            }
            return jsonify(response), 200
        
        @self.app.route('/api/block/hash/<hash>', methods=['GET'])
        def get_block_by_hash(hash):
            """Busca un bloque por su hash."""
            for block in self.blockchain.chain:
                if block.hash == hash or block.hash.startswith(hash):
                    response = block.to_dict()
                    return jsonify(response), 200
            return jsonify({'error': 'Bloque no encontrado'}), 404
        
        @self.app.route('/api/blockchain/export', methods=['GET'])
        def export_blockchain():
            """Exporta la blockchain completa en formato JSON."""
            response = {
                'chain': [block.to_dict() for block in self.blockchain.chain],
                'length': len(self.blockchain.chain),
                'difficulty': self.blockchain.difficulty,
                'exported_at': time.time()
            }
            return jsonify(response), 200
        
        @self.app.route('/api/transactions/pending', methods=['GET'])
        def get_pending_transactions():
            """Obtiene todas las transacciones pendientes."""
            transactions = [tx.to_dict() for tx in self.blockchain.pending_transactions]
            response = {
                'transactions': transactions,
                'count': len(transactions)
            }
            return jsonify(response), 200
        
        @self.app.route('/api/transactions/history', methods=['GET'])
        def get_transaction_history():
            """Obtiene el historial completo de transacciones confirmadas."""
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
            
            all_transactions = []
            for block in self.blockchain.chain:
                for tx in block.transactions:
                    tx_dict = tx.to_dict()
                    tx_dict['block_index'] = block.index
                    tx_dict['block_hash'] = block.hash
                    tx_dict['confirmed'] = True
                    all_transactions.append(tx_dict)
            
            # Ordenar por timestamp descendente
            all_transactions.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
            
            # Paginación
            total = len(all_transactions)
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            
            response = {
                'transactions': all_transactions[start_idx:end_idx],
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }
            return jsonify(response), 200
        
        @self.app.route('/api/transactions/address/<address>', methods=['GET'])
        def get_transactions_by_address(address):
            """Obtiene todas las transacciones de una dirección específica."""
            transactions = []
            
            # Buscar en bloques confirmados
            for block in self.blockchain.chain:
                for tx in block.transactions:
                    if tx.sender == address or tx.recipient == address:
                        tx_dict = tx.to_dict()
                        tx_dict['block_index'] = block.index
                        tx_dict['confirmed'] = True
                        transactions.append(tx_dict)
            
            # Buscar en pendientes
            for tx in self.blockchain.pending_transactions:
                if tx.sender == address or tx.recipient == address:
                    tx_dict = tx.to_dict()
                    tx_dict['confirmed'] = False
                    transactions.append(tx_dict)
            
            # Ordenar por timestamp
            transactions.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
            
            response = {
                'address': address,
                'transactions': transactions,
                'count': len(transactions)
            }
            return jsonify(response), 200
        
        @self.app.route('/api/transaction/create', methods=['POST'])
        def create_transaction_api():
            """Crea una nueva transacción (endpoint mejorado)."""
            try:
                data = request.get_json()
                
                # Validar campos requeridos
                required = ['sender', 'recipient', 'amount']
                if not all(k in data for k in required):
                    return jsonify({'error': 'Missing required fields: sender, recipient, amount'}), 400
                
                # Validar montos
                try:
                    amount = float(data['amount'])
                    if amount <= 0:
                        return jsonify({'error': 'Amount must be positive'}), 400
                except ValueError:
                    return jsonify({'error': 'Invalid amount format'}), 400
                
                # Obtener token (por defecto ORX)
                token = data.get('token', 'ORX').upper()
                
                # Verificar balance del sender
                sender_balance = self.blockchain.get_balance(data['sender'], token)
                if sender_balance < amount:
                    return jsonify({
                        'error': f'Insufficient balance. Available: {sender_balance} {token}'
                    }), 400
                
                # Crear transacción
                block_index = self.blockchain.add_transaction(
                    sender=data['sender'],
                    recipient=data['recipient'],
                    amount=amount,
                    token=token
                )
                
                response = {
                    'success': True,
                    'message': f'Transaction created successfully',
                    'transaction': {
                        'sender': data['sender'],
                        'recipient': data['recipient'],
                        'amount': amount,
                        'token': token,
                        'block_index': block_index
                    }
                }
                return jsonify(response), 201
                
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/wallet/create', methods=['POST'])
        def create_new_wallet():
            """Crea una nueva wallet y retorna las claves."""
            new_wallet = Wallet()
            response = {
                'address': new_wallet.address,
                'public_key': new_wallet.get_public_key(),
                'private_key': new_wallet.private_key.hex(),
                'message': 'Wallet creada exitosamente. Guarda tu clave privada de forma segura.'
            }
            return jsonify(response), 201
        
        @self.app.route('/api/wallets', methods=['GET'])
        def get_all_wallets():
            """Obtiene lista de wallets con sus balances."""
            # Por ahora solo devolvemos la wallet del nodo
            # En producción, esto vendría de una base de datos
            wallets = []
            
            # Wallet del nodo
            node_balances = self.blockchain.get_all_balances(self.wallet.address)
            wallets.append({
                'address': self.wallet.address,
                'balances': node_balances,
                'is_node_wallet': True
            })
            
            response = {
                'wallets': wallets,
                'count': len(wallets)
            }
            return jsonify(response), 200
        
        @self.app.route('/api/wallet/<address>/balance', methods=['GET'])
        def get_wallet_balance(address):
            """Obtiene el balance completo de una wallet específica."""
            balances = self.blockchain.get_all_balances(address)
            
            # Calcular valor total en ORX
            total_value = 0
            for token, amount in balances.items():
                if token == 'ORX':
                    total_value += amount
                elif token == 'VRX':
                    # Asumiendo 1 VRX = 0.5 ORX (ajustar según tu lógica)
                    total_value += amount * 0.5
            
            response = {
                'address': address,
                'balances': balances,
                'total_value_orx': total_value
            }
            return jsonify(response), 200
        
        @self.app.route('/api/wallet/import', methods=['POST'])
        def import_wallet():
            """Importa una wallet existente usando clave privada."""
            try:
                data = request.get_json()
                
                if 'private_key' not in data:
                    return jsonify({'error': 'Private key is required'}), 400
                
                private_key = data['private_key']
                
                # Validar formato de clave privada
                try:
                    if isinstance(private_key, str):
                        # Remover prefijo 0x si existe
                        if private_key.startswith('0x'):
                            private_key = private_key[2:]
                        private_key_bytes = bytes.fromhex(private_key)
                    else:
                        private_key_bytes = private_key
                    
                    # Crear wallet desde clave privada
                    from ecdsa import SigningKey, SECP256k1
                    signing_key = SigningKey.from_string(private_key_bytes, curve=SECP256k1)
                    
                    # Crear objeto Wallet
                    imported_wallet = Wallet()
                    imported_wallet.private_key = signing_key
                    imported_wallet.public_key = signing_key.get_verifying_key()
                    imported_wallet.address = imported_wallet._generate_address()
                    
                    # Obtener balances
                    balances = self.blockchain.get_all_balances(imported_wallet.address)
                    
                    response = {
                        'success': True,
                        'address': imported_wallet.address,
                        'balances': balances,
                        'message': 'Wallet imported successfully'
                    }
                    return jsonify(response), 200
                    
                except Exception as e:
                    return jsonify({'error': f'Invalid private key format: {str(e)}'}), 400
                    
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/wallet/<address>/export', methods=['GET'])
        def export_wallet_keys(address):
            """Exporta las claves de una wallet (solo para la wallet del nodo)."""
            # Por seguridad, solo permitir exportar la wallet del nodo
            if address != self.wallet.address:
                return jsonify({'error': 'Can only export node wallet keys'}), 403
            
            response = {
                'address': self.wallet.address,
                'public_key': self.wallet.get_public_key(),
                'private_key': self.wallet.private_key.hex(),
                'warning': '⚠️ Keep your private key safe and never share it!'
            }
            return jsonify(response), 200
        
        @self.app.route('/api/health', methods=['GET'])
        def health_check():
            """Health check endpoint."""
            response = {
                'status': 'healthy',
                'blockchain': 'running',
                'api': 'online',
                'timestamp': self.blockchain.chain[-1].timestamp if self.blockchain.chain else 0
            }
            return jsonify(response), 200
    
    def _calculate_avg_block_time(self):
        """Calcula el tiempo promedio entre bloques."""
        if len(self.blockchain.chain) < 2:
            return 0
        
        total_time = 0
        for i in range(1, min(10, len(self.blockchain.chain))):
            total_time += self.blockchain.chain[i].timestamp - self.blockchain.chain[i-1].timestamp
        
        return total_time / min(9, len(self.blockchain.chain) - 1) if len(self.blockchain.chain) > 1 else 0
    
    def setup_jewelry_routes(self):
        """Configura las rutas para certificación de joyería."""
        
        @self.app.route('/api/jewelry/certify', methods=['POST'])
        def certify_jewelry():
            """Crea un nuevo certificado de joyería."""
            try:
                data = request.get_json()
                
                # Crear item de joyería
                item = JewelryItem(
                    item_id=data.get('item_id'),
                    jewelry_type=data.get('jewelry_type'),
                    material=data.get('material'),
                    purity=data.get('purity'),
                    weight=float(data.get('weight', 0)),
                    stones=data.get('stones', []),
                    jeweler=data.get('jeweler'),
                    manufacturer=data.get('manufacturer'),
                    origin_country=data.get('origin_country'),
                    creation_date=data.get('creation_date'),
                    description=data.get('description'),
                    images=data.get('images', []),
                    estimated_value=float(data.get('estimated_value', 0))
                )
                
                # Crear certificado
                certificate = self.jewelry_system.create_certificate(
                    item=item,
                    owner=data.get('owner'),
                    issuer=data.get('issuer')
                )
                
                # Obtener número de bloque actual
                latest_block = self.blockchain.get_latest_block()
                block_number = latest_block.index if latest_block else 0
                
                return jsonify({
                    'success': True,
                    'certificate': certificate.to_dict(),
                    'certificate_id': certificate.certificate_id,
                    'blockchain_tx': certificate.blockchain_tx,
                    'transaction_hash': certificate.blockchain_tx,
                    'block_number': str(block_number),
                    'verification_url': certificate.verification_url,
                    'message': 'Certificado creado exitosamente'
                }), 201
                
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 400
        
        @self.app.route('/api/jewelry/verify/<certificate_id>', methods=['GET'])
        def verify_jewelry(certificate_id):
            """Verifica un certificado de joyería."""
            result = self.jewelry_system.verify_certificate(certificate_id)
            
            if result:
                return jsonify({
                    'success': True,
                    'verification': result
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': 'Certificado no encontrado'
                }), 404
        
        @self.app.route('/api/jewelry/transfer', methods=['POST'])
        def transfer_jewelry():
            """Transfiere la propiedad de una joya certificada."""
            try:
                data = request.get_json()
                
                success = self.jewelry_system.transfer_ownership(
                    certificate_id=data.get('certificate_id'),
                    new_owner=data.get('new_owner'),
                    current_owner=data.get('current_owner')
                )
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': 'Transferencia exitosa'
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Transferencia fallida'
                    }), 400
                    
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 400
        
        @self.app.route('/api/jewelry/history/<certificate_id>', methods=['GET'])
        def jewelry_history(certificate_id):
            """Obtiene el historial completo de un certificado."""
            history = self.jewelry_system.get_certificate_history(certificate_id)
            
            return jsonify({
                'success': True,
                'certificate_id': certificate_id,
                'history': history
            }), 200
        
        @self.app.route('/api/jewelry/report', methods=['POST'])
        def report_jewelry():
            """Reporta una joya como perdida o robada."""
            try:
                data = request.get_json()
                
                success = self.jewelry_system.report_lost_or_stolen(
                    certificate_id=data.get('certificate_id'),
                    owner=data.get('owner'),
                    status=data.get('status')  # 'lost' or 'stolen'
                )
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': f'Joya reportada como {data.get("status")}'
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Reporte fallido'
                    }), 400
                    
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 400
        
        @self.app.route('/api/jewelry/nft/<certificate_id>', methods=['POST'])
        def create_jewelry_nft(certificate_id):
            """Crea un NFT para una joya certificada."""
            nft_token_id = self.jewelry_system.create_nft(certificate_id)
            
            if nft_token_id:
                return jsonify({
                    'success': True,
                    'nft_token_id': nft_token_id,
                    'message': 'NFT creado exitosamente'
                }), 201
            else:
                return jsonify({
                    'success': False,
                    'error': 'No se pudo crear el NFT'
                }), 400
        
        @self.app.route('/api/jewelry/search', methods=['GET'])
        def search_jewelry():
            """Busca certificados por filtros."""
            filters = {}
            
            if request.args.get('jewelry_type'):
                filters['jewelry_type'] = request.args.get('jewelry_type')
            if request.args.get('material'):
                filters['material'] = request.args.get('material')
            if request.args.get('jeweler'):
                filters['jeweler'] = request.args.get('jeweler')
            if request.args.get('min_value'):
                filters['min_value'] = float(request.args.get('min_value'))
            if request.args.get('max_value'):
                filters['max_value'] = float(request.args.get('max_value'))
            
            results = self.jewelry_system.search_certificates(**filters)
            
            return jsonify({
                'success': True,
                'count': len(results),
                'results': [cert.to_dict() for cert in results]
            }), 200
        
        @self.app.route('/api/jewelry/jeweler/<jeweler>', methods=['GET'])
        def jeweler_certificates(jeweler):
            """Obtiene todos los certificados de un joyero."""
            certificates = self.jewelry_system.get_jeweler_certificates(jeweler)
            
            return jsonify({
                'success': True,
                'jeweler': jeweler,
                'count': len(certificates),
                'certificates': [cert.to_dict() for cert in certificates]
            }), 200
        
        @self.app.route('/api/jewelry/owner/<owner>', methods=['GET'])
        def owner_certificates(owner):
            """Obtiene todos los certificados de un propietario."""
            certificates = self.jewelry_system.get_owner_certificates(owner)
            
            return jsonify({
                'success': True,
                'owner': owner,
                'count': len(certificates),
                'certificates': [cert.to_dict() for cert in certificates]
            }), 200
        
        @self.app.route('/api/jewelry/stats', methods=['GET'])
        def jewelry_stats():
            """Obtiene estadísticas del sistema de certificación."""
            stats = self.jewelry_system.get_statistics()
            
            return jsonify({
                'success': True,
                'statistics': stats
            }), 200
    
    def run(self, debug=True):
        """
        Inicia el servidor Flask.
        
        Args:
            debug (bool): Modo debug
        """
        self.app.run(host='0.0.0.0', port=self.port, debug=debug)
