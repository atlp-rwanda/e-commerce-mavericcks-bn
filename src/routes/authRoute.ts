import { Router } from 'express';
import passport from 'passport';
import { authenticateViaGoogle } from '../controllers/authController';
import { login } from '../controllers/authController';

const router = Router();
// redirect user to google for authentication
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// authenticated user and store user data
router.get('/google/callback', authenticateViaGoogle);

// Route to login a user
router.post('/login', login);

export default router;
