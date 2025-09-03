const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: (msg) => {
      if (msg.startsWith("Executing")) return; // ignora queries
      console.log("📦 Sequelize:", msg);
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Conectado ao MySQL com sucesso ✅"))
  .catch((err) => console.error("Erro ao conectar no MySQL ❌", err));

module.exports = sequelize;
