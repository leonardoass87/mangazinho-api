// src/server.js
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');

// ---------------- Env por ambiente (.env + .env.{NODE_ENV}) ----------------
try {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'development') {
    // Carrega .env e .env.development apenas no ambiente local
    require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
    require('dotenv').config({
      path: path.resolve(process.cwd(), `.env.${env}`),
      override: true,
    });
    console.log(`🔧 NODE_ENV=${env} | dotenv carregado: .env e .env.${env}`);
  } else {
    // Em production/hml, usa apenas process.env (variáveis do sistema/GitHub Actions)
    console.log(`🔧 NODE_ENV=${env} | usando variáveis do ambiente (sem .env.*)`);
  }
} catch (error) {
  console.log('Não foi possível carregar .env*; usando process.env');
}


const app = express();
const port = process.env.PORT || 4000; // não colidir com Next (3000)

// ------------ Middlewares ------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------ CORS (allowlist a partir do .env) ------------
if (!process.env.CORS_ORIGIN) {
  console.error("❌ ERRO: Variável CORS_ORIGIN não encontrada no .env");
  process.exit(1); // encerra o servidor, já que sem isso não faz sentido subir
}

const allowlist = process.env.CORS_ORIGIN.split(',').map(s => s.trim());

console.log('🌍 Allowlist CORS carregado:', allowlist);

app.use(cors({
  origin: (origin, cb) => {
    // Permite ferramentas sem Origin (Postman, curl)
    console.log("🔎 Origin recebido:", origin);
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

sequelize.sync({ force: false }).then(() => {
 // console.log('Tabelas sincronizadas ✅');
});

// ------------ Arquivos estáticos ------------
app.use('/files', express.static(path.join(__dirname, '..', 'storage')));

// ------------ Swagger (apenas em desenvolvimento) ------------
if (process.env.NODE_ENV !== 'production') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Mangazinho API',
        version: '1.0.0',
        description: 'API do Mangazinho - Leitor de Mangás com painel admin',
      },
      servers: [{ url: `http://localhost:${port}` }],
    },
    apis: [path.join(__dirname, 'routes', '*.js')],
  };
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ------------ Rotas ------------
const mangaRoutes   = require('./routes/manga.routes');
const uploadRoutes  = require('./routes/upload.routes');
const chapterRoutes = require('./routes/chapter.routes');
const { router: authRoutes } = require('./routes/auth.routes');

app.use('/auth', authRoutes);
app.use('/mangas', mangaRoutes);
app.use('/mangas', chapterRoutes);  // expõe /api/mangas/:mangaId/chapters
app.use('/upload', uploadRoutes);

// ------------ Healthcheck ------------
app.get('/', (_req, res) => {
  res.send('API Mangazinho rodando 🚀');
});

// ------------ Error Handler ------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// ------------ Start ------------
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
  }
});
