import { Router } from 'express';
import { addToWishlist, getWishlist, clearWishList, deleteWishlistItem } from '../controllers/wishlistController';
import { isAuthenticated, checkUserRoles } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/add-wishlist/:sizeId', isAuthenticated, checkUserRoles('buyer'), addToWishlist);
router.get('/get-wishlist', isAuthenticated, checkUserRoles('buyer'), getWishlist);
router.delete('/item/:id', isAuthenticated, checkUserRoles('buyer'), deleteWishlistItem);
router.delete('/clear', isAuthenticated, checkUserRoles('buyer'), clearWishList);

export default router;
