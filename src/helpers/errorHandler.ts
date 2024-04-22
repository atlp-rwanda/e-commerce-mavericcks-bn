import { Request, Response, NextFunction } from 'express';
import AppError from './AppError';

export const ErrorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const message = error.message || 'Something went wrong';
  res.status(statusCode).json({
    status,
    message,
  });
};
