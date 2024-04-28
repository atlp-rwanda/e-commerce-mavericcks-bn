/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { updateUser, getUserProfile } from '../controllers/profileController';
import multerUpload from '../helpers/multer';
const router = Router();
router.get('/users/:userId/', getUserProfile);
router.patch('/users/:id', multerUpload.single('profileImage'), updateUser);
export default router;
