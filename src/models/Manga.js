const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Manga = sequelize.define("Manga", {
  title: { type: DataTypes.STRING, allowNull: false },
  synopsis: { type: DataTypes.TEXT },
  coverUrl: { type: DataTypes.STRING },
  genres: { type: DataTypes.STRING }, // Comma-separated genres
  status: { 
    type: DataTypes.ENUM('ongoing', 'completed', 'paused'), 
    defaultValue: 'ongoing' 
  },
  slug: { type: DataTypes.STRING, unique: true } // <- novo
});

module.exports = Manga;
