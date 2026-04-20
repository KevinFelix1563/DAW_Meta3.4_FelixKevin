'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TareaTags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tareaId: {
        type: Sequelize.INTEGER,
        references: { model: 'Tareas', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tagId: {
        type: Sequelize.INTEGER,
        references: { model: 'Tags', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TareaTags');
  }
};