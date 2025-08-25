const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Manga = sequelize.define("Manga", {
  title: { type: DataTypes.STRING, allowNull: false },
  synopsis: { type: DataTypes.TEXT },
  coverUrl: { type: DataTypes.STRING },
  slug: { type: DataTypes.STRING, unique: true } // <- novo
});

module.exports = Manga;
