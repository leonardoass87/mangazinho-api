#!/bin/bash

# Script de Deploy para Ubuntu
# Execute: chmod +x deploy.sh && ./deploy.sh

echo "🚀 Iniciando deploy do Mangazinho..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js e npm
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MySQL
echo "🗄️ Instalando MySQL..."
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# Instalar Nginx
echo "🌐 Instalando Nginx..."
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Instalar PM2
echo "⚡ Instalando PM2..."
sudo npm install -g pm2

# Criar usuário para aplicação
echo "👤 Criando usuário da aplicação..."
sudo useradd -m -s /bin/bash mangazinho
sudo usermod -aG sudo mangazinho

# Criar diretórios
echo "📁 Criando diretórios..."
sudo mkdir -p /var/www/mangazinho
sudo mkdir -p /var/www/mangazinho/storage
sudo chown -R mangazinho:mangazinho /var/www/mangazinho

echo "✅ Deploy inicial concluído!"
echo "📋 Próximos passos:"
echo "1. Configure o MySQL: sudo mysql_secure_installation"
echo "2. Crie o banco de dados: CREATE DATABASE mangazinho;"
echo "3. Configure as variáveis de ambiente"
echo "4. Faça upload dos arquivos para /var/www/mangazinho"
echo "5. Configure o Nginx"
echo "6. Inicie a aplicação com PM2"
