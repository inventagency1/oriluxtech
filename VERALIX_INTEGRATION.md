# 🌉 ORILUXCHAIN ↔️ VERALIX.IO INTEGRATION

## Integración Completa entre Oriluxchain y Veralix.io

Esta guía explica cómo conectar Oriluxchain con Veralix.io para sincronización bidireccional.

---

## 🎯 Arquitectura de Integración

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  ORILUXCHAIN    │◄───────►│  VERALIX BRIDGE  │◄───────►│  VERALIX.IO     │
│  (localhost)    │         │  (API Gateway)   │         │  (Production)   │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │                            │                            │
    ORX/VRX                    WebSockets                    Cloud DB
    Tokens                     REST API                      Analytics
    Smart Contracts            CORS Enabled                  Dashboard
```

---

## 🚀 Opciones de Integración

### **Opción 1: API Gateway (Recomendada)** ⭐⭐⭐⭐⭐

**Arquitectura**:
- Oriluxchain corre localmente (puerto 5000)
- API Gateway corre en puerto 5001
- Veralix.io se conecta al Gateway
- Sincronización bidireccional

**Ventajas**:
- ✅ Oriluxchain permanece local
- ✅ Control total de datos
- ✅ Sincronización en tiempo real
- ✅ WebSockets para eventos
- ✅ CORS configurado
- ✅ Fácil de implementar

**Implementación**:
```python
# main.py
from veralix_integration import VeralixAPI

# Iniciar Oriluxchain
blockchain = Blockchain(difficulty=3)

# Iniciar API Gateway
veralix_api = VeralixAPI(blockchain, port=5001)
veralix_api.run()
```

---

### **Opción 2: Cloud Deployment** ⭐⭐⭐⭐

**Arquitectura**:
- Desplegar Oriluxchain en servidor cloud
- Exponer API pública
- Veralix.io se conecta directamente
- Base de datos compartida

**Plataformas Recomendadas**:
1. **Railway.app** - Deploy automático
2. **Render.com** - Free tier disponible
3. **Fly.io** - Edge deployment
4. **DigitalOcean** - Droplet con control total
5. **AWS EC2** - Escalable

**Ventajas**:
- ✅ Acceso público 24/7
- ✅ Escalabilidad
- ✅ No requiere localhost
- ✅ SSL/TLS automático

---

### **Opción 3: Hybrid (Local + Cloud)** ⭐⭐⭐⭐⭐

**Arquitectura**:
- Nodo local para desarrollo
- Nodo cloud para producción
- Sincronización entre ambos
- Veralix.io conectado al cloud

**Ventajas**:
- ✅ Mejor de ambos mundos
- ✅ Desarrollo local
- ✅ Producción en cloud
- ✅ Backup automático

---

## 🔧 Configuración Paso a Paso

### **Paso 1: Instalar Dependencias**

```bash
pip install flask-cors flask-socketio python-socketio requests
```

### **Paso 2: Configurar Veralix.io**

```python
from veralix_integration import create_veralix_config

config = create_veralix_config(
    veralix_url="https://veralix.io",
    api_key="tu_api_key_aqui",  # Obtener de Veralix.io
    auto_sync=True,
    sync_interval=10  # segundos
)
```

### **Paso 3: Iniciar API Gateway**

```python
from veralix_integration import VeralixAPI
from blockchain import Blockchain

# Crear blockchain
blockchain = Blockchain(difficulty=3)

# Crear API Gateway
api = VeralixAPI(blockchain, port=5001)

# Iniciar servidor
api.run()
```

### **Paso 4: Conectar con Veralix.io**

```bash
# Desde Veralix.io o Postman
curl -X POST http://localhost:5001/api/veralix/connect \
  -H "Content-Type: application/json" \
  -d '{
    "veralix_url": "https://veralix.io",
    "api_key": "tu_api_key"
  }'
```

### **Paso 5: Habilitar Sincronización**

```bash
curl -X POST http://localhost:5001/api/veralix/sync/enable
```

---

## 📡 API Endpoints

### **Health Check**
```bash
GET /api/veralix/health

Response:
{
  "status": "online",
  "blockchain": "Oriluxchain",
  "version": "1.0.0",
  "veralix_connected": true
}
```

### **Conectar**
```bash
POST /api/veralix/connect
{
  "veralix_url": "https://veralix.io",
  "api_key": "your_key"
}
```

### **Sincronización Manual**
```bash
POST /api/veralix/sync

Response:
{
  "blocks": 150,
  "transactions": 42,
  "contracts": 5,
  "errors": []
}
```

### **Habilitar Auto-Sync**
```bash
POST /api/veralix/sync/enable
```

### **Deshabilitar Auto-Sync**
```bash
POST /api/veralix/sync/disable
```

### **Estado**
```bash
GET /api/veralix/status

Response:
{
  "connected": true,
  "sync_enabled": true,
  "blockchain_info": {
    "blocks": 150,
    "pending_tx": 3,
    "contracts": 5
  }
}
```

### **Webhook (Recibir de Veralix)**
```bash
POST /api/veralix/webhook
{
  "event": "transaction",
  "payload": {...}
}
```

---

## 🔌 WebSocket Events

### **Conectar**
```javascript
const socket = io('http://localhost:5001');

socket.on('connect', () => {
  console.log('Conectado a Oriluxchain');
});
```

### **Suscribirse a Eventos**
```javascript
socket.emit('subscribe', { channel: 'blocks' });

socket.on('new_block', (data) => {
  console.log('Nuevo bloque:', data);
});
```

### **Eventos Disponibles**
- `new_block` - Nuevo bloque minado
- `new_transaction` - Nueva transacción
- `contract_deployed` - Contrato desplegado
- `contract_executed` - Contrato ejecutado

---

## 🌐 Desplegar en Cloud

### **Opción A: Railway.app**

1. **Crear cuenta** en Railway.app
2. **Conectar GitHub** repo
3. **Deploy automático**:
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python main.py --port $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

4. **Variables de entorno**:
```
VERALIX_URL=https://veralix.io
VERALIX_API_KEY=tu_key
PORT=5000
```

---

### **Opción B: Render.com**

1. **Crear cuenta** en Render.com
2. **New Web Service**
3. **Configurar**:
```yaml
# render.yaml
services:
  - type: web
    name: oriluxchain
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python main.py --port $PORT
    envVars:
      - key: VERALIX_URL
        value: https://veralix.io
      - key: VERALIX_API_KEY
        sync: false
```

---

### **Opción C: Docker**

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000 5001

CMD ["python", "main.py", "--port", "5000"]
```

```bash
# Build y Run
docker build -t oriluxchain .
docker run -p 5000:5000 -p 5001:5001 oriluxchain
```

---

## 🔐 Seguridad

### **API Key**
```python
from veralix_integration import generate_api_key

api_key = generate_api_key()
print(f"Tu API Key: {api_key}")
```

### **CORS Configuration**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://veralix.io",
            "https://*.veralix.io"
        ]
    }
})
```

### **Rate Limiting**
```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    default_limits=["100 per hour"]
)
```

---

## 📊 Monitoreo

### **Logs**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('veralix_bridge.log'),
        logging.StreamHandler()
    ]
)
```

### **Métricas**
```python
metrics = {
    'blocks_synced': 0,
    'transactions_synced': 0,
    'contracts_synced': 0,
    'errors': 0,
    'uptime': 0
}
```

---

## 🎯 Flujo de Datos

### **Oriluxchain → Veralix.io**

```
1. Nuevo bloque minado
   ↓
2. Bridge detecta evento
   ↓
3. Serializa datos
   ↓
4. POST a Veralix.io API
   ↓
5. Veralix.io almacena
   ↓
6. Confirma recepción
```

### **Veralix.io → Oriluxchain**

```
1. Evento en Veralix.io
   ↓
2. Webhook a Bridge
   ↓
3. Bridge valida datos
   ↓
4. Procesa en Oriluxchain
   ↓
5. Actualiza estado
   ↓
6. Confirma procesamiento
```

---

## 🚀 Quick Start

### **Desarrollo Local**

```bash
# Terminal 1: Oriluxchain
python main.py --port 5000

# Terminal 2: Veralix Bridge
python veralix_bridge.py --port 5001

# Terminal 3: Conectar
curl -X POST http://localhost:5001/api/veralix/connect \
  -H "Content-Type: application/json" \
  -d '{"veralix_url": "https://veralix.io", "api_key": "key"}'
```

### **Producción**

```bash
# Deploy a Railway/Render
git push origin main

# Configurar variables
VERALIX_URL=https://veralix.io
VERALIX_API_KEY=production_key

# Verificar
curl https://tu-app.railway.app/api/veralix/health
```

---

## 🔄 Sincronización

### **Automática**
- Cada 10 segundos
- Solo cambios nuevos
- Retry en caso de error
- Log de todas las operaciones

### **Manual**
```bash
curl -X POST http://localhost:5001/api/veralix/sync
```

### **Selectiva**
```python
# Solo bloques
bridge.sync_blocks()

# Solo transacciones
bridge.sync_transactions()

# Solo contratos
bridge.sync_contracts()
```

---

## 📱 Integración con Frontend

### **Desde Veralix.io**

```javascript
// Conectar a Oriluxchain
const orilux = new OriluxchainSDK({
  rpcUrl: 'https://tu-nodo.railway.app',
  apiKey: 'tu_api_key'
});

// Obtener blockchain info
const info = await orilux.getInfo();

// Crear transacción
const tx = await orilux.createTransaction({
  from: wallet.address,
  to: recipient,
  amount: 100,
  token: 'ORX'
});

// Desplegar contrato
const contract = await orilux.deployContract({
  template: 'erc20',
  params: {
    name: 'Mi Token',
    symbol: 'MTK',
    supply: 1000000
  }
});
```

---

## 🎯 Próximos Pasos

1. **Obtener API Key** de Veralix.io
2. **Configurar** integración
3. **Desplegar** nodo público
4. **Conectar** con Veralix.io
5. **Sincronizar** datos
6. **Monitorear** estado

---

## 📞 Soporte

- **Documentación**: Este archivo
- **Issues**: GitHub Issues
- **Email**: support@oriluxchain.io
- **Discord**: discord.gg/oriluxchain

---

**¡Oriluxchain + Veralix.io = Blockchain del Futuro!** 🚀
