import { Request, Response } from 'express';
import { Cart } from '../database/models/cart';
import { Product } from '../database/models/Product';
import User from '../database/models/user';
import { sendInternalErrorResponse } from '../validations';
import sequelize from '../database/models';
import logger from '../logs/config';
import { Size } from '../database/models/Size';
import CartsProducts from '../database/models/cartsProducts';
import { validateFields } from '../validations';
import { Transaction } from 'sequelize';
import { checkStockSize, updateStock } from '../helpers/stockSizeManagers';

const addCartItem = async (req: Request, res: Response): Promise<void> => {
  const { productId, sizeId, quantity } = req.body;
  const { id: userId } = req.user as User;
  let transaction: Transaction | null = null;
  // validate the required fields
  const requiredFields = validateFields(req, ['productId', 'sizeId']);
  if (requiredFields.length > 0) {
    res.status(400).json({ ok: false, message: `Required fields: ${requiredFields} ` });
    return;
  }
  try {
    // check if the product exist, given the productId
    transaction = await sequelize.transaction();
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      res.status(404).json({ ok: false, message: 'Product not found' });
      return;
    }
    let size: Size | null = null;
    // check if the product size exist
    size = await Size.findOne({ where: { productId, id: sizeId }, transaction });
    if (!size) {
      res.status(404).json({ ok: false, message: 'Size not found for this product' });
      return;
    }
    const stock = await checkStockSize(sizeId, productId, quantity);
    if (stock <= 0) {
      const product = await Product.findByPk(productId, {
        include: [{ model: Size, as: 'sizes', where: { id: sizeId }, attributes: ['quantity'] }],
      });

      res
        .status(404)
        .json({ ok: false, message: `Our stock has ${product?.sizes[0].quantity} product(s) of this size only!` });
      return;
    }
    await updateStock(sizeId, productId, stock);
    // Find the cart for the current user
    const cart = await Cart.findOne({ where: { userId }, transaction });
    if (cart) {
      // Check if product already exists in cart (optional for quantity update)
      let existingCartItem: CartsProducts | null = null;
      if (sizeId) {
        existingCartItem = await CartsProducts.findOne({
          where: { cartId: cart.id, productId: productId, sizeId: sizeId },
          transaction,
        });
      } else {
        existingCartItem = await CartsProducts.findOne({
          where: { cartId: cart.id, productId },
          transaction,
        });
      }
      // Update quantity if product already exists, otherwise create a new entry
      if (existingCartItem) {
        existingCartItem.quantity += quantity ?? 1;
        await existingCartItem.save({ transaction });
      } else {
        await CartsProducts.create({
          cartId: cart.id,
          productId,
          sizeId,
          quantity: quantity ?? 1,
        });
      }
    } else {
      const newCart = await Cart.create(
        {
          userId,
        },
        { transaction }
      );

      await CartsProducts.create({ cartId: newCart.id, productId, sizeId, quantity: quantity ?? 1 }, { transaction });
    }
    await transaction.commit();
    res.status(200).json({ message: 'Product added to cart successfully' });
    return;
  } catch (error) {
    await transaction?.rollback();
    sendInternalErrorResponse(res, error instanceof Error ? error.message : error);
    return;
  }
};

const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity, sizeId } = req.body;
  const { id: userId } = req.user as User;

  const transaction = await sequelize.transaction();
  try {
    const cartItem: any = await Cart.findOne({
      where: { userId },
      transaction,
    });

    if (!cartItem) {
      res.status(404).json({ ok: false, message: 'Cart not found' });
      return;
    }
    if (quantity >= 1) {
      await sequelize.query(
        'UPDATE "CartsProducts" SET quantity =? WHERE "cartId" =? AND "productId" =? and "sizeId" =?',
        {
          replacements: [quantity, cartItem.id, productId, sizeId],
          transaction,
        }
      );

      await transaction.commit();
      res.status(200).json({ ok: true, message: 'Cart updated successfully' });
    } else {
      throw new Error('Quantity cannot be less than 1');
    }
  } catch (error) {
    await transaction.rollback();
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};

//getting items of a cart

const getCartItems = async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = req.user as User;

  const transaction = await sequelize.transaction();
  try {
    const cart: any = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity'] },
          include: [
            {
              model: Size,
              as: 'sizes',
              attributes: ['size', 'price'],
            },
          ],
        },
      ],
      transaction,
    });
    if (!cart) {
      res.status(404).json({ ok: false, message: 'Cart not found' });
      return;
    }
    const cartsProducts = await CartsProducts.findAll({ where: { cartId: cart.id }, transaction });
    const allProducts = Promise.all(
      cartsProducts.map(async item => {
        return {
          product: await Product.findOne({
            where: { id: item.productId },
            attributes: ['id', 'name', 'sellerId', 'images'],
            include: [
              {
                model: Size,
                as: 'sizes',
                where: {
                  id: item.sizeId,
                },
                attributes: ['price', 'size', 'id'],
              },
            ],
            transaction,
          }),
          quantity: item.quantity,
        };
      })
    );
    if ((await allProducts).length < 1) {
      res.status(404).json({ ok: false, message: 'No Product in the Cart' });
      return;
    }
    const sendProducts = [...(await allProducts)].map(item => {
      if (!item.product) return null;
      const { id, name, sellerId, images, sizes } = item.product;
      return {
        id,
        name,
        sizes,
        sellerId,
        image: images[0],
        quantity: item.quantity,
      };
    });
    await transaction.commit();
    res.status(200).json({ ok: true, cartId: cart.id, cartProducts: sendProducts });
    return;
  } catch (error) {
    await transaction.rollback();
    logger.error(error);
    sendInternalErrorResponse(res, error instanceof Error ? error.message : error);
  }
};

//clear cart

const clearCart = async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = req.user as User;

  const transaction = await sequelize.transaction();
  try {
    const cart = await Cart.findOne({
      where: { userId },
      transaction,
    });

    if (!cart) {
      res.status(404).json({ ok: false, message: 'Cart not found' });
      return;
    }

    await sequelize.query('DELETE FROM "CartsProducts" WHERE "cartId" =?', { replacements: [cart.id], transaction });
    await transaction.commit();
    res.status(200).json({ ok: true, message: 'Cart cleared successfully' });
    return;
  } catch (error) {
    await transaction.rollback();
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};

export { addCartItem, updateCartItem, getCartItems, clearCart };
