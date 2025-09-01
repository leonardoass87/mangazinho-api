#!/bin/bash

# Script para configurar variáveis de ambiente
# Execute: chmod +x setup-env.sh && ./setup-env.sh

echo "🔧 Configurando variáveis de ambiente..."

# Usar domínio fixo
DOMAIN="mangazinho.site"
echo "🌐 Configurando para o domínio: ${DOMAIN}"

# Criar .env para API
cat > /var/www/mangazinho/.env << EOF
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mangazinho
DB_USER=mangazinho_user
DB_PASSWORD=mangazinho123

# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações de CORS
CORS_ORIGIN=https://${DOMAIN}

# Configurações JWT
JWT_SECRET=mangazinho_jwt_secret_$(openssl rand -hex 32)

# Configurações de Upload
UPLOAD_PATH=/var/www/mangazinho/storage
MAX_FILE_SIZE=10485760
EOF

# Criar .env.local para Frontend
cat > /var/www/mangazinho/frontend/.env.local << EOF
# Configurações para produção - mangazinho.site
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_FILES_URL=https://${DOMAIN}

# Para desenvolvimento local, use:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
# NEXT_PUBLIC_FILES_URL=http://localhost:3000
EOF

# Atualizar nginx.conf com o domínio
sed -i "s/seudominio.com/${DOMAIN}/g" /etc/nginx/sites-available/mangazinho
sed -i "s/mangazinho.site/${DOMAIN}/g" /etc/nginx/sites-available/mangazinho

# Definir permissões
chown mangazinho:mangazinho /var/www/mangazinho/.env
chown mangazinho:mangazinho /var/www/mangazinho/frontend/.env.local

echo "✅ Variáveis de ambiente configuradas!"
echo "🌐 Domínio configurado: ${DOMAIN}"
echo ""
echo "📋 Próximos passos:"
echo "1. Teste a configuração do Nginx: nginx -t"
echo "2. Reinicie o Nginx: systemctl restart nginx"
echo "3. Faça build do frontend: cd /var/www/mangazinho/frontend && npm run build"
echo "4. Inicie as aplicações: pm2 start ecosystem.config.js"
