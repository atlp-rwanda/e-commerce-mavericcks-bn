import { Model, Optional, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from './index';

interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  googleId?: string;
  photoUrl?: string;
  verified: boolean;
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
  public gender!: string;
  public phoneNumber!: string;
  public googleId?: string | undefined;
  public photoUrl?: string | undefined;
  public verified!: boolean;
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
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name is not empty.',
        },
      },
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
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password must not be empty.',
        },
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['Male', 'Female']],
          msg: "Gender must be either 'male' or 'female'",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: {
          msg: 'Phone number cannot be empty.',
        },
        isNumeric: {
          msg: 'Phone number must contain only digits.',
        },
        len: {
          args: [5, 15],
          msg: 'Phone number must be between 5 and 15 digits long.',
        },
      },
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
  },
  { sequelize: sequelize, timestamps: true }
);

export default User;
