from flask import Flask, jsonify, request, render_template, send_from_directory
from blockchain import Blockchain
from node import Node
from wallet import Wallet
from transaction import Transaction
import os


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
        self.port = port
        self.blockchain = Blockchain(difficulty=4)
        self.node = Node(self.blockchain)
        self.wallet = Wallet()  # Wallet del nodo
        
        # Registrar rutas
        self.register_routes()
    
    def register_routes(self):
        """
        Registra todas las rutas de la API.
        """
        
        @self.app.route('/mine', methods=['POST'])
        def mine():
            """Mina un nuevo bloque."""
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
            """Recibe un nuevo bloque de otro nodo."""
            values = request.get_json()
            
            # Aquí se podría validar y añadir el bloque
            # Por ahora solo lo reconocemos
            response = {'message': 'Bloque recibido'}
            return jsonify(response), 200
        
        @self.app.route('/tokens', methods=['GET'])
        def get_tokens():
            """Obtiene información de los tokens."""
            response = self.blockchain.token_manager.to_dict()
            return jsonify(response), 200
        
        @self.app.route('/tokens/swap', methods=['POST'])
        def swap_tokens():
            """Intercambia tokens entre ORX y VRX."""
            values = request.get_json()
            required = ['from_token', 'to_token', 'amount', 'address']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            success = self.blockchain.token_manager.swap(
                from_token=values['from_token'].upper(),
                to_token=values['to_token'].upper(),
                amount=values['amount'],
                user_address=values['address']
            )
            
            if success:
                response = {
                    'message': f'Swap exitoso: {values["amount"]} {values["from_token"]} → {values["to_token"]}',
                    'success': True
                }
                return jsonify(response), 200
            else:
                return jsonify({'error': 'Swap fallido', 'success': False}), 400
        
        @self.app.route('/staking/stake', methods=['POST'])
        def stake_tokens():
            """Stakea tokens."""
            values = request.get_json()
            required = ['address', 'amount', 'token']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            success = self.blockchain.staking_pool.stake(
                address=values['address'],
                amount=values['amount'],
                token=values['token'].upper()
            )
            
            if success:
                response = {
                    'message': f'{values["amount"]} {values["token"]} stakeados exitosamente',
                    'success': True
                }
                return jsonify(response), 200
            else:
                return jsonify({'error': 'Staking fallido', 'success': False}), 400
        
        @self.app.route('/staking/unstake', methods=['POST'])
        def unstake_tokens():
            """Retira tokens stakeados."""
            values = request.get_json()
            required = ['address', 'amount', 'token']
            if not all(k in values for k in required):
                return jsonify({'error': 'Faltan campos requeridos'}), 400
            
            success = self.blockchain.staking_pool.unstake(
                address=values['address'],
                amount=values['amount'],
                token=values['token'].upper()
            )
            
            if success:
                response = {
                    'message': f'{values["amount"]} {values["token"]} retirados exitosamente',
                    'success': True
                }
                return jsonify(response), 200
            else:
                return jsonify({'error': 'Unstaking fallido', 'success': False}), 400
        
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
    
    def run(self, debug=True):
        """
        Inicia el servidor Flask.
        
        Args:
            debug (bool): Modo debug
        """
        self.app.run(host='0.0.0.0', port=self.port, debug=debug)
