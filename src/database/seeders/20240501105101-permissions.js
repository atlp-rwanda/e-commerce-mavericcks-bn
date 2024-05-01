'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const defaultPermissions = dummies => {
      const permissions = [];
      for (let i = 0; i < dummies.length; i++) {
        permissions.push({
          id: uuidv4(),
          name: dummies[i],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return permissions;
    };
    const permissions = [
      'view items',
      'manage cart',
      'buy items',
      'rate platform',
      'rate vendors',
      'manage stock',
      'manage users',
      'inspect stock',
    ];
    await queryInterface.bulkInsert(
      'Permissions',
      defaultPermissions(permissions)
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  },
};
