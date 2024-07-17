/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import {
  createProduct,
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
  getAllProductsBySeller,
} from '../controllers/productsController';
import multerUpload from '../helpers/multer';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';

const router = Router();

router.post(
  '/create-product/',
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

router.get('/', getAllProduct);
router.get('/sizes', isAuthenticated, checkUserRoles('seller'), getAllSizes);
router.get('/:productId', getProductById);
router.delete('/:id', isAuthenticated, checkUserRoles('seller'), deleteProductById);
router.put('/:sizeId/available', isAuthenticated, checkUserRoles('seller'), markProductAsAvailable);
router.put('/:sizeId/unavailable', isAuthenticated, checkUserRoles('seller'), markProductAsUnavailable);
router.post('/:productId/review/', isAuthenticated, multerUpload.single('feedbackImage'), provideReviewToProduct);
router.delete('/:productId/review/:reviewId', isAuthenticated, deleteReview);
router.get('/:productId/review/statistics', calculateAverageRating);
router.get('/seller-products/:sellerId', isAuthenticated, checkUserRoles('seller'), getAllProductsBySeller);

export default router;
