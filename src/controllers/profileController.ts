// controllers/userController.ts
import { Request, Response } from 'express';
import User from '../database/models/user';

const getAllUserProfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all user profiles
    const users = await User.findAll();

    // Return all user profiles
    res.status(200).json(users);
  } catch (error) {
    // Handle errors
    console.error('Error fetching user profiles:', error);
    res.status(500).send('Internal Server Error');
  }
};

const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.params.userId;

  try {
    // Find the user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Return user profile
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    // Handle errors
    console.error('Error fetching user profile:', error);
    res.status(500).send('Internal Server Error');
  }
};

const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.params.userId;
  const newData = req.body;

  try {
    // Find the user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update user profile data
    await user.update(newData);

    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    // Handle errors
    console.error('Error updating user profile:', error);
    res.status(500).send('Internal Server Error');
  }
};

export { getUserProfile, updateUserProfile, getAllUserProfiles };
