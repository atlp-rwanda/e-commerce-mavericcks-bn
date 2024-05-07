import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export interface UserPayload {
  id: string;
  email?: string;
}
// Function to generate token
export const userToken = async (userId: string, userEmail?: string) => {
  const payload: UserPayload = {
    id: userId,
    email: userEmail ?? undefined,
  };
  const token: string = jwt.sign(payload, process.env.SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRATION as string,
  });

  return token;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const verifyToken = (token: string, results?: any) => {
  return jwt.verify(token, process.env.SECRET_KEY as string, results);
};

export const decodedToken = (token: string) => {
  return jwt.decode(token);
};
