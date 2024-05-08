import { Router } from 'express';
import {
  createProduct,
  createSize,
  deleteProductById,
  getAllProduct,
  getProductById,
  markProductAsAvailable,
  markProductAsUnavailable,
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

router.post('/:productId/add-size', isAuthenticated, checkUserRoles('seller'), createSize);

router.get('/', getAllProduct);
router.get('/:productId', getProductById);
router.delete('/:id', isAuthenticated, checkUserRoles('seller'), deleteProductById);
router.put('/:sizeId/available', isAuthenticated, checkUserRoles('seller'), markProductAsAvailable);
router.put('/:sizeId/unavailable', isAuthenticated, checkUserRoles('seller'), markProductAsUnavailable);

export default router;
