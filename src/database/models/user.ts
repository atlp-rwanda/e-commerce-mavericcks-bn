import { Model, Optional, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from './index';
import Role from './role';
interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public getRoles!: () => Promise<Role[]>;
  public addRole!: (roles: Role) => Promise<Role[]>;
  public readonly createdAt!: Date | undefined;
  public readonly updatedAt!: Date | undefined;
  public removeRole!: (role: Role) => Promise<void>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'XXX',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: sequelize, timestamps: true }
);

export default User;
