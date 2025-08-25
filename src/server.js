const express = require('express');
const path = require('path'); 
const app = express();
const port = 3000;

app.use(express.json());

const sequelize = require("./config/db");
const Manga = require("./models/Manga");

// força sincronização para criar tabelas no MySQL
sequelize.sync({ force: false }).then(() => {
  console.log("Tabelas sincronizadas ✅");
});

// middlewares
app.use(express.json());

// servir arquivos estáticos de /storage em /files
app.use(
  "/files",
  express.static(path.join(__dirname, "..", "storage"))
);



// rotas
const mangaRoutes = require("./routes/manga.routes");
const uploadRoutes = require("./routes/upload.routes");


app.use("/mangas",mangaRoutes);
app.use("/upload",uploadRoutes)

// debug simples (ver o que chega)
app.use((req, _res, next) => { console.log(req.method, req.url); next(); });

app.get('/', (req, res) => {
  res.send('API Mangazinho rodando 🚀');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});