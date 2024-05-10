import { Request, Response } from 'express';
import { Cart, CartCreationAttributes } from '../database/models/cart';
import CartAttributes from '../database/models/cart';
import { Product, ProductAttributes } from '../database/models/Product';
import User from '../database/models/user';
import { validateFields } from '../validations';
import sequelize from '../database/models';
import { Optional } from 'sequelize';

const addCartItem = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.body;
  const { id: userId } = req.user as User;
  try {
    // Validate request body
    const missingFields = validateFields(req, ['productId']);
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
      const product = await Product.findByPk(productId);
      if (!product) {
        res.status(404).json({ ok: false, message: 'Product was not found in Cart' });
        return;
      }

      // Check if the item already exists in the cart
      const cartItem: any = await Cart.findOne({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'address', 'phone', 'gender'],
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
          await sequelize.query('UPDATE CartsProducts SET quantity = quantity + 1 WHERE cartId =? AND productId =?', {
            replacements: [cartItem.id, productId],
          });
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
    } catch (error) {
      // Rollback the transaction if an error occurs
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
    res.status(500).json({ ok: false, message: 'An unexpected error occurred' });
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

    const existingProduct = cartItem.products.find((p: ProductAttributes) => p.id === productId);
    if (!existingProduct) {
      res.status(404).json({ ok: false, message: 'Product not found in cart' });
      return;
    }

    await sequelize.query('UPDATE CartsProducts SET quantity =? WHERE cartId =? AND productId =?', {
      replacements: [quantity, cartItem.id, productId],
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
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
        },
      ],
      transaction,
    });

    if (!cart) {
      res.status(404).json({ ok: false, message: 'Cart not found' });
      return;
    }

    res.json(cart.products);
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

    // Assuming you have a method to delete all associated products
    await Cart.destroy({
      where: { userId },
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export { addCartItem, updateCartItem, getCartItems, clearCart };
