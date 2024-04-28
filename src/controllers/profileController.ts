import { Request, Response } from 'express';
import User from '../database/models/user';
import logger from '../logs/config';
import uploadImage from '../helpers/claudinary';
import Role from '../database/models/role';
import { sendInternalErrorResponse } from '../validations';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.params.userId;

  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'photoUrl', 'gender'],
      include: {
        model: Role,
        attributes: ['name'],
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ ok: true, message: user });
  } catch (error) {
    logger.error('Error fetching user profile:: ', error);
    sendInternalErrorResponse(res, error);
  }
};

// Function to update user profile
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, gender, phoneNumber } = req.body;

    const user = await User.findOne({ where: { id: req.params.id } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let uploadedImage: any;
    if (!req.file) {
      res.status(400).json({ ok: false, error: 'Profile Image required.' });
    }
    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer);
    }
    const updatedFields = {
      firstName: firstName || user?.firstName,
      lastName: lastName || user?.lastName,
      gender: gender || user?.gender,
      phoneNumber: phoneNumber || user?.phoneNumber,
      photoUrl: uploadedImage || user?.photoUrl,
    };

    await user?.update(updatedFields);
    const userResponse = {
      id: user?.id,
      firstName: updatedFields.firstName,
      lastName: updatedFields.lastName,
      email: user?.email,
      phoneNumber: updatedFields.phoneNumber,
      gender: updatedFields.gender,
      photoUrl: updatedFields.photoUrl,
    };

    res.status(201).json({ ok: true, message: userResponse });
  } catch (error) {
    logger.error('Error Edit User Role: ', error);
    sendInternalErrorResponse(res, error);
  }
};
