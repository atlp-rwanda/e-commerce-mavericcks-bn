/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import passport from 'passport';
import { authenticateViaGoogle, login, updatePassword } from '../controllers/authController';
import { isAuthenticated } from '../middlewares/authMiddlewares';
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

router.put('/update-password', updatePassword, isAuthenticated);

export default router;
