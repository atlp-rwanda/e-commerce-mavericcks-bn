import { Model, DataTypes, Optional } from 'sequelize';
import User from './user';
import { Product } from './Product';
import sequelize from '.';

interface CartAttributes {
  id: string;
  userId: string;
}
export interface CartCreationAttributes extends Optional<CartAttributes, 'id'> {}

export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: string;
  public userId!: string;
  map: any;
}
Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Cart',
    timestamps: true,
  }
);
Cart.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Cart.belongsToMany(Product, {
  through: 'CartsProducts',
  foreignKey: 'cartId',
  otherKey: 'productId',
  as: 'products',
});

export default Cart;
