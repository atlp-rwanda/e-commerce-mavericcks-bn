'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'permissions',
      [
        { name: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'write', createdAt: new Date(), updatedAt: new Date() },
        { name: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Add more permissions as needed
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};
