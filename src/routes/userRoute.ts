/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { activateUserAccount, deactivateUserAccount } from '../controllers/manageUserStatus';
import {
  deleteUser,
  editUser,
  editUserRole,
  getAllUser,
  getOneUser,
  signupUser,
  userVerify,
} from '../controllers/userController';
import multerUpload from '../helpers/multer';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/signup', signupUser);
router.get('/:page?', isAuthenticated, getAllUser);
router.get('/user/:id', isAuthenticated, getOneUser);
router.delete('/:id', isAuthenticated, checkUserRoles('admin'), deleteUser);
router.patch('/edit/:id', isAuthenticated, multerUpload.single('profileImage'), editUser); // remove id param
router.put('/role/:userId', isAuthenticated, checkUserRoles('admin'), editUserRole);
router.get('/:token/verify-email', userVerify);
router.put('/deactivate/:userId', isAuthenticated, deactivateUserAccount);
router.put('/activate/:userId', isAuthenticated, checkUserRoles('admin'), activateUserAccount);

export default router;
