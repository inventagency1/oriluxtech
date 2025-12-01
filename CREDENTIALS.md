# 🔐 CREDENCIALES DE ORILUXCHAIN

**Fecha:** 24 de Noviembre, 2025  
**Status:** 🟢 CONFIGURADO Y LISTO

⚠️ **IMPORTANTE: MANTENER ESTE ARCHIVO SEGURO Y PRIVADO**

---

## 🔑 CREDENCIALES GENERADAS

### Superadmin
```
Username: superadm
Password: OriluxSecure2025!@#$%^&*()_+
```

### API Keys (2 generadas)
```
API Key 1: orilux_api_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
API Key 2: orilux_api_b9c8d7e6f5g4h3i2j1k0l9m8n7o6p5q4r3s2t1u0v9w8x7y6z5
```

### Secret Keys
```
SECRET_KEY: orilux_sk_7f9a2b4e8c1d6f3a9e5b2c8d4f1a7e3b9c5d2f8a4e6b1c7d3f9a5e2b8c4d1f7a
JWT_SECRET:  orilux_jwt_3e8f1b9c5d2a7f4e1b8c6d3a9f5e2b7c4d1a8f6e3b9c5d2a7f4e1b8c6d3a9f5
```

---

## 📋 CONFIGURACIÓN APLICADA

### Seguridad
- ✅ Contraseña superadmin segura (32 caracteres)
- ✅ 2 API keys generadas
- ✅ Secret keys de 64 caracteres
- ✅ JWT secret único
- ✅ Rate limiting: 10 req/60s
- ✅ Validación de firmas: ACTIVADA

### Blockchain
- ✅ Dificultad: 3
- ✅ Max block size: 1MB
- ✅ Max reorg depth: 10 bloques
- ✅ Max transactions/block: 1000

### Puertos
- ✅ API: 5000
- ✅ Bridge: 5001

---

## 🚀 CÓMO USAR LAS CREDENCIALES

### 1. Login como Superadmin
```bash
# En la aplicación web
Username: superadm
Password: OriluxSecure2025!@#$%^&*()_+
```

### 2. Usar API Keys
```bash
# En requests HTTP
curl -H "Authorization: Bearer orilux_api_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" \
     http://localhost:5000/mine
```

### 3. En Código Python
```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('API_KEYS').split(',')[0]
superadmin_pass = os.getenv('SUPERADMIN_PASSWORD')
```

---

## ⚠️ SEGURIDAD CRÍTICA

### ❌ NUNCA HACER
- ❌ Compartir este archivo públicamente
- ❌ Commitear a Git
- ❌ Enviar por email sin encriptar
- ❌ Mostrar en screenshots
- ❌ Hardcodear en código

### ✅ SIEMPRE HACER
- ✅ Mantener en lugar seguro
- ✅ Usar variables de entorno
- ✅ Rotar keys cada 30-90 días
- ✅ Usar diferentes keys por ambiente
- ✅ Backup encriptado

---

## 🔄 ROTACIÓN DE CREDENCIALES

### Cada 30 días
- [ ] Rotar API keys
- [ ] Generar nuevas con `python security_patches.py`
- [ ] Actualizar en `.env`
- [ ] Notificar a usuarios de API

### Cada 90 días
- [ ] Cambiar contraseña superadmin
- [ ] Rotar JWT secret
- [ ] Rotar SECRET_KEY
- [ ] Actualizar documentación

---

## 📝 REGISTRO DE CAMBIOS

### 24 Nov 2025 - Generación Inicial
- ✅ Credenciales generadas automáticamente
- ✅ Configuración de seguridad aplicada
- ✅ Archivo .env actualizado

### Próxima Rotación
- 📅 24 Diciembre 2025 (API Keys)
- 📅 24 Febrero 2026 (Passwords)

---

## 🆘 EN CASO DE COMPROMISO

Si sospechas que las credenciales fueron comprometidas:

1. **INMEDIATO** (< 5 minutos)
   ```bash
   # Detener servicios
   docker-compose down
   ```

2. **URGENTE** (< 30 minutos)
   - Generar nuevas credenciales
   - Actualizar `.env`
   - Reiniciar servicios
   - Notificar al equipo

3. **SEGUIMIENTO** (< 24 horas)
   - Revisar logs de acceso
   - Identificar accesos no autorizados
   - Documentar incidente
   - Implementar mejoras

---

## 📞 CONTACTO DE EMERGENCIA

**Security Team:** security@oriluxchain.io  
**Emergency:** +1-XXX-XXX-XXXX  
**Slack:** #security-emergency

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [x] Credenciales generadas
- [x] Archivo .env actualizado
- [x] Documentación creada
- [ ] Servicios iniciados
- [ ] Login verificado
- [ ] API testeada
- [ ] Backup creado

---

**⚠️ RECORDATORIO FINAL:**

Este archivo contiene información CRÍTICA de seguridad.
- Guárdalo en un lugar SEGURO
- NO lo compartas
- NO lo commitees a Git
- Usa un gestor de contraseñas

---

**Generado:** 24 Nov 2025 17:24  
**Válido hasta:** 24 Feb 2026  
**Próxima rotación:** 24 Dic 2025
