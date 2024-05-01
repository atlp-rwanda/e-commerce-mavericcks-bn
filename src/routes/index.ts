/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import userRoute from './userRoute';
import profileRoutes from './profileRoutes';
import authRoute from './authRoute';
import roleRoute from './roleRoute';
import productRouter from './productRoutes';
import { categoryRouter } from './categoryRouter';
import wishlistRoute from './wishlistRoute';
import notificationRoutes from './notificationRoutes';
import { permissionRoute } from './permissionRoute';
import { sellerRequestRouter } from './sellerRequestRoute';

const router = Router();

router.use('/users', userRoute);
// Profile routes
router.use('/profiles', profileRoutes);
router.use('/auth', authRoute);
router.use('/roles', roleRoute);
router.use('/products', productRouter);
router.use('/category', categoryRouter);
router.use('/wishlist', wishlistRoute);
router.use('/notifications', notificationRoutes);
router.use('/permissions', permissionRoute);
router.use('/vendor-requests', sellerRequestRouter);

export default router;
