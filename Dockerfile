# Oriluxchain Docker Image
FROM python:3.9-slim

# Metadata
LABEL maintainer="Orilux Tech <support@oriluxchain.io>"
LABEL description="Oriluxchain - Blockchain with Dual Tokens and Smart Contracts"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory for blockchain persistence
RUN mkdir -p /app/data

# Expose ports
# 5000 - Main API
# 5001 - Veralix Bridge API
EXPOSE 5000 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/api/info')" || exit 1

# Environment variables (can be overridden)
ENV PYTHONUNBUFFERED=1
ENV PORT=5000
ENV BRIDGE_PORT=5001
ENV DIFFICULTY=3

# Run the application
CMD ["python", "start_with_veralix.py", "--port", "5000", "--bridge-port", "5001"]
