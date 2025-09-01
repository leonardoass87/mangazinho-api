# 🚀 Guia de Deploy - Mangazinho

## 📋 Pré-requisitos

- Servidor Ubuntu 20.04+ 
- Acesso root ou sudo
- Domínio configurado (opcional, mas recomendado)

## 🔧 Configuração do Servidor

### 1. Executar Script de Setup Inicial

```bash
# No servidor Ubuntu
chmod +x deploy.sh
./deploy.sh
```

### 2. Configurar MySQL

```bash
# Configurar segurança do MySQL
sudo mysql_secure_installation

# Acessar MySQL
sudo mysql

# Criar banco de dados
CREATE DATABASE mangazinho;
CREATE USER 'mangazinho_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON mangazinho.* TO 'mangazinho_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configurar Variáveis de Ambiente

**Opção A: Usar script automático (Recomendado)**
```bash
# Execute o script de configuração (já configurado para mangazinho.site)
chmod +x setup-env.sh
./setup-env.sh
```

**Opção B: Configuração manual**

Criar arquivo `/var/www/mangazinho/.env`:
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mangazinho
DB_USER=mangazinho_user
DB_PASSWORD=sua_senha_segura

# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações de CORS
CORS_ORIGIN=https://mangazinho.site

# Configurações JWT
JWT_SECRET=sua_chave_jwt_super_secreta_e_longa

# Configurações de Upload
UPLOAD_PATH=/var/www/mangazinho/storage
MAX_FILE_SIZE=10485760
```

**IMPORTANTE: Criar também `/var/www/mangazinho/frontend/.env.local`:**
```env
# Configurações para produção
NEXT_PUBLIC_API_URL=https://mangazinho.site/api
NEXT_PUBLIC_FILES_URL=https://mangazinho.site
```

### 4. Configurar Nginx

```bash
# Copiar configuração do Nginx
sudo cp nginx.conf /etc/nginx/sites-available/mangazinho

# O domínio mangazinho.site já está configurado
# Se precisar editar: sudo nano /etc/nginx/sites-available/mangazinho

# Ativar site
sudo ln -s /etc/nginx/sites-available/mangazinho /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 📦 Deploy da Aplicação

### 1. Upload dos Arquivos

```bash
# Via SCP/SFTP ou Git
sudo mkdir -p /var/www/mangazinho
sudo chown -R mangazinho:mangazinho /var/www/mangazinho

# Copiar arquivos da API
sudo cp -r src/ /var/www/mangazinho/
sudo cp package*.json /var/www/mangazinho/
sudo cp ecosystem.config.js /var/www/mangazinho/

# Copiar arquivos do Frontend
sudo mkdir -p /var/www/mangazinho/frontend
sudo cp -r mangazinho-fe/mangazinho-fe/* /var/www/mangazinho/frontend/
```

### 2. Instalar Dependências

```bash
# API
cd /var/www/mangazinho
sudo -u mangazinho npm install --production

# Frontend
cd /var/www/mangazinho/frontend
sudo -u mangazinho npm install
sudo -u mangazinho npm run build

# ⚠️ IMPORTANTE: Após o build, verificar se as variáveis de ambiente estão corretas
sudo -u mangazinho cat .env.local
```

### 3. Configurar PM2

```bash
# Criar diretório de logs
sudo mkdir -p /var/log/mangazinho
sudo chown -R mangazinho:mangazinho /var/log/mangazinho

# Iniciar aplicações
cd /var/www/mangazinho
sudo -u mangazinho pm2 start ecosystem.config.js

# Salvar configuração do PM2
sudo -u mangazinho pm2 save
sudo -u mangazinho pm2 startup
```

## 🔒 Configurações de Segurança

### 1. Firewall

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. SSL/HTTPS (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d mangazinho.site -d www.mangazinho.site
```

### 3. Configurações de Segurança Adicionais

```bash
# Atualizar configuração do Nginx para HTTPS
sudo nano /etc/nginx/sites-available/mangazinho

# Adicionar headers de segurança
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 📊 Monitoramento

### 1. Logs

```bash
# Ver logs da API
pm2 logs mangazinho-api

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Status dos Serviços

```bash
# Status do PM2
pm2 status

# Status dos serviços do sistema
sudo systemctl status nginx
sudo systemctl status mysql
```

## 🔄 Atualizações

### 1. Backup

```bash
# Backup do banco
mysqldump -u mangazinho_user -p mangazinho > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup dos arquivos
sudo tar -czf mangazinho_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/mangazinho
```

### 2. Deploy de Atualizações

```bash
# Parar aplicações
pm2 stop all

# Fazer backup
# ... (ver seção backup)

# Atualizar código
# ... (upload dos novos arquivos)

# Instalar dependências
npm install --production

# Rebuild frontend (se necessário)
cd frontend && npm run build

# Reiniciar aplicações
pm2 restart all
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com MySQL**
   - Verificar se MySQL está rodando: `sudo systemctl status mysql`
   - Verificar credenciais no arquivo `.env`

2. **Erro de permissões**
   - Verificar proprietário dos arquivos: `ls -la /var/www/mangazinho`
   - Corrigir: `sudo chown -R mangazinho:mangazinho /var/www/mangazinho`

3. **Erro de porta em uso**
   - Verificar processos: `netstat -tulpn | grep :3000`
   - Parar processo conflitante ou alterar porta

4. **Erro de CORS**
   - Verificar configuração `CORS_ORIGIN` no `.env`
   - Verificar configuração do Nginx

5. **🆕 Capas não aparecem (Problema mais comum)**
   - Verificar se `/var/www/mangazinho/frontend/.env.local` existe
   - Verificar se `NEXT_PUBLIC_FILES_URL` está configurado corretamente
   - Verificar se o domínio está no `next.config.mjs`
   - Rebuild do frontend após alterações: `npm run build`
   - Verificar logs do frontend: `pm2 logs mangazinho-frontend`

### Comandos Úteis

```bash
# Reiniciar todos os serviços
sudo systemctl restart nginx mysql
pm2 restart all

# Ver uso de recursos
htop
df -h
free -h

# Ver logs em tempo real
pm2 logs --lines 100
```

## 📞 Suporte

Para problemas específicos, verifique:
1. Logs do PM2: `pm2 logs`
2. Logs do Nginx: `/var/log/nginx/`
3. Logs do MySQL: `/var/log/mysql/`
4. Status dos serviços: `systemctl status [serviço]`
