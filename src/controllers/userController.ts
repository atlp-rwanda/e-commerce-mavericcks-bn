import { NextFunction, Request, Response } from 'express';
import User from '../database/models/user';
import logger from '../logs/config';

import { asyncMiddleware } from '../middlewares/asyncMiddleware';
import AppError from '../helpers/AppError';

const createUser = asyncMiddleware(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Extract user data from request body
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    logger.error('Please provide firstName, lastName, email, and Password');
    return next(new AppError('Please provide firstName, lastName, email, and Password', 400));
  }
  // Create a new user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
  });
  res.status(201).json(newUser);
});

export { createUser };
