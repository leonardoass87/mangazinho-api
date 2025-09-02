@echo off
REM Script de Build - Mangazinho (Windows)
REM Execute: build.bat

echo 🚀 Iniciando build do Mangazinho...

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: Execute este script na pasta raiz do projeto (mangazinho-api)
    pause
    exit /b 1
)

if not exist "src" (
    echo ❌ Erro: Pasta src não encontrada
    pause
    exit /b 1
)

REM Verificar se o frontend existe
if not exist "mangazinho-fe\mangazinho-fe" (
    echo ❌ Erro: Pasta do frontend não encontrada
    echo Certifique-se de que a estrutura está assim:
    echo mangazinho-api/
    echo ├── src/
    echo ├── mangazinho-fe\mangazinho-fe/
    echo └── package.json
    pause
    exit /b 1
)

echo 📦 Instalando dependências da API...
call npm install --production

echo 📦 Instalando dependências do Frontend...
cd mangazinho-fe\mangazinho-fe
call npm install

echo 🔨 Fazendo build do Frontend...
call npm run build

echo ✅ Build concluído com sucesso!
echo.
echo 📋 Próximos passos para deploy:
echo 1. Upload dos arquivos para o servidor
echo 2. Execute no servidor: chmod +x deploy.sh ^&^& ./deploy.sh
echo 3. Execute no servidor: chmod +x setup-env.sh ^&^& ./setup-env.sh
echo 4. Configure o PM2: pm2 start ecosystem.config.js
echo.
echo 🔗 Guia completo: DEPLOY_GUIDE.md
echo 🚀 Guia rápido: DEPLOY_QUICK.md

pause
