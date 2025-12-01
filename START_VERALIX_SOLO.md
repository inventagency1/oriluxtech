# 🚀 INICIO RÁPIDO - SOLO VERALIX-CRESTCHAIN

**Objetivo:** Levantar Veralix y probar emisión de certificados NFT (sin Oriluxchain)  
**Tiempo:** 5-10 minutos

---

## ✅ LO QUE VAMOS A PROBAR

1. ✅ Levantar Veralix frontend
2. ✅ Crear certificado de joyería
3. ✅ Generar NFT con metadata
4. ✅ Subir a IPFS (Pinata)
5. ✅ Ver certificado en Supabase
6. ✅ Verificar estado del certificado

**SIN necesidad de Oriluxchain, ngrok, ni túneles.**

---

## 🚀 PASO 1: Verificar Configuración

```powershell
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Ver variables de entorno
type .env
```

**Verificar que tienes:**
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY`
- ✅ `VITE_PINATA_API_KEY` (si falta, lo configuramos)
- ✅ `VITE_PINATA_SECRET_KEY` (si falta, lo configuramos)

---

## 🚀 PASO 2: Instalar Dependencias (Solo primera vez)

```powershell
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0

# Instalar dependencias
npm install
```

**Espera a que termine...** (puede tomar 2-3 minutos)

---

## 🚀 PASO 3: Iniciar Veralix

```powershell
# En la misma terminal
npm run dev
```

**Deberías ver:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🚀 PASO 4: Abrir en Navegador

**Abre:** http://localhost:5173

**Deberías ver:**
- Página de inicio de Veralix
- Menú de navegación
- Diseño profesional

---

## 🚀 PASO 5: Crear Cuenta o Iniciar Sesión

### Opción A: Crear Nueva Cuenta
1. Click en "Sign Up" o "Registrarse"
2. Ingresa email y contraseña
3. Verifica email (revisa tu bandeja de entrada)

### Opción B: Usar Cuenta Existente
1. Click en "Sign In" o "Iniciar Sesión"
2. Ingresa tus credenciales

---

## 🎯 PASO 6: Crear Certificado de Prueba

### 6.1. Navegar a Certificados

Busca en el menú:
- "Certificates" o "Certificados"
- "NFT Certificates"
- "Create Certificate"

### 6.2. Llenar Formulario

**Datos de ejemplo:**

```
Nombre de la Joya: Anillo de Oro Prueba
Tipo: Ring / Anillo
Material: Gold / Oro
Pureza: 18K
Peso: 5.5 gramos
Joyero: Test Jeweler
Fabricante: Test Manufacturer
País de Origen: Colombia
Descripción: Certificado de prueba para verificar integración
Valor Estimado: 1000 USD
```

### 6.3. Subir Imagen (Opcional)

Si el formulario permite subir imagen:
- Usa cualquier imagen de prueba
- O deja que el sistema genere una automáticamente

### 6.4. Enviar

Click en "Create Certificate" o "Crear Certificado"

---

## ✅ PASO 7: Verificar Resultados

### 7.1. En la UI de Veralix

**Deberías ver:**
- ✅ Loading spinner / "Creando certificado..."
- ✅ Mensaje de éxito: "Certificate created successfully"
- ✅ El certificado aparece en la lista
- ✅ Puedes hacer click para ver detalles

**Información visible:**
- ID del certificado
- Nombre de la joya
- Estado: "Pending" o "Minted"
- IPFS Hash (si se subió correctamente)
- Metadata

### 7.2. En la Consola del Navegador

**Abre DevTools (F12) → Console**

Deberías ver logs como:
```
✅ Certificate created
📦 IPFS Hash: QmXxx...
🎨 Metadata uploaded
✅ NFT minted
```

### 7.3. En Supabase Dashboard

1. Ve a: https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl
2. Click en "Table Editor"
3. Busca tabla `nft_certificates` o `jewelry_items`
4. Deberías ver tu certificado recién creado

**Campos importantes:**
- `certificate_id`
- `ipfs_hash`
- `metadata_uri`
- `status`
- `created_at`

### 7.4. En IPFS (Pinata)

Si tienes acceso a Pinata:
1. Ve a: https://app.pinata.cloud/
2. Busca el hash en "Files"
3. Deberías ver la metadata del certificado

---

## 🎊 RESULTADOS ESPERADOS

Si todo funciona correctamente:

### ✅ Frontend (Veralix)
- [x] Aplicación carga sin errores
- [x] Puedes navegar entre secciones
- [x] Formulario de certificado funciona
- [x] Se muestra feedback visual
- [x] Certificado aparece en lista

### ✅ Backend (Supabase)
- [x] Edge Functions se ejecutan
- [x] Certificado se guarda en DB
- [x] Metadata se genera correctamente
- [x] Estados se actualizan

### ✅ Storage (IPFS)
- [x] Archivos se suben a Pinata
- [x] Se obtiene hash IPFS
- [x] Metadata es accesible públicamente

### ✅ NFT (Crestchain)
- [x] Token ID se genera
- [x] Metadata apunta a IPFS
- [x] Certificado es "minteable"

---

## 🔍 FUNCIONES ADICIONALES A PROBAR

### 1. Ver Detalles del Certificado
- Click en el certificado creado
- Deberías ver toda la información
- Imagen del certificado
- Metadata completa
- Link a IPFS

### 2. Buscar Certificados
- Usa la barra de búsqueda
- Filtra por tipo, material, etc.
- Verifica que funciona

### 3. Verificar Certificado
- Busca opción "Verify" o "Verificar"
- Ingresa el ID del certificado
- Deberías ver estado de verificación

### 4. Ver en Marketplace (si existe)
- Navega a "Marketplace"
- Deberías ver joyería disponible
- Puedes ver detalles de cada pieza

### 5. Perfil de Usuario
- Ve a tu perfil
- Deberías ver tus certificados
- Estadísticas de actividad

---

## 🐛 TROUBLESHOOTING

### Problema: "npm: command not found"
**Solución:** Instalar Node.js
```powershell
# Descargar de: https://nodejs.org/
# Versión recomendada: LTS (18.x o superior)
```

### Problema: "Cannot find module"
**Solución:** Reinstalar dependencias
```powershell
rm -rf node_modules
rm package-lock.json
npm install
```

### Problema: "Supabase connection failed"
**Solución:** Verificar .env
```powershell
type .env | findstr SUPABASE
```

Debe tener:
```env
VITE_SUPABASE_URL=https://hykegpmjnpaupvwptxtl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

### Problema: "IPFS upload failed"
**Solución:** Verificar credenciales de Pinata

Si faltan en `.env`, agregar:
```env
VITE_PINATA_API_KEY=tu_api_key_aqui
VITE_PINATA_SECRET_KEY=tu_secret_key_aqui
```

**Obtener keys de Pinata:**
1. Ve a: https://app.pinata.cloud/
2. Sign up / Sign in
3. API Keys → New Key
4. Copia API Key y Secret

### Problema: "Port 5173 already in use"
**Solución:** Matar proceso o usar otro puerto
```powershell
# Opción 1: Matar proceso
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Opción 2: Usar otro puerto
npm run dev -- --port 3000
```

### Problema: Edge Functions no responden
**Solución:** Verificar en Supabase Dashboard

1. Ve a: https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl
2. Edge Functions → Verifica que estén desplegadas
3. Logs → Revisa errores

**Redesplegar si es necesario:**
```powershell
npx supabase functions deploy generate-nft-certificate
npx supabase functions deploy mint-nft-crestchain
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Pre-requisitos
- [ ] Node.js instalado (v18+)
- [ ] npm instalado
- [ ] Cuenta Supabase activa
- [ ] Cuenta Pinata (opcional pero recomendado)

### Configuración
- [ ] `.env` existe y tiene variables
- [ ] `node_modules` instalado
- [ ] Supabase credentials correctas
- [ ] Pinata credentials (si aplica)

### Ejecución
- [ ] `npm run dev` corre sin errores
- [ ] http://localhost:5173 carga
- [ ] Puedes iniciar sesión
- [ ] Formulario de certificado visible

### Prueba
- [ ] Certificado creado exitosamente
- [ ] Aparece en lista
- [ ] Tiene IPFS hash
- [ ] Visible en Supabase
- [ ] Metadata accesible

---

## 🎯 PRÓXIMOS PASOS (Después de probar)

Una vez que Veralix funcione correctamente:

1. ✅ **Integrar con Oriluxchain** (siguiente fase)
   - Configurar webhook
   - Usar ngrok
   - Conectar ambos sistemas

2. ✅ **Probar flujo completo**
   - Certificado en Veralix
   - Registro en Oriluxchain
   - Verificación en blockchain

3. ✅ **Deploy a producción**
   - Cloudflare Pages para Veralix
   - Servidor para Oriluxchain
   - Configurar dominio

---

## 📝 NOTAS IMPORTANTES

### Lo que funciona SIN Oriluxchain:
- ✅ Crear certificados
- ✅ Generar NFTs
- ✅ Subir a IPFS
- ✅ Ver en Supabase
- ✅ Marketplace
- ✅ Verificación básica

### Lo que necesita Oriluxchain:
- ⏳ Registro en blockchain real
- ⏳ Verificación descentralizada
- ⏳ Historial inmutable
- ⏳ Smart contracts
- ⏳ Tokens ORX/VRX

---

## ✨ ¡LISTO PARA EMPEZAR!

```powershell
cd C:\Users\Sebastian\Desktop\Oriluxchain\veralix-crestchain\veralix-crestchain-1.0
npm install
npm run dev
```

**Luego abre:** http://localhost:5173

---

**¿Algún error? Revisa la sección Troubleshooting arriba.** 🔧

**Última actualización:** 25 de Noviembre, 2025 - 5:50 PM
