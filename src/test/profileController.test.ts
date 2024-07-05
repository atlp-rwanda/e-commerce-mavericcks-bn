// src/test/profileController.test.ts
import { Request, Response } from 'express';
import { getUserProfile, updateUser } from '../controllers/profileController';
import User from '../database/models/user';
import Role from '../database/models/role';
import logger from '../logs/config';
import uploadImage from '../helpers/claudinary';
import { sendInternalErrorResponse } from '../validations';
import { Readable } from 'stream';

// Mock dependencies
jest.mock('../database/models/user', () => {
  const sequelizeMock = jest.requireActual('sequelize-mock');
  const dbMock = new sequelizeMock();

  // Define UserMock interface
  interface UserMock {
    findByPk: jest.Mock;
    update: jest.Mock;
  }

  // Define User variable as UserMock
  const User: UserMock = dbMock.define('User', {
    id: 'some_uuid_string',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'sample_password',
    gender: 'male',
    phoneNumber: '1234567890',
    googleId: 'sample_google_id',
    photoUrl: 'http://example.com/photo.jpg',
    verified: true,
    status: 'active', // UserStatus.ACTIVE
    createdAt: new Date(),
    updatedAt: new Date(),
    RoleId: 'some_role_id',
    enable2FA: true,
    lastPasswordUpdated: new Date(),
  });

  // Assign jest.fn() to User methods
  User.findByPk = jest.fn();
  User.update = jest.fn();

  return User;
});

jest.mock('../database/models/role', () => {
  const sequelizeMock = jest.requireActual('sequelize-mock');
  const dbMock = new sequelizeMock();

  const Role = dbMock.define('Role', {
    id: 'some_uuid_string',
    name: 'buyer',
    displayName: 'Buyer Role Display Name',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return Role;
});
jest.mock('../logs/config');
jest.mock('../helpers/claudinary');
jest.mock('../validations');

// Define a type for our mocked User model for TypeScript
type MockedUserModel = typeof User & {
  findByPk: jest.Mock;
  update: jest.Mock;
};

describe('Profile Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 'user-id' },
      file: {
        buffer: Buffer.from('image-data'),
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset and setup mocks for each test
    (User.findByPk as jest.Mock).mockClear();
    (uploadImage as jest.Mock).mockClear();
    (User as unknown as MockedUserModel).update.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile if user exists', async () => {
      const user = {
        id: 'user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        photoUrl: 'http://example.com/photo.jpg',
        gender: 'male',
        Role: { name: 'buyer' },
      };
      (User.findByPk as jest.Mock).mockResolvedValue(user);

      await getUserProfile(req as Request, res as Response);

      expect(User.findByPk).toHaveBeenCalledWith('user-id', {
        attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'photoUrl', 'gender'],
        include: { model: Role, attributes: ['name'] },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ok: true, message: user });
    });

    it('should return 404 if user is not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await getUserProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: 'User not found' });
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Database error');
      (User.findByPk as jest.Mock).mockRejectedValue(error);

      await getUserProfile(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('Error fetching user profile:: ', error);
      expect(sendInternalErrorResponse).toHaveBeenCalledWith(res, error);
    });
  });

  describe('updateUser', () => {
    it('should update user profile if user exists and image is provided', async () => {
      const user = {
        id: 'user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        photoUrl: 'http://example.com/photo.jpg',
        gender: 'male',
        update: jest.fn(),
      };
      const uploadedImage = 'http://example.com/new-photo.jpg';
      (User.findByPk as jest.Mock).mockResolvedValue(user);
      (uploadImage as jest.Mock).mockResolvedValue(uploadedImage);

      // Set the user-id in the params of the request object
      req.params = { id: 'user-id' };
      req.body = { firstName: 'Jane', lastName: 'Doe', gender: 'female', phoneNumber: '0987654321' };

      await updateUser(req as Request, res as Response);

      expect(User.findByPk).toHaveBeenCalledWith('user-id');
      expect(uploadImage).toHaveBeenCalledWith(req.file!.buffer);
      expect(user.update).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        gender: 'female',
        phoneNumber: '0987654321',
        photoUrl: uploadedImage,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: {
          id: 'user-id',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '0987654321',
          gender: 'female',
          photoUrl: uploadedImage,
        },
      });
    });

    it('should return 404 if user is not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ ok: false, error: 'User not found' });
    });

    it('should return 400 if profile image is not provided', async () => {
      req.file = undefined;
      const user = { id: 'user-id' };
      (User.findByPk as jest.Mock).mockResolvedValue(user);

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ ok: false, error: 'Profile Image required.' });
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Database error');
      (User.findByPk as jest.Mock).mockRejectedValue(error);

      await updateUser(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('Error updating user profile: ', error);
      expect(sendInternalErrorResponse).toHaveBeenCalledWith(res, error);
    });
  });
});
