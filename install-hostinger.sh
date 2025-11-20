#!/bin/bash

# ORILUXCHAIN - INSTALACIÓN AUTOMÁTICA EN HOSTINGER
# Script de deployment completo

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         ORILUXCHAIN DEPLOYMENT EN HOSTINGER              ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función de log
log() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 1. VERIFICAR SISTEMA
echo -e "${BLUE}[1/8] Verificando sistema...${NC}"
if [ "$EUID" -ne 0 ]; then 
    error "Por favor ejecuta como root: sudo bash install-hostinger.sh"
fi
log "Usuario root verificado"

# 2. ACTUALIZAR SISTEMA
echo -e "${BLUE}[2/8] Actualizando sistema...${NC}"
apt update -y
apt upgrade -y
log "Sistema actualizado"

# 3. INSTALAR DOCKER
echo -e "${BLUE}[3/8] Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    log "Docker instalado"
else
    log "Docker ya está instalado"
fi

# 4. INSTALAR DOCKER COMPOSE
echo -e "${BLUE}[4/8] Instalando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
    log "Docker Compose instalado"
else
    log "Docker Compose ya está instalado"
fi

# 5. CLONAR REPOSITORIO
echo -e "${BLUE}[5/8] Clonando Oriluxchain...${NC}"
cd /opt
if [ -d "oriluxtech" ]; then
    warn "Directorio existe, actualizando..."
    cd oriluxtech
    git pull
else
    git clone https://github.com/inventagency1/oriluxtech.git
    cd oriluxtech
fi
log "Repositorio clonado"

# 6. CONFIGURAR VARIABLES
echo -e "${BLUE}[6/8] Configurando variables de entorno...${NC}"
cat > .env << EOF
# Oriluxchain Environment Variables
PORT=5000
BRIDGE_PORT=5001
DIFFICULTY=3

# Veralix Integration
VERALIX_URL=https://veralix.io
VERALIX_API_KEY=

# Domain Configuration
DOMAIN=blockchain.veralix.io
SSL_EMAIL=admin@veralix.io

# Database
POSTGRES_USER=orilux
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=oriluxchain

# Security
SECRET_KEY=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Monitoring
LOG_LEVEL=INFO
EOF
log "Variables configuradas"

# 7. CREAR DIRECTORIOS
echo -e "${BLUE}[7/8] Creando directorios...${NC}"
mkdir -p logs data ssl
log "Directorios creados"

# 8. INICIAR SERVICIOS
echo -e "${BLUE}[8/8] Iniciando Oriluxchain...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d

# Esperar a que inicie
echo "Esperando a que los servicios inicien..."
sleep 10

# Verificar
if curl -f http://localhost:5000/api/info > /dev/null 2>&1; then
    log "Oriluxchain iniciado correctamente!"
else
    error "Oriluxchain no pudo iniciar. Revisa los logs: docker-compose logs"
fi

# Mostrar información
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ✅ INSTALACIÓN COMPLETA                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Oriluxchain está corriendo!${NC}"
echo ""
echo "📊 Información del deployment:"
echo "   - Ubicación: /opt/oriluxtech"
echo "   - Puerto API: 5000"
echo "   - Puerto Bridge: 5001"
echo ""
echo "🌐 URLs de acceso:"
echo "   - API: http://$(hostname -I | awk '{print $1}'):5000/api/info"
echo "   - Dashboard: http://$(hostname -I | awk '{print $1}'):5000"
echo "   - Veralix Bridge: http://$(hostname -I | awk '{print $1}'):5001/api/veralix/health"
echo ""
echo "📋 Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Reiniciar: docker-compose restart"
echo "   - Parar: docker-compose down"
echo "   - Actualizar: git pull && docker-compose up -d --build"
echo ""
echo "🔐 Próximos pasos:"
echo "   1. Configurar DNS: A record apuntando a $(hostname -I | awk '{print $1}')"
echo "   2. Configurar SSL: bash setup-ssl.sh"
echo "   3. Conectar Veralix.io"
echo ""
echo "📝 Archivos importantes:"
echo "   - Configuración: /opt/oriluxtech/.env"
echo "   - Logs: /opt/oriluxtech/logs/"
echo "   - Data: /opt/oriluxtech/data/"
echo ""
