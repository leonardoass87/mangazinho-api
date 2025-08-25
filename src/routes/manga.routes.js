const express = require("express");   // importa o Express
const router = express.Router();      // cria um mini-app de rotas
const slugify = require("slugify");         // <= Faltava
const Manga = require("../models/Manga");   // <= Faltava



// Criar manga
router.post("/", async (req, res) => {
  try {
    const { title, synopsis } = req.body;
    if (!title) return res.status(400).json({ error: "title é obrigatório" });

    const slug = slugify(title, { lower: true, strict: true });
    const manga = await Manga.create({ title, synopsis, slug });

    res.status(201).json(manga);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar mangá" });
  }
});

// Listar
router.get("/", async (_req, res) => {
  const list = await Manga.findAll({ order: [["createdAt", "DESC"]] });
  res.json(list);
});

// GET /mangas/:id (detalhe)
router.get("/:id", async (req, res) => {
  const manga = await Manga.findByPk(req.params.id);
  if (!manga) return res.status(404).json({ error: "Mangá não encontrado" });
  res.json(manga);
});



module.exports = router;             // exporta o router para o server usar
