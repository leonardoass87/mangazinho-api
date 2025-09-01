#!/bin/bash

# Script de Build - Mangazinho
# Execute: chmod +x build.sh && ./build.sh

set -e

echo "🚀 Iniciando build do Mangazinho..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto (mangazinho-api)"
    exit 1
fi

# Verificar se o frontend existe
if [ ! -d "mangazinho-fe/mangazinho-fe" ]; then
    echo "❌ Erro: Pasta do frontend não encontrada"
    echo "Certifique-se de que a estrutura está assim:"
    echo "mangazinho-api/"
    echo "├── src/"
    echo "├── mangazinho-fe/mangazinho-fe/"
    echo "└── package.json"
    exit 1
fi

echo "📦 Instalando dependências da API..."
npm install --production

echo "📦 Instalando dependências do Frontend..."
cd mangazinho-fe/mangazinho-fe
npm install

echo "🔨 Fazendo build do Frontend..."
npm run build

echo "✅ Build concluído com sucesso!"
echo ""
echo "📋 Próximos passos para deploy:"
echo "1. Upload dos arquivos para o servidor"
echo "2. Execute no servidor: chmod +x deploy.sh && ./deploy.sh"
echo "3. Execute no servidor: chmod +x setup-env.sh && ./setup-env.sh"
echo "4. Configure o PM2: pm2 start ecosystem.config.js"
echo ""
echo "🔗 Guia completo: DEPLOY_GUIDE.md"
echo "🚀 Guia rápido: DEPLOY_QUICK.md"
