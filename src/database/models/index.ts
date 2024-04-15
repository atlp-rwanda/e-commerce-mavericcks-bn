'use strict';

import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, Dialect } from 'sequelize';

const basename: string = path.basename(__filename);
const env: string = process.env.NODE_ENV || 'development';

const config = require('../config/config.js');
const db: any = {};

const dbConfig = config[env];

export const sequelize = new Sequelize(dbConfig.database!, dbConfig.username!, dbConfig.password!, {
  dialect: dbConfig.dialect! as Dialect,
  host: dbConfig.host || 'localhost',
});

export default { sequelize, db };
