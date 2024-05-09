import { Model, Optional, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from './index';

export interface SizeAttributes {
  id: number;
  size?: string;
  price: number;
  quantity?: number;
  discount?: number;
  expiryDate?: Date;
  productId: string;
  available?: boolean;
}

export interface SizeCreationAttributes extends Optional<SizeAttributes, 'id'> {}

export class Size extends Model<SizeAttributes, SizeCreationAttributes> implements SizeAttributes {
  public id!: number;
  public size!: string;
  public price!: number;
  public quantity!: number;
  public discount!: number;
  public expiryDate!: Date;
  public productId!: string;
  public available!: boolean;
}

Size.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      autoIncrement: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 1,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Set default value to true
    },
  },
  {
    sequelize,
    modelName: 'Size',
    tableName: 'sizes',
    timestamps: true,
  }
);
