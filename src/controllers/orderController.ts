/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import logger from '../logs/config';
import { Request, Response } from 'express';
import Order from '../database/models/order';
import { sendInternalErrorResponse, validateFields } from '../validations';
import sequelize from '../database/models/index';
import User from '../database/models/user';
import { Product } from '../database/models/Product';
import { Size } from '../database/models/Size';
import Cart from '../database/models/cart';
import OrderItems from '../database/models/orderItems';
import { sendErrorResponse } from '../helpers/helper';

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
      'SELECT "productId", "sizeId", quantity FROM "CartsProducts" WHERE "cartId" = ?',
      {
        replacements: [cart.id],
      }
    );

    const sizes = await Promise.all(
      orderItems.map(async (item: any) => {
        const productSize = await Size.findOne({
          where: { id: item.sizeId },
          attributes: ['id', 'price', 'discount'],
        });

        if (!productSize) {
          throw new Error(`Size with id ${item.sizeId} not found`);
        }

        const discountDecimal = 1 - productSize.discount / 100;
        const discountedPrice = productSize.price * discountDecimal;
        const sizeQtyPrice = discountedPrice * item.quantity;

        return {
          productId: item.productId,
          sizeId: productSize.id,
          quantity: item.quantity,
          price: discountedPrice,
          sizeQtyPrice,
        };
      })
    );

    // combine all products sizes retrieved by flat()
    const combinedproductsAndSizes = sizes.flat();
    const totalPrice = combinedproductsAndSizes.reduce((prev: number, curr: any) => prev + curr.sizeQtyPrice, 0);

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
      combinedproductsAndSizes.map(async (item: any) =>
        OrderItems.create({
          orderId: order.id,
          productId: item.productId,
          sizeId: item.sizeId,
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
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.user as User;
    const orders = await Order.findAll({
      where: {
        userId: id,
      },
    });

    if (!orders || orders.length === 0) {
      return sendErrorResponse(res, 'No orders found');
    }

    return res.status(200).json({
      ok: true,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (err) {
    return sendInternalErrorResponse(res, err);
  }
};
export const sellerProductOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.user as User;
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItems,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'products',
              where: { sellerId: id },
            },
          ],
        },
      ],
    });
    if (!orders) {
      return sendErrorResponse(res, 'No orders found');
    }

    res.status(200).json({
      ok: true,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (err) {
    logger.error('Error changing order status:', err);
    console.log('hello there');
    return sendInternalErrorResponse(res, err);
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
