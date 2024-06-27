import { resetPassword } from '../../controllers/authController';
import { Request, Response } from 'express';
import User from '../../database/models/user';
import { validatePassword } from '../../validations';
import { passwordEncrypt } from '../../helpers/encrypt';
import logger from '../../logs/config';
import { sendInternalErrorResponse } from '../../validations';

jest.mock('../../database/models/user');
jest.mock('../../validations');
jest.mock('../../helpers/encrypt');
jest.mock('../../logs/config');
jest.mock('../../validations');

jest.mock('../../database/models/otp', () => ({
  __esModule: true,
  default: {
    belongsTo: jest.fn(),
  },
}));

describe('POST/ reset Password Route', () => {
  let reqMock: Partial<Request>;
  let resMock: Partial<Response>;

  beforeEach(() => {
    reqMock = {
      body: { newPassword: 'NewP@ssw0rd' },
      user: { id: '1' } as User,
    };
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should respond with an error if the user does not exist', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await resetPassword(reqMock as Request, resMock as Response);

    expect(User.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.json).toHaveBeenCalledWith({ ok: false, error: 'User does not exist' });
  });

  it('should respond with an error if the password is invalid', async () => {
    const mockUser = { id: '1' };
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (validatePassword as jest.Mock).mockReturnValue(false);

    await resetPassword(reqMock as Request, resMock as Response);

    expect(User.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(validatePassword).toHaveBeenCalledWith('NewP@ssw0rd');
    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith({
      ok: false,
      error: 'Password must contain at least 1 letter, 1 number, and 1 special character, minumun 8 characters',
    });
  });

  it('should update the user password and respond with success message', async () => {
    const mockUser = { id: '1', update: jest.fn() };
    const mockHashedPassword = 'hashedPassword';
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (validatePassword as jest.Mock).mockReturnValue(true);
    (passwordEncrypt as jest.Mock).mockResolvedValue(mockHashedPassword);

    await resetPassword(reqMock as Request, resMock as Response);

    expect(User.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(validatePassword).toHaveBeenCalledWith('NewP@ssw0rd');
    expect(passwordEncrypt).toHaveBeenCalledWith('NewP@ssw0rd');
    expect(mockUser.update).toHaveBeenCalledWith({ password: mockHashedPassword });
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      ok: true,
      message: 'Password reset successfully',
    });
  });

  it('should handle errors and call sendInternalErrorResponse', async () => {
    const mockError = new Error('Internal error');
    (User.findOne as jest.Mock).mockRejectedValue(mockError);

    await resetPassword(reqMock as Request, resMock as Response);

    expect(logger.error).toHaveBeenCalledWith('Error resetting password: ', mockError);
    expect(sendInternalErrorResponse).toHaveBeenCalledWith(resMock, mockError);
  });
});
