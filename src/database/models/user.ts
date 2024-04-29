// User Model
import { Model, Optional, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from './index';
import Role from './role';
import getDefaultRole from '../../helpers/defaultRoleGenerator';
import logger from '../../logs/config';

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  googleId?: string;
  photoUrl?: string;
  verified?: boolean;
  status?: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  RoleId?: string;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public gender!: string;
  public phoneNumber!: string;
  public googleId?: string | undefined;
  public photoUrl?: string | undefined;
  public verified!: boolean;
  public status!: UserStatus;
  public RoleId!: string | undefined;
  public readonly createdAt!: Date | undefined;
  public readonly updatedAt!: Date | undefined;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name is not empty.',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name is not empty.',
        },
        isEmail: {
          msg: 'Email must be a valid email address.',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['male', 'female', 'not specified']],
          msg: "Gender must be either 'male' or 'female'",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(UserStatus.ACTIVE, UserStatus.INACTIVE),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE,
    },
    RoleId: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      references: {
        model: Role,
        key: 'id',
      },
    },
  },
  { sequelize: sequelize, timestamps: true }
);

User.beforeCreate(async (user: User) => {
  try {
    const defaultRole = await getDefaultRole();
    user.RoleId = defaultRole;
  } catch (error) {
    logger.error('Error setting default role:', error);
    throw error;
  }
});

User.belongsTo(Role);

export default User;
