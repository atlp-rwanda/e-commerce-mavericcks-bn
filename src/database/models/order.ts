import { DataTypes, Model, UUIDV4 } from 'sequelize';
import sequelize from '.';
import OrderItem from './orderedItem';

interface OrderAttributes {
  id?: string;
  orderedItemsId: string[];
  paymentInfo: string[];
  address: string[];
  deliverlyStatus: string;
  coupons: string;
}

class Order extends Model<OrderAttributes> {}
Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      unique: true,
    },
    orderedItemsId: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      references: {
        model: 'OrderItem',
        key: 'id',
      },
    },
    paymentInfo: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    address: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    coupons: {
      type: DataTypes.STRING,
    },
    deliverlyStatus: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    modelName: 'Order',
    tableName: 'Orders',
    sequelize,
  }
);
Order.hasMany(OrderItem);
export default Order;
