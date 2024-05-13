import logger from '../logs/config';
import { Request, Response } from 'express';
import Order from '../database/models/order';
import { sendInternalErrorResponse, validateFields } from '../validations';
import sequelize from '../database/models/index';
import { Transaction } from 'sequelize';
import User from '../database/models/user';
import { Product } from '../database/models/Product';
import { Size } from '../database/models/Size';
import Cart from '../database/models/cart';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const transaction: Transaction = await sequelize.transaction();
  const { id: userId } = req.user as User;
  try {
    const { shippingAddress1, shippingAddress2, cartId, country, city, phone, zipCode } = req.body;
    const missingFields = validateFields(req, ['cartId', 'shippingAddress1', 'city', 'country', 'phone']);
    if (missingFields.length !== 0) {
      res.status(400).json({ ok: false, message: `the following fields are required: ${missingFields.join(',')}` });
      return;
    }
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity'] },
          include: [{ model: Size, as: 'sizes', attributes: ['price'] }],
        },
      ],
      transaction,
    });

    if (!cart) {
      res.status(404).json({ ok: false, message: 'No cart found for this user!' });
      return;
    }
    const [orderItems] = await sequelize.query('SELECT "productId", quantity from "CartsProducts" where "cartId" = ?', {
      replacements: [cart.id],
      transaction,
    });

    const sizes = Promise.all(
      orderItems.map(async (item: any) => {
        const product = await Product.findOne({
          where: { id: item.productId },
          include: {
            model: Size,
            as: 'sizes',
            attributes: ['price'],
          },
          transaction,
        });

        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }

        // Calculate the total for each size
        const totals = (product as any).dataValues.sizes.map((size: Size) => {
          const total = size.price * item.quantity;
          return total;
        });

        // Sum up all totals for the current product
        const totalSum = totals.reduce((acc: number, curr: number) => acc + curr, 0);

        return totalSum;
      })
    );

    const totalPrice = (await sizes).reduce((prev: number, cur: number) => prev + cur) as number;
    const order = await Order.create(
      {
        phone,
        shippingAddress1,
        shippingAddress2,
        country,
        city,
        zipCode,
        cartId,
        userId,
        totalPrice,
      },
      { transaction }
    );
    await transaction.commit();
    res.status(201).json({ ok: true, message: 'Order created successfully', order });
  } catch (error) {
    logger.error('error creating order');
    logger.error(error);
    await transaction.rollback();
    sendInternalErrorResponse(res, error);
    return;
  }
};
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const orders = await Order.findAll({
      attributes: ['id', 'totalPrice', 'country', 'city', 'phone'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'phoneNumber', 'firstName', 'lastName'],
        },
        {
          model: Cart,
          as: 'Carts',
        },
      ],
      transaction,
    });

    if (orders.length === 0) {
      res.status(404).json({
        ok: false,
        message: 'No orders found',
      });
      return;
    }
    const [cartItems] = await sequelize.query('SELECT "productId", quantity from "CartsProducts" where "cartId" = ?', {
      replacements: [orders.map((order: any) => order.Carts.id)],
      transaction,
    });
    const orderedProducts = Promise.all(
      cartItems.map(async (item: any) => {
        const productsAndQuantity = [];
        const product = await Product.findOne({
          where: { id: item.productId },
          attributes: ['name', 'description', 'id'],
          include: {
            model: Size,
            as: 'sizes',
          },
        });
        productsAndQuantity.push({ product, quantity: item.quantity });
        return productsAndQuantity;
      })
    );
    await transaction.commit();
    res.status(200).json({ ok: true, data: { orders, orderItems: await orderedProducts } });
  } catch (error) {
    logger.error(error);
    await transaction.rollback();
    sendInternalErrorResponse(res, error);
    return;
  }
};
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      res.status(404).json({ ok: false, message: `No order found with id: ${req.params.id}` });
      return;
    }
    await Order.destroy({ where: { id: req.params.id } });
    res.status(200).json({ ok: true, message: 'Order deleted successfully!' });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      res.status(404).json({ ok: false, message: `No order found with id: ${req.params.id}` });
      return;
    }
    await Order.update(req.body, { where: { id: req.params.id } });
    res.status(200).json({ ok: true, message: 'Order updated successfully!' });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
