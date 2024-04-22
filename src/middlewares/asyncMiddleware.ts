import { Request, Response, NextFunction } from 'express';
interface AsyncMiddlewareFunction {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}
export const asyncMiddleware = (fn: AsyncMiddlewareFunction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
