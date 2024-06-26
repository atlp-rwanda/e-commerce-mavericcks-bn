'use strict';

import { Sequelize, Dialect } from 'sequelize';
const env = process.env.NODE_ENV as string;

const config = require('../config/config.js');

const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database!, dbConfig.username!, dbConfig.password!, {
  dialect: dbConfig.dialect! as Dialect,
  host: dbConfig.host || 'localhost',
  port: dbConfig.port || 5432,
});

export default sequelize;
