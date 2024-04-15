/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { sequelize } from './models';

const databaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('connected to the database');
  } catch (error: any) {
    console.log(error.message);
  }
};

export default databaseConnection;
