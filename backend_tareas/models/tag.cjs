'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // N a M: Un tag pertenece a muchas tareas
      Tag.belongsToMany(models.Tarea, { 
        through: 'TareaTags', 
        foreignKey: 'tagId',
        as: 'tareas'
    });
    }
  }
  Tag.init({
    nombre: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tag',
  });
  return Tag;
};