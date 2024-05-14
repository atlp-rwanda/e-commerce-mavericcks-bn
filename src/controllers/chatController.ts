/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Request, Response } from 'express';
import { join } from 'path';
import logger from '../logs/config';
import { sendInternalErrorResponse } from '../validations';
import Chat from '../database/models/chat';
import User from '../database/models/user';

export const chatApplication = (req: Request, res: Response) => {
  const filePath = join(__dirname, '../../public/index.html');
  res.sendFile(filePath);
};
export const chats = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findAll({
      include: {
        model: User,
        attributes: ['firstName', 'lastName', 'photoUrl'],
      },
      attributes: ['id', 'senderId', 'socketId', 'content', 'updatedAt'],
    });

    return res.status(200).json({ ok: true, chat });
  } catch (error) {
    logger.error('Get Chats : ', error);
    sendInternalErrorResponse(res, error);
  }
};
