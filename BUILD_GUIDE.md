# 🔨 Guia de Build - Mangazinho

## 📋 Pré-requisitos

### Para Windows:
- Node.js 18+ instalado
- Git instalado
- PowerShell ou CMD

### Para Linux/Mac:
- Node.js 18+ instalado
- Git instalado
- Bash

## 🚀 Build Automático

### Windows:
```cmd
# Execute o script de build
build.bat
```

### Linux/Mac:
```bash
# Dar permissão e executar
chmod +x build.sh
./build.sh
```

## 🔧 Build Manual

### 1. Verificar Estrutura
Certifique-se de que a estrutura está assim:
```
mangazinho-api/
├── src/
├── mangazinho-fe/mangazinho-fe/
├── package.json
├── build.sh (ou build.bat)
└── ...
```

### 2. Build da API
```bash
# Na pasta raiz (mangazinho-api)
npm install --production
```

### 3. Build do Frontend
```bash
# Navegar para o frontend
cd mangazinho-fe/mangazinho-fe

# Instalar dependências
npm install

# Fazer build
npm run build
```

## ✅ Verificação do Build

### Verificar se o build foi bem-sucedido:

1. **API:**
   - Pasta `node_modules` deve existir
   - Não deve haver erros no console

2. **Frontend:**
   - Pasta `.next` deve existir em `mangazinho-fe/mangazinho-fe/`
   - Arquivo `next.config.mjs` deve estar configurado
   - Não deve haver erros no console

### Comandos de verificação:
```bash
# Verificar se o build do frontend foi criado
ls -la mangazinho-fe/mangazinho-fe/.next

# Verificar dependências da API
ls -la node_modules

# Verificar configuração do Next.js
cat mangazinho-fe/mangazinho-fe/next.config.mjs
```

## 🚨 Problemas Comuns

### 1. **Erro: "Cannot find module"**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### 2. **Erro no build do Next.js**
```bash
# Limpar cache do Next.js
cd mangazinho-fe/mangazinho-fe
rm -rf .next
npm run build
```

### 3. **Erro de permissão (Linux/Mac)**
```bash
# Dar permissão aos scripts
chmod +x build.sh
chmod +x deploy.sh
chmod +x setup-env.sh
```

### 4. **Erro de memória no build**
```bash
# Aumentar memória do Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## 📦 Arquivos Gerados

Após o build bem-sucedido, você terá:

### API:
- `node_modules/` - Dependências instaladas
- `package-lock.json` - Versões fixas das dependências

### Frontend:
- `mangazinho-fe/mangazinho-fe/.next/` - Build otimizado
- `mangazinho-fe/mangazinho-fe/out/` - Build estático (se configurado)

## 🚀 Próximos Passos

Após o build bem-sucedido:

1. **Upload para servidor:**
   ```bash
   # Compactar para upload
   tar -czf mangazinho-build.tar.gz . --exclude=node_modules
   ```

2. **Deploy no servidor:**
   ```bash
   # Seguir o guia de deploy
   chmod +x deploy.sh && ./deploy.sh
   chmod +x setup-env.sh && ./setup-env.sh
   ```

## 📞 Suporte

- **Logs de erro:** Verificar console durante o build
- **Documentação:** DEPLOY_GUIDE.md
- **Deploy rápido:** DEPLOY_QUICK.md
