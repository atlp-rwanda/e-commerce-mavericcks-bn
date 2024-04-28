import { Router } from 'express';
import userRoute from './userRoute';
import profileRoutes from './profileRoutes';
import authRoute from './authRoute';
import roleRoute from './roleRoute';

const router = Router();

router.use('/users', userRoute);
// Profile routes
router.use('/profiles', profileRoutes);
router.use('/auth', authRoute);
router.use('/roles', roleRoute);

export default router;
