import { Model, DataTypes } from 'sequelize';
import sequelize from './index';
import { UUIDV4 } from 'sequelize';
import { Category } from './Category';
import { Size } from './Size';
import User from './user';
import Cart from './cart';

export interface ProductAttributes {
  id?: string;
  sellerId: string;
  name: string;
  description: string;
  images: string[];
  colors?: string[];
  categoryId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product extends Model<ProductAttributes> implements ProductAttributes {
  public id!: string;
  public sellerId!: string;
  public name!: string;
  public description!: string;
  public categoryId!: string;
  public images!: string[];
  public colors!: string[];
  public readonly createdAt!: Date | undefined;
  public readonly updatedAt!: Date | undefined;
  sizes?: any;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    colors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    sellerId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      references: {
        model: 'Category',
        key: 'id',
      },
    },
  },
  { sequelize: sequelize, timestamps: true, modelName: 'Product', tableName: 'products' }
);

Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'user' });
Product.hasMany(Size, { foreignKey: 'productId', as: 'sizes' });
// Product.hasMany(Cart, { foreignKey: 'productId', as: 'carts' });
