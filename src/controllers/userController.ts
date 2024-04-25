import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../database/models/user';
import logger from '../logs/config';

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user data from request body
    const { firstName, lastName, email, password, gender, phoneNumber, verified } = req.body;

    // Hashing a password
    const saltRound = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, saltRound);
    // Create a new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      gender,
      phoneNumber,
      verified,
    });

    // Send success response with the newly created user
    res.status(201).json({
      ok: true,
      message: 'User Created Successfully',
    });
  } catch (error) {
    // Handle errors
    logger.error('Error adding user:', error);
    res.status(500).send('Internal Server Error');
  }
};

export { createUser };