import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import { Product } from './Product';

interface OrderItemAttributes {
  productId: string;
  quantity: number;
  id?: string;
  userId: string;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: string;
  public productId!: string;
  public quantity!: number;
  public userId!: string;
}
OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Product',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'orderItems',
  }
);

Product.belongsToMany(OrderItem, { through: 'ProductOrderItem' });

export default OrderItem;
