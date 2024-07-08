/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { activateUserAccount, deactivateUserAccount } from '../controllers/manageUserStatus';
import {
  deleteUser,
  editUser,
  editUserRole,
  enable2FA,
  getAllUser,
  getUsersByRoleName,
  getOneUser,
  resendVerifyLink,
  signupUser,
  userVerify,
} from '../controllers/userController';
import multerUpload from '../helpers/multer';
import { checkUserRoles, isAuthenticated } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/signup', signupUser);
router.get('/', isAuthenticated, checkUserRoles('admin'), getAllUser);
router.get('/user/:id', isAuthenticated, getOneUser);
router.delete('/:id', isAuthenticated, checkUserRoles('admin'), deleteUser);
router.patch('/edit/:id', isAuthenticated, multerUpload.single('profileImage'), editUser);
router.put('/role/:userId', isAuthenticated, checkUserRoles('admin'), editUserRole);
router.get('/role/:roleName', isAuthenticated, checkUserRoles('admin'), getUsersByRoleName);
router.get('/:token/verify-email', userVerify);
router.post('/resend-verify', resendVerifyLink);
router.put('/deactivate/:userId', isAuthenticated, deactivateUserAccount);
router.put('/activate/:userId', isAuthenticated, checkUserRoles('admin'), activateUserAccount);
router.patch('/enable2fa', isAuthenticated, checkUserRoles('seller'), enable2FA);

export default router;
