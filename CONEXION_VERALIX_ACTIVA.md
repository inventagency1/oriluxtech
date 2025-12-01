# 🎉 ORILUXCHAIN + VERALIX - CONEXIÓN ACTIVA

## ✅ Estado Actual

### Oriluxchain
- **Estado**: ✅ CORRIENDO
- **URL**: http://localhost:5000
- **Puerto**: 5000
- **Proceso**: Activo (Background ID: 41)
- **Dashboard**: http://localhost:5000 (Login disponible)

### Veralix
- **Estado**: ✅ CORRIENDO  
- **URL**: http://localhost:8080
- **Ubicación**: `C:\Users\Sebastian\Desktop\veralix.io\Blockfactory perras\veralix-certify-your-sparkle-integracion-crestchain`

---

## 🔗 Configuración de Integración

### Variables de Entorno (.env)
```env
# Oriluxchain Configuration
PORT=5000
BRIDGE_PORT=5001
DIFFICULTY=3

# Veralix Integration
VERALIX_URL=http://localhost:8080
VERALIX_API_KEY=your_api_key_here
```

---

## 🚀 Cómo Conectar Ambos Sistemas

### Opción 1: Desde Veralix (Frontend)

En el frontend de Veralix (localhost:8080), puedes conectarte a Oriluxchain usando:

```javascript
// Configurar conexión a Oriluxchain
const oriluxchainConfig = {
  rpcUrl: 'http://localhost:5000',
  apiEndpoint: 'http://localhost:5000/api',
  networkId: 'orilux-mainnet'
};

// Ejemplo de llamada API
fetch('http://localhost:5000/api/blockchain/info')
  .then(response => response.json())
  .then(data => console.log('Blockchain Info:', data));
```

### Opción 2: Usar el Bridge API (Puerto 5001)

Si necesitas un bridge dedicado, puedes iniciar el API Gateway:

```bash
# En una nueva terminal
cd C:\Users\Sebastian\Desktop\Oriluxchain
python -c "from veralix_integration import VeralixAPI; from blockchain import Blockchain; bc = Blockchain(difficulty=3); api = VeralixAPI(bc, port=5001); api.run()"
```

Luego conectar desde Veralix:

```bash
curl -X POST http://localhost:5001/api/veralix/connect \
  -H "Content-Type: application/json" \
  -d '{
    "veralix_url": "http://localhost:8080",
    "api_key": "tu_api_key"
  }'
```

---

## 📡 Endpoints Disponibles

### Oriluxchain API (localhost:5000)

#### Autenticación
- `POST /login` - Login de usuario
- `POST /register` - Registro de usuario
- `GET /logout` - Cerrar sesión

#### Blockchain
- `GET /api/blockchain/info` - Información de la blockchain
- `GET /api/chain` - Obtener toda la cadena
- `POST /api/transactions/new` - Crear nueva transacción
- `POST /api/mine` - Minar nuevo bloque

#### Tokens (ORX/VRX)
- `GET /api/tokens/balance/<address>` - Balance de tokens
- `POST /api/tokens/transfer` - Transferir tokens
- `GET /api/tokens/info` - Información de tokens

#### Smart Contracts
- `POST /api/contracts/deploy` - Desplegar contrato
- `POST /api/contracts/execute` - Ejecutar contrato
- `GET /api/contracts/list` - Listar contratos

#### Certificados de Joyería
- `POST /api/certificates/create` - Crear certificado
- `GET /api/certificates/<cert_id>` - Obtener certificado
- `GET /api/certificates/verify/<cert_id>` - Verificar certificado

---

## 🔐 Credenciales de Acceso

### Oriluxchain Dashboard
- **Usuario**: superadm
- **Contraseña**: Ver archivo `.env` → `SUPERADMIN_PASSWORD`
- **URL**: http://localhost:5000

---

## 🧪 Pruebas de Conexión

### Verificar que ambos sistemas estén corriendo:

```bash
# Ejecutar script de prueba
python test_veralix_connection.py
```

### Pruebas manuales:

```bash
# Verificar Oriluxchain
curl http://localhost:5000/

# Verificar Veralix
curl http://localhost:8080/

# Verificar API de Oriluxchain
curl http://localhost:5000/api/blockchain/info
```

---

## 🎯 Próximos Pasos para Integración Completa

### 1. Configurar CORS en Veralix
Asegúrate de que Veralix permita requests desde Oriluxchain:

```javascript
// En la configuración de Veralix
const corsOptions = {
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true
};
```

### 2. Crear API Key
Genera una API key para autenticación segura:

```python
# En Oriluxchain
python -c "from veralix_integration import generate_api_key; print(generate_api_key())"
```

### 3. Implementar Sincronización
Configura la sincronización automática de datos:

```python
# Ejemplo de sincronización
from veralix_integration import VeralixConnector, VeralixBridge

connector = VeralixConnector('http://localhost:8080', api_key='tu_key')
bridge = VeralixBridge(blockchain, connector)
bridge.enable_sync()  # Sincronización cada 10 segundos
```

### 4. Webhooks (Opcional)
Configura webhooks para eventos en tiempo real:

```javascript
// En Veralix, configurar webhook
const webhookUrl = 'http://localhost:5000/api/veralix/webhook';

// Enviar eventos a Oriluxchain
fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'transaction',
    payload: { /* datos del evento */ }
  })
});
```

---

## 📊 Monitoreo

### Ver logs de Oriluxchain:
Los logs se muestran en la terminal donde ejecutaste `start_with_veralix.py`

### Verificar estado:
```bash
# Ver procesos activos
python -c "import requests; print(requests.get('http://localhost:5000/').status_code)"
python -c "import requests; print(requests.get('http://localhost:8080/').status_code)"
```

---

## 🛠️ Comandos Útiles

### Detener Oriluxchain:
Presiona `CTRL+C` en la terminal donde está corriendo

### Reiniciar Oriluxchain:
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain
python start_with_veralix.py
```

### Ver estado de la blockchain:
```bash
python -c "import requests; import json; r = requests.get('http://localhost:5000/api/blockchain/info'); print(json.dumps(r.json(), indent=2))"
```

---

## 📞 Soporte

Si tienes problemas con la integración:

1. Verifica que ambos servicios estén corriendo
2. Revisa los logs en las terminales
3. Verifica la configuración de CORS
4. Asegúrate de que los puertos 5000 y 8080 estén disponibles

---

## 🎉 ¡Listo!

Ambos sistemas están corriendo y listos para integrarse. Ahora puedes:

1. **Acceder al dashboard de Oriluxchain**: http://localhost:5000
2. **Acceder a Veralix**: http://localhost:8080
3. **Configurar la integración** desde el frontend de Veralix
4. **Empezar a crear transacciones** y certificados

---

**Fecha de configuración**: 24 de noviembre, 2025  
**Configurado por**: Cascade AI Assistant
