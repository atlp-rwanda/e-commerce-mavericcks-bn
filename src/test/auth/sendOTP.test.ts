import { sendOTP } from '../../controllers/authController';
import { Request, Response } from 'express';
import User from '../../database/models/user';
import { createOTPToken, saveOTPDB } from '../../middlewares/otpAuthMiddleware';
import jwt from 'jsonwebtoken';

jest.mock('../../database/models/user');
jest.mock('../../middlewares/otpAuthMiddleware');
jest.mock('jsonwebtoken');

jest.mock('../../database/models/otp', () => ({
  __esModule: true,
  default: {
    belongsTo: jest.fn(),
  },
}));

describe('POST/ sendOTP route', () => {
  let reqMock: Partial<Request>;
  let resMock: Partial<Response>;

  beforeEach(() => {
    reqMock = {};
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should respond with a token when OTP is successfully created and saved', async () => {
    const mockUser = {
      dataValues: {
        id: '1',
        email: 'email@gmail.com',
        firstName: 'NP',
      },
    };
    const mockOTPToken = 'mockOTPToken';
    const mockAccessToken = 'mockAccessToken';

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (createOTPToken as jest.Mock).mockResolvedValue(mockOTPToken);
    (saveOTPDB as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockAccessToken);

    await sendOTP(reqMock as Request, resMock as Response, 'email@gmail.com');

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'email@gmail.com' } });
    expect(createOTPToken).toHaveBeenCalledWith('1', 'email@gmail.com', 'NP');
    expect(saveOTPDB).toHaveBeenCalledWith('1', mockOTPToken);
    expect(jwt.sign).toHaveBeenCalledWith({ id: '1', FAEnabled: true }, process.env.SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({ ok: true, token: mockAccessToken });
  });

  it('should respond with 404 if user is not found', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await sendOTP(reqMock as Request, resMock as Response, 'email@gmail.com');

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'email@gmail.com' } });
    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.json).toHaveBeenCalledWith({ ok: false, message: 'User not found' });
  });

  it('should handle errors and respond with 500', async () => {
    const mockError = new Error('Internal error');
    (User.findOne as jest.Mock).mockRejectedValue(mockError);

    await sendOTP(reqMock as Request, resMock as Response, 'email@gmail.com');

    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({ ok: false, message: 'Internal Server Error' });
  });

  it('should respond with 500 if saving OTP fails', async () => {
    const mockUser = {
      dataValues: {
        id: '1',
        email: 'email@gmail.com',
        firstName: 'NP',
      },
    };
    const mockOTPToken = 'mockOTPToken';

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (createOTPToken as jest.Mock).mockResolvedValue(mockOTPToken);
    (saveOTPDB as jest.Mock).mockResolvedValue(false);

    await sendOTP(reqMock as Request, resMock as Response, 'email@gmail.com');

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'email@gmail.com' } });
    expect(createOTPToken).toHaveBeenCalledWith('1', 'email@gmail.com', 'NP');
    expect(saveOTPDB).toHaveBeenCalledWith('1', mockOTPToken);
    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({ ok: false, message: 'Failed to save OTP' });
  });
});
