import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from './index';
interface VendorRequestAttributes {
  id: string;
  vendorId: string;
  status?: string; // pending, approved, rejected
  createdAt?: Date;
  updatedAt?: Date;
  documents: string[];
  agreement: boolean;
}
interface VendorRequestCreationAttributes extends Optional<VendorRequestAttributes, 'id'> {}
class VendorRequest
  extends Model<VendorRequestAttributes, VendorRequestCreationAttributes>
  implements VendorRequestAttributes
{
  public id!: string;
  public vendorId!: string;
  public status!: string;
  public documents!: string[];
  public agreement!: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}
VendorRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    documents: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    agreement: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: sequelize,
    tableName: 'VendorRequest',
  }
);

export default VendorRequest;
