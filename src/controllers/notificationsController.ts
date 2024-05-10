import { Request, Response } from 'express';
import Notification from '../database/models/notification';
import { sendInternalErrorResponse } from '../validations';
import logger from '../logs/config';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.findAll({ where: { userId } });
    if (notifications.length === 0) {
      logger.error('No notifications were found');
      res.status(404).json({
        ok: false,
        message: 'No notifications that were found',
      });
      return;
    }
    res.status(200).json({ ok: true, data: notifications });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isRead } = req.body;
  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      res.status(401).json({
        ok: false,
        errorMessage: 'No such notification that were found! Try again',
      });
      return;
    }
    notification.isRead = isRead;
    await notification.save();
    res.status(200).json({ ok: true, message: 'Notification were updated successfully' });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
