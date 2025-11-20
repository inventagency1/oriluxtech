# 🚀 ORILUXCHAIN - DEPLOYMENT GUIDE

## Guía Completa para Desplegar Oriluxchain y Conectar con Veralix.io

---

## 🎯 Opciones de Deployment

### **Opción 1: Railway.app** (Recomendada) ⭐⭐⭐⭐⭐

**Ventajas**:
- ✅ Deploy automático desde GitHub
- ✅ SSL/TLS gratis
- ✅ Dominio personalizado
- ✅ Escalado automático
- ✅ $5 gratis al mes

**Pasos**:

1. **Crear cuenta** en [Railway.app](https://railway.app)

2. **Preparar el proyecto**:
```bash
# Crear railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python start_with_veralix.py --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. **Push a GitHub**:
```bash
git add .
git commit -m "Preparar para Railway deployment"
git push origin main
```

4. **Deploy en Railway**:
   - New Project → Deploy from GitHub
   - Seleccionar repo
   - Configurar variables de entorno
   - Deploy!

5. **Variables de Entorno**:
```
PORT=5000
VERALIX_URL=https://veralix.io
VERALIX_API_KEY=tu_api_key_aqui
DIFFICULTY=3
```

6. **URL Final**:
```
https://oriluxchain-production.up.railway.app
```

---

### **Opción 2: Render.com** ⭐⭐⭐⭐

**Ventajas**:
- ✅ Free tier generoso
- ✅ Auto-deploy desde GitHub
- ✅ SSL automático
- ✅ Fácil configuración

**Pasos**:

1. **Crear render.yaml**:
```yaml
services:
  - type: web
    name: oriluxchain
    env: python
    region: oregon
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: python start_with_veralix.py --port $PORT
    envVars:
      - key: VERALIX_URL
        value: https://veralix.io
      - key: VERALIX_API_KEY
        sync: false
      - key: DIFFICULTY
        value: 3
```

2. **Deploy**:
   - New → Web Service
   - Connect GitHub
   - Deploy

3. **URL Final**:
```
https://oriluxchain.onrender.com
```

---

### **Opción 3: Fly.io** ⭐⭐⭐⭐

**Ventajas**:
- ✅ Edge deployment (más rápido)
- ✅ Free tier disponible
- ✅ CLI poderoso

**Pasos**:

1. **Instalar Fly CLI**:
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login**:
```bash
fly auth login
```

3. **Crear fly.toml**:
```toml
app = "oriluxchain"
primary_region = "mia"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"
  VERALIX_URL = "https://veralix.io"
  DIFFICULTY = "3"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

4. **Deploy**:
```bash
fly launch
fly deploy
```

5. **URL Final**:
```
https://oriluxchain.fly.dev
```

---

### **Opción 4: DigitalOcean** ⭐⭐⭐

**Ventajas**:
- ✅ Control total
- ✅ $200 crédito gratis
- ✅ Escalable

**Pasos**:

1. **Crear Droplet**:
   - Ubuntu 22.04
   - Basic plan ($6/mes)
   - Datacenter cerca de ti

2. **SSH al servidor**:
```bash
ssh root@tu_ip
```

3. **Instalar dependencias**:
```bash
apt update
apt install python3 python3-pip git nginx -y
```

4. **Clonar repo**:
```bash
git clone https://github.com/tu-usuario/Oriluxchain.git
cd Oriluxchain
pip3 install -r requirements.txt
```

5. **Crear servicio systemd**:
```bash
nano /etc/systemd/system/oriluxchain.service
```

```ini
[Unit]
Description=Oriluxchain Node
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/Oriluxchain
Environment="VERALIX_URL=https://veralix.io"
Environment="VERALIX_API_KEY=tu_key"
ExecStart=/usr/bin/python3 start_with_veralix.py --port 5000
Restart=always

[Install]
WantedBy=multi-user.target
```

6. **Iniciar servicio**:
```bash
systemctl enable oriluxchain
systemctl start oriluxchain
systemctl status oriluxchain
```

7. **Configurar Nginx**:
```bash
nano /etc/nginx/sites-available/oriluxchain
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Activar sitio**:
```bash
ln -s /etc/nginx/sites-available/oriluxchain /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

9. **SSL con Let's Encrypt**:
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d tu-dominio.com
```

---

## 🔗 Conectar con Veralix.io

### **Paso 1: Obtener API Key**

1. Ir a [Veralix.io](https://veralix.io)
2. Login o Register
3. Dashboard → API Keys
4. Generate New Key
5. Copiar key

### **Paso 2: Configurar en Deployment**

**Railway/Render**:
- Añadir variable: `VERALIX_API_KEY=tu_key`

**Fly.io**:
```bash
fly secrets set VERALIX_API_KEY=tu_key
```

**DigitalOcean**:
- Editar `/etc/systemd/system/oriluxchain.service`
- Añadir: `Environment="VERALIX_API_KEY=tu_key"`
- Reiniciar: `systemctl restart oriluxchain`

### **Paso 3: Verificar Conexión**

```bash
curl https://tu-nodo.railway.app/api/veralix/status
```

Respuesta esperada:
```json
{
  "connected": true,
  "sync_enabled": true,
  "blockchain_info": {
    "blocks": 1,
    "pending_tx": 0,
    "contracts": 0
  }
}
```

---

## 🌐 Configurar Dominio Personalizado

### **Railway**:
1. Settings → Domains
2. Add Custom Domain
3. Configurar DNS:
```
CNAME @ oriluxchain-production.up.railway.app
```

### **Render**:
1. Settings → Custom Domain
2. Add Domain
3. Configurar DNS:
```
CNAME @ oriluxchain.onrender.com
```

### **Cloudflare** (Recomendado):
1. Añadir sitio a Cloudflare
2. Configurar DNS:
```
A @ tu_ip_servidor
CNAME www oriluxchain.tu-dominio.com
```
3. SSL/TLS → Full (strict)
4. Speed → Auto Minify (todo)

---

## 📊 Monitoreo

### **Logs en Railway**:
```bash
railway logs
```

### **Logs en Render**:
- Dashboard → Logs tab

### **Logs en DigitalOcean**:
```bash
journalctl -u oriluxchain -f
```

### **Uptime Monitoring**:
- [UptimeRobot](https://uptimerobot.com) - Gratis
- [Pingdom](https://www.pingdom.com) - 30 días gratis
- [StatusCake](https://www.statuscake.com) - Gratis

---

## 🔐 Seguridad

### **Firewall (DigitalOcean)**:
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### **Rate Limiting**:
```python
# En api.py
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour", "10 per minute"]
)
```

### **API Key Rotation**:
- Rotar cada 30 días
- Usar variables de entorno
- Nunca commitear keys

---

## 🚀 Quick Deploy

### **Un Solo Comando**:

```bash
# Railway
railway up

# Render
render deploy

# Fly.io
fly deploy
```

---

## 📱 Integrar con Veralix.io Frontend

### **Desde Veralix.io**:

```javascript
// En tu app de Veralix.io
const ORILUX_RPC = 'https://oriluxchain-production.up.railway.app';

// Conectar
const response = await fetch(`${ORILUX_RPC}/api/info`);
const data = await response.json();

console.log('Oriluxchain conectado:', data);

// Crear transacción
const tx = await fetch(`${ORILUX_RPC}/transactions/new`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sender: wallet.address,
    recipient: to,
    amount: 100,
    token: 'ORX'
  })
});
```

---

## 🎯 Checklist de Deployment

- [ ] Código en GitHub
- [ ] requirements.txt actualizado
- [ ] Variables de entorno configuradas
- [ ] API Key de Veralix obtenida
- [ ] Deployment exitoso
- [ ] Health check pasando
- [ ] Conexión a Veralix verificada
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL/TLS activo
- [ ] Monitoreo configurado
- [ ] Logs accesibles

---

## 🆘 Troubleshooting

### **Error: Port already in use**
```bash
# Cambiar puerto
python start_with_veralix.py --port 5001
```

### **Error: Cannot connect to Veralix**
- Verificar API Key
- Verificar URL de Veralix
- Revisar logs

### **Error: Module not found**
```bash
pip install -r requirements.txt
```

### **Error: Permission denied**
```bash
chmod +x start_with_veralix.py
```

---

## 📞 Soporte

- **Documentación**: `VERALIX_INTEGRATION.md`
- **Issues**: GitHub Issues
- **Email**: support@oriluxchain.io

---

**¡Oriluxchain desplegado y conectado a Veralix.io!** 🚀✨
