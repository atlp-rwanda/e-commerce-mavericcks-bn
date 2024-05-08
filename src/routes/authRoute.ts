import { Router } from 'express';
import passport from 'passport';
import { authenticateViaGoogle, verifyOTP } from '../controllers/authController';
import { login } from '../controllers/authController';
import { isCheckedOTP } from '../middlewares/otpAuthMiddleware';
import { forgotPassword, resetPassword } from '../controllers/authController';
import { isAuthenticated } from '../middlewares/authMiddlewares';

const router = Router();
// redirect user to google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', authenticateViaGoogle);
router.post('/login', login);
router.post('/:token/otp', isCheckedOTP, verifyOTP);

// Route to request password reset
router.post('/forgot-password', forgotPassword);

// Route to reset password using provided token
router.post('/reset-password/:token', isAuthenticated, resetPassword);

export default router;
