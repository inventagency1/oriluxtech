# 🚀 INICIO RÁPIDO - VERALIX + ORILUXCHAIN

**Tiempo estimado:** 10 minutos  
**Objetivo:** Levantar todo y emitir un certificado real

---

## ✅ CHECKLIST PRE-VUELO

Antes de empezar, verifica que tienes:
- [ ] Python 3.8+ instalado
- [ ] Node.js 18+ instalado
- [ ] npm o pnpm instalado
- [ ] Cuenta Supabase activa (ya configurada ✅)
- [ ] Cuenta Pinata/IPFS (verificar si está en .env)

---

## 🎯 PASO A PASO

### PASO 1: Levantar Oriluxchain (Backend)

```powershell
# Terminal 1
cd C:\Users\Sebastian\Desktop\Oriluxchain
python start_with_veralix.py
```

**Verificar:** Deberías ver:
```
🚀 Starting Oriluxchain with Veralix integration...
✅ CORS configured for Veralix
🔗 Veralix webhook endpoint: /api/veralix/webhook
 * Running on http://127.0.0.1:5000
```

**Test rápido:**
```powershell
# En otra terminal
curl http://localhost:5000/api/health
```

---

### PASO 2: Instalar dependencias de Veralix (Solo primera vez)

```powershell
# Terminal 2
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
npm install
```

---

### PASO 3: Levantar Veralix (Frontend)

```powershell
# En la misma Terminal 2
npm run dev
```

**Verificar:** Deberías ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Abrir en navegador:** http://localhost:5173

---

### PASO 4: Verificar Edge Functions de Supabase

```powershell
# Terminal 3
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Listar funciones desplegadas
npx supabase functions list
```

**Deberías ver:**
- ✅ `generate-nft-certificate`
- ✅ `mint-nft-crestchain`
- ✅ `oriluxchain-webhook`
- ✅ `verify-nft-status`

**Si no están desplegadas:**
```powershell
# Desplegar todas las funciones necesarias
npx supabase functions deploy generate-nft-certificate
npx supabase functions deploy mint-nft-crestchain
npx supabase functions deploy oriluxchain-webhook
npx supabase functions deploy verify-nft-status
```

---

### PASO 5: Configurar Túnel Público (ngrok)

**⚠️ IMPORTANTE:** Supabase (cloud) necesita llegar a tu Oriluxchain (local)

#### Opción A: ngrok (Recomendado)

1. **Descargar ngrok:**
   - Ve a: https://ngrok.com/download
   - Descarga la versión para Windows
   - Extrae el .exe

2. **Ejecutar ngrok:**
```powershell
# Terminal 4
cd C:\ruta\donde\descargaste\ngrok
.\ngrok.exe http 5000
```

3. **Copiar URL pública:**
```
Forwarding  https://abc123xyz.ngrok.io -> http://localhost:5000
```
**Copia esta URL:** `https://abc123xyz.ngrok.io`

#### Opción B: Cloudflare Tunnel
```powershell
cloudflared tunnel --url http://localhost:5000
```

#### Opción C: LocalTunnel
```powershell
npx localtunnel --port 5000
```

---

### PASO 6: Actualizar URL en Veralix

**Archivo:** `veralix-crestchain-1.0/.env`

Agrega o actualiza esta línea:
```env
VITE_ORILUXCHAIN_URL=https://abc123xyz.ngrok.io
```

**Reiniciar Veralix:**
```powershell
# En Terminal 2, presiona Ctrl+C y luego:
npm run dev
```

---

### PASO 7: Probar Certificado Real 🎯

1. **Abrir Veralix:** http://localhost:5173

2. **Navegar a Certificados:**
   - Busca la sección de "Certificates" o "NFT Certificates"
   - O ve directamente a: http://localhost:5173/certificates

3. **Crear Certificado de Prueba:**

**Datos de ejemplo:**
```
Tipo de Joya: Ring
Material: Gold
Pureza: 18K
Peso: 5.5 gramos
Joyero: Test Jeweler
Fabricante: Test Manufacturer
País de Origen: Colombia
Descripción: Test certificate for integration testing
Valor Estimado: 1000 USD
```

4. **Enviar y Observar:**

**En Veralix (navegador):**
- ✅ Loading spinner
- ✅ "Certificate created successfully"
- ✅ Ver el certificado en la lista

**En Terminal de Oriluxchain:**
```
📥 Webhook received from Veralix
📦 Certificate data: {...}
✅ Certificate registered in blockchain
🔗 Transaction hash: 0x...
```

**En Terminal de ngrok:**
```
POST /api/veralix/webhook  200 OK
```

---

## 🔍 VERIFICACIÓN COMPLETA

### 1. Verificar en Oriluxchain Dashboard

```
http://localhost:5000
Login: admin / admin123
```

- Ve a "Blockchain" → Deberías ver un nuevo bloque
- Ve a "Transactions" → Deberías ver la transacción del certificado

### 2. Verificar en API directamente

```powershell
# Ver certificados registrados
curl http://localhost:5000/api/jewelry/stats

# Ver último bloque
curl http://localhost:5000/api/blocks?page=1&per_page=1
```

### 3. Verificar en Supabase

1. Ve a: https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl
2. Table Editor → `nft_certificates`
3. Busca tu certificado
4. Verifica que `orilux_blockchain_status` = "verified"

---

## 🐛 TROUBLESHOOTING

### Problema: "Failed to fetch" en Veralix

**Causa:** CORS o Oriluxchain no está corriendo

**Solución:**
```powershell
# Verificar que Oriluxchain está corriendo
curl http://localhost:5000/api/health

# Si no responde, reiniciar:
cd C:\Users\Sebastian\Desktop\Oriluxchain
python start_with_veralix.py
```

### Problema: "Webhook timeout" o "Connection refused"

**Causa:** ngrok no está corriendo o URL incorrecta

**Solución:**
1. Verificar ngrok está activo
2. Copiar la URL correcta de ngrok
3. Actualizar `.env` de Veralix
4. Reiniciar Veralix

### Problema: "IPFS upload failed"

**Causa:** Credenciales de Pinata incorrectas o faltantes

**Solución:**
```powershell
# Verificar .env tiene las claves de Pinata
cd veralix-crestchain-1.0
type .env | findstr PINATA
```

Si faltan, agregar:
```env
VITE_PINATA_API_KEY=tu_api_key
VITE_PINATA_SECRET_KEY=tu_secret_key
```

### Problema: Edge Functions no responden

**Causa:** No están desplegadas o Supabase está caído

**Solución:**
```powershell
# Verificar estado de Supabase
curl https://hykegpmjnpaupvwptxtl.supabase.co/rest/v1/

# Redesplegar funciones
npx supabase functions deploy generate-nft-certificate
npx supabase functions deploy oriluxchain-webhook
```

---

## 📊 FLUJO COMPLETO ESPERADO

```
1. Usuario crea certificado en Veralix
   ↓
2. Veralix → Supabase Edge Function "generate-nft-certificate"
   ↓
3. Edge Function genera imagen y metadata
   ↓
4. Edge Function sube a IPFS (Pinata)
   ↓
5. Edge Function guarda en Supabase DB
   ↓
6. Edge Function llama a "mint-nft-crestchain"
   ↓
7. Mint function envía a Oriluxchain (vía ngrok)
   ↓
8. Oriluxchain recibe en /api/veralix/webhook
   ↓
9. Oriluxchain crea transacción en blockchain
   ↓
10. Oriluxchain mina bloque
   ↓
11. Oriluxchain responde OK
   ↓
12. Supabase actualiza estado a "verified"
   ↓
13. Usuario ve certificado verificado ✅
```

---

## ✅ CHECKLIST FINAL

Antes de considerar que todo funciona:

- [ ] Oriluxchain corriendo en http://localhost:5000
- [ ] Veralix corriendo en http://localhost:5173
- [ ] ngrok/túnel activo y mostrando URL pública
- [ ] Edge Functions desplegadas en Supabase
- [ ] Certificado creado exitosamente en Veralix
- [ ] Certificado visible en Oriluxchain dashboard
- [ ] Transacción registrada en blockchain
- [ ] Estado "verified" en Supabase

---

## 🎉 ¡ÉXITO!

Si completaste todos los pasos y el checklist está ✅, tienes:

- ✅ Veralix emitiendo certificados NFT
- ✅ IPFS almacenando metadata
- ✅ Oriluxchain registrando en blockchain
- ✅ Integración completa funcionando

**¡El ecosistema está vivo!** 🚀

---

## 📝 NOTAS IMPORTANTES

### Para desarrollo continuo:
- ngrok URL cambia cada vez que lo reinicias (versión gratuita)
- Necesitas actualizar `.env` cada vez que cambies la URL
- Mantén las 4 terminales abiertas mientras trabajas

### Para producción:
- Oriluxchain debe estar en un servidor con IP pública
- Usar dominio real (ej: api.oriluxchain.com)
- Configurar SSL/HTTPS
- Usar base de datos persistente
- Implementar rate limiting y seguridad

---

**Última actualización:** 25 de Noviembre, 2025 - 5:40 PM
