import express from 'express';

import { addCartItem, updateCartItem, getCartItems, clearCart } from '../controllers/cartController';

import { isAuthenticated } from '../middlewares/authMiddlewares';

const cartRouter = express.Router();

cartRouter
  .route('/')
  .get(isAuthenticated, getCartItems)
  .post(isAuthenticated, addCartItem)
  .delete(isAuthenticated, clearCart);
cartRouter.route('/:id').patch(isAuthenticated, updateCartItem);

export default cartRouter;
