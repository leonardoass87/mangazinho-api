const express = require("express");
const multer = require("multer");
const path = require("path");
const fse = require("fs-extra");
const Manga = require("../models/Manga");

const router = express.Router();

// Raiz do storage (../storage)
const STORAGE_ROOT = path.join(__dirname, "..", "..", "storage");

// Garante storage/tmp
fse.ensureDirSync(path.join(STORAGE_ROOT, "tmp"));

// Multer: apenas imagens, até 15MB
const upload = multer({
  dest: path.join(STORAGE_ROOT, "tmp"),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Tipo de arquivo não permitido. Envie uma imagem."));
    }
    cb(null, true);
  },
});

/**
 * @openapi
 * /upload/mangas/{id}/cover:
 *   post:
 *     summary: Envia/atualiza a capa de um mangá
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do mangá
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [cover]
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (jpg, png, webp, gif) até 15MB
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 coverUrl: { type: string, example: "/files/mangas/one-piece/cover.jpg" }
 *       400:
 *         description: Requisição inválida (arquivo ausente ou tipo inválido)
 *       404:
 *         description: Mangá não encontrado
 *       500:
 *         description: Erro interno
 */
router.post("/mangas/:id/cover", upload.single("cover"), async (req, res) => {
  try {
    const manga = await Manga.findByPk(req.params.id);
    if (!manga) return res.status(404).json({ error: "Mangá não encontrado" });
    if (!req.file) return res.status(400).json({ error: "Arquivo 'cover' é obrigatório" });

    // Diretório destino: storage/mangas/<slug>/
    const slug = manga.slug || String(manga.id);
    const mangaDir = path.join(STORAGE_ROOT, "mangas", slug);
    await fse.ensureDir(mangaDir);

    // Extensão preservada (fallback .jpg)
    const original = req.file.originalname || "";
    const ext = path.extname(original).toLowerCase() || ".jpg";

    // Nome final fixo "cover"
    const finalPath = path.join(mangaDir, `cover${ext}`);

    // Move do tmp para destino final (sobrescreve se existir)
    await fse.move(req.file.path, finalPath, { overwrite: true });

    // URL pública (servida por /files no server.js)
    const publicUrl = `/files/mangas/${slug}/cover${ext}`;
    await manga.update({ coverUrl: publicUrl });

    return res.json({ ok: true, coverUrl: publicUrl });
  } catch (err) {
    console.error(err);
    // Se o Multer barrou pelo tipo/tamanho, retorna 400
    if (err instanceof Error && /não permitido|File too large/i.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Erro ao enviar capa" });
  }
});

module.exports = router;
