import express from 'express';
import { login } from '../controllers/authController';

const router = express.Router();

// Route to login a user
router.post('/login', login);

export default router;
