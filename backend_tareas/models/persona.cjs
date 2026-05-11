'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    static associate(models) {
      // 1 a N: Una persona tiene muchas tareas
      Persona.hasMany(models.Tarea, { foreignKey: 'personaId', as: 'tareas' });
    }
  }
  Persona.init({
    nombre: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rol: {
      type: DataTypes.STRING,
      defaultValue: 'usuario'
    },
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Persona',
  });
  return Persona;
};