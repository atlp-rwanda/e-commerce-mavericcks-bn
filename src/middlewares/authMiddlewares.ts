import { asyncMiddleware } from './asyncMiddleware';
import { Request, Response, NextFunction } from 'express';
import User from '../database/models/user';
import Role from '../database/models/role';
import { UserRole } from '../database/models/user_role_relations';
import logger from '../logs/config';
import AppError from '../helpers/AppError';

type UserRoleType = 'admin' | 'customer' | 'seller';

interface RequestWithUser extends Request {
  user?: User;
}

export default class AuthMiddleware {
  static async checkAuth(req: RequestWithUser, res: Response, next: NextFunction) {
    if (!(await req.user)) {
      logger.error('Unauthorized');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }
  static checkUserRoles = (roles: UserRoleType[]) => {
    return asyncMiddleware(async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const userRoles = await UserRole.findAll({ where: { userId: req.user!.id }, include: [{ model: Role }] });
      const hasRole = userRoles.some((role: any) => roles.includes(role.name as UserRoleType));
      if (hasRole) {
        next();
      } else {
        // res.status(403).send('You do not have the required role');
        return next(new AppError('You do not have the required role', 403));
      }
    });
  };
  // check user permissions
  static checkUserPermissions = (permissions: string[]) => {
    return async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const userRoles = await UserRole.findAll({ where: { userId: req.user!.id }, include: [{ model: Role }] });
      const userPermissions = userRoles.map((role: any) => role.role.permissions.map((permission: any) => permission.name));
      const hasPermission = userPermissions.some((permission: any) => permissions.every((p: any) => permission.includes(p)));
      if (hasPermission) {
        next();
      } else {
        logger.error('You do not have the required permission');
        res.status(403).send('You do not have the required permission');
      }
    };
  };
}
