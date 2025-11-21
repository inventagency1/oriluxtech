#!/bin/bash
set -e

echo "🚀 Iniciando Oriluxchain..."

# Instalar dependencias del sistema
echo "📦 Instalando dependencias del sistema..."
apt-get update
apt-get install -y git gcc g++ make libssl-dev curl

# Clonar repositorio
echo "📥 Clonando repositorio..."
git clone https://github.com/inventagency1/oriluxtech.git /app
cd /app

# Instalar dependencias Python
echo "🐍 Instalando dependencias Python..."
pip install --no-cache-dir -r requirements.txt
pip install --no-cache-dir --force-reinstall Flask-Login==0.6.3

# Iniciar aplicación
echo "✅ Iniciando Oriluxchain..."
python start_with_veralix.py
