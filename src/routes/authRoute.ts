import { Router } from 'express';
import passport from 'passport';
import { authenticateViaGoogle } from '../controllers/authController';
import { login } from '../controllers/authController';
import { logout } from '../controllers/logoutController';
import { signupUser } from '../controllers/userController';

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

//signup a user
router.post('/signup', signupUser);

// Route to login a user
router.post('/login', login);
router.post('/logout', logout);

export default router;
