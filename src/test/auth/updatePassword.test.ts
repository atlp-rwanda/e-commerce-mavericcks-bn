import { updatePassword } from '../../controllers/authController';
import { Request, Response } from 'express';
import User from '../../database/models/user';
import { validatePassword } from '../../validations';
import { passwordEncrypt, passwordCompare } from '../../helpers/encrypt';
import logger from '../../logs/config';
import { sendInternalErrorResponse } from '../../validations';
import { sendErrorResponse } from '../../helpers/helper';

jest.mock('../../database/models/user');
jest.mock('../../validations');
jest.mock('../../helpers/encrypt');
jest.mock('../../logs/config');
jest.mock('../../helpers/helper');

jest.mock('../../database/models/otp', () => ({
  __esModule: true,
  default: {
    belongsTo: jest.fn(),
  },
}));

describe('PUT/ update Password route', () => {
  let reqMock: Partial<Request>;
  let resMock: Partial<Response>;

  beforeEach(() => {
    reqMock = {
      body: { oldPassword: 'OldP@ssw0rd', newPassword: 'NewP@ssw0rd' },
      user: { id: '1', password: 'hashedOldPassword' },
    };
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should respond with an error if the old password is incorrect', async () => {
    (passwordCompare as jest.Mock).mockResolvedValue(false);

    await updatePassword(reqMock as Request, resMock as Response);

    expect(passwordCompare).toHaveBeenCalledWith('OldP@ssw0rd', 'hashedOldPassword');
    expect(sendErrorResponse).toHaveBeenCalledWith(resMock, 'The old password is incorrect!');
  });

  it('should respond with an error if the new password is invalid', async () => {
    (passwordCompare as jest.Mock).mockResolvedValue(true);
    (validatePassword as jest.Mock).mockReturnValue(false);

    await updatePassword(reqMock as Request, resMock as Response);

    expect(passwordCompare).toHaveBeenCalledWith('OldP@ssw0rd', 'hashedOldPassword');
    expect(validatePassword).toHaveBeenCalledWith('NewP@ssw0rd');
    expect(sendErrorResponse).toHaveBeenCalledWith(
      resMock,
      'Ensuring it contains at least 1 letter, 1 number, and 1 special character, minumun 8 characters'
    );
  });

  it('should update the user password and respond with success message', async () => {
    const mockHashedNewPassword = 'hashedNewPassword';
    (passwordCompare as jest.Mock).mockResolvedValue(true);
    (validatePassword as jest.Mock).mockReturnValue(true);
    (passwordEncrypt as jest.Mock).mockResolvedValue(mockHashedNewPassword);

    await updatePassword(reqMock as Request, resMock as Response);

    expect(passwordCompare).toHaveBeenCalledWith('OldP@ssw0rd', 'hashedOldPassword');
    expect(validatePassword).toHaveBeenCalledWith('NewP@ssw0rd');
    expect(passwordEncrypt).toHaveBeenCalledWith('NewP@ssw0rd');
    expect(User.update).toHaveBeenCalledWith({ password: mockHashedNewPassword }, { where: { id: '1' } });
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      ok: true,
      message: 'Successfully updated user password!',
    });
  });

  it('should handle errors and call sendInternalErrorResponse', async () => {
    const mockError = new Error('Internal error');
    (passwordCompare as jest.Mock).mockRejectedValue(mockError);

    await updatePassword(reqMock as Request, resMock as Response);

    expect(logger.error).toHaveBeenCalledWith('Error updating user:', mockError);
    expect(sendInternalErrorResponse).toHaveBeenCalledWith(resMock, mockError);
  });
});
