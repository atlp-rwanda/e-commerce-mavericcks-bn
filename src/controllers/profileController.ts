import { Request, Response } from 'express';
import User from '../database/models/user';
import logger from '../logs/config';
import uploadImage from '../helpers/claudinary';
import Role from '../database/models/role';
import { sendInternalErrorResponse } from '../validations';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.params.userId ? req.params.userId : (req.user as User).id;

  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'photoUrl', 'gender'],
      include: {
        model: Role,
        attributes: ['name'],
      },
    });

    if (!user) {
      res.status(404).json({ ok: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ ok: true, message: user });
  } catch (error) {
    logger.error('Error fetching user profile:: ', error);
    sendInternalErrorResponse(res, error);
  }
};

//construct updated fields
const constructUpdatedFields = (body: any, user: User, uploadedImage?: string) => {
  return {
    firstName: body.firstName || user.firstName,
    lastName: body.lastName || user.lastName,
    gender: body.gender || user.gender,
    phoneNumber: body.phoneNumber || user.phoneNumber,
    photoUrl: uploadedImage || user.photoUrl,
  };
};

// Function to construct user response
const constructUserResponse = (user: User, updatedFields: any) => {
  return {
    id: user.id,
    firstName: updatedFields.firstName,
    lastName: updatedFields.lastName,
    email: user.email,
    phoneNumber: updatedFields.phoneNumber,
    gender: updatedFields.gender,
    photoUrl: updatedFields.photoUrl,
  };
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, gender, phoneNumber } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'Profile Image required.' });
    }

    // Upload image to cloudinary
    const uploadedImage = await uploadImage(req.file.buffer);

    const updatedFields = constructUpdatedFields(req.body, user, uploadedImage);

    await user.update(updatedFields);

    const userResponse = constructUserResponse(user, updatedFields);

    // Send response
    res.status(201).json({ ok: true, message: userResponse });
  } catch (error) {
    logger.error('Error updating user profile: ', error);
    sendInternalErrorResponse(res, error);
  }
};
