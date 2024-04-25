// Route to add a new user
import { Router } from 'express';
import { createUser } from '../controllers/userController';
import { activateUserAccount, deactivateUserAccount } from '../controllers/manageUserStatus';

const router = Router();

router.post('/', createUser);
router.put('/deactivate/:userId', deactivateUserAccount);
router.put('/activate/:userId', activateUserAccount);

export default router;
