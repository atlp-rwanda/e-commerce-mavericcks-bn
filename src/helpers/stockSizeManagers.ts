import { Product } from '../database/models/Product';
import { Size } from '../database/models/Size';

// function to check the current stock size, note that this function should be applied whenever the order has been successfully paid
export const updateStock = async (sizeId: string, productId: string, newQuantity = 0) => {
  const size = await Size.findOne({ where: { id: sizeId, productId } });
  if (!size) throw new Error('size not found');
  if (newQuantity === 0) {
    await size.destroy();
  }
  size.quantity = newQuantity;
  await size.save();
};
export const checkStockSize = async (sizeId: string, productId: string, quantity = 1): Promise<number> => {
  const product = await Product.findByPk(productId, {
    include: [{ model: Size, as: 'sizes', where: { id: sizeId }, attributes: ['quantity'] }],
  });
  if (!product) throw new Error('Product Not Available');
  // Note that I am getting a unique size which is one of the many sizes, I am allowed to grab the first since that's the only one I have
  const result = product.sizes[0].quantity > quantity ? product.sizes[0].quantity - quantity : -1;
  return result;
};
