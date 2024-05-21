/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import {
  createProduct,
  createSize,
  deleteProductById,
  getAllProduct,
  getProductById,
  markProductAsAvailable,
  markProductAsUnavailable,
  updateProduct,
  getAllSizes,
  provideReviewToProduct,
  calculateAverageRating,
  deleteReview,
  getProductReviewsById,
} from '../controllers/productsController';
import multerUpload from '../helpers/multer';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';

const router = Router();

router.post(
  '/:categoryId/create-product/',
  isAuthenticated,
  checkUserRoles('seller'),
  multerUpload.array('images', 8),
  createProduct
);

router.put(
  '/:productId/update-product',
  multerUpload.array('images', 8),
  isAuthenticated,
  checkUserRoles('seller'),
  updateProduct
);
router.post('/:productId/add-size', isAuthenticated, checkUserRoles('seller'), createSize);

router.get('/', getAllProduct);
router.get('/sizes', isAuthenticated, checkUserRoles('seller'), getAllSizes);
router.get('/:productId', getProductById);
router.delete('/:id', isAuthenticated, checkUserRoles('seller'), deleteProductById);
router.put('/:sizeId/available', isAuthenticated, checkUserRoles('seller'), markProductAsAvailable);
router.put('/:sizeId/unavailable', isAuthenticated, checkUserRoles('seller'), markProductAsUnavailable);
router.post('/:productId/review/', isAuthenticated, multerUpload.single('feedbackImage'), provideReviewToProduct);
router.delete('/:productId/review/:reviewId', isAuthenticated, deleteReview);
router.get('/:productId/review/statistics', isAuthenticated, calculateAverageRating);
router.get('/:productId/reviews', getProductReviewsById);

export default router;
