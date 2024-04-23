import { Router } from 'express';
import userRoute from './userRoute';
import roleRoute from './roleRoute';

const router = Router();

router.use('/users', userRoute);
router.use('/role', roleRoute);
export default router;
