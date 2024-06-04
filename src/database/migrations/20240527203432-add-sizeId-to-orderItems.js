'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orderItems', 'sizeId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'sizes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orderItems', 'sizeId');
  },
};
