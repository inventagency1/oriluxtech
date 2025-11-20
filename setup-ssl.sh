#!/bin/bash

# ORILUXCHAIN - CONFIGURACIÓN SSL
# Script para configurar Let's Encrypt SSL

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              CONFIGURACIÓN SSL - ORILUXCHAIN              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor ejecuta como root: sudo bash setup-ssl.sh${NC}"
    exit 1
fi

# Pedir dominio
read -p "Ingresa tu dominio (ej: blockchain.veralix.io): " DOMAIN
read -p "Ingresa tu email (ej: admin@veralix.io): " EMAIL

echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - Asegúrate de que el DNS esté configurado"
echo "   - El dominio debe apuntar a este servidor"
echo "   - Verifica con: nslookup $DOMAIN"
echo ""
read -p "¿DNS configurado correctamente? (y/n): " DNS_OK

if [ "$DNS_OK" != "y" ]; then
    echo -e "${RED}❌ Configura el DNS primero y vuelve a ejecutar este script${NC}"
    exit 1
fi

# Instalar certbot
echo -e "${GREEN}[1/5] Instalando certbot...${NC}"
apt update
apt install certbot -y

# Parar nginx temporalmente
echo -e "${GREEN}[2/5] Parando nginx...${NC}"
cd /opt/oriluxtech
docker-compose stop nginx

# Obtener certificado
echo -e "${GREEN}[3/5] Obteniendo certificado SSL...${NC}"
certbot certonly --standalone \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Copiar certificados
echo -e "${GREEN}[4/5] Copiando certificados...${NC}"
mkdir -p /opt/oriluxtech/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/oriluxtech/ssl/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/oriluxtech/ssl/key.pem
chmod 644 /opt/oriluxtech/ssl/*.pem

# Actualizar .env
echo -e "${GREEN}[5/5] Actualizando configuración...${NC}"
sed -i "s/DOMAIN=.*/DOMAIN=$DOMAIN/" /opt/oriluxtech/.env
sed -i "s/SSL_EMAIL=.*/SSL_EMAIL=$EMAIL/" /opt/oriluxtech/.env

# Reiniciar servicios
docker-compose up -d

# Configurar renovación automática
echo "0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/oriluxtech/ssl/cert.pem && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/oriluxtech/ssl/key.pem && docker-compose -f /opt/oriluxtech/docker-compose.yml restart nginx" | crontab -

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ✅ SSL CONFIGURADO                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🔐 SSL configurado correctamente!${NC}"
echo ""
echo "🌐 Tu blockchain está disponible en:"
echo "   - HTTPS: https://$DOMAIN"
echo "   - API: https://$DOMAIN/api/info"
echo "   - Dashboard: https://$DOMAIN"
echo ""
echo "🔄 Renovación automática configurada (cada día a las 3am)"
echo ""
echo "✅ Verifica que funciona:"
echo "   curl https://$DOMAIN/api/info"
echo ""
