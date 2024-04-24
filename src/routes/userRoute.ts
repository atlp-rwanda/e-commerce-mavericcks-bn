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
const router = Router();

router.post('/signup', signupUser);
router.get('/:page?', getAllUser);
router.get('/user/:id', getOneUser);
router.delete('/:id', deleteUser);
router.patch('/edit/:id', multerUpload.single('profileImage'), editUser); // remove id param
router.put('/role/:userId', editUserRole);
router.get('/:token/verify-email', userVerify);
router.put('/deactivate/:userId', deactivateUserAccount);
router.put('/activate/:userId', activateUserAccount);

export default router;
