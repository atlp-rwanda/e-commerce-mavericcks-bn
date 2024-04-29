import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendInternalErrorResponse } from '../validations';
import logger from '../logs/config';
import BlacklistedToken from '../database/models/blackListedToken';
import { extractTokenMiddleware } from '../helpers/tokenExtractor'; // Import the middleware

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    extractTokenMiddleware(req, res, () => {
      const token = (req as any).token;

      jwt.verify(token, process.env.JWT_SECRET as string, (err: any) => {
        if (err) {
          res.status(401).json({
            ok: false,
            message: 'Invalid token',
          });
          return;
        }

        BlacklistedToken.create({ token })
          .then(() => {
            res.status(200).json({
              ok: true,
              message: 'Logged out successfully',
            });
          })
          .catch(error => {
            throw error;
          });
      });
    });
  } catch (err: any) {
    const message = (err as Error).message;
    logger.error(message);
    sendInternalErrorResponse(res, err);
  }
};

export { logout, extractTokenMiddleware };
