import { Request, Response } from 'express';
import User from '../database/models/user';
import logger from '../logs/config';

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user data from request body
    const { firstName, lastName, email, password } = req.body;

    // Create a new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // Send success response with the newly created user
    res.status(201).json(newUser);
  } catch (error) {
    // Handle errors
    logger.error('Error adding user:', error);
    res.status(500).send('Internal Server Error');
  }
};

export { createUser };
