#!/bin/bash

# Oriluxchain Deployment Script
# For Hostinger with Portainer

set -e

echo "🚀 Oriluxchain Deployment Script"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your configuration${NC}"
    exit 1
fi

# Load environment variables
source .env

echo -e "${GREEN}✅ Environment variables loaded${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose is installed${NC}"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p data
mkdir -p ssl

echo -e "${GREEN}✅ Directories created${NC}"

# Build Docker image
echo "🔨 Building Docker image..."
docker-compose build

echo -e "${GREEN}✅ Docker image built${NC}"

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker-compose down

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

echo -e "${GREEN}✅ Containers started${NC}"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if Oriluxchain is running
if curl -f http://localhost:5000/api/info > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Oriluxchain is running!${NC}"
else
    echo -e "${RED}❌ Oriluxchain failed to start${NC}"
    echo "📋 Checking logs..."
    docker-compose logs oriluxchain
    exit 1
fi

# Display status
echo ""
echo "=================================="
echo -e "${GREEN}🎉 Deployment Successful!${NC}"
echo "=================================="
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "🌐 Access Points:"
echo "   - Dashboard: http://localhost:5000"
echo "   - API: http://localhost:5000/api/info"
echo "   - Veralix Bridge: http://localhost:5001/api/veralix/health"
echo ""
echo "📝 Useful Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop: docker-compose down"
echo "   - Restart: docker-compose restart"
echo "   - Update: git pull && docker-compose up -d --build"
echo ""
echo "🔐 Next Steps:"
echo "   1. Configure SSL certificates in ./ssl/"
echo "   2. Update nginx.conf with your domain"
echo "   3. Configure DNS to point to your server"
echo "   4. Test from Veralix.io"
echo ""
