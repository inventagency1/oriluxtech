# 🌐 ACCESO AL FRONTEND DE ORILUXCHAIN

**Status:** 🟢 Backend corriendo en puerto 5000  
**Fecha:** 24 de Noviembre, 2025

---

## 🎯 SITUACIÓN ACTUAL

✅ **Backend (API):** Corriendo en `http://localhost:5000`  
✅ **Templates HTML:** Disponibles en `/templates`  
🟡 **Frontend:** Accesible vía navegador

---

## 🌐 PÁGINAS DISPONIBLES

### 1. Dashboard Principal
```
http://localhost:5000/
```
**Descripción:** Página principal con información de la blockchain

### 2. Dashboard Futurista
```
http://localhost:5000/futuristic
```
**Descripción:** Dashboard con diseño moderno y futurista

### 3. Login
```
http://localhost:5000/login
```
**Credenciales:**
- Usuario: `superadm`
- Password: `OriluxSecure2025!@#$%^&*()_+`

### 4. Registro
```
http://localhost:5000/register
```
**Descripción:** Crear nueva cuenta de usuario

### 5. Verificar Certificado
```
http://localhost:5000/verify_certificate
```
**Descripción:** Verificar certificados de joyería en la blockchain

---

## 🚀 CÓMO ACCEDER

### Opción 1: Navegador Web
1. Abre tu navegador favorito (Chrome, Firefox, Edge)
2. Ve a: `http://localhost:5000`
3. Explora las diferentes páginas

### Opción 2: Browser Preview (IDE)
Ya está abierto en tu IDE en: `http://127.0.0.1:57996`

---

## 📱 RUTAS DISPONIBLES

### Páginas Web (HTML)
```
GET  /                      → Dashboard principal
GET  /futuristic            → Dashboard futurista
GET  /login                 → Página de login
GET  /register              → Página de registro
GET  /verify_certificate    → Verificar certificados
```

### API Endpoints (JSON)
```
GET  /chain                 → Ver blockchain completa
GET  /balance/<address>     → Ver balance de una dirección
POST /mine                  → Minar nuevo bloque (requiere API key)
POST /transactions/new      → Nueva transacción (requiere API key)
GET  /nodes                 → Ver nodos conectados
POST /nodes/register        → Registrar nuevo nodo
GET  /nodes/resolve         → Sincronizar con otros nodos
```

### Tokens
```
POST /tokens/swap           → Intercambiar ORX ↔ VRX
POST /tokens/stake          → Stakear VRX
POST /tokens/unstake        → Retirar VRX stakeado
GET  /tokens/staking-info   → Info del staking pool
```

### Smart Contracts
```
POST /contracts/deploy      → Desplegar contrato
POST /contracts/execute     → Ejecutar contrato
GET  /contracts/<address>   → Ver contrato
```

### Certificados
```
POST /certificates/register → Registrar certificado de joyería
GET  /certificates/<id>     → Ver certificado
POST /certificates/verify   → Verificar autenticidad
```

---

## 🎨 CARACTERÍSTICAS DEL FRONTEND

### Dashboard Principal
- ✅ Visualización de bloques
- ✅ Estadísticas en tiempo real
- ✅ Lista de transacciones
- ✅ Información de nodos

### Dashboard Futurista
- ✅ Diseño moderno con animaciones
- ✅ Gráficos interactivos
- ✅ Métricas en tiempo real
- ✅ Tema oscuro/claro

### Sistema de Autenticación
- ✅ Login/Logout
- ✅ Registro de usuarios
- ✅ Sesiones persistentes
- ✅ Roles (admin/usuario)

### Certificados de Joyería
- ✅ Registro en blockchain
- ✅ Verificación de autenticidad
- ✅ Historial de propiedad
- ✅ Imágenes y metadata

---

## 🔧 PERSONALIZACIÓN

### Cambiar Puerto
Editar `.env`:
```bash
PORT=8080  # Cambiar a otro puerto
```

### Cambiar Tema
Los templates están en:
```
c:\Users\Sebastian\Desktop\Oriluxchain\templates\
```

### Archivos Estáticos
CSS, JS, imágenes en:
```
c:\Users\Sebastian\Desktop\Oriluxchain\static\
```

---

## 🧪 PRUEBAS RÁPIDAS

### Test 1: Ver Dashboard
```
http://localhost:5000/
```
**Esperado:** Página con información de la blockchain

### Test 2: Login
```
http://localhost:5000/login
```
**Credenciales:**
- Usuario: `superadm`
- Password: `OriluxSecure2025!@#$%^&*()_+`

### Test 3: API desde Frontend
Abre la consola del navegador (F12) y ejecuta:
```javascript
fetch('http://localhost:5000/chain')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## 📊 ARQUITECTURA ACTUAL

```
┌─────────────────────────────────────┐
│         NAVEGADOR WEB               │
│  http://localhost:5000              │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      FLASK WEB SERVER               │
│      Puerto 5000                    │
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │  Templates  │  │  Static      │ │
│  │  (HTML)     │  │  (CSS/JS)    │ │
│  └─────────────┘  └──────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     API REST                │   │
│  │  - /chain                   │   │
│  │  - /mine                    │   │
│  │  - /transactions            │   │
│  └─────────────────────────────┘   │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      BLOCKCHAIN CORE                │
│  - Bloques                          │
│  - Transacciones                    │
│  - Smart Contracts                  │
│  - Tokens (ORX/VRX)                 │
└─────────────────────────────────────┘
```

---

## 🎯 PRÓXIMOS PASOS

### Para Desarrollo
1. **Explorar el dashboard** en el navegador
2. **Hacer login** con superadm
3. **Probar funcionalidades** (minar, transacciones)
4. **Verificar certificados** de joyería

### Para Producción
1. **Configurar dominio** (chain.oriluxtech.com)
2. **Agregar HTTPS** (SSL/TLS)
3. **Optimizar frontend** (minificar CSS/JS)
4. **CDN** para assets estáticos

---

## 🔒 SEGURIDAD FRONTEND

### Implementado
- ✅ Autenticación de usuarios
- ✅ Sesiones seguras
- ✅ CSRF protection (Flask)
- ✅ Rate limiting en API

### Pendiente
- ⏳ HTTPS/SSL
- ⏳ Content Security Policy
- ⏳ XSS protection mejorada
- ⏳ Input sanitization frontend

---

## 💡 TIPS

### Desarrollo
```powershell
# Ver logs en tiempo real
# Los logs aparecen en la terminal donde ejecutaste python main.py

# Recargar cambios
# Flask auto-reload está activado en desarrollo
# Solo guarda los archivos y recarga el navegador
```

### Debug
```python
# En main.py, activar debug mode
app.run(debug=True, port=5000)
```

### Performance
```python
# Para producción, usar gunicorn o waitress
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

---

## 🆘 TROUBLESHOOTING

### Problema: Página no carga
**Solución:**
1. Verificar que el backend está corriendo
2. Abrir http://localhost:5000 en navegador
3. Revisar logs en la terminal

### Problema: 404 Not Found
**Solución:**
- Verificar que la ruta existe en `api.py`
- Verificar que el template existe en `/templates`

### Problema: Estilos no cargan
**Solución:**
- Verificar que `/static` tiene los archivos CSS
- Limpiar caché del navegador (Ctrl+Shift+R)

### Problema: API no responde
**Solución:**
- Verificar que usas la API key correcta
- Revisar que el endpoint requiere autenticación

---

## 📞 ACCESO RÁPIDO

### URLs Principales
```
Dashboard:     http://localhost:5000/
API Chain:     http://localhost:5000/chain
Login:         http://localhost:5000/login
Certificados:  http://localhost:5000/verify_certificate
```

### Browser Preview (IDE)
```
http://127.0.0.1:57996
```

---

## ✅ CHECKLIST

- [x] Backend corriendo
- [x] Puerto 5000 abierto
- [x] Templates disponibles
- [x] Browser preview activo
- [ ] Explorar dashboard
- [ ] Hacer login
- [ ] Probar funcionalidades
- [ ] Verificar certificados

---

**Última Actualización:** 24 Nov 2025 17:32  
**Status:** 🟢 FRONTEND ACCESIBLE  
**URL:** http://localhost:5000
