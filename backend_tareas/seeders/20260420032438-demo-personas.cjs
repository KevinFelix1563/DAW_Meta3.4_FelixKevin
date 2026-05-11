'use strict';
const bcrypt = require('bcryptjs'); // Usaremos bcryptjs para el cifrado

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Generamos una contraseña encriptada por defecto para las pruebas
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('secreto123', salt);

    await queryInterface.bulkInsert('Personas', [
      { 
        id: 1, 
        nombre: 'Kevin Felix', 
        email: 'kevin@uabc.edu.mx', 
        password: hashedPassword,
        rol: 'usuario',
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 2, 
        nombre: 'Adad Arias', 
        email: 'adad@uabc.edu.mx', 
        password: hashedPassword,
        rol: 'usuario',
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 3, 
        nombre: 'Dante Palacios', 
        email: 'dante@uabc.edu.mx', 
        password: hashedPassword,
        rol: 'usuario',
        activo: false, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      {
        id: 4, 
        nombre: 'Admin Kevin', 
        email: 'kevin.felix59@uabc.edu.mx', 
        password: hashedPassword,
        rol: 'admin', // <-- ESTE ES TU USUARIO ADMINISTRADOR
        activo: true, 
        createdAt: new Date(), 
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Personas', null, {});
  }
};