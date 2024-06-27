import { forgotPassword } from '../../controllers/authController';
import { Request, Response } from 'express';
import User from '../../database/models/user';
import { userToken } from '../../helpers/token.generator';
import { sendEmail } from '../../helpers/send-email';
import logger from '../../logs/config';
import { sendInternalErrorResponse } from '../../validations';

jest.mock('../../database/models/user');
jest.mock('../../helpers/token.generator');
jest.mock('../../helpers/send-email');
jest.mock('../../logs/config');
jest.mock('../../validations');

jest.mock('../../database/models/otp', () => ({
  __esModule: true,
  default: {
    belongsTo: jest.fn(),
  },
}));

describe('POST/ forgot Password', () => {
  let reqMock: Partial<Request>;
  let resMock: Partial<Response>;

  beforeEach(() => {
    reqMock = {
      body: { email: 'npemailmock@example.com' },
    };
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should respond with an error if the user does not exist', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await forgotPassword(reqMock as Request, resMock as Response);

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'npemailmock@example.com' } });
    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.json).toHaveBeenCalledWith({ ok: false, error: 'User with this email does not exist' });
  });

  it('should send a reset email if the user exists', async () => {
    const mockUser = {
      id: '1',
      email: 'npemailmock@example.com',
      firstName: 'NP',
      lastName: 'Leon',
    };
    const mockToken = 'mockToken';
    const mockLink = `${process.env.URL_HOST}/api/auth/reset-password/${mockToken}`;

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (userToken as jest.Mock).mockResolvedValue(mockToken);
    (sendEmail as jest.Mock).mockResolvedValue(true);

    await forgotPassword(reqMock as Request, resMock as Response);

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'npemailmock@example.com' } });
    expect(userToken).toHaveBeenCalledWith('1', 'npemailmock@example.com');
    expect(sendEmail).toHaveBeenCalledWith('reset_password', {
      name: 'NP Leon',
      email: 'npemailmock@example.com',
      link: mockLink,
    });
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      ok: true,
      message: 'A password reset link has been sent to your email.',
    });
  });

  it('should handle errors and call sendInternalErrorResponse', async () => {
    const mockError = new Error('Internal error');
    (User.findOne as jest.Mock).mockRejectedValue(mockError);

    await forgotPassword(reqMock as Request, resMock as Response)

    expect(logger.error).toHaveBeenCalledWith('Error requesting password reset: ', mockError);
    expect(sendInternalErrorResponse).toHaveBeenCalledWith(resMock, mockError);
  });
});
