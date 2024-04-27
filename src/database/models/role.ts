import { Model, Optional, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from './index';

export interface RoleAttributes {
  id: string;
  name: string;
  displayName?: string;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public displayName?: string;
  public readonly createdAt: Date | undefined;
  public readonly updatedAt: Date | undefined;
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
    displayName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: sequelize,
    timestamps: true,
  }
);

export default Role;
