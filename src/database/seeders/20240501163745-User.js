/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Seed} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          id: uuidv4(),
          firstName: 'admin',
          lastName: '',
          email: process.env.EMAIL,
          password:
            '$2b$10$ZCgzouXesg4Zqgj22u7ale5aAOJzmjfOchCpMlSgBMV8o2f.zdYUq',
          gender: 'not specified',
          phoneNumber: process.env.ADMIN_PHONE,
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active',
          RoleId: '6ef1e121-304a-4f08-ad4e-cd07f9578b52', // Replace with the actual RoleId
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
