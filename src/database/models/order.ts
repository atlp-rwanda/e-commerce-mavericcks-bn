import { DataTypes, Model, Optional, UUIDV4 } from 'sequelize';
import sequelize from './index';
import User from './user';
// import Cart from './cart';

interface OrderAttributes {
  id: string;
  status?: string; // pending delivered cancelled
  createdAt?: Date;
  updatedAt?: Date;
  shippingAddress1?: string;
  shippingAddress2?: string;
  phone?: string;
  city?: string;
  country?: string;
  userId: string;
  zipCode?: string;
  totalPrice: number;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public status!: string; // pending delivered cancelled
  public createdAt!: Date;
  public updatedAt!: Date;
  public shippingAddress1!: string;
  public shippingAddress2?: string;
  public phone!: string;
  public city!: string;
  public country!: string;
  public userId!: string;
  public totalPrice!: number;
  public zipCode?: string;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    shippingAddress1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingAddress2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
  },

  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
  }
);
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId' });
// Cart.hasMany(Order, { foreignKey: 'cartId', as: 'orders' });
// Order.belongsTo(Cart, { foreignKey: 'cartId', as: 'Carts' });

export default Order;
