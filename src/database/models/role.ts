import { Model, Optional, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from './index';
import Permission from './permission';
import RolePermission from './rolePermissions';

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
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    name: {
      type: DataTypes.ENUM('admin', 'buyer', 'seller'),
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
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  onDelete: 'CASCADE',
  onUpdate: 'RESTRICT',
});
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId' });
export default Role;
