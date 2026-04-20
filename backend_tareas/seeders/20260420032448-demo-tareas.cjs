'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Tareas', [
      { id: 1, titulo: 'Terminar práctica Web', descripcion: 'Conectar Vue con Express y MariaDB', completada: false, personaId: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, titulo: 'Pasear al perrito', descripcion: 'Comprarle sus croquetas de cachorro', completada: true, personaId: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, titulo: 'Calificar reportes', descripcion: 'Revisar repositorios de GitHub', completada: false, personaId: 2, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tareas', null, {});
  }
};