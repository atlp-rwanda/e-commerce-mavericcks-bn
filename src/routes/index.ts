import { Router } from 'express';
import userRoute from './userRoute';
import authRoute from './authRoute';
import roleRoute from './roleRoute';

const router = Router();

router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/roles', roleRoute);

export default router;
