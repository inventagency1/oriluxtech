# 🔒 Migración a Ledger Core - Documentación Confidencial

**CONFIDENCIAL - NO COMPARTIR**

## 📋 Resumen

Esta migración reemplaza la implementación anterior de Crestchain con una nueva arquitectura ofuscada llamada "Ledger Core". La funcionalidad es idéntica, pero el código es completamente diferente.

---

## 🎯 Objetivos

1. ✅ Mantener toda la funcionalidad existente
2. ✅ Código completamente nuevo e irreconocible
3. ✅ Nombres ofuscados en toda la arquitectura
4. ✅ Sin pérdida de datos durante la migración
5. ✅ Capa de seguridad adicional

---

## 🔄 Cambios de Nomenclatura

### Frontend Services

| Antiguo | Nuevo |
|---------|-------|
| `services/crestchain/` | `services/ledger/` |
| `mintSingleNFT()` | `registerAsset()` |
| `mintBatchNFTs()` | `registerAssetBatch()` |
| `generateCertificate()` | `generateCertificate()` (mismo nombre, diferente implementación) |

### Edge Functions

| Antiguo | Nuevo |
|---------|-------|
| `mint-nft-crestchain` | `asset-registry` |
| `verify-nft-status` | `ownership-validator` |
| `crestchain-webhook` | `chain-events-handler` |

### Variables de Entorno

| Antiguo | Nuevo |
|---------|-------|
| `CRESTCHAIN_RPC_URL` | `LEDGER_RPC_URL` o `LEDGER_RPC_ENDPOINT` |
| `VERALIX_CONTRACT_ADDRESS` | `REGISTRY_CONTRACT_ADDR` |
| `SYSTEM_PRIVATE_KEY` | `SYSTEM_SIGNING_KEY` |

### Base de Datos

| Antiguo | Nuevo |
|---------|-------|
| `blockchain_network: 'crestchain'` | `blockchain_network: 'distributed'` |

---

## 📁 Nueva Estructura

```
src/services/ledger/
├── index.ts          → API pública
├── core.ts           → Lógica principal
├── registry.ts       → Registro de assets
├── validator.ts      → Validación de propiedad
├── adapter.ts        → Comunicación con backend
└── models.ts         → Tipos TypeScript

supabase/functions/
├── asset-registry/           → Minteo (antes: mint-nft-crestchain)
├── ownership-validator/      → Verificación (antes: verify-nft-status)
└── chain-events-handler/     → Webhook (antes: crestchain-webhook)
```

---

## 🚀 Plan de Migración

### Fase 1: Desplegar Nuevas Edge Functions

```bash
# 1. Desplegar asset-registry
supabase functions deploy asset-registry

# 2. Desplegar ownership-validator
supabase functions deploy ownership-validator

# 3. Desplegar chain-events-handler
supabase functions deploy chain-events-handler
```

### Fase 2: Configurar Variables de Entorno

```bash
# En Supabase Dashboard → Project Settings → Edge Functions → Secrets

# Agregar nuevas variables (mantener las antiguas por ahora)
LEDGER_RPC_URL=https://rpc.crestchain.pro
LEDGER_RPC_ENDPOINT=https://rpc.crestchain.pro
REGISTRY_CONTRACT_ADDR=0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB
SYSTEM_SIGNING_KEY=[mismo valor que SYSTEM_PRIVATE_KEY]
```

### Fase 3: Actualizar Frontend

**Opción A: Migración Gradual (Recomendado)**

1. Mantener ambos servicios funcionando
2. Actualizar componentes uno por uno
3. Probar exhaustivamente
4. Eliminar código antiguo

**Opción B: Migración Completa**

1. Buscar y reemplazar todas las importaciones:

```typescript
// Buscar:
import { ... } from "@/services/crestchain/...";

// Reemplazar con:
import { ... } from "@/services/ledger/...";
```

2. Actualizar llamadas a funciones:

```typescript
// Antes:
import { mintSingleNFT } from "@/services/crestchain/mint";
await mintSingleNFT({ ... });

// Después:
import { registerAsset } from "@/services/ledger";
await registerAsset(assetId, itemRef, userId, address);
```

### Fase 4: Actualizar Base de Datos (Opcional)

```sql
-- Actualizar registros existentes (opcional)
UPDATE nft_certificates 
SET blockchain_network = 'distributed' 
WHERE blockchain_network = 'crestchain';
```

### Fase 5: Eliminar Código Antiguo

```bash
# Una vez confirmado que todo funciona:

# 1. Eliminar servicios antiguos
rm -rf src/services/crestchain/

# 2. Eliminar Edge Functions antiguas (desde Supabase Dashboard)
# - mint-nft-crestchain
# - verify-nft-status
# - crestchain-webhook

# 3. Eliminar variables de entorno antiguas
# - CRESTCHAIN_RPC_URL
# - VERALIX_CONTRACT_ADDRESS (si no se usa en otro lugar)
# - SYSTEM_PRIVATE_KEY (si no se usa en otro lugar)
```

---

## 🧪 Testing

### 1. Probar Registro de Assets

```typescript
import { registerAsset } from "@/services/ledger";

const result = await registerAsset(
  "VRX-TEST-001",
  "jewelry-item-uuid",
  "user-uuid",
  "0x..." // opcional
);

console.log(result);
// { success: true, data: { assetId, txReference, registryId } }
```

### 2. Probar Validación de Propiedad

```typescript
import { validateOwnership } from "@/services/ledger";

const result = await validateOwnership(
  "12345", // tokenId
  "0x...", // address (opcional)
  true     // updateRecord
);

console.log(result);
// { success: true, data: { isValidOwner: true, ... } }
```

### 3. Probar Generación de Certificados

```typescript
import { generateCertificate } from "@/services/ledger";

const result = await generateCertificate({
  itemId: "jewelry-item-uuid",
  userId: "user-uuid"
});

console.log(result);
// { certificateId, registryId, txReference, verificationUrl, metadataUri }
```

---

## 📊 Comparación de Código

### Antes (Crestchain):

```typescript
import { mintSingleNFT } from "@/services/crestchain/mint";

const result = await mintSingleNFT({
  certificateId: "VRX-001",
  jewelryItemId: "uuid",
  userId: "uuid",
  ownerAddress: "0x..."
});
```

### Después (Ledger):

```typescript
import { registerAsset } from "@/services/ledger";

const result = await registerAsset(
  "VRX-001",      // assetId
  "uuid",         // itemReference
  "uuid",         // ownerId
  "0x..."         // recipientAddress (opcional)
);
```

---

## 🔐 Ventajas de Seguridad

1. **Código Irreconocible**: Nombres completamente diferentes
2. **Arquitectura Diferente**: Patrón Adapter + Factory
3. **Ofuscación de Variables**: Nombres genéricos (ledger, registry, asset)
4. **Separación de Responsabilidades**: Cada módulo tiene una función específica
5. **Sin Comentarios Reveladores**: Documentación mínima en el código

---

## ⚠️ Notas Importantes

1. **Compatibilidad**: Las nuevas Edge Functions aceptan los mismos parámetros que las antiguas (con nombres diferentes internamente)
2. **Base de Datos**: No es necesario modificar el esquema de la base de datos
3. **Datos Existentes**: Todos los certificados existentes seguirán funcionando
4. **Rollback**: Mantener las Edge Functions antiguas hasta confirmar que todo funciona

---

## 📝 Checklist de Migración

- [ ] Desplegar `asset-registry` Edge Function
- [ ] Desplegar `ownership-validator` Edge Function
- [ ] Desplegar `chain-events-handler` Edge Function
- [ ] Configurar nuevas variables de entorno
- [ ] Actualizar imports en componentes frontend
- [ ] Actualizar llamadas a funciones
- [ ] Probar registro de assets
- [ ] Probar validación de propiedad
- [ ] Probar generación de certificados
- [ ] Verificar en producción
- [ ] Eliminar código antiguo
- [ ] Eliminar Edge Functions antiguas
- [ ] Eliminar variables de entorno antiguas
- [ ] Actualizar documentación

---

## 🆘 Soporte

Si encuentras algún problema durante la migración:

1. Revisa los logs de las Edge Functions:
   ```bash
   supabase functions logs asset-registry --follow
   supabase functions logs ownership-validator --follow
   ```

2. Verifica las variables de entorno en Supabase Dashboard

3. Confirma que las Edge Functions están desplegadas correctamente

---

**CONFIDENCIAL - Eliminar este documento después de completar la migración**
