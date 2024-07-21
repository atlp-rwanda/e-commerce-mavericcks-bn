import { Request, Response } from 'express';
import User from '../database/models/user';
import logger from '../logs/config';
import { userToken } from '../helpers/token.generator';
import uploadImage from '../helpers/claudinary';
import * as jwt from 'jsonwebtoken';
import Role from '../database/models/role';
import { sendEmail } from '../helpers/send-email';
import { sendInternalErrorResponse, validateEmail, validateFields, validatePassword } from '../validations';
import { passwordEncrypt } from '../helpers/encrypt';
import getDefaultRole from '../helpers/defaultRoleGenerator';
import sequelize from '../database/models/index';
import { Transaction } from 'sequelize';

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
        error: 'Password should contains at least 1 letter, 1 number, and 1 special character, minumun 8 characters',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (user?.dataValues.email === email) {
      return res.status(400).json({ ok: false, error: 'Email is already used, Login to continuue' });
    }
    if (user?.dataValues.phoneNumber === phoneNumber) {
      return res.status(400).json({ ok: false, error: 'Phone number is already used, try different Number' });
    }
    const hashPassword = await passwordEncrypt(password);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      gender,
      phoneNumber,
      RoleId: await getDefaultRole(),
    });

    const createdUser = newUser.dataValues;
    let token;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (createdUser) {
      token = await userToken(createdUser.id as string, createdUser.email as string);
    }
    const link: string = `${process.env.URL_HOST}/api/users/${token}/verify-email`;

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
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'photoUrl', 'gender'],
      include: {
        model: Role,
        attributes: ['name'],
      },
    });
    logger.info(`Fetched ${users.length} users`);
    return res.status(200).json({ ok: true, message: users });
  } catch (error) {
    logger.error(`Error fetching all users: ${error}`);
    sendInternalErrorResponse(res, error);
    return;
  }
};

// Function to get users by role name
export const getUsersByRoleName = async (req: Request, res: Response) => {
  try {
    const { roleName } = req.params;

    const role = await Role.findOne({ where: { name: roleName } });

    if (!role) {
      return res.status(404).json({ ok: false, error: 'Role not found' });
    }

    const users = await User.findAll({
      where: { RoleId: role.id },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'photoUrl', 'gender'],
      include: {
        model: Role,
        attributes: ['name'],
      },
    });

    if (users.length === 0) {
      return res.status(404).json({ ok: false, error: 'No users found for this role' });
    }

    logger.info(`Fetched ${users.length} users with role ${roleName}`);
    return res.status(200).json({ ok: true, message: users });
  } catch (error) {
    logger.error(`Error fetching users by role: ${error}`);
    sendInternalErrorResponse(res, error);
    return;
  }
};

// Function to get one user
export const getOneUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user: User | null = await User.findOne({
      where: { id },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'photoUrl', 'gender', 'enable2FA'],
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

// Function to delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleteUserAccount = await User.destroy({
      where: { id: req.params.id },
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
  const transaction: Transaction = await sequelize.transaction();
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    if (validateFields(req, ['roleId']).length !== 0) {
      res.status(400).json({ ok: false, error: 'roleId is required' });
      return;
    }
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      logger.error('Error User Not Found');
      res.status(404).json({ ok: false, error: 'User not found' });
      return;
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      res.status(404).json({ ok: false, message: `There is no Role with this id: ${roleId}` });
      return;
    }

    await user.update({ RoleId: roleId }, { transaction });
    await transaction.commit();

    res.status(200).json({ ok: true, message: 'Role assigned successfully.' });
  } catch (error) {
    await transaction.rollback();
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
    if (!req.file) {
      res.status(400).json({ ok: false, error: 'Profile Image required.' });
      return;
    }
    const uploadedImage = await uploadImage(req.file.buffer);
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

    res.status(201).json({ ok: true, data: userResponse });
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
        return res.redirect(`${process.env.FRONT_END_BASEURL}/login?message=Account verified, Login to continue.`);
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

// Function for resend verification link
export const resendVerifyLink = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }
    if (validateFields(req, ['email']).length !== 0) {
      res.status(400).json({ ok: false, error: 'Email is required' });
      return;
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ ok: false, error: 'User with this email does not exit, Sign up to continue' });
    }
    const notVerifiedUser = await User.findOne({ where: { email, verified: false } });
    if (!notVerifiedUser) {
      return res.status(202).json({ ok: false, error: `${email} is already verified. Login to continue` });
    }

    const token = await userToken(user.dataValues.id as string, user.dataValues.email as string);
    const verificationLink: string = `${process.env.URL_HOST}/api/users/${token}/verify-email`;

    sendEmail('account_verify', {
      name: `${user.dataValues.firstName} ${user.dataValues.lastName}`,
      email,
      link: verificationLink,
    });
    res.status(201).json({ ok: true, message: 'Check your email to verify.' });
  } catch (error) {
    logger.error('Resend-verify: ', error);
    sendInternalErrorResponse(res, error);
  }
};

// Function to enable two factor authentication(2FA)
export const enable2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as User).id;

    if (!userId) {
      return res.status(404).json({ ok: false, error: 'UserId Not Found' });
    }
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(400).json({ ok: false, error: 'User not found' });
    }
    user.enable2FA = !user.enable2FA;
    await user.save();

    res.status(201).json({ ok: true, message: `2FA status toggled to ${user.enable2FA}` });
  } catch (error) {
    logger.error('Enable 2FA', error);
    sendInternalErrorResponse(res, error);
  }
};
