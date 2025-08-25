const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("mangazinho", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("Conectado ao MySQL com sucesso ✅"))
  .catch((err) => console.error("Erro ao conectar no MySQL ❌", err));

module.exports = sequelize;
