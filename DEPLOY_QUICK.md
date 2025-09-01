# 🚀 Deploy Rápido - Mangazinho.site

## 📋 Deploy Automático

### 1. Preparar o Servidor
```bash
# Execute o script de setup inicial
chmod +x deploy.sh
./deploy.sh
```

### 2. Configurar Ambiente
```bash
# Configurar variáveis de ambiente automaticamente
chmod +x setup-env.sh
./setup-env.sh
```

### 3. Upload dos Arquivos
```bash
# Copiar arquivos da API
sudo cp -r src/ /var/www/mangazinho/
sudo cp package*.json /var/www/mangazinho/
sudo cp ecosystem.config.js /var/www/mangazinho/

# Copiar arquivos do Frontend
sudo mkdir -p /var/www/mangazinho/frontend
sudo cp -r mangazinho-fe/mangazinho-fe/* /var/www/mangazinho/frontend/
```

### 4. Instalar e Build
```bash
# API
cd /var/www/mangazinho
sudo -u mangazinho npm install --production

# Frontend
cd /var/www/mangazinho/frontend
sudo -u mangazinho npm install
sudo -u mangazinho npm run build
```

### 5. Iniciar Aplicações
```bash
cd /var/www/mangazinho
sudo -u mangazinho pm2 start ecosystem.config.js
sudo -u mangazinho pm2 save
sudo -u mangazinho pm2 startup
```

### 6. SSL/HTTPS (Opcional)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d mangazinho.site -d www.mangazinho.site
```

## 🔍 Verificação

### Verificar se está funcionando:
```bash
# Status dos serviços
pm2 status
sudo systemctl status nginx

# Verificar variáveis de ambiente
cat /var/www/mangazinho/frontend/.env.local

# Testar API
curl https://mangazinho.site/api/mangas

# Testar arquivos estáticos
curl https://mangazinho.site/files/mangas/one-piece/cover.jpg
```

### Logs úteis:
```bash
# Logs do frontend
pm2 logs mangazinho-frontend

# Logs da API
pm2 logs mangazinho-api

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

## 🚨 Problema das Capas

Se as capas não aparecerem:

1. **Verificar .env.local:**
```bash
cat /var/www/mangazinho/frontend/.env.local
```

2. **Rebuild do frontend:**
```bash
cd /var/www/mangazinho/frontend
npm run build
pm2 restart mangazinho-frontend
```

3. **Verificar configuração do Next.js:**
```bash
# O arquivo next.config.mjs já está configurado para mangazinho.site
cat next.config.mjs
```

## 📞 Suporte

- **Documentação completa:** DEPLOY_GUIDE.md
- **Logs:** `pm2 logs`
- **Status:** `pm2 status`
