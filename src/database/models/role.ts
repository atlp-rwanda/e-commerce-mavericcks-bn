import { Model, DataTypes, Optional, UUIDV4 } from 'sequelize';
import sequelize from './index';

import Permission from './permission';

export interface RoleAttributes {
  id: string;
  name: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public permissions!: Permission[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public getPermissions!: () => Promise<Permission[]>;
  public addPermission!: (permission: Permission) => Promise<void>;
  public removePermission!: (permission: Permission) => Promise<void>;
  public static associate: () => void;
}

Role.init(
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
    tableName: 'roles',
    sequelize,
  }
);

export default Role;
