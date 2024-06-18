/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import logger from '../logs/config';
import sequelize from './models';

const databaseConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('connected to the database');
  } catch (error) {
    logger.info(error);
    if (error instanceof Error) logger.error(error.message);
  }
};

export default databaseConnection;
