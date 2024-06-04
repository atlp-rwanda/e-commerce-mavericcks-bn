import express from 'express';

import { addCartItem, updateCartItem, getCartItems, clearCart } from '../controllers/cartController';

import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';

const cartRouter = express.Router();

cartRouter
  .route('/')
  .get([isAuthenticated, checkUserRoles('buyer')], getCartItems)
  .post([isAuthenticated, checkUserRoles('buyer')], addCartItem)
  .delete([isAuthenticated, checkUserRoles('buyer')], clearCart);
cartRouter.route('/:id').patch([isAuthenticated, checkUserRoles('buyer')], updateCartItem);

export default cartRouter;
