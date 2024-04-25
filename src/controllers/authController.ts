import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../database/models/user';
import { sendInternalErrorResponse, validateFields } from '../validations';
import logger from '../logs/config';

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

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      logger.error('Invalid credentials');
      res.status(404).json({ ok: false, message: 'Invalid credentials' });
      return;
    }

    // Authenticate user with jwt
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
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

export { login };
