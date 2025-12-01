# 🎯 SIGUIENTE PASO: INTEGRACIÓN ORILUXCHAIN ↔️ VERALIX

## 🔐 CREDENCIALES DE ADMIN

```
URL: http://localhost:5000
Usuario: superadm
Contraseña: OriluxSecure2025!@#$%^&*()_+
```

---

## ✅ PASO 1: Reiniciar Oriluxchain (IMPORTANTE)

Acabamos de actualizar la configuración de CORS para permitir conexiones desde Veralix. 
**Necesitas reiniciar Oriluxchain para que tome los cambios:**

### Opción A: Desde la terminal actual
1. Ve a la terminal donde está corriendo Oriluxchain
2. Presiona `CTRL+C` para detenerlo
3. Ejecuta de nuevo:
   ```bash
   python start_with_veralix.py
   ```

### Opción B: Desde una nueva terminal
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain
python start_with_veralix.py
```

---

## ✅ PASO 2: Acceder al Dashboard de Oriluxchain

1. Abre tu navegador en: **http://localhost:5000**
2. Inicia sesión con:
   - **Usuario**: `superadm`
   - **Contraseña**: `OriluxSecure2025!@#$%^&*()_+`
3. Explora el dashboard:
   - Ver blockchain
   - Crear transacciones
   - Gestionar tokens (ORX/VRX)
   - Crear certificados de joyería

---

## ✅ PASO 3: Conectar desde Veralix

### Opción A: Integración desde el Frontend de Veralix

En tu código de Veralix (localhost:8080), agrega la configuración de Oriluxchain:

```javascript
// src/config/blockchain.js o similar
export const oriluxchainConfig = {
  apiUrl: 'http://localhost:5000/api',
  rpcUrl: 'http://localhost:5000',
  networkId: 'orilux-mainnet',
  tokens: {
    ORX: {
      name: 'Orilux Token',
      symbol: 'ORX',
      decimals: 18
    },
    VRX: {
      name: 'Veralix Token', 
      symbol: 'VRX',
      decimals: 18
    }
  }
};

// Ejemplo de uso
async function getBlockchainInfo() {
  try {
    const response = await fetch(`${oriluxchainConfig.apiUrl}/blockchain/info`);
    const data = await response.json();
    console.log('Blockchain Info:', data);
    return data;
  } catch (error) {
    console.error('Error conectando a Oriluxchain:', error);
  }
}

// Ejemplo: Crear certificado de joyería desde Veralix
async function createJewelryCertificate(jewelryData) {
  try {
    const response = await fetch(`${oriluxchainConfig.apiUrl}/certificates/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_type: jewelryData.type,
        description: jewelryData.description,
        weight: jewelryData.weight,
        purity: jewelryData.purity,
        origin: jewelryData.origin,
        owner: jewelryData.owner
      })
    });
    
    const certificate = await response.json();
    console.log('Certificado creado:', certificate);
    return certificate;
  } catch (error) {
    console.error('Error creando certificado:', error);
  }
}
```

### Opción B: Usar el SDK de Oriluxchain

Si tienes el SDK de Oriluxchain en tu proyecto:

```javascript
import { OriluxchainSDK } from './orilux-sdk.js';

const orilux = new OriluxchainSDK({
  rpcUrl: 'http://localhost:5000',
  networkId: 'orilux-mainnet'
});

// Obtener información
const info = await orilux.getBlockchainInfo();

// Crear transacción
const tx = await orilux.createTransaction({
  from: walletAddress,
  to: recipientAddress,
  amount: 100,
  token: 'ORX'
});
```

---

## ✅ PASO 4: Probar la Integración

### Prueba 1: Verificar conexión desde Veralix

En la consola del navegador de Veralix (F12), ejecuta:

```javascript
// Probar conexión
fetch('http://localhost:5000/api/blockchain/info')
  .then(r => r.json())
  .then(data => console.log('✅ Oriluxchain conectado:', data))
  .catch(err => console.error('❌ Error:', err));
```

### Prueba 2: Crear un certificado de prueba

```javascript
fetch('http://localhost:5000/api/certificates/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    item_type: 'ring',
    description: 'Anillo de oro 18k con diamante',
    weight: 5.2,
    purity: '18k',
    origin: 'Colombia',
    owner: 'Test Owner'
  })
})
.then(r => r.json())
.then(cert => console.log('✅ Certificado creado:', cert))
.catch(err => console.error('❌ Error:', err));
```

---

## 📡 ENDPOINTS PRINCIPALES DE ORILUXCHAIN

### Blockchain
- `GET /api/blockchain/info` - Información general
- `GET /api/chain` - Ver toda la cadena
- `POST /api/mine` - Minar nuevo bloque

### Transacciones
- `POST /api/transactions/new` - Crear transacción
- `GET /api/transactions/pending` - Ver transacciones pendientes

### Tokens (ORX/VRX)
- `GET /api/tokens/balance/<address>` - Ver balance
- `POST /api/tokens/transfer` - Transferir tokens
- `GET /api/tokens/info` - Información de tokens

### Certificados de Joyería
- `POST /api/certificates/create` - Crear certificado
- `GET /api/certificates/<cert_id>` - Obtener certificado
- `GET /api/certificates/verify/<cert_id>` - Verificar autenticidad
- `GET /api/certificates/list` - Listar todos los certificados

### Smart Contracts
- `POST /api/contracts/deploy` - Desplegar contrato
- `POST /api/contracts/execute` - Ejecutar contrato
- `GET /api/contracts/list` - Listar contratos

---

## 🔑 API KEYS (Si necesitas autenticación)

Para requests autenticados, usa uno de estos API keys en el header:

```javascript
headers: {
  'Authorization': 'Bearer orilux_api_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
  'Content-Type': 'application/json'
}
```

API Keys disponibles (desde .env):
- `orilux_api_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- `orilux_api_b9c8d7e6f5g4h3i2j1k0l9m8n7o6p5q4r3s2t1u0v9w8x7y6z5`

---

## 🎨 INTEGRACIÓN EN LA UI DE VERALIX

### Ejemplo: Mostrar información de blockchain en Veralix

```typescript
// En un componente de React/Vue/Svelte
import { useEffect, useState } from 'react';

function BlockchainStatus() {
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/blockchain/info')
      .then(r => r.json())
      .then(data => setBlockchainInfo(data))
      .catch(err => console.error(err));
  }, []);
  
  return (
    <div className="blockchain-status">
      <h3>Oriluxchain Status</h3>
      {blockchainInfo && (
        <div>
          <p>Bloques: {blockchainInfo.blocks}</p>
          <p>Transacciones: {blockchainInfo.transactions}</p>
          <p>Dificultad: {blockchainInfo.difficulty}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 CASOS DE USO PRINCIPALES

### 1. Certificación de Joyería
- Crear certificados digitales en blockchain
- Verificar autenticidad de joyas
- Historial inmutable de propiedad

### 2. Transacciones de Tokens
- Transferir ORX/VRX entre usuarios
- Sistema de pagos integrado
- Staking y rewards

### 3. Smart Contracts
- Contratos de compra/venta
- Escrow automático
- NFTs de joyería

---

## 📊 MONITOREO

### Ver logs en tiempo real:
La terminal donde corre Oriluxchain muestra todos los eventos

### Verificar estado:
```bash
# Script de prueba
python test_veralix_connection.py
```

---

## 🆘 TROUBLESHOOTING

### Error de CORS
- ✅ **SOLUCIONADO**: Ya agregamos localhost:8080 a ALLOWED_ORIGINS
- Reinicia Oriluxchain para aplicar cambios

### No puedo conectar desde Veralix
1. Verifica que Oriluxchain esté corriendo: http://localhost:5000
2. Verifica que Veralix esté corriendo: http://localhost:8080
3. Revisa la consola del navegador (F12) para errores
4. Asegúrate de que CORS esté configurado correctamente

### Error 401 (No autorizado)
- Agrega el API key en el header de tus requests
- O desactiva la autenticación temporalmente para pruebas

---

## ✨ PRÓXIMOS PASOS RECOMENDADOS

1. **Reiniciar Oriluxchain** con la nueva configuración de CORS
2. **Acceder al dashboard** con las credenciales de admin
3. **Crear un certificado de prueba** desde el dashboard
4. **Implementar la integración** en el frontend de Veralix
5. **Probar la conexión** desde la consola del navegador
6. **Desarrollar las funcionalidades** específicas que necesites

---

## 📞 RESUMEN RÁPIDO

```
✅ Oriluxchain corriendo en: http://localhost:5000
✅ Veralix corriendo en: http://localhost:8080
✅ CORS configurado para permitir conexiones entre ambos
✅ Credenciales: superadm / OriluxSecure2025!@#$%^&*()_+

🎯 ACCIÓN INMEDIATA:
   1. Reiniciar Oriluxchain (CTRL+C y volver a ejecutar)
   2. Login en http://localhost:5000
   3. Empezar a integrar desde Veralix
```

---

**¡Todo listo para la integración completa! 🚀**
