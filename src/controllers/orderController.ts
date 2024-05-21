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
import OrderItems from '../database/models/orderItems';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = req.user as User;

  try {
    const { shippingAddress1, shippingAddress2, country, city, phone, zipCode } = req.body;
    const missingFields = validateFields(req, ['shippingAddress1', 'city', 'country', 'phone']);
    if (missingFields.length !== 0) {
      res.status(400).json({ ok: false, message: `The following fields are required: ${missingFields.join(',')}` });
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
    });

    if (!cart) {
      res.status(404).json({ ok: false, message: 'No cart found for this user!' });
      return;
    }

    const [orderItems]: any = await sequelize.query(
      'SELECT "productId", quantity FROM "CartsProducts" WHERE "cartId" = ?',
      {
        replacements: [cart.id],
      }
    );

    const sizes = await Promise.all(
      orderItems.map(async (item: any) => {
        const product = await Product.findOne({
          where: { id: item.productId },
          include: {
            model: Size,
            as: 'sizes',
            attributes: ['price'],
          },
        });

        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }

        const size = product.sizes[0];
        const totalSum = size.price * item.quantity;

        return { productId: item.productId, quantity: item.quantity, price: size.price, totalSum };
      })
    );

    const totalPrice = sizes.reduce((prev: number, cur: any) => prev + cur.totalSum, 0);

    const order = await Order.create({
      phone,
      shippingAddress1,
      shippingAddress2,
      country,
      city,
      zipCode,
      userId,
      totalPrice,
    });

    await Promise.all(
      sizes.map(async (item: any) =>
        OrderItems.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })
      )
    );

    res.status(201).json({ ok: true, message: 'Order created successfully', order });
  } catch (error) {
    logger.error('Error creating order');
    logger.error(error);
    sendInternalErrorResponse(res, error);
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
