/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import userRoute from './userRoute';
import authRoute from './authRoute';
import roleRoute from './roleRoute';
import { productRouter } from './productRoutes';
import { categoryRouter } from './categoryRouter';

const router = Router();

router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/roles', roleRoute);
router.use('/products', productRouter);
router.use('/category', categoryRouter);
export default router;
