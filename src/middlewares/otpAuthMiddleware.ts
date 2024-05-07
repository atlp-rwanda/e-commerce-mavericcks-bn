/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import logger from '../logs/config';
import { sendInternalErrorResponse } from '../validations';
import { verifyToken } from '../helpers/token.generator';
import randomstring from 'randomstring';
import { sendEmail } from '../helpers/send-email';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Otp from '../database/models/otp';
import sequelize from '../database/models';

// Function middleware to verify if otp equal to jwt token payload
export const isCheckedOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token;
    const otp = req.body.otp;

    // Check if OTP is provided
    if (!otp) {
      return res.status(404).json({ ok: false, error: 'Invalid token' });
    }

    // Verify the token and decode its payload
    const userIdPayload = verifyToken(token) as JwtPayload;

    // Check if the decoded token is valid and contains the userId
    if (!userIdPayload || !userIdPayload.id || !userIdPayload.FAEnabled) {
      return res.status(400).json({ ok: false, error: 'Invalid or missing user ID in token' });
    }

    // Find the latest OTP associated with the user
    const userToken: Otp | null = await Otp.findOne({
      where: { userId: userIdPayload.id },
      order: [['createdAt', 'DESC']],
    });

    // If no OTP found for the user
    if (!userToken) {
      logger.error('No user sent 2FA token');
      return res.status(404).json({ ok: false, error: 'No User Sent Token' });
    }

    // Verify the OTP
    const verifyCallBack = async (err: Error, decoded: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (err) {
        let errorMessage = 'Invalid Token';
        if (err.message.includes('expired')) {
          errorMessage = 'Token expired';
        } else if (err.message.includes('signature')) {
          errorMessage = 'Invalid Signature';
        }
        logger.error('Verify Token', err.message);
        return res.status(403).json({ ok: false, error: errorMessage });
      }

      // If OTP doesn't match
      if (decoded?.code !== otp) {
        return res.status(400).json({ ok: false, error: ' OTP Entered is wrong' });
      }

      // OTP is valid, proceed to the next middleware
      req.user = decoded;
      await deleteOTPRow(userToken.token);
      next();
    };

    // Verify the token
    verifyToken(userToken.token as string, verifyCallBack);
  } catch (error) {
    logger.error('VerifyOTP: ', error);
    sendInternalErrorResponse(res, error);
  }
};
// Function to create new token and send OTP to email address
export const createOTPToken = async (id: string, email: string, firstName: string) => {
  // Generate a number to send
  const code = randomstring.generate({
    length: 6,
    charset: 'numeric',
  });

  await sendEmail('OTP', { email, name: firstName, otp: code });

  const payload = {
    id,
    email,
    code,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY as string, {
    expiresIn: '240s',
  });

  return token;
};
// Function to save OTP Token in database
export const saveOTPDB = async (userId: string, token: string) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    let existingData = await Otp.findOne({
      where: {
        userId: userId,
      },
      transaction,
    });
    if (existingData) {
      await existingData.update(
        {
          token,
        },
        {
          transaction,
        }
      );
    } else {
      existingData = await Otp.create(
        {
          userId: userId,
          token: token,
        },
        {
          transaction,
        }
      );
    }
    await transaction.commit();

    return existingData.dataValues;
  } catch (error) {
    // Rollback the transaction if there's an error
    if (transaction) await transaction.rollback();
    logger.error('Error creating/updating data: ', error);
  }
};
// Function to delete OTP Token row in db before move to next middleware
const deleteOTPRow = async (token: string) => {
  try {
    await Otp.destroy({
      where: {
        token,
      },
    });
    logger.info('OTP row deleted...');
  } catch (error) {
    logger.error('Error deleting OTP row: ', error);
  }
};
