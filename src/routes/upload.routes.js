const express = require("express");
const multer = require("multer");
const path = require("path");
const fse = require("fs-extra");
const Manga = require("../models/Manga");

const router = express.Router();

// pasta raiz do storage (../storage)
const STORAGE_ROOT = path.join(__dirname, "..", "..", "storage");

// pasta temporária para uploads
const upload = multer({ dest: path.join(STORAGE_ROOT, "tmp") });

// POST /upload/mangas/:id/cover  (campo: cover)
router.post("/mangas/:id/cover", upload.single("cover"), async (req, res) => {
  try {
    const manga = await Manga.findByPk(req.params.id);
    if (!manga) return res.status(404).json({ error: "Mangá não encontrado" });
    if (!req.file) return res.status(400).json({ error: "Arquivo 'cover' é obrigatório" });

    // garante dirs: storage/mangas/<slug>/
    const slug = manga.slug || String(manga.id);
    const mangaDir = path.join(STORAGE_ROOT, "mangas", slug);
    await fse.ensureDir(mangaDir);

    // extensão original (fallback .jpg)
    const ext = path.extname(req.file.originalname) || ".jpg";
    const finalPath = path.join(mangaDir, `cover${ext}`);

    // move do tmp p/ destino final
    await fse.move(req.file.path, finalPath, { overwrite: true });

    // URL pública servida pelo Express /files
    const publicUrl = `/files/mangas/${slug}/cover${ext}`;
    await manga.update({ coverUrl: publicUrl });

    res.json({ ok: true, coverUrl: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao enviar capa" });
  }
});

module.exports = router;
