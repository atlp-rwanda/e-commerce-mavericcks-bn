import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User, { UserAttributes } from '../database/models/user';
import { sendInternalErrorResponse, validateFields } from '../validations';
import logger from '../logs/config';
import { passwordCompare } from '../helpers/encrypt';

const authenticateViaGoogle = (req: Request, res: Response, next: NextFunction) => {
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
const login = async (req: Request, res: Response): Promise<void> => {
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
      logger.error('Invalid credentials');
      res.status(404).json({ ok: false, message: 'Invalid credentials' });
      return;
    }

    // Check if user is inactive
    if (user.status === 'inactive') {
      logger.error('Your account has been blocked. Please contact support.');
      res.status(403).json({ ok: false, message: 'Your account has been blocked. Please contact support.' });
      return;
    }

    // Check if user is verified
    if (!user.verified) {
      logger.error('Your account is not verified. Please verify your account.');
      res.status(403).json({ ok: false, message: 'Your account is not verified. Please verify your account.' });
      return;
    }

    // Verify password
    const passwordValid = await passwordCompare(password, user.password);
    if (!passwordValid) {
      logger.error('Invalid credentials');
      res.status(404).json({ ok: false, message: 'Invalid credentials' });
      return;
    }

    // Authenticate user with jwt
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY as string, {
      expiresIn: process.env.JWT_EXPIRATION as string,
    });

    res.status(200).json({
      ok: true,
      token: token,
    });
  } catch (err: any) {
    const message = (err as Error).message;
    logger.error(message);
    sendInternalErrorResponse(res, err);
  }
};

export { login, authenticateViaGoogle };
