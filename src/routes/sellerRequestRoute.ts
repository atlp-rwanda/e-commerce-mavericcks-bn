/* eslint-disable @typescript-eslint/no-misused-promises */
import { isAuthenticated } from '../middlewares/authMiddlewares';
import { Router } from 'express';
import multerUpload from '../helpers/multer';
import {
  createSellerRequest,
  getAllSellerRequests,
  getSellerRequest,
  updateSellerRequest,
  deleteSellerRequest,
} from '../controllers/sellerRequestController';

export const sellerRequestRouter = Router();

sellerRequestRouter
  .route('/')
  .post(isAuthenticated, multerUpload.array('documents', 6), createSellerRequest)
  .get(isAuthenticated, getAllSellerRequests);
sellerRequestRouter
  .route('/:id')
  .get(isAuthenticated, getSellerRequest)
  .patch(isAuthenticated, multerUpload.array('documents', 6), updateSellerRequest)
  .delete(isAuthenticated, deleteSellerRequest);
