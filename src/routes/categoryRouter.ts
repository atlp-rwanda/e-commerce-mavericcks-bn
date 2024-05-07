/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';
import { createCategory } from '../controllers/categoriesController';

export const categoryRouter = express.Router();

categoryRouter.post('/create-category', isAuthenticated, checkUserRoles('admin'), createCategory);
