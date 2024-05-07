/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { createProduct, createSize } from '../controllers/productsController';
import multerUpload from '../helpers/multer';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';

export const productRouter = express.Router();

productRouter.post(
  '/:categoryId/create-product/',
  isAuthenticated,
  checkUserRoles('seller'),
  multerUpload.array('images', 8),
  createProduct
);

productRouter.post('/:productId/add-size', isAuthenticated, checkUserRoles('seller'), createSize);
