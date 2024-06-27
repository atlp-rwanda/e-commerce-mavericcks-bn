import { verifyOTP } from '../../controllers/authController';
import { Request, Response } from 'express';
import { userToken } from '../../helpers/token.generator';
import { sendInternalErrorResponse } from '../../validations';
import logger from '../../logs/config';

jest.mock('../../helpers/token.generator');
jest.mock('../../validations');
jest.mock('../../logs/config');

describe('verifyOTP', () => {
  let reqMock: Partial<Request>;
  let resMock: Partial<Response>;

  beforeEach(() => {
    reqMock = {
      user: { id: 'mockUserId' },
    };
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should respond with a token when userToken resolves successfully', async () => {
    const mockToken = 'mockToken';
    (userToken as jest.Mock).mockResolvedValue(mockToken);

    await verifyOTP(reqMock as Request, resMock as Response);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({ ok: true, token: mockToken });
  });

  it('should handle errors and call sendInternalErrorResponse', async () => {
    const mockError = new Error('Internal error');
    (userToken as jest.Mock).mockRejectedValue(mockError);

    await verifyOTP(reqMock as Request, resMock as Response);

    expect(logger.error).toHaveBeenCalledWith('VerifyOTP Internal Server Error', mockError);
    expect(sendInternalErrorResponse).toHaveBeenCalledWith(resMock, mockError);
  });
});
