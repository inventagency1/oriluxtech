# 🚀 PLAN DE EJECUCIÓN COMPLETA - VERALIX + ORILUXCHAIN

**Objetivo:** Levantar todo el ecosistema y emitir certificados NFT reales que se registren en Oriluxchain.

---

## 📊 ARQUITECTURA ACTUAL

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO (Navegador)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              VERALIX FRONTEND (React/Vite)                   │
│                   localhost:8082                             │
└──────────────┬──────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────┐
│           SUPABASE (Cloud - Edge Functions)                  │
│  • generate-nft-certificate                                  │
│  • mint-nft-crestchain                                       │
│  • verify-nft-status                                         │
│  • crestchain-webhook                                        │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├──────────────┐
               ↓              ↓
        ┌──────────┐   ┌─────────────────┐
        │   IPFS   │   │  ORILUXCHAIN    │
        │ (Pinata) │   │  localhost:5000 │
        └──────────┘   └─────────────────┘
                              ↓
                       ┌──────────────┐
                       │  BLOCKCHAIN  │
                       │   (Local)    │
                       └──────────────┘
```

---

## 🎯 PLAN DE 5 PASOS

### PASO 1: Verificar Configuración Actual ✅
**Objetivo:** Asegurar que todo está configurado correctamente.

**Acciones:**
1. ✅ Verificar `.env` de Veralix tiene todas las variables
2. ✅ Verificar Supabase Edge Functions están desplegadas
3. ✅ Verificar credenciales de Pinata (IPFS)
4. ✅ Verificar Oriluxchain tiene endpoint `/api/veralix/webhook`

**Comandos:**
```bash
# Ver configuración de Veralix
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
type .env

# Ver endpoint de webhook en Oriluxchain
cd C:\Users\Sebastian\Desktop\Oriluxchain
grep -n "veralix/webhook" api.py
```

---

### PASO 2: Exponer Oriluxchain a Internet (TEMPORAL) 🌐
**Objetivo:** Permitir que Supabase Edge Functions lleguen a Oriluxchain local.

**Opciones:**

#### Opción A: ngrok (RECOMENDADO - Más fácil)
```bash
# Instalar ngrok (si no lo tienes)
# Descargar de: https://ngrok.com/download

# Exponer puerto 5000
ngrok http 5000
```

**Resultado:** Te dará una URL pública como `https://abc123.ngrok.io`

#### Opción B: Cloudflare Tunnel (Más profesional)
```bash
# Instalar cloudflared
# Descargar de: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Crear túnel
cloudflared tunnel --url http://localhost:5000
```

**Resultado:** URL pública de Cloudflare

#### Opción C: LocalTunnel (Alternativa rápida)
```bash
npm install -g localtunnel
lt --port 5000
```

**⚠️ IMPORTANTE:** Estas son soluciones TEMPORALES para testing. En producción, Oriluxchain debe estar en un servidor real.

---

### PASO 3: Configurar Webhook en Supabase Edge Functions 🔗
**Objetivo:** Decirle a Supabase dónde está Oriluxchain.

**Acciones:**
1. Obtener URL pública de ngrok/cloudflare (ej: `https://abc123.ngrok.io`)
2. Actualizar Edge Function `crestchain-webhook` con la URL

**Archivo a modificar:**
```
veralix-crestchain-1.0/supabase/functions/crestchain-webhook/index.ts
```

**Cambio necesario:**
```typescript
// ANTES (probablemente apunta a localhost o no existe)
const oriluxchainUrl = 'http://localhost:5000/api/veralix/webhook';

// DESPUÉS (con tu URL de ngrok)
const oriluxchainUrl = 'https://abc123.ngrok.io/api/veralix/webhook';
```

**Redesplegar Edge Function:**
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
npx supabase functions deploy crestchain-webhook
```

---

### PASO 4: Levantar Todo el Sistema 🚀
**Objetivo:** Tener todo corriendo simultáneamente.

#### 4.1. Terminal 1 - Oriluxchain
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain
python start_with_veralix.py
```
**Verificar:** http://localhost:5000 responde

#### 4.2. Terminal 2 - ngrok (Túnel)
```bash
ngrok http 5000
```
**Copiar:** La URL pública que te da (ej: `https://abc123.ngrok.io`)

#### 4.3. Terminal 3 - Veralix Frontend
```bash
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
npm run dev
```
**Verificar:** http://localhost:8082 responde

---

### PASO 5: Testing Completo - Emitir Certificado Real 🎯
**Objetivo:** Crear un certificado NFT y verificar que llega a Oriluxchain.

#### 5.1. Acceder a Veralix
1. Abre: http://localhost:8082
2. Navega a la sección de certificados

#### 5.2. Crear Certificado de Prueba
**Datos de ejemplo:**
```json
{
  "jewelry_type": "Ring",
  "material": "Gold",
  "purity": "18K",
  "weight": 5.5,
  "jeweler": "Test Jeweler",
  "manufacturer": "Test Manufacturer",
  "origin_country": "Colombia",
  "description": "Test certificate for integration",
  "estimated_value": 1000
}
```

#### 5.3. Verificar el Flujo Completo

**En Veralix (Frontend):**
- ✅ Formulario se envía correctamente
- ✅ Aparece loading/spinner
- ✅ Mensaje de éxito

**En Supabase (Cloud):**
- ✅ Edge Function `generate-nft-certificate` se ejecuta
- ✅ Imagen se sube a IPFS (Pinata)
- ✅ Metadata se sube a IPFS
- ✅ Edge Function `crestchain-webhook` se ejecuta
- ✅ POST request a Oriluxchain

**En Oriluxchain (Local):**
- ✅ Webhook recibe el certificado
- ✅ Se crea transacción en blockchain
- ✅ Certificado se registra en la base de datos
- ✅ Logs en consola muestran el proceso

**Verificación Final:**
```bash
# En Oriluxchain, verificar que el certificado llegó
curl http://localhost:5000/api/jewelry/certificates
```

---

## 🔍 DEBUGGING - Si algo falla

### Problema 1: Veralix no puede conectar a Supabase
**Síntomas:** Errores de CORS, "Failed to fetch"

**Solución:**
```bash
# Verificar .env tiene las credenciales correctas
cd veralix-crestchain-1.0
type .env | findstr SUPABASE
```

### Problema 2: Supabase no puede llegar a Oriluxchain
**Síntomas:** Timeout, "Connection refused"

**Solución:**
1. Verificar ngrok está corriendo
2. Verificar URL en Edge Function es correcta
3. Verificar Oriluxchain está corriendo

**Test manual del webhook:**
```bash
# Desde PowerShell (con tu URL de ngrok)
$body = @{
    certificate_id = "test-123"
    jewelry_type = "Ring"
    material = "Gold"
    nft_token_id = "999"
    ipfs_hash = "QmTest123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://abc123.ngrok.io/api/veralix/webhook" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

### Problema 3: IPFS/Pinata falla
**Síntomas:** "Failed to upload to IPFS"

**Solución:**
```bash
# Verificar credenciales de Pinata en .env
type .env | findstr PINATA
```

### Problema 4: Edge Functions no desplegadas
**Síntomas:** "Function not found"

**Solución:**
```bash
# Listar funciones desplegadas
npx supabase functions list

# Redesplegar todas
npx supabase functions deploy generate-nft-certificate
npx supabase functions deploy mint-nft-crestchain
npx supabase functions deploy crestchain-webhook
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Pre-requisitos
- [ ] Node.js instalado (v18+)
- [ ] Python instalado (v3.8+)
- [ ] npm/pnpm instalado
- [ ] Cuenta Supabase activa
- [ ] Cuenta Pinata activa
- [ ] ngrok instalado (o alternativa)

### Configuración
- [ ] `.env` de Veralix completo
- [ ] Supabase CLI configurado
- [ ] Edge Functions desplegadas
- [ ] Oriluxchain corriendo
- [ ] ngrok/túnel activo

### Testing
- [ ] Frontend accesible (localhost:8082)
- [ ] Backend accesible (localhost:5000)
- [ ] Túnel público funcionando
- [ ] Webhook responde correctamente
- [ ] Certificado se crea en Veralix
- [ ] Certificado llega a Oriluxchain
- [ ] Blockchain registra el certificado

---

## 🎯 RESULTADO ESPERADO

Al final de este proceso, deberías poder:

1. ✅ Abrir Veralix en el navegador
2. ✅ Crear un certificado de joyería
3. ✅ Ver el certificado subirse a IPFS
4. ✅ Ver el certificado registrarse en Oriluxchain
5. ✅ Consultar el certificado desde el dashboard de Oriluxchain
6. ✅ Ver la transacción en la blockchain

---

## 📝 NOTAS IMPORTANTES

### Limitaciones Actuales
- ⚠️ ngrok/túnel es temporal (se cae si cierras la terminal)
- ⚠️ URL de ngrok cambia cada vez que lo reinicias (versión gratuita)
- ⚠️ Supabase Edge Functions tienen límites de ejecución

### Para Producción
- 🚀 Oriluxchain debe estar en un servidor con IP pública
- 🚀 Usar dominio real (ej: api.oriluxchain.com)
- 🚀 Configurar SSL/HTTPS
- 🚀 Usar base de datos persistente
- 🚀 Implementar autenticación robusta

---

## 🔄 FLUJO COMPLETO ESPERADO

```
1. Usuario crea certificado en Veralix
   ↓
2. Veralix llama a Supabase Edge Function "generate-nft-certificate"
   ↓
3. Edge Function genera imagen del certificado
   ↓
4. Edge Function sube imagen a IPFS (Pinata)
   ↓
5. Edge Function crea metadata JSON
   ↓
6. Edge Function sube metadata a IPFS
   ↓
7. Edge Function llama a "crestchain-webhook"
   ↓
8. Webhook envía POST a Oriluxchain (vía ngrok)
   ↓
9. Oriluxchain recibe certificado
   ↓
10. Oriluxchain crea transacción en blockchain
   ↓
11. Oriluxchain registra certificado en DB
   ↓
12. Oriluxchain responde OK
   ↓
13. Veralix muestra éxito al usuario
   ↓
14. Usuario puede ver certificado en ambos sistemas
```

---

## 🎊 SIGUIENTE PASO

**Ejecuta los comandos en orden y reporta cualquier error que encuentres.**

¿Listo para empezar? 🚀
