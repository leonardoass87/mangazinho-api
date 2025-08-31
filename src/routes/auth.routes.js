const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "mangazinho-secret-key-2024";

// Middleware para verificar token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Usuário não encontrado ou inativo" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin()) {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
  }
  next();
};

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Usuário criado }
 *       400: { description: Dados inválidos }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }

    // Verificar se usuário já existe
    const existingUser = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Usuário ou email já existe" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: 0 // Usuário comum por padrão
    });

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Faz login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login bem-sucedido }
 *       401: { description: Credenciais inválidas }
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username e senha são obrigatórios" });
    }

    // Buscar usuário por username ou email
    const user = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Verificar senha
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Retorna informações do usuário logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Informações do usuário }
 *       401: { description: Não autorizado }
 */
router.get("/me", authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/**
 * @openapi
 * /auth/admin:
 *   get:
 *     summary: Verifica se o usuário é admin
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: É admin }
 *       403: { description: Não é admin }
 */
router.get("/admin", authenticateToken, requireAdmin, async (req, res) => {
  res.json({ 
    message: "Acesso permitido",
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

module.exports = { router, authenticateToken, requireAdmin };
