/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';
import { createCategory, getAllCategories } from '../controllers/categoriesController';
import multerUpload from '../helpers/multer';

export const categoryRouter = express.Router();

categoryRouter
  .route('/')
  .post(isAuthenticated, multerUpload.single('image'), checkUserRoles('admin'), createCategory)
  .get(isAuthenticated, checkUserRoles('seller'), getAllCategories);
