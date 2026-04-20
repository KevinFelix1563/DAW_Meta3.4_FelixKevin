'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TareaTags', [
      { tareaId: 1, tagId: 1, createdAt: new Date(), updatedAt: new Date() }, // Práctica Web es Urgente
      { tareaId: 1, tagId: 2, createdAt: new Date(), updatedAt: new Date() }, // Práctica Web es de Universidad
      { tareaId: 1, tagId: 4, createdAt: new Date(), updatedAt: new Date() }, // Práctica Web es de Backend
      { tareaId: 2, tagId: 3, createdAt: new Date(), updatedAt: new Date() }, // Pasear al perrito es Personal
      { tareaId: 3, tagId: 1, createdAt: new Date(), updatedAt: new Date() }, // Calificar es Urgente
      { tareaId: 3, tagId: 2, createdAt: new Date(), updatedAt: new Date() }  // Calificar es de Universidad
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TareaTags', null, {});
  }
};