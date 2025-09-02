// src/models/Chapter.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Manga = require('./Manga');

const Chapter = sequelize.define('Chapter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // FK explícita para o Manga
  mangaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Manga.tableName, // normalmente "Mangas"
      key: 'id',
    },
  },

  // Número do capítulo (1, 2, 3, ...)
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // Título opcional do capítulo
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  // Impede duplicar o mesmo número de capítulo para o mesmo mangá
  indexes: [
    {
      name: 'uniq_manga_chapter_number',
      unique: true,
      fields: ['mangaId', 'number'],
    },
  ],
});

// Associações (com cascade)
Manga.hasMany(Chapter, {
  foreignKey: { name: 'mangaId', allowNull: false },
  as: 'chapters',
  onDelete: 'CASCADE',
  hooks: true, // necessário para CASCADE em alguns dialetos
});

Chapter.belongsTo(Manga, {
  foreignKey: { name: 'mangaId', allowNull: false },
  as: 'manga',
  onDelete: 'CASCADE',
});

module.exports = Chapter;
