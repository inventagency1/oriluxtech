# 🔗 Guía de Integración Veralix ↔ Oriluxchain

## 📋 RESUMEN

Esta guía explica cómo integrar Veralix.io con Oriluxchain para registrar certificados de joyería en blockchain.

---

## 🎯 ENDPOINTS DISPONIBLES

### 1. **Webhook Principal** (Para Veralix)

```
POST https://chain.oriluxtech.com/api/veralix/webhook
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "X-Blockchain": "Oriluxchain"
}
```

**Body:**
```json
{
  "event": "jewelry_certified",
  "payload": {
    "certificate_id": "VRX-JWL-2025-001",
    "jewelry_type": "ring",
    "material": "18k gold",
    "weight": "5.2g",
    "stones": [
      {
        "type": "diamond",
        "carats": 0.5,
        "clarity": "VS1",
        "color": "G"
      }
    ],
    "jeweler": {
      "name": "Joyería Premium",
      "location": "Bogotá, Colombia",
      "license": "JWL-12345"
    },
    "owner": {
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "name": "María González"
    },
    "nft": {
      "token_id": "12345",
      "contract_address": "0xabc...",
      "metadata_uri": "ipfs://Qm..."
    },
    "images": [
      "https://veralix.io/jewelry/img1.jpg"
    ],
    "metadata": {
      "appraisal_value": "5000 USD",
      "certification_date": "2025-11-20"
    }
  }
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Certificate registered in blockchain",
  "certificate_id": "VRX-JWL-2025-001",
  "blockchain": {
    "hash": "0x123abc...",
    "status": "pending_mining",
    "pending_block": 1235
  },
  "verification_url": "https://chain.oriluxtech.com/verify/VRX-JWL-2025-001"
}
```

---

### 2. **Verificar Certificado** (Público)

```
GET https://chain.oriluxtech.com/api/certificate/verify/{certificate_id}
```

**Ejemplo:**
```
GET https://chain.oriluxtech.com/api/certificate/verify/VRX-JWL-2025-001
```

**Respuesta:**
```json
{
  "found": true,
  "verified": true,
  "certificate": {
    "certificate_id": "VRX-JWL-2025-001",
    "jewelry_type": "ring",
    "material": "18k gold",
    ...
  },
  "block_number": 1234,
  "block_hash": "0xabc123...",
  "timestamp": 1700524500
}
```

---

### 3. **Obtener Certificado** (Datos Completos)

```
GET https://chain.oriluxtech.com/api/certificate/{certificate_id}
```

---

### 4. **Certificados por Propietario**

```
GET https://chain.oriluxtech.com/api/certificates/owner/{wallet_address}
```

---

### 5. **Certificados por Joyería**

```
GET https://chain.oriluxtech.com/api/certificates/jeweler/{jeweler_name}
```

---

### 6. **Certificados Recientes**

```
GET https://chain.oriluxtech.com/api/certificates/recent?limit=10
```

---

### 7. **Estadísticas**

```
GET https://chain.oriluxtech.com/api/certificates/stats
```

**Respuesta:**
```json
{
  "total_certificates": 150,
  "verified_certificates": 145,
  "pending_certificates": 5,
  "by_jewelry_type": {
    "ring": 80,
    "necklace": 40,
    "bracelet": 20,
    "earrings": 10
  }
}
```

---

### 8. **Health Check**

```
GET https://chain.oriluxtech.com/api/veralix/health
```

---

## 🔄 FLUJO DE INTEGRACIÓN

### Paso 1: Veralix Emite Certificado
```javascript
// En Veralix cuando se certifica una joya
async function certifyJewelry(jewelryData) {
  // ... crear certificado en Veralix ...
  
  // Registrar en Oriluxchain
  const response = await fetch('https://chain.oriluxtech.com/api/veralix/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Blockchain': 'Oriluxchain'
    },
    body: JSON.stringify({
      event: 'jewelry_certified',
      payload: {
        certificate_id: certificate.id,
        jewelry_type: jewelryData.type,
        material: jewelryData.material,
        weight: jewelryData.weight,
        // ... más datos ...
      }
    })
  });
  
  const blockchainData = await response.json();
  
  // Guardar datos de blockchain en Veralix
  await updateCertificate(certificate.id, {
    blockchain_hash: blockchainData.blockchain.hash,
    blockchain_status: blockchainData.blockchain.status,
    verification_url: blockchainData.verification_url
  });
}
```

### Paso 2: Oriluxchain Registra en Blockchain
- Recibe webhook
- Valida datos
- Crea transacción especial tipo "CERTIFICATE"
- Añade a pending_transactions
- Responde con hash y URL de verificación

### Paso 3: Minería del Bloque
- Minero incluye certificado en próximo bloque
- Certificado queda INMUTABLE en blockchain
- Estado cambia de "pending_mining" a "verified"

### Paso 4: Verificación Pública
- Cualquiera puede verificar en: `https://chain.oriluxtech.com/verify/{certificate_id}`
- Muestra datos completos del certificado
- Muestra prueba blockchain (bloque, hash, timestamp)

---

## 💎 CAMPOS DEL CERTIFICADO

### Requeridos:
- `certificate_id` - ID único del certificado
- `jewelry_type` - Tipo de joyería (ring, necklace, bracelet, earrings, other)
- `material` - Material (18k gold, 14k gold, platinum, silver, etc)
- `weight` - Peso con unidad (5.2g, 10.5g, etc)
- `jeweler.name` - Nombre de la joyería

### Opcionales:
- `stones` - Array de piedras preciosas
- `jeweler.location` - Ubicación de la joyería
- `jeweler.license` - Licencia de la joyería
- `owner.wallet_address` - Wallet del propietario
- `owner.name` - Nombre del propietario
- `nft.token_id` - ID del NFT
- `nft.contract_address` - Dirección del contrato NFT
- `nft.metadata_uri` - URI de metadata (IPFS)
- `images` - Array de URLs de imágenes
- `metadata` - Objeto con metadata adicional

---

## 🧪 TESTING

### Test 1: Enviar Certificado de Prueba

```bash
curl -X POST https://chain.oriluxtech.com/api/veralix/webhook \
  -H "Content-Type: application/json" \
  -H "X-Blockchain: Oriluxchain" \
  -d '{
    "event": "jewelry_certified",
    "payload": {
      "certificate_id": "TEST-001",
      "jewelry_type": "ring",
      "material": "18k gold",
      "weight": "5.0g",
      "jeweler": {
        "name": "Test Jewelry"
      },
      "owner": {
        "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      }
    }
  }'
```

### Test 2: Verificar Certificado

```bash
curl https://chain.oriluxtech.com/api/certificate/verify/TEST-001
```

### Test 3: Ver Página de Verificación

```
https://chain.oriluxtech.com/verify/TEST-001
```

---

## 🔐 SEGURIDAD

### Actual (v1):
- Sin autenticación (endpoints públicos)
- Validación de datos en servidor
- CORS configurado para Veralix.io

### Futuro (v2):
- API Key requerida para webhooks
- Firma digital de payloads
- Rate limiting
- Whitelist de IPs

---

## 📊 MONITOREO

### Logs a Revisar:
```bash
# En Portainer, buscar en logs:
"Certificate {id} registered successfully"
"Received Veralix webhook: jewelry_certified"
"Error processing webhook: ..."
```

### Métricas:
- Total de certificados registrados
- Certificados verificados vs pendientes
- Tiempo promedio de minería
- Errores en webhooks

---

## 🚀 PRÓXIMOS PASOS

1. **Implementar en Veralix:**
   - Agregar webhook POST cuando se emite certificado
   - Guardar respuesta de blockchain
   - Mostrar badge "Verificado en Blockchain"
   - Link a página de verificación

2. **Testing:**
   - Probar con certificados reales
   - Verificar tiempos de respuesta
   - Validar datos en blockchain

3. **Mejoras:**
   - Agregar autenticación con API Key
   - Implementar retry logic
   - Notificaciones cuando se mina el bloque
   - Dashboard de certificados en Oriluxchain

---

## 📞 SOPORTE

**Blockchain:** https://chain.oriluxtech.com
**Documentación:** Este archivo
**Health Check:** https://chain.oriluxtech.com/api/veralix/health

---

**Versión:** 1.0.0
**Fecha:** 2025-11-20
**Estado:** ✅ Listo para Integración
