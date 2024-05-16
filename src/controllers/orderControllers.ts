import { Request, Response } from 'express';
import { sendInternalErrorResponse, validateFields } from '../validations';
import OrderItem from '../database/models/orderedItem';
import logger from '../logs/config';
import sequelize from '../database/models';
import { Product } from '../database/models/Product';
import { Size } from '../database/models/Size';

const createOrderItem = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  const { id: userId } = req.user as any;
  const { quantity, productId } = req.body;

  try {
    const missingFields = validateFields(req, ['quantity', 'productId']);
    if (missingFields.length !== 0) {
      res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
      return;
    }
    const orderedItem = await OrderItem.create({ quantity, productId, userId }, { transaction });

    res.status(201).json({
      ok: true,
      message: 'Order was successfully created',
      data: orderedItem,
    });
    transaction.commit();
  } catch (error) {
    transaction.rollback();
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};

//THINGS TO GET FROM REQ.USER = PHONE, EMAIL, VERIFIED,
//THINGS TO GET FROM REQEST BODY = ORDERED ITEMS, QUANTITY,
const createOrderList = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { id: userId, phoneNumber } = req.user as any;
    const { shippingAddress, city } = req.body;
    const orderedItems = await OrderItem.findAll({ where: { userId }, transaction });

    if (orderedItems.length === 0) throw new Error(' The ordered Items cannot be be found');

    const orderedItemsId = orderedItems.map(item => item.id);

    const productsOrdered = [];
    for (const item of orderedItems) {
      const product = await Product.findAll({
        attributes: ['name'],
        where: { id: item.productId },
        include: {
          model: Size,
          attributes: ['price'],
        },
        transaction,
      });
      productsOrdered.push(product);
    }
    if (productsOrdered.length === 0) {
      throw new Error('There are no products ordered. Please try again');
    }
    const totalPrice = productsOrdered.reduce((total, product) => {
      product.forEach(p => {
        total += p.price;
      });
      return total;
    }, 0);

    // const order = await Order.create({orderedItemsId});
    //CREATE A AN ORDER LISTS HERE

    transaction.commit();
  } catch (error) {
    transaction.rollback();
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
