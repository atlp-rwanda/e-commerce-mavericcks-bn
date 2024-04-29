import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export interface UserPayload {
  id: string;
  email: string;
}
// Function to generate token
export const userToken = async (userId: string, userEmail: string) => {
  const payload: UserPayload = {
    id: userId,
    email: userEmail,
  };
  const token: string = jwt.sign(payload, process.env.SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRATION as string,
  });

  return token;
};

// Function for token verification

// Function for token Decode
