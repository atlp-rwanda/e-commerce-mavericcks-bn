import { Optional, UUIDV4 } from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import sequelize from '.';
import User from './user';

export interface OtpAttributes {
  id: string;
  token: string;
  userId?: string;
}

export interface OtpCreationAttributes extends Optional<OtpAttributes, 'id'> {}

class Otp extends Model<OtpAttributes, OtpCreationAttributes> implements OtpAttributes {
  public id!: string;
  public token!: string;
  public userId!: string | undefined;
  public readonly createdAt: Date | undefined;
  public readonly updatedAt: Date | undefined;
}
Otp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(1235),
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: 'OTP',
  }
);
Otp.belongsTo(User, { foreignKey: 'userId' });

export default Otp;
