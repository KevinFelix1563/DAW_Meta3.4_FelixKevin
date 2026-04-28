'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Personas', [
      { id: 1, nombre: 'Kevin Felix', email: 'kevin@uabc.edu.mx', activo: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, nombre: 'Adad Arias', email: 'adad@uabc.edu.mx', activo: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, nombre: 'Dante Palacios', email: 'dante@uabc.edu.mx', activo: false, createdAt: new Date(), updatedAt: new Date() },
      {id: 4, nombre: 'Kevin Felix', email: 'kevin.felix59@uabc.edu.mx', activo: true, createdAt: new Date(), updatedAt: new Date()}
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Personas', null, {});
  }
};