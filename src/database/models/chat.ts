import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '.';
import { UUIDV4 } from 'sequelize';
import User from './user';
interface ChatAttr {
  id: string;
  senderId: string;
  content: string;
  socketId: string;
  readStatus?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ChatCreationAttr extends Optional<ChatAttr, 'id'> {}

class Chat extends Model<ChatAttr, ChatCreationAttr> implements ChatAttr {
  public id!: string;
  public senderId!: string;
  public content!: string;
  public socketId!: string;
  public readStatus!: boolean;
  public readonly createdAt: Date | undefined;
  public readonly updatedAt: Date | undefined;
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    readStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  { timestamps: true, sequelize, tableName: 'Chats' }
);

Chat.belongsTo(User, { foreignKey: 'senderId' });

export default Chat;
