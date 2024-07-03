/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Request, Response } from 'express';
import { sendErrorResponse } from '../helpers/helper';
import Order from '../database/models/order';
import User from '../database/models/user';
import logger from '../logs/config';
import { io } from '../server';
import { sendInternalErrorResponse } from '../validations';

export const processOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { id } = req.user as User;
    const order = await Order.findOne({ where: { id: orderId, userId: id } });

    if (!order) {
      return sendErrorResponse(res, 'Order not found');
    }

    io.emit('orderProcessed', { order });

    return res.status(200).json({
      ok: true,
      message: `The order is ${order.status}`,
    });
  } catch (err) {
    logger.error('Error processing order:', err);
    return sendInternalErrorResponse(res, err);
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { id } = req.user as User;
    const order = await Order.findOne({ where: { id: orderId, userId: id } });

    if (!order) {
      return sendErrorResponse(res, 'Order not found');
    }
    console.log(order);

    if (order.status !== 'cancelled' && order.status !== 'pending') {
      return sendErrorResponse(
        res,
        'Only orders that are only paid only or pending are the only ones that can be cancelled'
      );
    }
    order.status = 'cancelled';
    await order.save();

    io.emit('orderCancelled', { order });

    return res.status(200).json({
      ok: true,
      message: 'Order is cancelled successfully !',
      data: order,
    });
  } catch (err) {
    logger.error('Error cancelling order:', err);
    return sendInternalErrorResponse(res, err);
  }
};

export const sellerChangeOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, expectedDeliveryDate } = req.body;
    const order = await Order.findOne({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return sendErrorResponse(res, 'Order not found or you do not have permission to modify this order');
    }

    order.status = status;
    if (expectedDeliveryDate) {
      order.expectedDeliveryDate = new Date(expectedDeliveryDate);
    }
    await order.save();

    io.emit('orderStatusChanged', { order });

    return res.status(200).json({
      ok: true,
      message: 'Order status updated successfully',
    });
  } catch (err) {
    logger.error('Error changing order status:', err);
    return sendInternalErrorResponse(res, err);
  }
};
