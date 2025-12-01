import requests
import json
import time
from datetime import datetime

# Configuración
API_URL = "http://127.0.0.1:5001"

def print_header(title):
    print("\n" + "="*60)
    print(f"💎 {title}")
    print("="*60)

def get_all_certificates():
    # Como no tenemos endpoint de 'all', consultamos stats para ver cuántos hay
    # y tratamos de buscar por el owner de prueba si lo supiéramos.
    # Mejor consultamos la cadena completa para encontrar transacciones de 'jewelry_certification'
    try:
        response = requests.get(f"{API_URL}/api/chain")
        if response.status_code == 200:
            chain_data = response.json()
            return chain_data['chain']
        return []
    except Exception as e:
        print(f"Error conectando a API: {e}")
        return []

def visualize_passport():
    print_header("ORILUXCHAIN DIGITAL PASSPORT")
    print("🔍 Analizando Blockchain Local...")
    
    chain = get_all_certificates()
    
    found_certs = []
    
    print(f"\n📦 Bloques minados: {len(chain)}")
    
    for block in chain:
        block_idx = block['index']
        block_hash = block['hash']
        prev_hash = block['previous_hash']
        timestamp = datetime.fromtimestamp(block['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
        
        for tx in block['transactions']:
            # Buscar transacciones con 'data' (nuestro nuevo formato)
            if 'data' in tx and tx['data']:
                data = tx['data']
                tx_type = data.get('type')
                
                if tx_type in ['jewelry_certification', 'jewelry_transfer', 'jewelry_report']:
                    cert_id = data.get('certificate_id')
                    
                    print("\n" + "-"*60)
                    print(f"🔗 BLOQUE #{block_idx} | {timestamp}")
                    print(f"   Hash Bloque: {block_hash[:20]}...")
                    print(f"   Prev Hash:   {prev_hash[:20]}...")
                    print("-" * 60)
                    
                    if tx_type == 'jewelry_certification':
                        print(f"   ✨ EVENTO: CREACIÓN DE CERTIFICADO (GÉNESIS DE ACTIVO)")
                        print(f"   🆔 ID Certificado: {cert_id}")
                        print(f"   💍 Item Hash:      {data.get('item_hash')}")
                        print(f"   👤 Issuer:         {data.get('issuer')}")
                        print(f"   👤 Owner Inicial:  {data.get('owner')}")
                        found_certs.append(cert_id)
                        
                    elif tx_type == 'jewelry_transfer':
                        print(f"   🔄 EVENTO: TRANSFERENCIA DE PROPIEDAD")
                        print(f"   🆔 ID Certificado: {cert_id}")
                        print(f"   📤 De:             {data.get('from')}")
                        print(f"   📥 A:              {data.get('to')}")
                        
                    print(f"   📝 Metadata Hash:  (Verificado en Blockchain)")
                    
    if found_certs:
        print_header("RESUMEN DE ACTIVOS ENCONTRADOS")
        for cert in found_certs:
            print(f"💎 {cert}")
            # Consultar detalles específicos de la API de historial
            try:
                hist_resp = requests.get(f"{API_URL}/api/jewelry/history/{cert}")
                if hist_resp.status_code == 200:
                    hist_data = hist_resp.json()
                    print(f"   📜 Historial de eventos: {len(hist_data.get('history', []))}")
                    # Ver estado actual
                    verify_resp = requests.get(f"{API_URL}/api/jewelry/certificate/{cert}")
            except:
                pass

    else:
        print("\n⚠️ No se encontraron eventos de joyería en la blockchain aún.")
        print("   (Asegúrate de que la transacción se haya minado o agregado al mempool)")

    # Consultar transacciones pendientes
    try:
        pending = requests.get(f"{API_URL}/transactions/pending").json()
        if pending.get('pending_transactions'):
            print_header("TRANSECCIONES EN MEMPOOL (PENDIENTES DE MINAR)")
            for tx in pending['pending_transactions']:
                 if 'data' in tx and tx['data']:
                     print(f"⏳ PENDIENTE: {tx['data'].get('type')} - ID: {tx['data'].get('certificate_id')}")
    except:
        pass

if __name__ == "__main__":
    visualize_passport()
