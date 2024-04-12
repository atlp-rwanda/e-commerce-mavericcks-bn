/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import db from './models';

const databaseConnection = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('connected to the database');
  } catch (error: any) {
    console.log(error.message);
  }
};

export default databaseConnection;
