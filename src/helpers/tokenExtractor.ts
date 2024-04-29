import { Request, Response, NextFunction } from 'express';

const extractTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(400).json({
      ok: false,
      message: 'Token not provided',
    });
    return;
  }
  (req as any).token = token;
  next();
};

export { extractTokenMiddleware };
