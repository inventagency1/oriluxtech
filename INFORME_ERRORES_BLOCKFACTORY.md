# 🚨 INFORME DE ERRORES Y FALTANTES - BLOCKFACTORY

**Fecha:** 1 de Diciembre, 2025  
**Cliente:** Veralix / Oriluxchain  
**Proveedor:** BlockFactory  
**Tipo:** Auditoría de Entrega

---

## ⚠️ RESUMEN EJECUTIVO

### CALIFICACIÓN DE ENTREGA: 2/10 - INACEPTABLE

BlockFactory entregó un sistema **incompleto, inconsistente y no funcional** que requiere trabajo adicional significativo para operar. La documentación es engañosa y contradictoria, y **faltan elementos críticos** que ellos debían proporcionar.

---

## 🔴 ERRORES CRÍTICOS

### 1. DIRECCIONES DE CONTRATO INCONSISTENTES

BlockFactory proporcionó **DOS direcciones diferentes** en su documentación sin clarificar cuál es la correcta:

| Ubicación | Dirección | Estado |
|-----------|-----------|--------|
| Manual de Operación | `0xddF276c0Ab894fa7D085Ac3441471A431610A0E4` | ❓ |
| CRESTCHAIN_INTEGRATION.md | `0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB` | ❓ |

**PROBLEMA:** No sabemos cuál contrato usar. La documentación se contradice a sí misma.

---

### 2. 🔑 PRIVATE KEY NO ENTREGADA

**ESTO ES CRÍTICO:** BlockFactory **NUNCA entregó la SYSTEM_PRIVATE_KEY** necesaria para operar el sistema.

**Evidencia:**
```typescript
// mint-nft-crestchain/index.ts (línea 12)
const SYSTEM_PRIVATE_KEY = Deno.env.get("SYSTEM_PRIVATE_KEY");

// Si no existe, el sistema falla:
if (!SYSTEM_PRIVATE_KEY) return { success: false, error: "SYSTEM_PRIVATE_KEY missing" };
```

**Consecuencia:** 
- ❌ No podemos mintear NFTs
- ❌ No podemos operar el sistema
- ❌ Dependemos de una clave que ellos tienen y no entregaron

**Preguntas para BlockFactory:**
1. ¿Dónde está la private key del sistema?
2. ¿Quién tiene acceso a la wallet del sistema?
3. ¿Por qué no fue entregada en la documentación?

---

### 3. RPC URL INCORRECTO

**En el manual dicen:**
```
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro:8545
```

**Pero el puerto :8545 NO FUNCIONA:**
```
Error: Se ha terminado la conexión: Error inesperado de envío.
```

**El RPC correcto es:**
```
CRESTCHAIN_RPC_URL=https://rpc.crestchain.pro  (SIN PUERTO)
```

**Consecuencia:** Cualquiera que siga el manual tendrá errores de conexión.

---

### 4. TOKEN TCT EN RED INCORRECTA

**El token TCT existe en BSC Mainnet**, NO en Crestchain como BlockFactory indicó:

| Información | Valor |
|-------------|-------|
| **Token** | TCT |
| **Red Real** | BSC Mainnet (Chain ID: 56) |
| **Contrato TCT** | `0x2D8931C368fE34D3d039Ab454aFc131342A339B5` |
| **Red Documentada** | Crestchain (Chain ID: 85523) |

**PROBLEMAS GRAVES:**

1. **BlockFactory documentó "CREST"** en lugar de "TCT" en la documentación técnica
2. **El token TCT está en BSC Mainnet**, no en Crestchain
3. **¿Cómo se supone que paguemos gas en Crestchain con TCT si TCT está en BSC?**

**Preguntas críticas:**
- ¿Existe un bridge de TCT entre BSC y Crestchain?
- ¿Crestchain usa TCT como token nativo o es un token ERC-20 en BSC?
- ¿Por qué no documentaron esta información?

---

### 5. ABI DEL CONTRATO INCONSISTENTE

**En mint-nft-crestchain/index.ts:**
```typescript
const CONTRACT_ABI = [
  {
    inputs: [
      { name: "certificateNumber", type: "string" },
      { name: "jewelryType", type: "string" },
      { name: "description", type: "string" },
      { name: "imageHash", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "owner", type: "address" },
      { name: "appraisalValue", type: "uint256" },
      { name: "appraisalCurrency", type: "string" },
    ],
    name: "createCertificate",
    // ...
  }
];
```

**En CRESTCHAIN_INTEGRATION.md:**
```typescript
function createCertificate(
    address to, 
    string memory certificateId, 
    string memory metadataURI
) external returns (uint256)
```

**PROBLEMA:** Las firmas de función son COMPLETAMENTE DIFERENTES:
- Una tiene 8 parámetros
- Otra tiene 3 parámetros

**¿Cuál es la correcta?** No lo sabemos.

---

### 6. WALLET DEL SISTEMA - INFORMACIÓN CONTRADICTORIA

**En CRESTCHAIN_INTEGRATION.md:**
```
Address: 0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9
```

**En el diagnóstico actual:**
```
Address: 0x9C604DfFf13CbeB8ffe7A4102d9245b5b57784D9
```

**PROBLEMA:** ¿Cuál es la wallet del sistema? Hay DOS direcciones diferentes.

---

### 7. VARIABLES DE ENTORNO NO DOCUMENTADAS

BlockFactory **NO proporcionó** las siguientes variables que son necesarias:

| Variable | Estado | Impacto |
|----------|--------|---------|
| `SYSTEM_PRIVATE_KEY` | ❌ NO ENTREGADA | Sistema no funciona |
| `PINATA_JWT` | ❓ No documentado | IPFS puede fallar |
| `ORILUXCHAIN_API_URL` | ❌ URL incorrecta | Integración falla |

**La documentación dice:**
```bash
SYSTEM_PRIVATE_KEY=0x...  # Private key del system wallet
```

**Pero NUNCA dicen cuál es esa private key.**

---

### 8. CÓDIGO CON PLACEHOLDERS

El código tiene **datos hardcodeados** que nunca fueron reemplazados:

```typescript
// mint-nft-crestchain/index.ts
const jewelryType = "unknown";           // ❌ PLACEHOLDER
const description = "Veralix NFT Certificate";  // ❌ GENÉRICO
const imageHash = "ipfs://placeholder";  // ❌ PLACEHOLDER
const metadataURI = "ipfs://metadata";   // ❌ PLACEHOLDER
const appraisalValue = 0n;               // ❌ SIEMPRE CERO
```

**Consecuencia:** Todos los NFTs tendrían datos falsos/vacíos.

---

### 9. MIGRACIÓN "LEDGER" INCOMPLETA

BlockFactory intentó una "migración a Ledger Core" que **nunca completó**:

**Evidencia en AUDITORIA_CRESTCHAIN_COMPLETA.md:**
```markdown
# 🔒 Migración a Ledger Core - Documentación Confidencial
**CONFIDENCIAL - NO COMPARTIR**

Esta migración reemplaza la implementación anterior de Crestchain 
con una nueva arquitectura ofuscada llamada "Ledger Core".
```

**PROBLEMA:** 
- Existen DOS sistemas (Crestchain Y Ledger)
- Código mezclado y confuso
- Ninguno funciona completamente
- ¿Por qué intentaron "ofuscar" el código?

---

### 10. URLs QUE NO EXISTEN

**En el código:**
```typescript
const ORILUX_API_URL = 'http://host.docker.internal:5000/api/veralix/webhook';
```

**PROBLEMA:** `host.docker.internal` solo funciona dentro de Docker, no desde Supabase Edge Functions.

---

## 📋 LISTA COMPLETA DE FALTANTES

### Documentación Faltante:
- [ ] Private key del sistema
- [ ] Cuál contrato usar (hay 3 direcciones)
- [ ] ABI correcta del contrato
- [ ] Token nativo correcto (TCT vs CREST)
- [ ] Wallet del sistema correcta
- [ ] Guía de configuración de variables de entorno COMPLETA

### Código Faltante:
- [ ] Lógica para obtener datos reales de joyas (no placeholders)
- [ ] Manejo de errores robusto
- [ ] Retry logic para transacciones
- [ ] Validación de respuestas

### Configuración Faltante:
- [ ] Variables de entorno en Supabase
- [ ] Private key del sistema
- [ ] URL correcta de Oriluxchain

---

## 💰 IMPACTO FINANCIERO

### Tiempo Perdido:
- Diagnóstico de problemas: ~8 horas
- Corrección de errores: ~4 horas
- Documentación correcta: ~2 horas
- **Total: ~14 horas de trabajo adicional**

### Riesgo:
- Sistema no operativo
- Certificados no se pueden generar
- Clientes afectados
- Reputación dañada

---

## ❓ PREGUNTAS PARA BLOCKFACTORY

1. **¿Dónde está la SYSTEM_PRIVATE_KEY?**
   - Sin esta clave, el sistema NO FUNCIONA
   - ¿Quién la tiene?
   - ¿Por qué no fue entregada?

2. **¿Cuál es el contrato correcto?**
   - `0xddF276c0Ab894fa7D085Ac3441471A431610A0E4`
   - `0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB`
   - ¿Por qué hay dos direcciones diferentes?

3. **¿Cuál es el ABI correcto?**
   - ¿8 parámetros o 3 parámetros?
   - ¿Dónde está el código fuente del contrato?

4. **¿Cómo funciona TCT entre BSC y Crestchain?**
   - TCT está en BSC Mainnet: `0x2D8931C368fE34D3d039Ab454aFc131342A339B5`
   - ¿Existe un bridge entre BSC y Crestchain?
   - ¿Cómo se paga gas en Crestchain si TCT está en BSC?
   - ¿Por qué documentaron "CREST" en lugar de "TCT"?

5. **¿Por qué intentaron ofuscar el código?**
   - ¿Qué es "Ledger Core"?
   - ¿Por qué la migración no se completó?

6. **¿Cuál es la wallet del sistema?**
   - `0x7ed60Ee3f88fA872463766Ae9e476E010CaEa4B9`
   - `0x9C604DfFf13CbeB8ffe7A4102d9245b5b57784D9`
   - ¿Por qué hay dos direcciones?

---

## 🎯 ACCIONES REQUERIDAS DE BLOCKFACTORY

### Inmediato (24 horas):
1. ✅ Entregar SYSTEM_PRIVATE_KEY
2. ✅ Confirmar dirección de contrato correcta
3. ✅ Confirmar ABI correcta
4. ✅ Confirmar token nativo (TCT o CREST)

### Corto Plazo (1 semana):
1. ✅ Corregir documentación inconsistente
2. ✅ Completar código con datos reales (no placeholders)
3. ✅ Eliminar código de "Ledger Core" no utilizado
4. ✅ Proporcionar guía de configuración COMPLETA

### Compensación:
- Horas adicionales de trabajo para corregir errores
- Soporte técnico extendido sin costo
- Documentación corregida y completa

---

## 📊 RESUMEN DE INCONSISTENCIAS

| Elemento | Documentado | Correcto | Error |
|----------|-------------|----------|-------|
| Contrato | `0xddF276...` y `0xf23507...` | ❓ Sin confirmar | 2 direcciones diferentes |
| Token | CREST (en docs) | TCT en BSC: `0x2D8931C...` | Nombre y red incorrectos |
| Wallet | `0x7ed60E...` y `0x9C604D...` | ❓ Sin confirmar | 2 direcciones diferentes |
| RPC | `:8545` | Sin puerto | Puerto incorrecto |
| ABI | 8 params y 3 params | ❓ Sin confirmar | 2 versiones diferentes |
| Red TCT | Crestchain | BSC Mainnet (56) | Red incorrecta |

---

## 🔚 CONCLUSIÓN

BlockFactory entregó un producto **incompleto y no funcional** con documentación **contradictoria y engañosa**. 

Los elementos más críticos (**private key, dirección de contrato correcta, ABI**) no fueron entregados o están mal documentados.

**El sistema NO PUEDE OPERAR** en su estado actual sin información adicional de BlockFactory.

---

**Preparado por:** Auditoría Técnica  
**Fecha:** 1 de Diciembre, 2025  
**Estado:** PENDIENTE DE RESPUESTA DE BLOCKFACTORY

