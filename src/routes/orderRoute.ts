import { Router } from 'express';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';
import { getAllOrders, createOrder, deleteOrder, updateOrder } from '../controllers/orderController';
const orderRouter = Router();

orderRouter
  .route('/')
  .get(isAuthenticated, checkUserRoles('buyer'), getAllOrders)
  .post(isAuthenticated, checkUserRoles('buyer'), createOrder);
orderRouter
  .route('/:id')
  .delete(isAuthenticated, checkUserRoles('admin'), deleteOrder)
  .patch(isAuthenticated, checkUserRoles('buyer'), updateOrder);
export default orderRouter;
