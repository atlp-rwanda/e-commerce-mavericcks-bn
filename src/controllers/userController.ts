import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../database/models/user';
import logger from '../logs/config';
import { userToken } from '../helpers/token.generator';
import uploadImage from '../helpers/claudinary';
import * as jwt from 'jsonwebtoken';
import Role from '../database/models/role';
import { sendEmail } from '../helpers/send-email';
import { sendInternalErrorResponse, validateEmail, validateFields, validatePassword } from '../validations';

// Function for user signup
export const signupUser = async (req: Request, res: Response) => {
  try {
    // Extract user data from request body
    const { firstName, lastName, email, password, gender, phoneNumber } = req.body;

    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'gender', 'phoneNumber'];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      logger.error(`Adding User:Required fields are missing:${missingFields.join(', ')}`);
      res.status(400).json({
        ok: false,
        message: `Required fields are missing: ${missingFields.join(', ')}`,
      });
      return;
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        ok: false,
        error: 'Ensuring it contains at least 1 letter, 1 number, and 1 special character, minumun 8 characters',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (user?.dataValues.email === email) {
      return res.status(400).json({ ok: false, error: 'Email is already used, Login to continuue' });
    }

    const saltRound = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, saltRound);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      gender,
      phoneNumber,
    });

    const createdUser = newUser.dataValues;
    let token;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (createdUser) {
      token = await userToken(createdUser.id as string, createdUser.email as string);
    }
    const link: string = `${process.env.URL_HOST}:${process.env.PORT}/api/users/${token}/verify-email`;

    sendEmail('account_verify', {
      name: `${createdUser.firstName} ${createdUser.lastName}`,
      email: `${createdUser.email}`,
      link,
    });

    // Send success response with the newly created user
    return res.status(201).json({
      ok: true,
      message: 'User Created Successfully, please verify through email',
    });
  } catch (error) {
    // Handle errors
    logger.error('Error adding user:', error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
// Function for get all users
export const getAllUser = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.params.page, 10);
    const offset = Number.isNaN(page) ? 0 : page * 10;

    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'photoUrl', 'gender'],
      limit: 10,
      offset: offset,
      include: {
        model: Role,
        attributes: ['name'],
      },
    });
    return res.status(200).json({ ok: true, message: users });
  } catch (error) {
    logger.error(`Error for fetch all user: ${error}`);
    sendInternalErrorResponse(res, error);
    return;
  }
};
// Function to getOne user
export const getOneUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user: User | null = await User.findOne({
      where: {
        id,
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'photoUrl', 'gender'],
      include: {
        model: Role,
        attributes: ['name'],
      },
    });
    if (!user) return res.status(404).json({ ok: false, error: 'User with this ID does not exits' });

    return res.status(200).json({ ok: false, message: user });
  } catch (error) {
    logger.error(`Error for get one user: ${error}`);
    sendInternalErrorResponse(res, error);
    return;
  }
};
// Function for delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleteUserAccount = await User.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (deleteUserAccount === 0) {
      return res.status(404).json({ ok: false, message: 'User with this ID does not exist' });
    }
    return res.status(200).json({ ok: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user: ', error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
// Function to edit user role
export const editUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    if (validateFields(req, ['roleId']).length !== 0) {
      res.status(400).json({ ok: false, error: 'roleId is required' });
      return;
    }
    const user = await User.findByPk(userId);

    if (!user) {
      logger.error('Error User Not Found');
      res.status(404).json({ ok: false, error: 'User not found' });
    }

    await user?.update({ RoleId: roleId });

    res.status(200).json({ ok: true, message: 'Role assigned successfully.' });
  } catch (error) {
    logger.error('Error Edit User Role: ', error);
    sendInternalErrorResponse(res, error);
  }
};
// Function to update user profile
export const editUser = async (req: Request, res: Response) => {
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
// Function for verifying a user
export const userVerify = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;

    const decodeToken = jwt.verify(token, process.env.SECRET_KEY as string) as { id: string; email: string };

    const user = await User.findOne({
      where: { email: decodeToken.email, verified: false },
    });
    if (user) {
      const updatedUser = await user.update({ verified: true });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (updatedUser) {
        return res.status(201).json({ ok: true, message: 'Account verified, Login to continue.' });
      }
    }
    return res.status(400).json({ ok: false, error: 'Verification failed. Try again later' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ ok: false, error: 'Verification link has expired. Please request a new one.' });
    } else {
      logger.error('Error Edit User Role: ', error);
      sendInternalErrorResponse(res, error);
      return;
    }
  }
};
