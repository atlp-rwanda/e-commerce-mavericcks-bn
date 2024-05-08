import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { UserAttributes } from '../database/models/user';
import { sendInternalErrorResponse, validateFields, validatePassword } from '../validations';
import logger from '../logs/config';
import { passwordCompare } from '../helpers/encrypt';
import { verifyIfSeller } from '../middlewares/authMiddlewares';
import { createOTPToken, saveOTPDB } from '../middlewares/otpAuthMiddleware';
import { userToken, verifyToken } from '../helpers/token.generator';
import { sendErrorResponse } from '../helpers/helper';
// Additional imports
import { sendEmail } from '../helpers/send-email';
import { passwordEncrypt } from '../helpers/encrypt';

export const authenticateViaGoogle = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', (err: unknown, user: UserAttributes | null) => {
    if (err) {
      sendInternalErrorResponse(res, err);
      return;
    }
    if (!user) {
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY as string, {
      expiresIn: process.env.JWT_EXPIRATION as string,
    });

    res.status(200).json({
      ok: true,
      token: token,
    });
  })(req, res, next);
};

// login function
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const requiredFields = ['email', 'password'];
    const missingFields = validateFields(req, requiredFields);

    // Field validation
    if (missingFields.length > 0) {
      logger.error(`Adding User:Required fields are missing:${missingFields.join(', ')}`);
      res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
      return;
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      sendErrorResponse(res, 'invalidCredentials');
      return;
    }

    // Check if user is inactive
    if (user.status === 'inactive') {
      sendErrorResponse(res, 'inactiveUser');
      return;
    }

    // Check if user is verified
    if (!user.verified) {
      sendErrorResponse(res, 'unverifiedUser');
      return;
    }

    // Verify password
    const passwordValid = await passwordCompare(password, user.password);
    if (!passwordValid) {
      sendErrorResponse(res, 'invalidCredentials');
      return;
    }

    await verifyIfSeller(user, req, res);
  } catch (err: any) {
    const message = (err as Error).message;
    logger.error(message);
    sendInternalErrorResponse(res, err);
  }
};
// Function to verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const data = req.user as JwtPayload;
    const token = await userToken(data.id);

    res.status(200).json({ ok: true, token });
  } catch (error) {
    logger.error('VerifyOTP Internal Server Error', error);
    sendInternalErrorResponse(res, error);
  }
};
// Function to create OTP Token, Save it Postgres,
export const sendOTP = async (req: Request, res: Response, email: string) => {
  const userInfo = await User.findOne({ where: { email } });
  if (userInfo) {
    const { id, email, firstName } = userInfo.dataValues;

    const token = await createOTPToken(id, email, firstName);

    const otpSaved = await saveOTPDB(id, token);

    if (otpSaved) {
      /**
       * The token used for comparing the received OTP via email with the
       * generated token, which contains the user's ID.
       */
      const accessToken = jwt.sign({ id, FAEnabled: true }, process.env.SECRET_KEY as string, {
        expiresIn: process.env.JWT_EXPIRATION as string,
      });
      res.status(200).json({ ok: true, token: accessToken });
    }
  }
};

// Function to Request Password reset token
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Verify if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User with this email does not exist' });
    }

    // Generate reset token
    const token = await userToken(user.id, user.email);

    // Send email with token
    const link = `${process.env.URL_HOST}:${process.env.PORT}/api/auth/reset-password/${token}`;

    await sendEmail('reset_password', {
      name: `${user.firstName} ${user.lastName}`,
      email: `${user.email}`,
      link: link,
    });

    return res.status(200).json({
      ok: true,
      message: 'A password reset link has been sent to your email.',
    });
  } catch (error) {
    logger.error('Error requesting password reset: ', error);
    sendInternalErrorResponse(res, error);
    return;
  }
};

// Function to Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;

    const userId = (req.user as User).id;
    // Find user
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User does not exist' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        ok: false,
        error: 'Password must contain at least 1 letter, 1 number, and 1 special character, minumun 8 characters',
      });
    }

    // Hash new password
    const hashPassword = await passwordEncrypt(newPassword);

    // Update user's password
    await user.update({ password: hashPassword });

    return res.status(200).json({
      ok: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error('Error resetting password: ', error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
