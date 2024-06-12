import { Response } from 'express';
import logger from '../logs/config';

interface ErrorResponse {
  statusCode: number;
  message: string;
}

const errorResponses: Record<string, ErrorResponse> = {
  invalidCredentials: { statusCode: 400, message: 'Invalid credentials' },
  inactiveUser: { statusCode: 403, message: 'Your account has been blocked. Please contact support.' },
  unverifiedUser: { statusCode: 403, message: 'Your account is not verified. Please verify your account.' },
};

export const sendErrorResponse = (res: Response, errorType: keyof typeof errorResponses): void => {
  const errorResponse = errorResponses[errorType];
  logger.error(errorResponse.message);
  res.status(errorResponse.statusCode).json({ ok: false, message: errorResponse.message });
};
