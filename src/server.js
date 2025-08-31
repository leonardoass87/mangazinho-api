// src/server.js
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');

// Carrega variáveis de ambiente se o arquivo .env existir
try {
  require('dotenv').config();
} catch (error) {
  console.log('Arquivo .env não encontrado, usando configurações padrão');
}

const app = express();
const port = process.env.PORT || 3000;

// ------------ Middlewares ------------
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));

// ------------ DB & Models ------------
const sequelize = require('./config/db');

// importe TODOS os models que participam das associações ANTES do sync
require('./models/Manga');
require('./models/ChapterImage'); // 👈 novo
require('./models/Chapter');      // 👈 necessário para criar tabela/associação
require('./models/User');         // 👈 novo modelo de usuário
// require('./models/ChapterImage'); // (deixe comentado se ainda não criou)

sequelize.sync({ force: false }).then(() => {
  console.log('Tabelas sincronizadas ✅');
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
    // __dirname aqui é .../src
    apis: [path.join(__dirname, 'routes', '*.js')],
  };
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ------------ Rotas ------------
const mangaRoutes   = require('./routes/manga.routes');
const uploadRoutes  = require('./routes/upload.routes');
const chapterRoutes = require('./routes/chapter.routes'); // 👈 router (não é model)
const { router: authRoutes } = require('./routes/auth.routes'); // 👈 novo

app.use('/api/auth', authRoutes);
app.use('/api/mangas', mangaRoutes);
app.use('/api/mangas', chapterRoutes);  // expõe /api/mangas/:mangaId/chapters
app.use('/api/upload', uploadRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
