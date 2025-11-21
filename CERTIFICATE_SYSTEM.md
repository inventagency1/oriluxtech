# 🎓 Sistema de Certificados Veralix ↔ Oriluxchain

## 📋 FLUJO COMPLETO

### 1. Veralix Emite Certificado
```
Usuario completa curso en Veralix
→ Veralix genera certificado
→ Veralix envía webhook a Oriluxchain
```

### 2. Oriluxchain Recibe y Valida
```
Webhook recibido
→ Validar firma de Veralix
→ Verificar datos del certificado
→ Crear transacción en blockchain
```

### 3. Registro en Blockchain
```
Transacción creada
→ Añadida a pending_transactions
→ Minero incluye en próximo bloque
→ Certificado INMUTABLE en blockchain
```

### 4. Confirmación a Veralix
```
Bloque minado
→ Enviar confirmación a Veralix
→ Veralix actualiza certificado con TX hash
→ Usuario puede verificar en blockchain
```

---

## 🔐 ESTRUCTURA DE CERTIFICADO

```json
{
  "type": "CERTIFICATE",
  "certificate_id": "CERT-2025-001",
  "issuer": "VERALIX",
  "recipient": {
    "user_id": "user123",
    "name": "Juan Pérez",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  },
  "course": {
    "id": "blockchain-101",
    "name": "Blockchain Fundamentals",
    "duration": "40 hours",
    "level": "Beginner"
  },
  "achievement": {
    "completion_date": "2025-11-20",
    "score": 95,
    "grade": "A",
    "skills": ["Blockchain", "Smart Contracts", "Web3"]
  },
  "verification": {
    "hash": "0x123abc...",
    "signature": "0xdef456...",
    "timestamp": 1700524500,
    "blockchain_tx": "0xabc123...",
    "block_number": 1234
  },
  "metadata": {
    "ipfs_url": "ipfs://Qm...",
    "pdf_url": "https://veralix.io/certificates/CERT-2025-001.pdf",
    "nft_token_id": "12345"
  }
}
```

---

## 🛠️ ENDPOINTS NECESARIOS

### Para Veralix (Webhooks):
```
POST /api/veralix/certificate/issue
POST /api/veralix/certificate/revoke
POST /api/veralix/certificate/update
```

### Para Usuarios (Verificación):
```
GET /api/certificate/verify/:id
GET /api/certificate/:id
GET /api/certificates/user/:address
```

### Para Dashboard:
```
GET /api/certificates/recent
GET /api/certificates/stats
```

---

## 🎯 BENEFICIOS

### Para Estudiantes:
✅ Certificado inmutable en blockchain
✅ Verificación pública y transparente
✅ Propiedad real del certificado (NFT opcional)
✅ Portabilidad entre plataformas

### Para Veralix:
✅ Credibilidad y confianza
✅ Anti-falsificación automática
✅ Trazabilidad completa
✅ Integración Web3

### Para Empleadores:
✅ Verificación instantánea
✅ Imposible de falsificar
✅ Historial completo
✅ Confianza garantizada

---

## 🚀 PRÓXIMOS PASOS

1. **Implementar endpoints de certificados**
2. **Crear smart contract para certificados**
3. **Agregar página de verificación**
4. **Integrar con Veralix API**
5. **Testing completo**

---

## 💡 CARACTERÍSTICAS AVANZADAS (Futuro)

- **NFT Certificates**: Cada certificado como NFT único
- **Skill Badges**: Badges en blockchain por habilidades
- **Credential Stacking**: Combinar múltiples certificados
- **Social Proof**: Compartir en redes con verificación
- **Employer Dashboard**: Panel para empresas verificar candidatos

---

**Estado**: 📝 Diseñado, pendiente implementación
**Prioridad**: 🔥 Alta
**Complejidad**: ⭐⭐⭐ Media
