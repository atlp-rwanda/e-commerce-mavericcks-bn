import { Request } from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../../database/models/user';
import Role from '../../database/models/role';
import * as authController from '../../controllers/authController';
import { sendErrorResponse } from '../../helpers/helper';
import { sendInternalErrorResponse } from '../../validations';

dotenv.config();

const mockResponse = () => {
  const res = {} as any;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock('../../database/models/user', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    hasMany: jest.fn(),
  },
}));

jest.mock('../../database/models/role', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../database/models/otp', () => ({
  __esModule: true,
  default: {
    belongsTo: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'dgshdgshdgshgdhs-hghgashagsh-jhj'),
}));

jest.mock('../../helpers/helper', () => ({
  sendErrorResponse: jest.fn(),
}));

jest.mock('../../validations', () => ({
  sendInternalErrorResponse: jest.fn(),
}));

jest.mock('../../controllers/authController', () => ({
  ...jest.requireActual('../../controllers/authController'),
  calculatePasswordExpirationDate: jest.fn(),
  redirectToPasswordUpdate: jest.fn(),
}));

describe('AuthController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST/ User login route', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = {
        body: {
          email: 'mypass@gmail.com',
        },
      } as Request;
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: 'Required fields are missing',
      });

      expect(User.findOne).not.toHaveBeenCalled();
      expect(User.findByPk).not.toHaveBeenCalled();
      expect(Role.findOne).not.toHaveBeenCalled();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return 401 if user status is inactive', async () => {
      const req = {
        body: {
          email: 'inactiveuser@example.com',
          password: 'correctPassword',
        },
      } as Request;
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: 'inactiveuser@example.com',
        password: 'hashedPassword',
        status: 'inactive',
        verified: true,
        dataValues: {
          RoleId: 1,
          enable2FA: false,
          email: 'inactiveuser@example.com',
        },
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await authController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'inactiveuser@example.com' } });
      expect(sendErrorResponse).toHaveBeenCalledWith(res, 'inactiveUser');
    });

    it('should return 401 if user is not verified', async () => {
      const req = {
        body: {
          email: 'unverifieduser@example.com',
          password: 'correctPassword',
        },
      } as Request;
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: 'unverifieduser@example.com',
        password: 'hashedPassword',
        status: 'active',
        verified: false,
        dataValues: {
          RoleId: 1,
          enable2FA: false,
          email: 'unverifieduser@example.com',
        },
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await authController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'unverifieduser@example.com' } });
      expect(sendErrorResponse).toHaveBeenCalledWith(res, 'unverifiedUser');
    });

    it('should handle internal server error', async () => {
      const req = {
        body: {
          email: 'unverifieduser@example.com',
          password: 'correctPassword',
        },
      } as Request;
      const res = mockResponse();

      const mockError = new Error('Database connection failed');
      (User.findOne as jest.Mock).mockRejectedValueOnce(mockError);

      await authController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'unverifieduser@example.com' } });
      expect(sendInternalErrorResponse).toHaveBeenCalledWith(res, mockError);
    });

    it('should return 401 if user is not found', async () => {
      const req = {
        body: {
          email: 'noneuser@example.com',
          password: 'myPassword',
        },
      } as Request;
      const res = mockResponse();

      (User.findOne as jest.Mock).mockResolvedValueOnce(null);

      await authController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'noneuser@example.com' } });
      expect(sendErrorResponse).toHaveBeenCalledWith(res, 'invalidCredentials');
    });

    it('should return 401 if password is invalid', async () => {
      const req = {
        body: {
          email: 'user@example.com',
          password: 'wrongPassword',
        },
      } as Request;
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashedPassword',
        status: 'active',
        verified: true,
        dataValues: {
          RoleId: 1,
          enable2FA: false,
          email: 'user@example.com',
        },
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await authController.login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    });

    it('should return 200 if login is successful', async () => {
      const req = {
        body: {
          email: 'mypass@gmail.com',
          password: 'correctPassword',
        },
      } as Request;
      const res = mockResponse();

      const mockUser = {
        id: 1,
        email: 'mypass@gmail.com',
        password: 'hashedPassword',
        status: 'active',
        verified: true,
        dataValues: {
          RoleId: 1,
          enable2FA: false,
          email: 'mypass@gmail.com',
        },
      };

      const mockRole = {
        dataValues: {
          name: 'buyer',
        },
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (User.findByPk as jest.Mock).mockResolvedValueOnce(mockUser);
      (Role.findOne as jest.Mock).mockResolvedValueOnce(mockRole);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        token: 'dgshdgshdgshgdhs-hghgashagsh-jhj',
      });
    });
  });
});
