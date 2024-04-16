// Route to add a new user
import { Router } from 'express';
import { createUser } from '../controllers/userController';

const router = Router();

router.post('/', createUser);

export default router;
