"""
ORILUXCHAIN <-> VERALIX.IO INTEGRATION
Sistema de integración bidireccional entre Oriluxchain y Veralix.io
"""

import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import hashlib
from time import time
from typing import Dict, List, Optional
import threading


class VeralixConnector:
    """
    Conector para comunicación con Veralix.io
    Maneja la sincronización bidireccional de datos
    """
    
    def __init__(self, veralix_url: str = "https://veralix.io", api_key: str = None):
        self.veralix_url = veralix_url
        self.api_key = api_key
        self.session = requests.Session()
        self.connected = False
        
        # Headers para autenticación
        if api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'X-Blockchain': 'Oriluxchain'
            })
    
    def connect(self) -> bool:
        """Establece conexión con Veralix.io"""
        try:
            response = self.session.get(f"{self.veralix_url}/api/health")
            if response.status_code == 200:
                self.connected = True
                print(f"✅ Conectado a Veralix.io")
                return True
        except Exception as e:
            print(f"❌ Error conectando a Veralix.io: {e}")
            self.connected = False
        return False
    
    def register_blockchain(self, blockchain_info: Dict) -> Dict:
        """Registra Oriluxchain en Veralix.io"""
        try:
            response = self.session.post(
                f"{self.veralix_url}/api/blockchains/register",
                json={
                    'name': 'Oriluxchain',
                    'symbol': 'ORX',
                    'network_id': blockchain_info.get('network_id', 'orilux-mainnet'),
                    'rpc_url': blockchain_info.get('rpc_url'),
                    'explorer_url': blockchain_info.get('explorer_url'),
                    'tokens': ['ORX', 'VRX'],
                    'features': [
                        'smart_contracts',
                        'dual_token',
                        'staking',
                        'nft',
                        'defi'
                    ]
                }
            )
            return response.json()
        except Exception as e:
            print(f"Error registrando blockchain: {e}")
            return {'error': str(e)}
    
    def sync_transaction(self, transaction: Dict) -> bool:
        """Sincroniza una transacción con Veralix.io"""
        try:
            response = self.session.post(
                f"{self.veralix_url}/api/transactions/sync",
                json=transaction
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error sincronizando transacción: {e}")
            return False
    
    def sync_block(self, block: Dict) -> bool:
        """Sincroniza un bloque con Veralix.io"""
        try:
            response = self.session.post(
                f"{self.veralix_url}/api/blocks/sync",
                json=block
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error sincronizando bloque: {e}")
            return False
    
    def sync_contract(self, contract: Dict) -> bool:
        """Sincroniza un smart contract con Veralix.io"""
        try:
            response = self.session.post(
                f"{self.veralix_url}/api/contracts/sync",
                json=contract
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error sincronizando contrato: {e}")
            return False
    
    def get_veralix_data(self, endpoint: str) -> Optional[Dict]:
        """Obtiene datos desde Veralix.io"""
        try:
            response = self.session.get(f"{self.veralix_url}/api/{endpoint}")
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Error obteniendo datos: {e}")
        return None
    
    def subscribe_to_events(self, event_type: str, callback):
        """Suscribe a eventos de Veralix.io"""
        # Implementar WebSocket subscription
        pass


class VeralixBridge:
    """
    Bridge para comunicación bidireccional
    Maneja la sincronización automática
    """
    
    def __init__(self, blockchain, connector: VeralixConnector):
        self.blockchain = blockchain
        self.connector = connector
        self.sync_enabled = False
        self.sync_thread = None
        
    def enable_sync(self):
        """Habilita sincronización automática"""
        self.sync_enabled = True
        self.sync_thread = threading.Thread(target=self._sync_loop, daemon=True)
        self.sync_thread.start()
        print("✅ Sincronización automática habilitada")
    
    def disable_sync(self):
        """Deshabilita sincronización automática"""
        self.sync_enabled = False
        print("⏸️ Sincronización automática deshabilitada")
    
    def _sync_loop(self):
        """Loop de sincronización automática"""
        while self.sync_enabled:
            try:
                # Sincronizar últimos bloques
                latest_block = self.blockchain.get_latest_block()
                self.connector.sync_block(latest_block.to_dict())
                
                # Sincronizar transacciones pendientes
                for tx in self.blockchain.pending_transactions:
                    self.connector.sync_transaction(tx)
                
                # Sincronizar contratos
                contracts = self.blockchain.contract_manager.get_all_contracts()
                for contract in contracts:
                    self.connector.sync_contract(contract)
                
                # Esperar 10 segundos antes del próximo sync
                threading.Event().wait(10)
                
            except Exception as e:
                print(f"Error en sync loop: {e}")
                threading.Event().wait(30)
    
    def manual_sync(self) -> Dict:
        """Sincronización manual completa"""
        results = {
            'blocks': 0,
            'transactions': 0,
            'contracts': 0,
            'errors': []
        }
        
        try:
            # Sincronizar toda la cadena
            for block in self.blockchain.chain:
                if self.connector.sync_block(block.to_dict()):
                    results['blocks'] += 1
                else:
                    results['errors'].append(f"Block {block.index}")
            
            # Sincronizar transacciones
            for tx in self.blockchain.pending_transactions:
                if self.connector.sync_transaction(tx):
                    results['transactions'] += 1
            
            # Sincronizar contratos
            contracts = self.blockchain.contract_manager.get_all_contracts()
            for contract in contracts:
                if self.connector.sync_contract(contract):
                    results['contracts'] += 1
            
        except Exception as e:
            results['errors'].append(str(e))
        
        return results


class VeralixAPI:
    """
    API Gateway para Veralix.io
    Expone endpoints para comunicación
    """
    
    def __init__(self, blockchain, port: int = 5001):
        self.app = Flask(__name__)
        CORS(self.app, resources={
            r"/api/*": {
                "origins": [
                    "https://veralix.io",
                    "https://*.veralix.io",
                    "http://localhost:*"
                ],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "X-Blockchain"]
            }
        })
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")
        self.blockchain = blockchain
        self.port = port
        self.connector = None
        self.bridge = None
        
        self.setup_routes()
        self.setup_websockets()
    
    def setup_routes(self):
        """Configura las rutas de la API"""
        
        @self.app.route('/api/veralix/health', methods=['GET'])
        def health():
            """Health check"""
            return jsonify({
                'status': 'online',
                'blockchain': 'Oriluxchain',
                'version': '1.0.0',
                'veralix_connected': self.connector.connected if self.connector else False
            }), 200
        
        @self.app.route('/api/veralix/connect', methods=['POST'])
        def connect():
            """Conecta con Veralix.io"""
            data = request.get_json()
            veralix_url = data.get('veralix_url', 'https://veralix.io')
            api_key = data.get('api_key')
            
            self.connector = VeralixConnector(veralix_url, api_key)
            connected = self.connector.connect()
            
            if connected:
                # Registrar blockchain
                blockchain_info = {
                    'network_id': 'orilux-mainnet',
                    'rpc_url': f'http://localhost:{self.port}',
                    'explorer_url': f'http://localhost:{self.port}/explorer'
                }
                result = self.connector.register_blockchain(blockchain_info)
                
                # Crear bridge
                self.bridge = VeralixBridge(self.blockchain, self.connector)
                
                return jsonify({
                    'success': True,
                    'message': 'Conectado a Veralix.io',
                    'registration': result
                }), 200
            
            return jsonify({
                'success': False,
                'message': 'No se pudo conectar a Veralix.io'
            }), 500
        
        @self.app.route('/api/veralix/sync', methods=['POST'])
        def sync():
            """Sincronización manual"""
            if not self.bridge:
                return jsonify({'error': 'Bridge no inicializado'}), 400
            
            results = self.bridge.manual_sync()
            return jsonify(results), 200
        
        @self.app.route('/api/veralix/sync/enable', methods=['POST'])
        def enable_sync():
            """Habilita sincronización automática"""
            if not self.bridge:
                return jsonify({'error': 'Bridge no inicializado'}), 400
            
            self.bridge.enable_sync()
            return jsonify({'message': 'Sincronización habilitada'}), 200
        
        @self.app.route('/api/veralix/sync/disable', methods=['POST'])
        def disable_sync():
            """Deshabilita sincronización automática"""
            if not self.bridge:
                return jsonify({'error': 'Bridge no inicializado'}), 400
            
            self.bridge.disable_sync()
            return jsonify({'message': 'Sincronización deshabilitada'}), 200
        
        @self.app.route('/api/veralix/status', methods=['GET'])
        def status():
            """Estado de la integración"""
            return jsonify({
                'connected': self.connector.connected if self.connector else False,
                'sync_enabled': self.bridge.sync_enabled if self.bridge else False,
                'blockchain_info': {
                    'blocks': len(self.blockchain.chain),
                    'pending_tx': len(self.blockchain.pending_transactions),
                    'contracts': len(self.blockchain.contract_manager.contracts)
                }
            }), 200
        
        @self.app.route('/api/veralix/webhook', methods=['POST'])
        def webhook():
            """Webhook para recibir eventos de Veralix.io"""
            data = request.get_json()
            event_type = data.get('event')
            payload = data.get('payload')
            
            # Procesar evento
            if event_type == 'transaction':
                # Procesar transacción desde Veralix
                pass
            elif event_type == 'block':
                # Procesar bloque desde Veralix
                pass
            
            return jsonify({'received': True}), 200
    
    def setup_websockets(self):
        """Configura WebSockets para comunicación en tiempo real"""
        
        @self.socketio.on('connect')
        def handle_connect():
            print('Cliente WebSocket conectado')
            emit('connected', {'message': 'Conectado a Oriluxchain'})
        
        @self.socketio.on('subscribe')
        def handle_subscribe(data):
            channel = data.get('channel')
            print(f'Cliente suscrito a: {channel}')
            emit('subscribed', {'channel': channel})
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            print('Cliente WebSocket desconectado')
    
    def broadcast_event(self, event_type: str, data: Dict):
        """Broadcast de eventos a clientes conectados"""
        self.socketio.emit(event_type, data)
    
    def run(self):
        """Inicia el servidor de API Gateway"""
        print(f"\n🌉 Veralix Bridge API iniciado en puerto {self.port}")
        self.socketio.run(self.app, host='0.0.0.0', port=self.port, debug=False)


# Funciones de utilidad

def create_veralix_config(
    veralix_url: str = "https://veralix.io",
    api_key: str = None,
    auto_sync: bool = True,
    sync_interval: int = 10
) -> Dict:
    """Crea configuración para Veralix"""
    return {
        'veralix_url': veralix_url,
        'api_key': api_key,
        'auto_sync': auto_sync,
        'sync_interval': sync_interval,
        'features': {
            'sync_blocks': True,
            'sync_transactions': True,
            'sync_contracts': True,
            'websocket': True,
            'webhooks': True
        }
    }


def generate_api_key() -> str:
    """Genera una API key para autenticación"""
    import secrets
    return secrets.token_urlsafe(32)
