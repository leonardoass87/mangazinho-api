#!/bin/bash

# Script de Deploy - Mangazinho
# Execute como root ou com sudo

set -e

echo "🚀 Iniciando deploy do Mangazinho..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências
echo "🔧 Instalando dependências..."
apt install -y curl wget git nginx mysql-server nodejs npm pm2

# Criar usuário
echo "👤 Criando usuário mangazinho..."
useradd -m -s /bin/bash mangazinho || true
usermod -aG sudo mangazinho

# Criar diretórios
echo "📁 Criando diretórios..."
mkdir -p /var/www/mangazinho
mkdir -p /var/log/mangazinho
chown -R mangazinho:mangazinho /var/www/mangazinho
chown -R mangazinho:mangazinho /var/log/mangazinho

# Configurar MySQL
echo "🗄️ Configurando MySQL..."
systemctl start mysql
systemctl enable mysql

# Criar banco de dados (se não existir)
mysql -e "CREATE DATABASE IF NOT EXISTS mangazinho;" || true
mysql -e "CREATE USER IF NOT EXISTS 'mangazinho_user'@'localhost' IDENTIFIED BY 'mangazinho123';" || true
mysql -e "GRANT ALL PRIVILEGES ON mangazinho.* TO 'mangazinho_user'@'localhost';" || true
mysql -e "FLUSH PRIVILEGES;" || true

# Configurar Nginx
echo "🌐 Configurando Nginx..."
cp nginx.conf /etc/nginx/sites-available/mangazinho
ln -sf /etc/nginx/sites-available/mangazinho /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Instalar PM2 globalmente
echo "⚡ Instalando PM2..."
npm install -g pm2

echo "✅ Deploy inicial concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. O domínio mangazinho.site já está configurado"
echo "2. Execute: chmod +x setup-env.sh && ./setup-env.sh"
echo "3. Faça upload dos arquivos da aplicação"
echo "4. Execute: npm install && npm run build (frontend)"
echo "5. Execute: pm2 start ecosystem.config.js"
echo ""
echo "🔗 Documentação completa: DEPLOY_GUIDE.md"
