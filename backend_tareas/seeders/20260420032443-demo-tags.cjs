'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Tags', [
      { id: 1, nombre: 'Urgente', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nombre: 'Universidad', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, nombre: 'Personal', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, nombre: 'Backend', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tags', null, {});
  }
};