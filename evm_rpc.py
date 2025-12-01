"""
EVM JSON-RPC Server for OriluxChain
Provides Ethereum-compatible JSON-RPC endpoints for MetaMask and Web3 compatibility
"""

import json
import hashlib
import time
from flask import Blueprint, request, jsonify
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# OriluxChain EVM Configuration
EVM_CONFIG = {
    'chain_id': 8181,  # OriluxChain Chain ID
    'chain_name': 'OriluxChain Mainnet',
    'native_currency': {
        'name': 'Veralix',
        'symbol': 'VRX',
        'decimals': 18
    },
    'rpc_url': 'https://oriluxchain-production.up.railway.app/rpc',
    'block_explorer': 'https://oriluxchain-production.up.railway.app',
    'gas_price': 20000000000,  # 20 Gwei
    'gas_limit': 21000,
    'block_gas_limit': 8000000
}


def create_evm_rpc_blueprint(blockchain, wallet):
    """
    Creates the EVM JSON-RPC Blueprint
    
    Args:
        blockchain: OriluxChain blockchain instance
        wallet: Node wallet instance
    """
    evm_rpc = Blueprint('evm_rpc', __name__)
    
    def to_hex(value):
        """Convert integer to hex string"""
        if isinstance(value, int):
            return hex(value)
        return value
    
    def from_hex(value):
        """Convert hex string to integer"""
        if isinstance(value, str) and value.startswith('0x'):
            return int(value, 16)
        return int(value)
    
    def to_wei(amount):
        """Convert OLX to Wei (18 decimals)"""
        return int(amount * 10**18)
    
    def from_wei(wei):
        """Convert Wei to OLX"""
        return wei / 10**18
    
    def format_address(address):
        """Format address to Ethereum format (0x prefixed, 40 chars)"""
        if not address:
            return '0x0000000000000000000000000000000000000000'
        if address.startswith('0x'):
            return address.lower()
        # Convert OriluxChain address to Ethereum format
        addr_hash = hashlib.sha256(address.encode()).hexdigest()[:40]
        return f'0x{addr_hash}'
    
    def format_hash(hash_value):
        """Format hash to Ethereum format (0x prefixed, 64 chars)"""
        if not hash_value:
            return '0x' + '0' * 64
        if hash_value.startswith('0x'):
            return hash_value.lower()
        return f'0x{hash_value[:64].lower()}'
    
    def format_block(block, full_tx=False):
        """Format OriluxChain block to Ethereum block format"""
        block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
        
        transactions = []
        for i, tx in enumerate(block_dict.get('transactions', [])):
            if full_tx:
                transactions.append(format_transaction(tx, block_dict, i))
            else:
                tx_hash = tx.get('hash') or hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).hexdigest()
                transactions.append(format_hash(tx_hash))
        
        return {
            'number': to_hex(block_dict.get('index', 0)),
            'hash': format_hash(block_dict.get('hash', '')),
            'parentHash': format_hash(block_dict.get('previous_hash', '')),
            'nonce': to_hex(block_dict.get('proof', 0)),
            'sha3Uncles': '0x' + '0' * 64,
            'logsBloom': '0x' + '0' * 512,
            'transactionsRoot': format_hash(hashlib.sha256(json.dumps(transactions).encode()).hexdigest()),
            'stateRoot': '0x' + '0' * 64,
            'receiptsRoot': '0x' + '0' * 64,
            'miner': format_address(block_dict.get('miner', '')),
            'difficulty': to_hex(blockchain.difficulty if blockchain else 4),
            'totalDifficulty': to_hex((block_dict.get('index', 0) + 1) * (blockchain.difficulty if blockchain else 4)),
            'extraData': '0x4f72696c7578436861696e',  # "OriluxChain" in hex
            'size': to_hex(len(json.dumps(block_dict))),
            'gasLimit': to_hex(EVM_CONFIG['block_gas_limit']),
            'gasUsed': to_hex(len(transactions) * EVM_CONFIG['gas_limit']),
            'timestamp': to_hex(int(block_dict.get('timestamp', time.time()))),
            'transactions': transactions,
            'uncles': []
        }
    
    def format_transaction(tx, block=None, tx_index=0):
        """Format OriluxChain transaction to Ethereum transaction format"""
        tx_hash = tx.get('hash') or hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).hexdigest()
        
        return {
            'hash': format_hash(tx_hash),
            'nonce': to_hex(tx.get('nonce', 0)),
            'blockHash': format_hash(block.get('hash', '')) if block else None,
            'blockNumber': to_hex(block.get('index', 0)) if block else None,
            'transactionIndex': to_hex(tx_index),
            'from': format_address(tx.get('sender', '')),
            'to': format_address(tx.get('recipient', '')),
            'value': to_hex(to_wei(tx.get('amount', 0))),
            'gas': to_hex(EVM_CONFIG['gas_limit']),
            'gasPrice': to_hex(EVM_CONFIG['gas_price']),
            'input': '0x',
            'v': '0x1b',
            'r': '0x' + '0' * 64,
            's': '0x' + '0' * 64
        }
    
    def format_transaction_receipt(tx, block, tx_index, success=True):
        """Format transaction receipt"""
        tx_hash = tx.get('hash') or hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).hexdigest()
        
        return {
            'transactionHash': format_hash(tx_hash),
            'transactionIndex': to_hex(tx_index),
            'blockHash': format_hash(block.get('hash', '')),
            'blockNumber': to_hex(block.get('index', 0)),
            'from': format_address(tx.get('sender', '')),
            'to': format_address(tx.get('recipient', '')),
            'cumulativeGasUsed': to_hex((tx_index + 1) * EVM_CONFIG['gas_limit']),
            'gasUsed': to_hex(EVM_CONFIG['gas_limit']),
            'contractAddress': None,
            'logs': [],
            'logsBloom': '0x' + '0' * 512,
            'status': '0x1' if success else '0x0',
            'effectiveGasPrice': to_hex(EVM_CONFIG['gas_price'])
        }
    
    @evm_rpc.route('/rpc', methods=['POST'])
    @evm_rpc.route('/', methods=['POST'])
    def json_rpc():
        """Main JSON-RPC endpoint"""
        try:
            data = request.get_json()
            
            if isinstance(data, list):
                # Batch request
                responses = [handle_rpc_call(call) for call in data]
                return jsonify(responses)
            else:
                # Single request
                response = handle_rpc_call(data)
                return jsonify(response)
                
        except Exception as e:
            logger.error(f"JSON-RPC Error: {e}")
            return jsonify({
                'jsonrpc': '2.0',
                'error': {'code': -32603, 'message': str(e)},
                'id': None
            })
    
    def handle_rpc_call(data):
        """Handle individual RPC call"""
        method = data.get('method', '')
        params = data.get('params', [])
        request_id = data.get('id', 1)
        
        logger.info(f"RPC Call: {method} with params: {params}")
        
        # Method handlers
        handlers = {
            # Network methods
            'net_version': lambda: str(EVM_CONFIG['chain_id']),
            'net_listening': lambda: True,
            'net_peerCount': lambda: to_hex(1),
            
            # Web3 methods
            'web3_clientVersion': lambda: 'OriluxChain/v1.0.0/python',
            'web3_sha3': lambda: handle_sha3(params),
            
            # Eth methods
            'eth_chainId': lambda: to_hex(EVM_CONFIG['chain_id']),
            'eth_protocolVersion': lambda: '0x41',
            'eth_syncing': lambda: False,
            'eth_coinbase': lambda: format_address(wallet.address if wallet else ''),
            'eth_mining': lambda: False,
            'eth_hashrate': lambda: '0x0',
            'eth_gasPrice': lambda: to_hex(EVM_CONFIG['gas_price']),
            'eth_accounts': lambda: [format_address(wallet.address)] if wallet else [],
            'eth_blockNumber': lambda: to_hex(len(blockchain.chain) - 1) if blockchain else '0x0',
            
            # Block methods
            'eth_getBlockByNumber': lambda: handle_get_block_by_number(params),
            'eth_getBlockByHash': lambda: handle_get_block_by_hash(params),
            'eth_getBlockTransactionCountByNumber': lambda: handle_get_block_tx_count(params),
            'eth_getBlockTransactionCountByHash': lambda: handle_get_block_tx_count_by_hash(params),
            
            # Transaction methods
            'eth_getTransactionByHash': lambda: handle_get_transaction(params),
            'eth_getTransactionByBlockNumberAndIndex': lambda: handle_get_tx_by_block_and_index(params),
            'eth_getTransactionReceipt': lambda: handle_get_transaction_receipt(params),
            'eth_getTransactionCount': lambda: handle_get_transaction_count(params),
            'eth_sendTransaction': lambda: handle_send_transaction(params),
            'eth_sendRawTransaction': lambda: handle_send_raw_transaction(params),
            'eth_call': lambda: handle_call(params),
            'eth_estimateGas': lambda: to_hex(EVM_CONFIG['gas_limit']),
            
            # Balance methods
            'eth_getBalance': lambda: handle_get_balance(params),
            'eth_getCode': lambda: '0x',
            'eth_getStorageAt': lambda: '0x' + '0' * 64,
            
            # Filter methods (stubs)
            'eth_newFilter': lambda: '0x1',
            'eth_newBlockFilter': lambda: '0x1',
            'eth_newPendingTransactionFilter': lambda: '0x1',
            'eth_uninstallFilter': lambda: True,
            'eth_getFilterChanges': lambda: [],
            'eth_getFilterLogs': lambda: [],
            'eth_getLogs': lambda: [],
            
            # Other
            'eth_sign': lambda: handle_sign(params),
            'eth_signTransaction': lambda: handle_sign_transaction(params),
            'personal_sign': lambda: handle_personal_sign(params),
        }
        
        handler = handlers.get(method)
        
        if handler:
            try:
                result = handler()
                return {
                    'jsonrpc': '2.0',
                    'result': result,
                    'id': request_id
                }
            except Exception as e:
                logger.error(f"Handler error for {method}: {e}")
                return {
                    'jsonrpc': '2.0',
                    'error': {'code': -32603, 'message': str(e)},
                    'id': request_id
                }
        else:
            logger.warning(f"Unknown method: {method}")
            return {
                'jsonrpc': '2.0',
                'error': {'code': -32601, 'message': f'Method not found: {method}'},
                'id': request_id
            }
    
    # Handler implementations
    def handle_sha3(params):
        if not params:
            return '0x' + '0' * 64
        data = params[0]
        if data.startswith('0x'):
            data = bytes.fromhex(data[2:])
        else:
            data = data.encode()
        return '0x' + hashlib.sha3_256(data).hexdigest()
    
    def handle_get_block_by_number(params):
        if not params or not blockchain:
            return None
        
        block_number = params[0]
        full_tx = params[1] if len(params) > 1 else False
        
        if block_number == 'latest':
            block = blockchain.chain[-1]
        elif block_number == 'earliest':
            block = blockchain.chain[0]
        elif block_number == 'pending':
            return None
        else:
            index = from_hex(block_number)
            if index >= len(blockchain.chain):
                return None
            block = blockchain.chain[index]
        
        return format_block(block, full_tx)
    
    def handle_get_block_by_hash(params):
        if not params or not blockchain:
            return None
        
        block_hash = params[0]
        full_tx = params[1] if len(params) > 1 else False
        
        # Remove 0x prefix for comparison
        search_hash = block_hash[2:] if block_hash.startswith('0x') else block_hash
        
        for block in blockchain.chain:
            block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
            if block_dict.get('hash', '').lower() == search_hash.lower():
                return format_block(block, full_tx)
        
        return None
    
    def handle_get_block_tx_count(params):
        if not params or not blockchain:
            return '0x0'
        
        block_number = params[0]
        
        if block_number == 'latest':
            block = blockchain.chain[-1]
        elif block_number == 'earliest':
            block = blockchain.chain[0]
        else:
            index = from_hex(block_number)
            if index >= len(blockchain.chain):
                return '0x0'
            block = blockchain.chain[index]
        
        block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
        return to_hex(len(block_dict.get('transactions', [])))
    
    def handle_get_block_tx_count_by_hash(params):
        if not params or not blockchain:
            return '0x0'
        
        block_hash = params[0]
        search_hash = block_hash[2:] if block_hash.startswith('0x') else block_hash
        
        for block in blockchain.chain:
            block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
            if block_dict.get('hash', '').lower() == search_hash.lower():
                return to_hex(len(block_dict.get('transactions', [])))
        
        return '0x0'
    
    def handle_get_transaction(params):
        if not params or not blockchain:
            return None
        
        tx_hash = params[0]
        search_hash = tx_hash[2:] if tx_hash.startswith('0x') else tx_hash
        
        for block in blockchain.chain:
            block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
            for i, tx in enumerate(block_dict.get('transactions', [])):
                tx_h = tx.get('hash') or hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).hexdigest()
                if tx_h.lower() == search_hash.lower():
                    return format_transaction(tx, block_dict, i)
        
        return None
    
    def handle_get_tx_by_block_and_index(params):
        if len(params) < 2 or not blockchain:
            return None
        
        block_number = params[0]
        tx_index = from_hex(params[1])
        
        if block_number == 'latest':
            block = blockchain.chain[-1]
        else:
            index = from_hex(block_number)
            if index >= len(blockchain.chain):
                return None
            block = blockchain.chain[index]
        
        block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
        transactions = block_dict.get('transactions', [])
        
        if tx_index >= len(transactions):
            return None
        
        return format_transaction(transactions[tx_index], block_dict, tx_index)
    
    def handle_get_transaction_receipt(params):
        if not params or not blockchain:
            return None
        
        tx_hash = params[0]
        search_hash = tx_hash[2:] if tx_hash.startswith('0x') else tx_hash
        
        for block in blockchain.chain:
            block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
            for i, tx in enumerate(block_dict.get('transactions', [])):
                tx_h = tx.get('hash') or hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).hexdigest()
                if tx_h.lower() == search_hash.lower():
                    return format_transaction_receipt(tx, block_dict, i)
        
        return None
    
    def handle_get_transaction_count(params):
        if not params:
            return '0x0'
        
        address = params[0]
        # For now, return 0 - in a full implementation, track nonces per address
        return '0x0'
    
    def handle_get_balance(params):
        if not params or not blockchain:
            return '0x0'
        
        address = params[0]
        
        # Try to get balance from blockchain
        # Convert Ethereum address back to OriluxChain format if needed
        balance = 0
        
        # Check if it's the node wallet
        if wallet and format_address(wallet.address).lower() == address.lower():
            balance = blockchain.get_balance(wallet.address)
        else:
            # Search for matching address in transactions
            for block in blockchain.chain:
                block_dict = block.to_dict() if hasattr(block, 'to_dict') else block
                for tx in block_dict.get('transactions', []):
                    if format_address(tx.get('recipient', '')).lower() == address.lower():
                        balance += tx.get('amount', 0)
                    if format_address(tx.get('sender', '')).lower() == address.lower():
                        balance -= tx.get('amount', 0)
        
        return to_hex(to_wei(max(0, balance)))
    
    def handle_send_transaction(params):
        if not params or not blockchain:
            return None
        
        tx_data = params[0]
        
        # Create OriluxChain transaction
        sender = tx_data.get('from', '')
        recipient = tx_data.get('to', '')
        value = from_wei(from_hex(tx_data.get('value', '0x0')))
        
        # Add to pending transactions
        tx = {
            'sender': sender,
            'recipient': recipient,
            'amount': value,
            'timestamp': time.time()
        }
        
        tx_hash = hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).hexdigest()
        tx['hash'] = tx_hash
        
        blockchain.pending_transactions.append(tx)
        
        return format_hash(tx_hash)
    
    def handle_send_raw_transaction(params):
        if not params:
            return None
        
        # For raw transactions, we'd need to decode the signed transaction
        # This is a simplified implementation
        raw_tx = params[0]
        tx_hash = hashlib.sha256(raw_tx.encode()).hexdigest()
        
        return format_hash(tx_hash)
    
    def handle_call(params):
        # eth_call is used for read-only contract calls
        # Return empty data for now
        return '0x'
    
    def handle_sign(params):
        # Signing requires private key access
        return '0x' + '0' * 130
    
    def handle_sign_transaction(params):
        return {'raw': '0x', 'tx': {}}
    
    def handle_personal_sign(params):
        return '0x' + '0' * 130
    
    # Chain info endpoint for MetaMask
    @evm_rpc.route('/chain-info', methods=['GET'])
    def chain_info():
        """Returns chain configuration for wallet setup"""
        return jsonify({
            'chainId': to_hex(EVM_CONFIG['chain_id']),
            'chainName': EVM_CONFIG['chain_name'],
            'nativeCurrency': EVM_CONFIG['native_currency'],
            'rpcUrls': [EVM_CONFIG['rpc_url']],
            'blockExplorerUrls': [EVM_CONFIG['block_explorer']]
        })
    
    return evm_rpc


def get_evm_config():
    """Returns EVM configuration"""
    return EVM_CONFIG
