import { Request, Response } from 'express';
import { Cart } from '../database/models/cart';
import { Product, ProductAttributes } from '../database/models/Product';
import User from '../database/models/user';
import { sendInternalErrorResponse, validateFields } from '../validations';
import sequelize from '../database/models';
import logger from '../logs/config';
import { Size } from '../database/models/Size';

const addCartItem = async (req: Request, res: Response): Promise<void> => {
  const { productId, sizeId } = req.body;
  const { id: userId } = req.user as User;
  try {
    // Validate request body
    const missingFields = validateFields(req, ['productId', 'sizeId']);
    if (missingFields.length > 0) {
      res.status(400).json({
        ok: false,
        message: `Following required fields are missing: ${missingFields.join(', ')}`,
      });
      return;
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Check if the product exists
      const product = await Product.findByPk(productId, {
        include: {
          model: Size,
          as: 'sizes',
          where: { id: sizeId },
          attributes: ['quantity', 'price'],
        },
        transaction,
      });
      if (!product) {
        res.status(404).json({ ok: false, message: 'Product was not found in stock!' });
        return;
      }

      // Check if the item already exists in the cart
      const cartItem: any = await Cart.findOne({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'gender'],
          },
          {
            model: Product,
            as: 'products',
            through: { attributes: ['quantity'] },
          },
        ],
        where: { userId },
        transaction: transaction,
      });

      if (cartItem) {
        // Check if the product being added is already in the cart
        const existingProduct = cartItem.products.find((product: ProductAttributes) => product.id === productId);
        if (existingProduct) {
          // If the product already exists in the cart, increment the quantity in the join table
          await sequelize.query(
            'UPDATE "CartsProducts" SET quantity = quantity + 1 WHERE "cartId" =? AND "productId" =?',
            {
              replacements: [cartItem.id, product.id],
            }
          );
        } else {
          // If the product doesn't exist in the cart, add it to the cart
          await cartItem.addProducts(product, {
            through: { quantity: 1 },
            transaction: transaction,
          });
        }
      } else {
        // If the cart is empty, create a new cart item
        const newCartItem: any = await Cart.create({ userId }, { transaction });
        await newCartItem.addProducts(product, {
          through: { quantity: 1 },
          transaction,
        });
      }

      // Commit the transaction
      await transaction.commit();
      res.status(200).json({ ok: true, message: 'Product added to cart successfully' });
    } catch (error) {
      // Rollback the transaction if an error occurs
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
    // res.status(500).json({ ok: false, message: 'An unexpected error occurred' });
    sendInternalErrorResponse(res, error);
  }
};

//updating an item

const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity } = req.body;
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
      await sequelize.query('UPDATE "CartsProducts" SET quantity =? WHERE "cartId" =? AND "productId" =?', {
        replacements: [quantity, cartItem.id, productId],
        transaction,
      });

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
              attributes: ['quantity', 'price'],
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

    const products = cart.products.map((product: any) => {
      return {
        cartId: cart.id,
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: product.CartsProducts,
        image: product.images[0],
        sellerId: product.sellerId,
        createdAt: product.createdAt,
      };
    });
    res.status(200).json({ cart: products });
  } catch (error) {
    await transaction.rollback();
    throw error;
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
  } catch (error) {
    await transaction.rollback();
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};

export { addCartItem, updateCartItem, getCartItems, clearCart };
