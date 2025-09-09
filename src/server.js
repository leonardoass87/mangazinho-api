// src/server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');

// ---------------- Env por ambiente (.env + .env.{NODE_ENV}) ----------------
try {
  const env = process.env.NODE_ENV || 'development';

  // Carrega .env.<NODE_ENV>
  require('dotenv').config({ path: path.resolve(process.cwd(), `.env.${env}`) });
  console.log(`🔧 NODE_ENV=${env} | dotenv carregado: .env.${env}`);

  // Só aplica override do .env.local se for ambiente "local"
  if (env === 'local') {
    require('dotenv').config({ path: path.resolve(process.cwd(), `.env.local`), override: true });
    console.log(`📌 Override com .env.local (apenas no ambiente local)`);
  }
} catch (error) {
  console.log('Não foi possível carregar .env*; usando process.env');
}

const ENV = process.env.NODE_ENV || 'development';
const app = express();

// Em produção atrás de proxy (Nginx/CF), preserve IP real
if (ENV === 'production') {
  app.set('trust proxy', true);
}

const port = Number(process.env.PORT || 4000); // não colidir com Next (3000)

// ------------ Middlewares ------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------ CORS (allowlist a partir do .env) ------------
let allowlist = [];
if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.trim().length > 0) {
  allowlist = process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
} else if (ENV === 'production') {
  console.error("❌ ERRO: Variável CORS_ORIGIN não encontrada no .env de produção");
  process.exit(1);
} else {
  allowlist = ['http://localhost:3000', 'http://localhost:4000'];
  console.warn('⚠️ CORS_ORIGIN ausente. Usando fallback (dev/local):', allowlist);
}
console.log('🌍 Allowlist CORS carregado:', allowlist);

app.use(cors({
  origin: (origin, cb) => {
    // Permite ferramentas sem Origin (Postman/curl)
    if (!origin) return cb(null, true);
    if (allowlist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// ------------ DB & Models ------------
const sequelize = require('./config/db');

// importe TODOS os models que participam das associações ANTES do sync
require('./models/Manga');
require('./models/ChapterImage');
require('./models/Chapter');
require('./models/User');

// Tentamos autenticar antes de sincronizar/abrir porta (fail-fast)
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao MySQL com sucesso');

    await sequelize.sync({ force: false });
    // console.log('Tabelas sincronizadas ✅');

    // ------------ Arquivos estáticos ------------
    app.use('/files', express.static(path.join(__dirname, '..', 'storage')));

    // ------------ Swagger (apenas em desenvolvimento ou local) ------------
    if (['development', 'local'].includes(ENV)) {
      console.log("🚀 Montando Swagger em /api-docs");

      // Permite definir URL pública opcional (útil quando acessa via rede)
      const apiBase = process.env.API_BASE_URL || `http://localhost:${port}`;

      const swaggerOptions = {
        definition: {
          openapi: '3.0.0',
          info: {
            title: 'Mangazinho API',
            version: '1.0.0',
            description: 'API do Mangazinho - Leitor de Mangás com painel admin',
          },
          servers: [{ url: apiBase }],
        },
        apis: [path.join(__dirname, 'routes', '*.js')],
      };

      const swaggerSpec = swaggerJsdoc(swaggerOptions);
      app.use('/api-docs', swaggerUi.serve);
      app.get('/api-docs', swaggerUi.setup(swaggerSpec));
      console.log(`✅ Swagger montado: ${apiBase}/api-docs`);
    }

    // ------------ Rotas ------------
    const mangaRoutes   = require('./routes/manga.routes');
    const uploadRoutes  = require('./routes/upload.routes');
    const chapterRoutes = require('./routes/chapter.routes');
    const { router: authRoutes } = require('./routes/auth.routes');

    app.use('/auth', authRoutes);
    app.use('/mangas', mangaRoutes);
    app.use('/mangas', chapterRoutes);  // expõe /mangas/:mangaId/chapters
    app.use('/upload', uploadRoutes);

    // ------------ Healthcheck ------------
    app.get('/', (_req, res) => {
      res.send('API Mangazinho rodando 🚀');
    });

    // ------------ Error Handler ------------
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.error('🔥 ErrorHandler:', err.stack || err);
      res.status(500).send('Algo deu errado!');
    });

    // ------------ Start ------------
    app.listen(port, () => {
      console.log(`🚀 Server is listening on port ${port}`);
      if (['development', 'local'].includes(ENV)) {
        const apiBase = process.env.API_BASE_URL || `http://localhost:${port}`;
        console.log(`📘 Swagger UI: ${apiBase}/api-docs`);
      }
    });
  } catch (err) {
    console.error('❌ Falha ao inicializar servidor (DB indisponível?):', err.message || err);
    process.exit(1);
  }
})();
