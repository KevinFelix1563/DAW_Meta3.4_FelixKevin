'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 a N: Una persona tiene muchas tareas
      Persona.hasMany(models.Tarea, { foreignKey: 'personaId', as: 'tareas' });
    }
  }
  Persona.init({
    nombre: DataTypes.STRING,
    email: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Persona',
  });
  return Persona;
};