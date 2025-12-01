# 🔐 CREDENCIALES DE ACCESO - ORILUXCHAIN

## ✅ CREDENCIALES ACTUALIZADAS Y FUNCIONANDO

### Opción 1: Usuario Simple (Recomendado para pruebas)
```
URL: http://localhost:5000
Usuario: admin
Contraseña: admin123
```

### Opción 2: Super Admin
```
URL: http://localhost:5000
Usuario: superadm
Contraseña: OriluxSecure2025!@#$%^&*()_+
```

---

## 🎯 PASOS PARA ACCEDER

1. **Asegúrate de que Oriluxchain esté corriendo**
   - Si no está corriendo, ejecuta: `python start_with_veralix.py`

2. **Abre tu navegador**
   - Ve a: http://localhost:5000

3. **Inicia sesión**
   - Usa cualquiera de las credenciales de arriba
   - Recomendado: `admin` / `admin123` (más fácil de recordar)

---

## 🛠️ Scripts Útiles

### Resetear contraseña del superadmin
```bash
python reset_admin_password.py
```
Este script sincroniza la contraseña del superadmin con la del archivo .env

### Crear nuevos usuarios admin
```bash
python create_simple_admin.py
```
Este script crea usuarios admin con contraseñas simples

---

## 🔧 Solución de Problemas

### Si las credenciales no funcionan:

1. **Verifica que Oriluxchain esté corriendo**
   ```bash
   python -c "import requests; print(requests.get('http://localhost:5000/').status_code)"
   ```
   Debería mostrar: `200`

2. **Resetea la contraseña**
   ```bash
   python reset_admin_password.py
   ```

3. **Verifica el archivo de usuarios**
   - Ubicación: `data/users.json`
   - Debe contener los usuarios `superadm` y `admin`

4. **Reinicia Oriluxchain**
   - Presiona CTRL+C en la terminal
   - Ejecuta de nuevo: `python start_with_veralix.py`

---

## 📝 Crear Nuevos Usuarios

### Desde el código:
```python
from auth import UserManager

user_manager = UserManager()

# Crear usuario normal
user_manager.create_user('usuario', 'contraseña', is_admin=False)

# Crear usuario admin
user_manager.create_user('nuevo_admin', 'contraseña', is_admin=True)
```

### Desde la interfaz web:
1. Accede a http://localhost:5000/register
2. Completa el formulario de registro
3. Los nuevos usuarios NO son admin por defecto

---

## 🔑 API Keys (Para requests programáticos)

Si necesitas hacer requests a la API sin login web:

```
API Key 1: orilux_api_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
API Key 2: orilux_api_b9c8d7e6f5g4h3i2j1k0l9m8n7o6p5q4r3s2t1u0v9w8x7y6z5
```

Uso:
```javascript
fetch('http://localhost:5000/api/blockchain/info', {
  headers: {
    'Authorization': 'Bearer orilux_api_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
  }
})
```

---

## ✅ RESUMEN RÁPIDO

**Para acceder AHORA mismo:**
1. Abre: http://localhost:5000
2. Usuario: `admin`
3. Contraseña: `admin123`
4. ¡Listo! 🎉

---

**Última actualización:** 24 de noviembre, 2025 - 11:53 PM
