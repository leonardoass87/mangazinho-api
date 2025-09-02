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
    const { title, synopsis, genres, status } = req.body;
    if (!title) return res.status(400).json({ error: "title é obrigatório" });

    const slug = slugify(title, { lower: true, strict: true });
    const manga = await Manga.create({ title, synopsis, genres, status, slug });

    res.status(201).json(manga);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar mangá" });
  }
});

/**
 * @openapi
 * /mangas/{id}:
 *   put:
 *     summary: Atualiza um mangá existente
 *     tags: [Mangas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               synopsis: { type: string }
 *     responses:
 *       200: { description: Atualizado }
 *       404: { description: Não encontrado }
 */
router.put("/:id", async (req, res) => {
  try {
    const manga = await Manga.findByPk(req.params.id);
    if (!manga) return res.status(404).json({ error: "Mangá não encontrado" });
    const { title, synopsis, genres, status } = req.body || {};
    if (typeof title === "string") manga.title = title;
    if (typeof synopsis === "string") manga.synopsis = synopsis;
    if (typeof genres === "string") manga.genres = genres;
    if (status && ['ongoing', 'completed', 'paused'].includes(status)) manga.status = status;
    await manga.save();
    res.json(manga);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar mangá" });
  }
});

/**
 * @openapi
 * /mangas/{id}:
 *   delete:
 *     summary: Exclui um mangá
 *     tags: [Mangas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Removido }
 *       404: { description: Não encontrado }
 */
router.delete("/:id", async (req, res) => {
  try {
    const manga = await Manga.findByPk(req.params.id);
    if (!manga) return res.status(404).json({ error: "Mangá não encontrado" });
    await manga.destroy();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir mangá" });
  }
});

module.exports = router;
