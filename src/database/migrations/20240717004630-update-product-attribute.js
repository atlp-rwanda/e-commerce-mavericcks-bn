'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename the column
    await queryInterface.renameColumn(
      'products',
      'categoryId',
      'categoryName',
      {
        type: Sequelize.STRING,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert the change in case of rollback
    await queryInterface.renameColumn(
      'products',
      'categoryName',
      'categoryId',
      {
        type: Sequelize.STRING,
      }
    );
  },
};
