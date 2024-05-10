import { Model, Optional, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from './index';

export interface NotificationAttributes {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> {
  public id!: string;
  public message!: string;
  public userId!: string;
  public isRead!: boolean;
  public readonly createdAt: Date | undefined;
  public readonly updatedAt: Date | undefined;
}
Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize: sequelize,
    timestamps: true,
  }
);

export default Notification;
