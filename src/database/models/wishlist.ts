import { Model, DataTypes } from 'sequelize';
import sequelize from '.';
import { Size } from './Size';

interface WishlistAttributes {
  id: string;
  userId: string;
  sizeId: string;
}

interface WishlistCreationAttributes extends Omit<WishlistAttributes, 'id'> {
  id?: string;
}

class Wishlist extends Model<WishlistAttributes, WishlistCreationAttributes> implements WishlistAttributes {
  public id!: string;
  public userId!: string;
  public sizeId!: string;

  public static associate(models: { Size: typeof Size }): void {
    Wishlist.belongsTo(models.Size, {
      foreignKey: 'sizeId',
      as: 'size',
    });
  }
}

Wishlist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: DataTypes.UUID,
    sizeId: DataTypes.UUID,
  },
  {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'Wishlists', // Corrected table name to match convention
    timestamps: true,
  }
);

Wishlist.belongsTo(Size, { foreignKey: 'sizeId' });
Size.hasMany(Wishlist, { foreignKey: 'sizeId' });
export default Wishlist;
