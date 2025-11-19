#!/bin/bash
# setup-jenkins.sh

echo "🚀 Iniciando setup do Jenkins CI/CD..."

# Criar rede Docker se não existir
docker network create ci-cd-network 2>/dev/null || true

# Build e start dos containers
echo "📦 Construindo e iniciando containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "⏳ Aguardando Jenkins inicializar..."
sleep 30

# Configurar Jenkins inicial
echo "⚙️ Configurando Jenkins..."

JENKINS_URL="http://localhost:8080"

# Criar job inicial via CLI ou aguardar setup manual
echo "📋 Jenkins está disponível em: $JENKINS_URL"
echo "🔑 Senha inicial do admin:"
docker exec jenkins-ci-cd cat /var/jenkins_home/secrets/initialAdminPassword

echo "✅ Setup completo!"
echo "📊 Acesse:"
echo "   Jenkins: http://localhost:8080"
echo "   Aplicação: http://localhost:3000"