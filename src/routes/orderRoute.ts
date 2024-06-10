import { Router } from 'express';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';
import { getUserOrders, createOrder, deleteOrder, sellerProductOrders } from '../controllers/orderController';
const orderRouter = Router();

orderRouter
  .route('/')
  .get(isAuthenticated, checkUserRoles('buyer'), getUserOrders)
  .post(isAuthenticated, checkUserRoles('buyer'), createOrder);
orderRouter.route('/get-orders').get(isAuthenticated, checkUserRoles('seller'), sellerProductOrders);
orderRouter.route('/:id').delete(isAuthenticated, checkUserRoles('admin'), deleteOrder);
export default orderRouter;
