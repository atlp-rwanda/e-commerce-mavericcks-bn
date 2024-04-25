'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Leon16061998@',
        gender: 'Male',
        phoneNumber: '1234567890',
        googleId: null,
        photoUrl: null,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'nplcodes@gmail.com',
        password: 'Leon16061998@',
        gender: 'Female',
        phoneNumber: '9876543210',
        googleId: null,
        photoUrl: null,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        password: 'Leon16061998@',
        gender: 'Female',
        phoneNumber: '5551234567',
        googleId: null,
        photoUrl: null,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bob.brown@example.com',
        password: 'Leon16061998@',
        gender: 'Male',
        phoneNumber: '4449876543',
        googleId: null,
        photoUrl: null,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        firstName: 'Eve',
        lastName: 'Taylor',
        email: 'eve.taylor@example.com',
        password: 'Leon16061998@',
        gender: 'Female',
        phoneNumber: '7894561230',
        googleId: null,
        photoUrl: null,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
