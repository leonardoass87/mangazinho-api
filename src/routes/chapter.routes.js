// src/routes/chapter.routes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const ChapterImage = require('../models/ChapterImage');

// ---------- Utils ----------
const STORAGE_ROOT = path.join(__dirname, '..', '..', 'storage'); // /files mapeia aqui

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function badRequest(res, msg) {
  return res.status(400).json({ error: msg });
}

// ---------- Chapters ----------

/**
 * @openapi
 * /api/mangas/{mangaId}/chapters:
 *   get:
 *     summary: Lista capítulos de um mangá (ordenado por number ASC)
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Mangá não encontrado }
 *
 *   post:
 *     summary: Cria capítulo para um mangá
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [number]
 *             properties:
 *               number: { type: integer, example: 1 }
 *               title:  { type: string,  example: "Capítulo 1" }
 *     responses:
 *       201: { description: Criado }
 *       400: { description: Requisição inválida }
 *       404: { description: Mangá não encontrado }
 *       409: { description: Capítulo já existe }
 */

// Criar capítulo
router.post('/:mangaId/chapters', async (req, res) => {
  try {
    const mangaId = toInt(req.params.mangaId);
    if (!Number.isFinite(mangaId)) return badRequest(res, 'mangaId inválido');

    const body = req.body || {};
    const number = toInt(body.number);
    const title = typeof body.title === 'string' ? body.title : null;

    if (!Number.isFinite(number)) {
      return badRequest(res, 'Campo "number" é obrigatório e deve ser numérico');
    }

    const manga = await Manga.findByPk(mangaId);
    if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

    const exists = await Chapter.findOne({ where: { mangaId, number } });
    if (exists) return res.status(409).json({ error: 'Capítulo já existe para este mangá' });

    const chapter = await Chapter.create({ mangaId, number, title });
    return res.status(201).json(chapter);
  } catch (err) {
    console.error('POST /:mangaId/chapters', err);
    return res.status(500).json({ error: 'Erro ao criar capítulo' });
  }
});

// Listar capítulos (ordenados)
router.get('/:mangaId/chapters', async (req, res) => {
  try {
    const mangaId = toInt(req.params.mangaId);
    if (!Number.isFinite(mangaId)) return badRequest(res, 'mangaId inválido');

    const manga = await Manga.findByPk(mangaId);
    if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

    const chapters = await Chapter.findAll({
      where: { mangaId },
      order: [['number', 'ASC']],
    });

    return res.json(chapters);
  } catch (err) {
    console.error('GET /:mangaId/chapters', err);
    return res.status(500).json({ error: 'Erro ao listar capítulos' });
  }
});

// ---------- Pages (upload/lista) ----------

/**
 * @openapi
 * /api/mangas/{mangaId}/chapters/{number}/pages:
 *   post:
 *     summary: Faz upload de páginas (imagens) para um capítulo
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: number
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201: { description: Páginas salvas }
 *       400: { description: Requisição inválida }
 *       404: { description: Mangá/Capítulo não encontrado }
 *   get:
 *     summary: Lista as páginas (imagens) de um capítulo
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: number
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Mangá/Capítulo não encontrado }
 */

// Upload de páginas
router.post('/:mangaId/chapters/:number/pages', async (req, res) => {
  try {
    const mangaId = toInt(req.params.mangaId);
    const chapNo = toInt(req.params.number);
    if (!Number.isFinite(mangaId)) return badRequest(res, 'mangaId inválido');
    if (!Number.isFinite(chapNo)) return badRequest(res, 'number inválido');

    const manga = await Manga.findByPk(mangaId);
    if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

    const chapter = await Chapter.findOne({ where: { mangaId, number: chapNo } });
    if (!chapter) return res.status(404).json({ error: 'Capítulo não encontrado' });

    const safeSlug = (manga.slug || `manga_${manga.id}`).replace(/[^\w\-]/g, '_');
    const capDir = path.join(STORAGE_ROOT, 'mangas', safeSlug, `Cap_${chapNo}`);
    ensureDirSync(capDir);

    // Configura multer por requisição (dependemos da pasta dinâmica)
    let seq = 0;
    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, capDir),
      filename: (_req, file, cb) => {
        seq += 1;
        const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
        const name = String(seq).padStart(3, '0') + ext; // 001.jpg
        cb(null, name);
      },
    });

    const upload = multer({
      storage,
      limits: { files: 300, fileSize: 25 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = /image\/(jpeg|jpg|png|webp)/i.test(file.mimetype);
        cb(ok ? null : new Error('Tipo de arquivo inválido (use jpg/png/webp)'), ok);
      },
    }).array('pages');

    // Executa o upload
    upload(req, res, async (err) => {
      try {
        if (err) return res.status(400).json({ error: err.message || 'Falha no upload' });
        const files = req.files || [];
        if (!files.length) return badRequest(res, 'Envie arquivos no campo "pages"');

        // Continua a sequência se já houver imagens
        const last = await ChapterImage.findOne({
          where: { chapterId: chapter.id },
          order: [['order', 'DESC']],
        });
        let order = last ? last.order + 1 : 1;

        const baseUrl = `/files/mangas/${safeSlug}/Cap_${chapNo}`;
        const created = [];
        for (const f of files) {
          const img = await ChapterImage.create({
            chapterId: chapter.id,
            filename: f.filename,
            url: `${baseUrl}/${f.filename}`,
            order: order++,
          });
          created.push(img);
        }

        const images = await ChapterImage.findAll({
          where: { chapterId: chapter.id },
          order: [['order', 'ASC']],
        });

        return res.status(201).json({ chapterId: chapter.id, total: images.length, images });
      } catch (inner) {
        console.error('upload callback error', inner);
        return res.status(500).json({ error: 'Erro ao processar upload' });
      }
    });
  } catch (e) {
    console.error('POST /:mangaId/chapters/:number/pages', e);
    return res.status(500).json({ error: 'Erro ao fazer upload das páginas' });
  }
});

// Listar páginas de um capítulo
router.get('/:mangaId/chapters/:number/pages', async (req, res) => {
  try {
    const mangaId = toInt(req.params.mangaId);
    const chapNo = toInt(req.params.number);
    if (!Number.isFinite(mangaId)) return badRequest(res, 'mangaId inválido');
    if (!Number.isFinite(chapNo)) return badRequest(res, 'number inválido');

    const manga = await Manga.findByPk(mangaId);
    if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

    const chapter = await Chapter.findOne({ where: { mangaId, number: chapNo } });
    if (!chapter) return res.status(404).json({ error: 'Capítulo não encontrado' });

    const images = await ChapterImage.findAll({
      where: { chapterId: chapter.id },
      order: [['order', 'ASC']],
    });

    return res.json({ chapterId: chapter.id, total: images.length, images });
  } catch (e) {
    console.error('GET /:mangaId/chapters/:number/pages', e);
    return res.status(500).json({ error: 'Erro ao listar páginas' });
  }
});

module.exports = router;
