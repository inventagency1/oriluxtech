# 🚀 DEPLOYMENT RÁPIDO - ORILUXCHAIN EN HOSTINGER

## ⚡ GUÍA EXPRESS (15 MINUTOS)

---

## 📋 PASO 1: PREPARAR LOCALMENTE (2 min)

### **1.1 Crear archivo .env**

```bash
# En tu carpeta Oriluxchain
cp .env.example .env
```

### **1.2 Editar .env**

Abre `.env` y configura:

```env
PORT=5000
BRIDGE_PORT=5001
DIFFICULTY=3
VERALIX_URL=https://veralix.io
VERALIX_API_KEY=  # Dejar vacío por ahora
DOMAIN=blockchain.veralix.io  # Cambiar por tu dominio
```

---

## 📤 PASO 2: SUBIR A GITHUB (3 min)

### **Opción A: Si ya tienes repo**

```bash
git add .
git commit -m "Add Docker deployment configuration"
git push origin main
```

### **Opción B: Crear nuevo repo**

1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `Oriluxchain`
3. Público o Privado
4. Create repository

```bash
git init
git add .
git commit -m "Initial commit with Docker deployment"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/Oriluxchain.git
git push -u origin main
```

---

## 🖥️ PASO 3: CONECTAR A HOSTINGER (2 min)

### **3.1 SSH a tu servidor**

```bash
ssh root@TU_IP_HOSTINGER
# o
ssh usuario@TU_IP_HOSTINGER
```

### **3.2 Verificar Docker**

```bash
docker --version
docker-compose --version
```

Si no están instalados:

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y
```

---

## 🐳 PASO 4: DEPLOY CON PORTAINER (5 min)

### **4.1 Acceder a Portainer**

1. Abre navegador
2. Ve a: `http://TU_IP_HOSTINGER:9000`
3. Login

### **4.2 Crear Stack**

1. **Stacks** → **+ Add stack**
2. **Name**: `oriluxchain`
3. **Build method**: Selecciona **Repository**

### **4.3 Configurar Repository**

```
Repository URL: https://github.com/TU_USUARIO/Oriluxchain
Repository reference: refs/heads/main
Compose path: docker-compose.yml
```

Si es repo privado:
- Username: tu_usuario_github
- Personal access token: [Crear aquí](https://github.com/settings/tokens)

### **4.4 Variables de Entorno**

Añade estas variables (click en **+ add an environment variable**):

```
Name: DIFFICULTY          Value: 3
Name: VERALIX_URL         Value: https://veralix.io
Name: DOMAIN              Value: blockchain.veralix.io
```

### **4.5 Deploy**

1. Click **Deploy the stack**
2. Espera 2-3 minutos
3. Verás los containers iniciando

---

## ✅ PASO 5: VERIFICAR (2 min)

### **5.1 En Portainer**

1. **Containers** → Verifica que estén **running**:
   - `oriluxchain_node`
   - `orilux_nginx`

2. Click en `oriluxchain_node`
3. Tab **Logs** → Busca:
```
✅ Oriluxchain iniciado correctamente
```

### **5.2 Probar API**

```bash
# Desde tu computadora
curl http://TU_IP_HOSTINGER:5000/api/info

# Debería responder con info de la blockchain
```

---

## 🌐 PASO 6: CONFIGURAR DOMINIO (3 min)

### **6.1 DNS**

En tu proveedor de DNS (Cloudflare, Hostinger, etc.):

```
Tipo: A
Nombre: blockchain
Valor: TU_IP_HOSTINGER
TTL: Auto
Proxy: Desactivado (por ahora)
```

### **6.2 Esperar propagación**

```bash
# Verificar DNS (puede tardar 5-30 min)
nslookup blockchain.veralix.io
```

---

## 🔐 PASO 7: SSL (3 min)

### **Opción A: Certbot (Recomendado)**

```bash
# SSH a Hostinger
ssh root@TU_IP_HOSTINGER

# Instalar certbot
apt update
apt install certbot -y

# Parar nginx temporalmente
docker stop orilux_nginx

# Obtener certificado
certbot certonly --standalone -d blockchain.veralix.io --email admin@veralix.io --agree-tos

# Copiar certificados
mkdir -p /opt/Oriluxchain/ssl
cp /etc/letsencrypt/live/blockchain.veralix.io/fullchain.pem /opt/Oriluxchain/ssl/cert.pem
cp /etc/letsencrypt/live/blockchain.veralix.io/privkey.pem /opt/Oriluxchain/ssl/key.pem

# Reiniciar nginx
docker start orilux_nginx
```

### **Opción B: Cloudflare SSL**

1. Cloudflare Dashboard
2. SSL/TLS → Origin Server
3. Create Certificate
4. Copiar certificado y key
5. Guardar en `/opt/Oriluxchain/ssl/`

---

## 🎯 PASO 8: PROBAR TODO (2 min)

### **8.1 Verificar HTTPS**

```bash
curl https://blockchain.veralix.io/api/info
```

### **8.2 Verificar Dashboard**

Abre navegador: `https://blockchain.veralix.io`

Deberías ver el dashboard futurista de Oriluxchain!

### **8.3 Verificar Veralix Bridge**

```bash
curl https://blockchain.veralix.io/veralix/health
```

---

## 🔗 PASO 9: CONECTAR CON VERALIX.IO

Ahora que Oriluxchain está público, puedes conectarlo desde Veralix.io:

```javascript
// En tu código de Veralix.io
const ORILUX_RPC = 'https://blockchain.veralix.io';

// Probar conexión
fetch(`${ORILUX_RPC}/api/info`)
  .then(res => res.json())
  .then(data => console.log('Oriluxchain conectado:', data));
```

---

## 📊 MONITOREO

### **Ver Logs en Tiempo Real**

Portainer → Containers → `oriluxchain_node` → Logs → Toggle **Auto-refresh**

### **Estadísticas**

Portainer → Containers → `oriluxchain_node` → Stats

### **Restart si es necesario**

Portainer → Containers → Seleccionar → **Restart**

---

## 🛠️ COMANDOS ÚTILES

### **Ver logs desde SSH**

```bash
ssh root@TU_IP_HOSTINGER
cd /opt/Oriluxchain  # o donde clonaste
docker-compose logs -f oriluxchain
```

### **Reiniciar servicios**

```bash
docker-compose restart
```

### **Actualizar código**

```bash
git pull
docker-compose up -d --build
```

### **Ver status**

```bash
docker-compose ps
```

---

## ✅ CHECKLIST FINAL

- [ ] Código en GitHub
- [ ] SSH a Hostinger funciona
- [ ] Docker y Portainer instalados
- [ ] Stack creado en Portainer
- [ ] Containers corriendo (verde en Portainer)
- [ ] API responde en puerto 5000
- [ ] DNS configurado
- [ ] SSL configurado
- [ ] HTTPS funciona
- [ ] Dashboard accesible
- [ ] Veralix.io puede conectarse

---

## 🎉 ¡LISTO!

Tu Oriluxchain está:
- ✅ Desplegado en Hostinger
- ✅ Accesible públicamente
- ✅ Con SSL/HTTPS
- ✅ Listo para conectar con Veralix.io

---

## 🚨 TROUBLESHOOTING RÁPIDO

### **Containers no inician**

```bash
docker-compose logs oriluxchain
```

### **Puerto en uso**

```bash
netstat -tulpn | grep 5000
kill -9 PID_DEL_PROCESO
```

### **SSL no funciona**

```bash
# Verificar certificados
ls -la /opt/Oriluxchain/ssl/

# Reiniciar nginx
docker restart orilux_nginx
```

### **DNS no resuelve**

```bash
# Verificar DNS
nslookup blockchain.veralix.io

# Esperar propagación (hasta 30 min)
```

---

## 📞 SIGUIENTE PASO

Ahora vamos a crear el **SDK de JavaScript** para que Veralix.io pueda comunicarse fácilmente con Oriluxchain!

---

**¡Deployment completado!** 🎊
