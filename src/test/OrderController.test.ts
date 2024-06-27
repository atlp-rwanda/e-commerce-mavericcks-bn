import { Request, Response } from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController';
import User from '../database/models/user';
import Cart from '../database/models/cart';
import Order from '../database/models/order';
import OrderItems from '../database/models/orderItems';

jest.mock('../database/models/user');
jest.mock('../database/models/cart');
jest.mock('../database/models/order');
jest.mock('../database/models/orderItems');

describe('Order Controller', () => {
  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const userId = '123';
      const mockUser = { id: userId, Role: { name: 'buyer' } };
      const mockCart = {
        id: 'cart1',
        userId,
        products: [
          {
            id: 'product1',
            sizes: [{ id: 'size1', price: 100, discount: 10 }],
            CartProduct: { quantity: 2 },
          },
        ],
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);
      (Order.create as jest.Mock).mockResolvedValue({ id: 'order1' });
      (OrderItems.create as jest.Mock).mockResolvedValue({});

      const req = {
        user: { id: userId },
        body: {
          shippingAddress1: 'Kigali',
          country: 'Rwanda',
          city: 'City',
          phone: '+25073456789',
          zipCode: '0000',
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await createOrder(req, res);

      expect(res.status).toBeCalledWith(201);
      expect(res.json).toBeCalledWith({
        ok: true,
        message: 'Order created successfully',
      });
    });
  });

  describe('getUserOrders', () => {
    it('should retrieve user orders successfully', async () => {
      const mockOrders = [{ id: 'order1', totalPrice: 200 }];

      (Order.findAll as jest.Mock).mockResolvedValue(mockOrders);

      const req = { user: { id: '23457' } } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getUserOrders(req, res);

      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith({
        ok: true,
        message: 'Orders retrieved successfully',
        data: mockOrders,
      });
    });
  });
});
