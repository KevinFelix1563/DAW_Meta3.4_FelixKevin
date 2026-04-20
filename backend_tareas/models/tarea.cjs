'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tarea extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 a N: Una tarea pertenece a una persona
      Tarea.belongsTo(models.Persona, { foreignKey: 'personaId', as: 'autor' });
    
    // N a M: Una tarea tiene muchos tags
      Tarea.belongsToMany(models.Tag, { 
        through: 'TareaTags', 
        foreignKey: 'tareaId',
        as: 'etiquetas'
    });
    }
  }
  Tarea.init({
    titulo: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    completada: DataTypes.BOOLEAN,
    personaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Tarea',
  });
  return Tarea;
};