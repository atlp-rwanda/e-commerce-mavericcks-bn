'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      roleId: {
        type: Sequelize.UUID,
        references: {
          model: 'roles',
          key: 'id',
        },
        primaryKey: true,
      },
      permissionId: {
        type: Sequelize.UUID,
        references: {
          model: 'permissions',
          key: 'id',
        },
        primaryKey: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_permissions');
  },
};
