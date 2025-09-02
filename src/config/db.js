const { Sequelize } = require("sequelize");

// Carrega variáveis de ambiente se o arquivo .env existir
try {
  require('dotenv').config();
} catch (error) {
  console.log('Arquivo .env não encontrado, usando configurações padrão');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || "mangazinho",
  process.env.DB_USER || "root", 
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Conectado ao MySQL com sucesso ✅"))
  .catch((err) => console.error("Erro ao conectar no MySQL ❌", err));

module.exports = sequelize;
