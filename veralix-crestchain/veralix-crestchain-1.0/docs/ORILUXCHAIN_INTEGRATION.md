# Integración con Oriluxchain

## 🔗 Endpoint de Oriluxchain

- **URL:** `https://chain.oriluxtech.com/api/veralix/webhook`
- **Método:** POST
- **Headers:** 
  - `Content-Type: application/json`
  - `X-Blockchain: Oriluxchain`

## 📊 Flujo de Certificación

1. Usuario genera certificado NFT en Veralix
2. Veralix registra en Oriluxchain (background, no bloquea la respuesta)
3. Oriluxchain responde con hash y estado `"pending_mining"`
4. Certificado guardado en DB con `orilux_blockchain_status: 'pending'`
5. Oriluxchain mina el bloque
6. Oriluxchain envía webhook a Veralix (OPCIONAL)
7. Veralix actualiza estado a `'verified'`
8. Usuario ve badge "✅ Verificado en Oriluxchain"

## 🗄️ Campos en Base de Datos

### Tabla `nft_certificates`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `orilux_blockchain_hash` | TEXT | Hash del certificado en Oriluxchain |
| `orilux_blockchain_status` | TEXT | Estado: `'pending'` \| `'verified'` |
| `orilux_verification_url` | TEXT | URL pública de verificación |
| `orilux_block_number` | INTEGER | Número de bloque minado |
| `orilux_tx_hash` | TEXT | Hash de transacción |
| `orilux_timestamp` | BIGINT | Timestamp de registro (Unix) |

## 📤 Payload Enviado a Oriluxchain

```json
{
  "event": "jewelry_certified",
  "payload": {
    "certificate_id": "VRX-001",
    "jewelry_type": "anillo",
    "material": "oro 18k",
    "weight": "5.2g",
    "stones": [],
    "jeweler": {
      "name": "Joyería Premium",
      "location": "Bogotá, Colombia",
      "license": "VRX-CERTIFIED"
    },
    "owner": {
      "wallet_address": "0x0000...",
      "name": "Usuario Veralix"
    },
    "nft": {
      "token_id": "12345",
      "contract_address": "0xabc...",
      "metadata_uri": "ipfs://Qm..."
    },
    "images": [
      "https://ipfs.io/ipfs/..."
    ],
    "metadata": {
      "appraisal_value": "5000000 COP",
      "certification_date": "2025-11-21"
    }
  }
}
```

## 📥 Respuesta de Oriluxchain

```json
{
  "success": true,
  "message": "Certificate registered in blockchain",
  "certificate_id": "VRX-001",
  "blockchain": {
    "hash": "0x123abc...",
    "status": "pending_mining",
    "pending_block": 1235
  },
  "verification_url": "https://chain.oriluxtech.com/verify/VRX-001"
}
```

## 🔄 Webhook de Oriluxchain → Veralix (OPCIONAL)

Cuando Oriluxchain mina el bloque, puede enviar un webhook a:

- **URL:** `https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/oriluxchain-webhook`
- **Método:** POST

**Payload:**
```json
{
  "event": "certificate_verified",
  "certificate_id": "VRX-001",
  "blockchain": {
    "hash": "0x123abc...",
    "status": "verified",
    "block_number": 1235,
    "tx_hash": "0x456def...",
    "timestamp": 1732145678
  }
}
```

Este webhook actualizará automáticamente el estado del certificado de `'pending'` → `'verified'` y enviará una notificación al usuario.

## 🚨 Manejo de Errores

### ✅ Ventaja Principal: No Bloqueante

El registro en Oriluxchain se ejecuta en **background** usando `EdgeRuntime.waitUntil()`:

- ✅ **Si Oriluxchain responde OK:** Certificado se actualiza con datos de blockchain
- ⚠️ **Si Oriluxchain no responde / falla:** Certificado se crea igual en Veralix
- 📝 **Todos los errores quedan registrados** en `audit_logs` con tipo `'oriluxchain_registration_failed'`

### Logs de Auditoría

**Éxito:**
```json
{
  "action": "oriluxchain_registration",
  "resource_type": "nft_certificate",
  "resource_id": "VRX-001",
  "details": {
    "blockchain_hash": "0x123abc...",
    "verification_url": "https://chain.oriluxtech.com/verify/VRX-001",
    "status": "pending"
  }
}
```

**Error:**
```json
{
  "action": "oriluxchain_registration_failed",
  "resource_type": "nft_certificate",
  "resource_id": "VRX-001",
  "details": {
    "error": "Oriluxchain API error: 500",
    "timestamp": "2025-11-21T10:30:00Z"
  }
}
```

## 🔍 Verificación Pública

Los certificados verificados son accesibles públicamente en:

```
https://chain.oriluxtech.com/verify/{certificate_id}
```

**Ejemplo:** https://chain.oriluxtech.com/verify/VRX-001

Esta URL permite a cualquier persona verificar la autenticidad del certificado sin necesidad de estar autenticado en Veralix.

## 🎨 Estados en la UI

### Badge en el Hero

| Estado | Badge | Color | Animación |
|--------|-------|-------|-----------|
| `'verified'` | ✅ Verificado en Oriluxchain | Verde | - |
| `'pending'` | ⏳ Minando en Blockchain... | Ámbar | pulse |
| `null` | Certificado NFT Veralix | Dorado | - |

### Card de Verificación Blockchain

- **Estado "verified":** Fondo verde, check verde, mensaje "Certificado inmutable en Oriluxchain"
- **Estado "pending":** Fondo ámbar, reloj con pulse, mensaje "El bloque está siendo procesado"
- **Sin registro:** Fondo gris, alerta, mensaje "No registrado en blockchain"

## 📈 Métricas y Futuras Mejoras

### Implementadas

✅ Registro automático en Oriluxchain al generar certificado  
✅ Fallback robusto (no bloquea certificado si falla blockchain)  
✅ Logs de auditoría completos  
✅ UI dinámica con estados  
✅ Webhook receiver (opcional)  
✅ Notificaciones al usuario cuando se verifica  

### Futuras

⏳ **Panel de Admin para Reintentar Oriluxchain:**
- Ver certificados con `orilux_blockchain_status = NULL`
- Botón "Reintentar registro en blockchain"

⏳ **Campos avanzados:**
- `stones` (piedras preciosas) en `jewelry_items`
- `jeweler_license` en `jewelry_items`
- `wallet_address` en `profiles`

⏳ **Dashboard de Métricas:**
- % de certificados verificados
- Tiempo promedio de minería
- Tasa de éxito de Oriluxchain

## 🛠️ Debugging

### Ver logs del Edge Function

```bash
# Logs de generate-nft-certificate
supabase functions logs generate-nft-certificate --follow
```

### Ver logs del webhook receiver

```bash
# Logs de oriluxchain-webhook
supabase functions logs oriluxchain-webhook --follow
```

### Simular webhook de Oriluxchain

```bash
curl -X POST https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/oriluxchain-webhook \
  -H "Content-Type: application/json" \
  -H "X-Blockchain: Oriluxchain" \
  -d '{
    "event": "certificate_verified",
    "certificate_id": "VRX-001",
    "blockchain": {
      "hash": "0x123abc...",
      "status": "verified",
      "block_number": 1235,
      "tx_hash": "0x456def...",
      "timestamp": 1732145678
    }
  }'
```

## 📝 Notas Importantes

- El endpoint de Oriluxchain **NO requiere autenticación** (por ahora)
- Si el webhook falla, el certificado ya está creado en Veralix
- El estado inicial siempre es `'pending'`, cambia a `'verified'` cuando se mina
- La verificación pública está en: `https://chain.oriluxtech.com/verify/{certificate_id}`
- Todos los certificados quedan **inmutables** en blockchain Oriluxchain

## 🔗 Links Relacionados

- [Oriluxchain Explorer](https://chain.oriluxtech.com)
- [Documentación de Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Guía de Seguridad de Veralix](./SECURITY.md)
