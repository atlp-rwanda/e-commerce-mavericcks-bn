import { Model, DataTypes, Optional, UUIDV4 } from 'sequelize';
import User from './user';
import sequelize from './index';
import Role from './role';

export interface PermissionAttributes {
  id: string;
  name: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id'> {}

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public id!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'permissions',
    sequelize,
  }
);
export default Permission;
