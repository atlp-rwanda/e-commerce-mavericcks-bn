/* eslint-disable @typescript-eslint/no-misused-promises */
import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import logger from '../logs/config';
import User from '../database/models/user';
import Role from '../database/models/role';
import { sendInternalErrorResponse } from '../validations';
import { sendOTP } from '../controllers/authController';
import { userToken } from '../helpers/token.generator';

config();

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      logger.error('Authentication required.');
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY!, async (err, decoded: any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          logger.error('Token has expired.');
          return res.status(401).json({ message: 'Token has expired.' });
        }
        logger.error('Invalid token.');
        return res.status(401).json({ message: 'Invalid token.' });
      }

      const user = await User.findByPk(decoded.id, {
        include: [
          {
            model: Role,
            as: 'Role',
            attributes: ['name'],
          },
        ],
      });

      if (!user) {
        logger.error('Authorized user not found');
        return res.status(404).json({ message: 'Authorized user not found.' });
      }
      // Store the user and decoded token in the request for use in routes
      req.user = user;

      return next();
    });
  } catch (error) {
    logger.error('Error while checking authentication.', error);
    sendInternalErrorResponse(res, error);
  }
};
// Middleware to check user roles
export const checkUserRoles = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (await req.user) as any;
    const userRole = user.Role.name;

    // Check if the user has all of the required roles
    if (requiredRole !== userRole) {
      logger.error('Access denied: Your role does not permit this action.');
      return res.status(403).json({
        message: 'Access denied: Your role does not permit this action.',
      });
    }
    next();
  };
};

export const verifyIfSeller = async (user: any, req: Request, res: Response) => {
  const userRoleId = await user.dataValues.RoleId;
  const enabled2FA = await user.dataValues.enable2FA;
  const userRole = await Role.findOne({ where: { id: userRoleId } });

  // Check if it's seller
  if (enabled2FA && userRole?.dataValues.name === 'seller') {
    // Find seller information
    sendOTP(req, res, user.dataValues.email);
  } else {
    // Authenticate user with jwt
    const token = await userToken(user.id);

    res.status(200).json({
      ok: true,
      token: token,
    });
  }
};
