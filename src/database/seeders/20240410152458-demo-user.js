'use strict';

import { v4 as uuidv4 } from 'uuid';

export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert(
    'Users',
    [
      {
        id: uuidv4(),
        firstName: 'Admin',
        lastName: '',
        email: 'admin@gmail.com',
        password: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {}
  );
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('Users', null, {});
}
