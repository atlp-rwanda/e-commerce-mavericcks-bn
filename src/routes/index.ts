/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import userRoute from './userRoute';
import profileRoutes from './profileRoutes';
import authRoute from './authRoute';
import roleRoute from './roleRoute';
import productRouter from './productRoutes';
import { categoryRouter } from './categoryRouter';
import wishlistRoute from './wishlistRoute';

const router = Router();

router.use('/users', userRoute);
// Profile routes
router.use('/profiles', profileRoutes);
router.use('/auth', authRoute);
router.use('/roles', roleRoute);
router.use('/products', productRouter);
router.use('/category', categoryRouter);
router.use('/wishlist', wishlistRoute);
export default router;
