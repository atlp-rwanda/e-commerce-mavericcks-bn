import { Router } from 'express';
import { chatApplication, chats } from '../controllers/chatController';
import { isAuthenticated } from '../middlewares/authMiddlewares';
const router = Router();

router.get('/chatApp', chatApplication);
router.get('/', isAuthenticated, chats);

export default router;
