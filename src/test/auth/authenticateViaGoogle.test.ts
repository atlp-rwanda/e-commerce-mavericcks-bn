import { authenticateViaGoogle } from '../../controllers/authController';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

jest.mock('passport');
jest.mock('jsonwebtoken');
jest.mock('../../helpers/helper', () => ({
  sendInternalErrorResponse: jest.fn(),
}));

describe('authenticateViaGoogle', () => {
  let reqMock: Partial<Request>;
  let resMock: Partial<Response>;
  let nextMock: NextFunction;

  beforeEach(() => {
    reqMock = {};
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };
    nextMock = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle an error from passport.authenticate', () => {
    const mockError = new Error('Authentication error');
    (passport.authenticate as jest.Mock).mockImplementation((strategy, callback) => () => {
      callback(mockError, null);
    });

    authenticateViaGoogle(reqMock as Request, resMock as Response, nextMock);

    expect(passport.authenticate).toHaveBeenCalledWith('google', expect.any(Function));
  });

  it('should handle a situation where no user is returned', () => {
    (passport.authenticate as jest.Mock).mockImplementation((strategy, callback) => () => {
      callback(null, null);
    });

    authenticateViaGoogle(reqMock as Request, resMock as Response, nextMock);

    expect(passport.authenticate).toHaveBeenCalledWith('google', expect.any(Function));
    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
  });

  it('should authenticate user and redirect with JWT', () => {
    const mockUser = { id: 'mockUserId' };
    const mockToken = 'mockToken';
    (passport.authenticate as jest.Mock).mockImplementation((strategy, callback) => () => {
      callback(null, mockUser);
    });
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    process.env.SECRET_KEY = 'test_secret';
    process.env.JWT_EXPIRATION = '1h';
    process.env.FRONT_END_BASEURL = 'http://localhost:3000';

    authenticateViaGoogle(reqMock as Request, resMock as Response, nextMock);

    expect(passport.authenticate).toHaveBeenCalledWith('google', expect.any(Function));
    expect(jwt.sign).toHaveBeenCalledWith({ id: mockUser.id }, process.env.SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
    expect(resMock.redirect).toHaveBeenCalledWith(`${process.env.FRONT_END_BASEURL}/auth/success/${mockToken}`);
  });
});
