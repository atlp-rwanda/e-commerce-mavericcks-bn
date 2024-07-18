import { Router } from 'express';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';
import {
  getUserOrders,
  createOrder,
  deleteOrder,
  sellerProductOrders,
  getOrderItems,
} from '../controllers/orderController';
import { processOrder, cancelOrder, sellerChangeOrderStatus } from '../controllers/orderStatusController';
const orderRouter = Router();

orderRouter
  .route('/')
  .get(isAuthenticated, checkUserRoles('buyer'), getUserOrders)
  .post(isAuthenticated, checkUserRoles('buyer'), createOrder);
orderRouter.route('/get-orders').get(isAuthenticated, checkUserRoles('seller'), sellerProductOrders);
orderRouter.route('/:id').delete(isAuthenticated, checkUserRoles('admin'), deleteOrder);
orderRouter.get('/:orderId/check-status', isAuthenticated, checkUserRoles('buyer'), processOrder);
orderRouter.get('/:orderId', isAuthenticated, checkUserRoles('buyer'), getOrderItems);
orderRouter.put('/:orderId/cancel', isAuthenticated, checkUserRoles('buyer'), cancelOrder);
orderRouter.put('/:orderId/seller-change-status', isAuthenticated, checkUserRoles('seller'), sellerChangeOrderStatus);
orderRouter.get('/seller-products-status', isAuthenticated, checkUserRoles('seller'), sellerProductOrders);
export default orderRouter;
