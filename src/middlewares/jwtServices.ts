import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import logger from '../logs/config';
config();
logger.info(process.env.PORT);

export default class JwtServices {
  static async generateToken(payload: any) {
    return await jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: process.env.EXPIRES_IN });
  }
  static async verifyToken(token: string) {
    return await jwt.verify(token, process.env.JWT_SECRET as string);
  }
}
