import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from './index';
// create a permission interface with the following attributes, id, name
export interface PermissionAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
// create a permission creation interface with the following attributes, name, createdAt, updatedAt
export interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id'> {}
export default class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public id!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      set(value: string) {
        this.setDataValue('name', value.toLowerCase());
      },
    },
  },

  {
    sequelize: sequelize,
    timestamps: true,
  }
);
