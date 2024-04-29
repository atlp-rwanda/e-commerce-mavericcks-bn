import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from './index';

class BlacklistedToken extends Model {
  public id!: number;
  public token!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BlacklistedToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    modelName: 'BlacklistedToken',
    tableName: 'blacklisted_tokens',
    timestamps: true,
  }
);

export default BlacklistedToken;
