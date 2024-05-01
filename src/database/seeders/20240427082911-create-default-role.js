'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      {
        id: uuidv4(),
        name: 'buyer',
        displayName: 'Buyer Role',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6ef1e121-304a-4f08-ad4e-cd07f9578b52',
        name: 'admin',
        displayName: 'Admin Role',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', { name: 'buyer' });
  },
};
