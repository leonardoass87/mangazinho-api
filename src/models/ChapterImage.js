const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Chapter = require('./Chapter');

const ChapterImage = sequelize.define('ChapterImage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  chapterId: { type: DataTypes.INTEGER, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  url:      { type: DataTypes.STRING, allowNull: false }, // /files/mangas/<slug>/Cap_<n>/<file>
  order:    { type: DataTypes.INTEGER, allowNull: false }, // posição da página (1,2,3...)
});

Chapter.hasMany(ChapterImage, {
  foreignKey: { name: 'chapterId', allowNull: false },
  as: 'images',
  onDelete: 'CASCADE',
  hooks: true,
});
ChapterImage.belongsTo(Chapter, {
  foreignKey: { name: 'chapterId', allowNull: false },
  as: 'chapter',
  onDelete: 'CASCADE',
});

module.exports = ChapterImage;
