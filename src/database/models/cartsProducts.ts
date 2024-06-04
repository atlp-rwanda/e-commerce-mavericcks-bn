import { Model, DataTypes } from 'sequelize';
import sequelize from './index';
import Cart from './cart';
import { Product } from './Product';
import { Size } from './Size';

class CartsProducts extends Model {
  public cartId!: string;
  public productId!: string;
  public sizeId!: string;
  public quantity!: number;
}

CartsProducts.init(
  {
    cartId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: Cart,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    productId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: Product,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    sizeId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: Size,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'CartsProducts',
    timestamps: true,
  }
);

export default CartsProducts;
