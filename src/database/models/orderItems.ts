import { DataTypes, Model, Optional, UUIDV4 } from 'sequelize';
import sequelize from './index';
import Order from './order';
import { Product } from './Product';
import { Size } from './Size';

interface OrderItemsAttributes {
  id: string;
  orderId: string;
  productId: string;
  sizeId: string;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemsAttributes, 'id'> {}

class OrderItems extends Model<OrderItemsAttributes, OrderItemCreationAttributes> implements OrderItemsAttributes {
  public id!: string;
  public orderId!: string;
  public productId!: string;
  public sizeId!: string;
  public quantity!: number;
  public price!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItems.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    sizeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sizes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
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
    modelName: 'OrderItems',
    tableName: 'orderItems',
  }
);

OrderItems.belongsTo(Order, { foreignKey: 'orderId', as: 'orders' });
OrderItems.belongsTo(Product, { foreignKey: 'productId', as: 'products' });
OrderItems.belongsTo(Size, { foreignKey: 'sizeId', as: 'sizes' });

Order.hasMany(OrderItems, { foreignKey: 'orderId', as: 'orderItems' });
Product.hasMany(OrderItems, { foreignKey: 'productId', as: 'orderItems' });

export default OrderItems;
