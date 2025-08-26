const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = 3000;

// middlewares
app.use(express.json());

const cors = require("cors");
app.use(cors({
  origin: "http://localhost:3001"
}));

// DB & models
const sequelize = require("./config/db");
require("./models/Manga"); // apenas garante o import do model

sequelize.sync({ force: false }).then(() => {
  console.log("Tabelas sincronizadas ✅");
});

// arquivos estáticos de /storage em /files
app.use("/files", express.static(path.join(__dirname, "..", "storage")));

// ---- Swagger ----
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mangazinho API",
      version: "1.0.0",
      description: "API do Mangazinho - Leitor de Mangás com painel admin",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  // __dirname aqui é .../src
  apis: [path.join(__dirname, "routes", "*.js")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ------------------

// rotas
const mangaRoutes = require("./routes/manga.routes");
const uploadRoutes = require("./routes/upload.routes");

app.use("/mangas", mangaRoutes);
app.use("/upload", uploadRoutes);

// log simples (coloque ANTES das rotas se quiser logar tudo)
// app.use((req, _res, next) => { console.log(req.method, req.url); next(); });

app.get('/', (_req, res) => {
  res.send('API Mangazinho rodando 🚀');
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
  console.log(`Swagger UI:           http://localhost:${port}/api-docs`);
});
