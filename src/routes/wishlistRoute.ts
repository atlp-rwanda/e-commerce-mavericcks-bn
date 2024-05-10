import { Router } from 'express';
import { addToWishlist, getWishlist, clearWishList, deleteWishlistItem } from '../controllers/wishlistController';
import { isAuthenticated, checkUserRoles } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/add-wishlist/:id', isAuthenticated, checkUserRoles('buyer'), addToWishlist);
router.get('/get-wishlist', isAuthenticated, checkUserRoles('buyer'), getWishlist);
router.delete('/:id', isAuthenticated, checkUserRoles('buyer'), deleteWishlistItem);
router.delete('/', isAuthenticated, checkUserRoles('buyer'), clearWishList);

export default router;
