/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { UserAttributes } from '../database/models/user';
import { sendInternalErrorResponse, validateFields } from '../validations';
import logger from '../logs/config';

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
    const passwordValid = await bcrypt.compare(password, user.password);
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
const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({
        ok: false,
        message: 'Unauthorized',
      });
      return;
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    if (!decode) {
      res.status(400).json({
        ok: false,
        message: 'Invalid token',
      });
    }
    const saltRound = await bcrypt.genSalt(10);
    const user = await User.findOne({
      where: {
        id: decode.id,
      },
    });
    if (!user) {
      res.status(400).json({
        ok: false,
        message: 'User not found',
      });
      return;
    }
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      res.status(400).json({
        ok: false,
        message: 'The old password is incorrect!',
      });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRound);
    await User.update(
      { password: hashedNewPassword },
      {
        where: {
          id: decode.id,
        },
      }
    );
    res.status(200).json({
      ok: true,
      message: 'Successfully updated user password!',
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    sendInternalErrorResponse(res, error);
  }
};

export { login, updatePassword, authenticateViaGoogle };
