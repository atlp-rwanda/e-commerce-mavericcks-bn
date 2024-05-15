'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
require('ts-node').register();
const Role = require('../models/role').default;
/** @type {import('sequelize-cli').Seed} */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await Role.sync();
      const roles = await Role.findAll();
      if (roles.length === 0) {
        throw new Error('No roles found');
      }
      const role = roles[0].id;
      const {
        firstName,
        lastName,
        email,
        password,
        gender,
        verified,
        status,
        phoneNumber,
      } = process.env;
      const users = [
        {
          firstName,
          lastName,
          email,
          password: await hashPassword(password),
          gender,
          verified: toBoolean(verified),
          status,
          RoleId: role,
          phoneNumber,
        },
      ];

      return queryInterface.bulkInsert('Users', users.map(addUuid));
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  },
};

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
function toBoolean(value) {
  return value === 'true';
}
function addUuid(user) {
  return {
    ...user,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
