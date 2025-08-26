const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const Manga = require("../models/Manga");

/**
 * @openapi
 * components:
 *   schemas:
 *     Manga:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: One Piece
 *         synopsis:
 *           type: string
 *           example: Aventura de piratas em busca do One Piece.
 *         slug:
 *           type: string
 *           example: one-piece
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /mangas:
 *   get:
 *     summary: Lista todos os mangás
 *     tags: [Mangas]
 *     responses:
 *       200:
 *         description: Lista de mangás
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Manga'
 */
router.get("/", async (_req, res) => {
  const list = await Manga.findAll({ order: [["createdAt", "DESC"]] });
  res.json(list);
});

/**
 * @openapi
 * /mangas/{id}:
 *   get:
 *     summary: Retorna um mangá pelo ID
 *     tags: [Mangas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do mangá
 *     responses:
 *       200:
 *         description: Mangá encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manga'
 *       404:
 *         description: Mangá não encontrado
 */
router.get("/:id", async (req, res) => {
  const manga = await Manga.findByPk(req.params.id);
  if (!manga) return res.status(404).json({ error: "Mangá não encontrado" });
  res.json(manga);
});

/**
 * @openapi
 * /mangas:
 *   post:
 *     summary: Cria um novo mangá
 *     tags: [Mangas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Naruto
 *               synopsis:
 *                 type: string
 *                 example: História de um jovem ninja em busca de reconhecimento.
 *     responses:
 *       201:
 *         description: Mangá criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manga'
 *       400:
 *         description: Requisição inválida
 */
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

module.exports = router;
