# Oriluxchain

Una blockchain personalizada implementada desde cero en Python.

## Características

- **Proof of Work (PoW)**: Sistema de minería con dificultad ajustable
- **Transacciones**: Sistema completo de transferencias entre wallets
- **Validación de cadena**: Verificación de integridad de bloques
- **Red P2P**: Comunicación entre nodos descentralizados
- **API REST**: Interfaz para interactuar con la blockchain
- **Wallets**: Generación de claves públicas/privadas con criptografía

## Instalación

```bash
pip install -r requirements.txt
```

## Uso

### Iniciar un nodo

```bash
python main.py --port 5000
```

### Minar un bloque

```bash
curl -X POST http://localhost:5000/mine
```

### Crear una transacción

```bash
curl -X POST http://localhost:5000/transactions/new -H "Content-Type: application/json" -d '{
  "sender": "address1",
  "recipient": "address2",
  "amount": 10
}'
```

### Ver la cadena completa

```bash
curl http://localhost:5000/chain
```

## Arquitectura

- `block.py`: Clase Block con hash SHA-256 y proof of work
- `blockchain.py`: Clase Blockchain con validación y consenso
- `transaction.py`: Sistema de transacciones y firmas digitales
- `wallet.py`: Generación y gestión de wallets
- `node.py`: Nodo P2P para comunicación descentralizada
- `api.py`: API REST con Flask
- `main.py`: Punto de entrada de la aplicación

## Tecnologías

- Python 3.8+
- Flask (API REST)
- Cryptography (Firmas digitales)
- Requests (Comunicación P2P)
- SHA-256 (Hashing)

## Licencia

MIT
