import { Router } from 'express';
import passport from 'passport';
import { authenticateViaGoogle, verifyOTP } from '../controllers/authController';
import { login } from '../controllers/authController';
import { isCheckedOTP } from '../middlewares/otpAuthMiddleware';

const router = Router();
// redirect user to google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', authenticateViaGoogle);
router.post('/login', login);
router.post('/:token/otp', isCheckedOTP, verifyOTP);

export default router;
