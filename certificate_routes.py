"""
ORILUXCHAIN - Certificate Routes
Endpoints para la integración con Veralix.io
"""

from flask import jsonify, request, render_template
from certificate_manager import CertificateManager, JewelryCertificate
import logging

logger = logging.getLogger(__name__)


def init_certificate_routes(app, blockchain):
    """
    Inicializa las rutas de certificados
    
    Args:
        app: Instancia de Flask
        blockchain: Instancia de Blockchain
    """
    
    # Crear el gestor de certificados
    cert_manager = CertificateManager(blockchain)
    
    @app.route('/api/veralix/webhook', methods=['POST', 'OPTIONS'])
    def veralix_webhook():
        """
        Webhook para recibir eventos de Veralix.io
        
        POST /api/veralix/webhook
        {
          "event": "jewelry_certified",
          "payload": {
            "certificate_id": "VRX-JWL-2025-001",
            "jewelry_type": "ring",
            "material": "18k gold",
            ...
          }
        }
        """
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'ok'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Blockchain')
            response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
            return response, 200
        
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            event = data.get('event')
            payload = data.get('payload')
            
            logger.info(f"Received Veralix webhook: {event}")
            
            if event == 'jewelry_certified':
                # Crear certificado desde payload
                certificate = JewelryCertificate.from_veralix_payload(payload)
                
                # Registrar en blockchain
                result = cert_manager.register_certificate(certificate)
                
                if result['success']:
                    response = {
                        'success': True,
                        'message': 'Certificate registered in blockchain',
                        'certificate_id': result['certificate_id'],
                        'blockchain': {
                            'hash': result['hash'],
                            'status': result['status'],
                            'pending_block': result['pending_block']
                        },
                        'verification_url': f'https://chain.oriluxtech.com/verify/{result["certificate_id"]}'
                    }
                    
                    logger.info(f"Certificate {result['certificate_id']} registered successfully")
                    return jsonify(response), 200
                else:
                    logger.error(f"Failed to register certificate: {result.get('error')}")
                    return jsonify({
                        'success': False,
                        'error': result.get('error')
                    }), 500
            
            elif event == 'jewelry_updated':
                # Manejar actualización de joyería
                return jsonify({
                    'success': True,
                    'message': 'Update event received'
                }), 200
            
            else:
                return jsonify({
                    'success': False,
                    'error': f'Unknown event type: {event}'
                }), 400
                
        except Exception as e:
            logger.error(f"Error processing webhook: {e}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/certificate/verify/<certificate_id>', methods=['GET'])
    def verify_certificate(certificate_id):
        """
        Verifica un certificado en la blockchain
        
        GET /api/certificate/verify/VRX-JWL-2025-001
        """
        try:
            result = cert_manager.verify_certificate(certificate_id)
            
            if result:
                return jsonify(result), 200
            else:
                return jsonify({
                    'found': False,
                    'error': 'Certificate not found'
                }), 404
                
        except Exception as e:
            logger.error(f"Error verifying certificate: {e}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/certificate/<certificate_id>', methods=['GET'])
    def get_certificate(certificate_id):
        """
        Obtiene los datos completos de un certificado
        
        GET /api/certificate/VRX-JWL-2025-001
        """
        try:
            certificate = cert_manager.get_certificate(certificate_id)
            
            if certificate:
                return jsonify(certificate.to_dict()), 200
            else:
                return jsonify({'error': 'Certificate not found'}), 404
                
        except Exception as e:
            logger.error(f"Error getting certificate: {e}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/certificates/owner/<wallet_address>', methods=['GET'])
    def get_owner_certificates(wallet_address):
        """
        Obtiene todos los certificados de un propietario
        
        GET /api/certificates/owner/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
        """
        try:
            certificates = cert_manager.get_certificates_by_owner(wallet_address)
            return jsonify({
                'owner': wallet_address,
                'count': len(certificates),
                'certificates': certificates
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting owner certificates: {e}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/certificates/jeweler/<jeweler_name>', methods=['GET'])
    def get_jeweler_certificates(jeweler_name):
        """
        Obtiene todos los certificados de una joyería
        
        GET /api/certificates/jeweler/Joyería%20Premium
        """
        try:
            certificates = cert_manager.get_certificates_by_jeweler(jeweler_name)
            return jsonify({
                'jeweler': jeweler_name,
                'count': len(certificates),
                'certificates': certificates
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting jeweler certificates: {e}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/certificates/recent', methods=['GET'])
    def get_recent_certificates():
        """
        Obtiene los certificados más recientes
        
        GET /api/certificates/recent?limit=10
        """
        try:
            limit = request.args.get('limit', 10, type=int)
            certificates = cert_manager.get_recent_certificates(limit)
            
            return jsonify({
                'count': len(certificates),
                'certificates': certificates
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting recent certificates: {e}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/certificates/stats', methods=['GET'])
    def get_certificate_stats():
        """
        Obtiene estadísticas de certificados
        
        GET /api/certificates/stats
        """
        try:
            stats = cert_manager.get_stats()
            return jsonify(stats), 200
            
        except Exception as e:
            logger.error(f"Error getting certificate stats: {e}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/verify/<certificate_id>', methods=['GET'])
    def verify_page(certificate_id):
        """
        Página pública de verificación de certificados
        
        GET /verify/VRX-JWL-2025-001
        """
        try:
            result = cert_manager.verify_certificate(certificate_id)
            
            if result and result.get('found'):
                return render_template(
                    'verify_certificate.html',
                    certificate_id=certificate_id,
                    verification=result
                )
            else:
                return render_template(
                    'certificate_not_found.html',
                    certificate_id=certificate_id
                ), 404
                
        except Exception as e:
            logger.error(f"Error rendering verification page: {e}")
            return render_template('error.html', error=str(e)), 500
    
    @app.route('/api/veralix/health', methods=['GET'])
    def veralix_health():
        """
        Health check para Veralix
        
        GET /api/veralix/health
        """
        return jsonify({
            'status': 'online',
            'blockchain': 'Oriluxchain',
            'version': '2.0.0',
            'features': {
                'jewelry_certificates': True,
                'nft_support': True,
                'verification': True
            },
            'stats': cert_manager.get_stats()
        }), 200
    
    logger.info("Certificate routes initialized")
    return cert_manager
