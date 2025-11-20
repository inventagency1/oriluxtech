# 🐳 GUÍA DE DEPLOYMENT CON PORTAINER

## Desplegar Oriluxchain en Hostinger usando Portainer

---

## 📋 REQUISITOS PREVIOS

- ✅ Servidor Hostinger con Docker instalado
- ✅ Portainer instalado y funcionando
- ✅ Acceso SSH al servidor
- ✅ Dominio o subdominio configurado (opcional)

---

## 🚀 MÉTODO 1: DEPLOY VÍA PORTAINER UI (MÁS FÁCIL)

### **Paso 1: Acceder a Portainer**

1. Abre tu navegador
2. Ve a: `http://TU_IP_HOSTINGER:9000` o `https://TU_IP_HOSTINGER:9443`
3. Login con tus credenciales

### **Paso 2: Crear Stack**

1. En el menú lateral → **Stacks**
2. Click en **+ Add stack**
3. Nombre del stack: `oriluxchain`

### **Paso 3: Configurar Stack**

#### **Opción A: Web editor**

1. Selecciona **Web editor**
2. Copia y pega el contenido de `docker-compose.yml`
3. Scroll down a **Environment variables**

#### **Opción B: Git Repository** (Recomendado)

1. Selecciona **Repository**
2. Repository URL: `https://github.com/TU_USUARIO/Oriluxchain`
3. Repository reference: `refs/heads/main`
4. Compose path: `docker-compose.yml`
5. Authentication: Si es repo privado, añade credenciales

### **Paso 4: Variables de Entorno**

Añade estas variables:

```
DIFFICULTY=3
VERALIX_URL=https://veralix.io
VERALIX_API_KEY=tu_api_key_aqui
DOMAIN=blockchain.veralix.io
```

### **Paso 5: Deploy**

1. Click en **Deploy the stack**
2. Espera a que se descarguen las imágenes
3. Verifica que los contenedores estén corriendo

### **Paso 6: Verificar**

1. En Portainer → **Containers**
2. Deberías ver:
   - `oriluxchain_node` (running)
   - `orilux_nginx` (running)

3. Click en `oriluxchain_node`
4. Tab **Logs** → Verifica que no haya errores
5. Tab **Stats** → Verifica uso de recursos

---

## 🚀 MÉTODO 2: DEPLOY VÍA SSH (MÁS CONTROL)

### **Paso 1: Conectar por SSH**

```bash
ssh root@TU_IP_HOSTINGER
```

### **Paso 2: Clonar Repositorio**

```bash
cd /opt
git clone https://github.com/TU_USUARIO/Oriluxchain.git
cd Oriluxchain
```

### **Paso 3: Configurar Variables**

```bash
cp .env.example .env
nano .env
```

Edita las variables:
```
VERALIX_URL=https://veralix.io
VERALIX_API_KEY=tu_key
DOMAIN=blockchain.veralix.io
```

Guarda: `Ctrl+X`, `Y`, `Enter`

### **Paso 4: Deploy**

```bash
chmod +x deploy.sh
./deploy.sh
```

### **Paso 5: Verificar en Portainer**

1. Abre Portainer
2. Verás los contenedores automáticamente
3. Puedes gestionarlos desde la UI

---

## 🔐 CONFIGURAR SSL CON LET'S ENCRYPT

### **Opción A: Certbot Manual**

```bash
# Instalar certbot
apt update
apt install certbot -y

# Obtener certificado
certbot certonly --standalone -d blockchain.veralix.io

# Copiar certificados
cp /etc/letsencrypt/live/blockchain.veralix.io/fullchain.pem /opt/Oriluxchain/ssl/cert.pem
cp /etc/letsencrypt/live/blockchain.veralix.io/privkey.pem /opt/Oriluxchain/ssl/key.pem

# Reiniciar nginx
docker-compose restart nginx
```

### **Opción B: Certbot con Docker**

```bash
docker run -it --rm \
  -v /opt/Oriluxchain/ssl:/etc/letsencrypt \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d blockchain.veralix.io \
  --email admin@veralix.io \
  --agree-tos
```

### **Auto-renovación**

```bash
# Crear cron job
crontab -e

# Añadir esta línea (renueva cada día a las 3am)
0 3 * * * certbot renew --quiet && docker-compose -f /opt/Oriluxchain/docker-compose.yml restart nginx
```

---

## 🌐 CONFIGURAR DOMINIO

### **Paso 1: DNS**

En tu proveedor de DNS (Cloudflare, etc.):

```
Tipo: A
Nombre: blockchain
Valor: TU_IP_HOSTINGER
TTL: Auto
Proxy: Desactivado (para SSL directo)
```

### **Paso 2: Actualizar nginx.conf**

```bash
nano /opt/Oriluxchain/nginx.conf
```

Cambia:
```nginx
server_name blockchain.veralix.io;  # TU DOMINIO AQUÍ
```

### **Paso 3: Reiniciar**

```bash
docker-compose restart nginx
```

### **Paso 4: Verificar**

```bash
curl https://blockchain.veralix.io/api/info
```

---

## 📊 MONITOREO EN PORTAINER

### **Ver Logs en Tiempo Real**

1. Portainer → **Containers**
2. Click en `oriluxchain_node`
3. Tab **Logs**
4. Toggle **Auto-refresh logs**

### **Ver Estadísticas**

1. Click en container
2. Tab **Stats**
3. Verás:
   - CPU usage
   - Memory usage
   - Network I/O
   - Block I/O

### **Consola Interactiva**

1. Click en container
2. Tab **Console**
3. Click **Connect**
4. Ejecuta comandos:

```bash
# Ver archivos
ls -la

# Ver logs de Python
tail -f logs/oriluxchain.log

# Verificar blockchain
python -c "from blockchain import Blockchain; b = Blockchain(); print(len(b.chain))"
```

---

## 🔄 ACTUALIZAR ORILUXCHAIN

### **Método 1: Desde Portainer**

1. **Stacks** → `oriluxchain`
2. Click **Editor**
3. Si usas Git, click **Pull and redeploy**
4. Si usas Web editor, actualiza el código y click **Update the stack**

### **Método 2: Desde SSH**

```bash
cd /opt/Oriluxchain
git pull
docker-compose up -d --build
```

### **Método 3: Recrear Stack**

1. Portainer → **Stacks** → `oriluxchain`
2. Click **Delete this stack**
3. Crear nuevo stack con código actualizado

---

## 🛠️ TROUBLESHOOTING

### **Problema: Container no inicia**

```bash
# Ver logs
docker-compose logs oriluxchain

# Ver logs detallados
docker logs oriluxchain_node --tail 100
```

### **Problema: Puerto en uso**

```bash
# Ver qué usa el puerto
netstat -tulpn | grep 5000

# Matar proceso
kill -9 PID
```

### **Problema: Sin conexión a Veralix**

```bash
# Verificar conectividad
docker exec oriluxchain_node curl https://veralix.io

# Verificar variables
docker exec oriluxchain_node env | grep VERALIX
```

### **Problema: SSL no funciona**

```bash
# Verificar certificados
ls -la /opt/Oriluxchain/ssl/

# Verificar nginx config
docker exec orilux_nginx nginx -t

# Ver logs de nginx
docker logs orilux_nginx
```

---

## 📋 COMANDOS ÚTILES

### **Docker Compose**

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar todo
docker-compose restart

# Parar todo
docker-compose down

# Iniciar todo
docker-compose up -d

# Rebuild y reiniciar
docker-compose up -d --build

# Ver uso de recursos
docker stats
```

### **Containers Individuales**

```bash
# Reiniciar Oriluxchain
docker restart oriluxchain_node

# Ver logs de Oriluxchain
docker logs -f oriluxchain_node

# Entrar al container
docker exec -it oriluxchain_node bash

# Ver procesos
docker top oriluxchain_node
```

---

## ✅ CHECKLIST DE DEPLOYMENT

- [ ] Portainer accesible
- [ ] Docker y Docker Compose instalados
- [ ] Código subido al servidor
- [ ] `.env` configurado
- [ ] Stack creado en Portainer
- [ ] Containers corriendo
- [ ] API respondiendo en puerto 5000
- [ ] Dominio configurado (DNS)
- [ ] SSL configurado
- [ ] HTTPS funcionando
- [ ] Veralix.io puede conectarse
- [ ] Logs sin errores
- [ ] Backup configurado

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Verificar que todo funciona
2. ✅ Probar desde Veralix.io
3. ✅ Configurar monitoreo
4. ✅ Configurar backups
5. ✅ Documentar para el equipo

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs en Portainer
2. Verifica las variables de entorno
3. Consulta este documento
4. Contacta al equipo

---

**¡Oriluxchain desplegado con éxito en Hostinger + Portainer!** 🎉
