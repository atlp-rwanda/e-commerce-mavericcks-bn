'use strict';

import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, Dialect } from 'sequelize';

const basename: string = path.basename(__filename);
const env: string = process.env.NODE_ENV || 'development';

const config = require('../config/config.js');
const db: any = {};

const dbConfig = config[env];
console.log(dbConfig.username);

const sequelize = new Sequelize(dbConfig.database!, dbConfig.username!, dbConfig.password!, {
  dialect: dbConfig.dialect! as Dialect,
  host: dbConfig.host || 'localhost',
});

fs.readdirSync(__dirname)
  .filter((file: string) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file: string) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
