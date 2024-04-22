import { Model, DataTypes } from 'sequelize';
import sequelize from './index';
import User from './user';
import Role from './role';
import Permission from './permission';
class UserRole extends Model {
  public userId!: number;
  public roleId!: number;
}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
  },
  {
    tableName: 'user_roles',
    sequelize,
  }
);

class RolePermission extends Model {
  public roleId!: number;
  public permissionId!: number;
}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    permissionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
  },
  {
    tableName: 'role_permissions',
    sequelize,
  }
);
// defining relations
User.belongsToMany(Role, { through: 'UserRole' });
Role.belongsToMany(User, { through: 'UserRole' });

Role.belongsToMany(Permission, { through: 'RolePermission' });
Permission.belongsToMany(Role, { through: 'RolePermission' });

export { UserRole, RolePermission };
