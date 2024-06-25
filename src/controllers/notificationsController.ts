import { Request, Response } from 'express';
import Notification from '../database/models/notification';
import { sendInternalErrorResponse } from '../validations';
import logger from '../logs/config';
import sequelize from '../database/models';
import { Transaction } from 'sequelize';

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
    res.status(200).json({ ok: true, message: 'Notification were updated successfully', data: notification });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isRead } = req.body;
  try {
    const allNotifications = await Notification.findAll({ where: { userId } });
    await Promise.all(
      allNotifications.map(async notification => {
        notification.isRead = isRead;
        return notification.save();
      })
    );
    res.status(200).json({ ok: true, message: 'all notifications marked successfully' });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
export const getSingleNotification = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const oneNotification = await Notification.findByPk(id);
    if (!oneNotification) {
      res.status(404).json({
        ok: false,
        message: "Notification can't be found",
      });
      return;
    }
    res.status(200).json({
      ok: true,
      message: 'Notifications was found successfully',
      data: oneNotification,
    });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};

export const deleteSingleNotification = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await Notification.destroy({
      where: {
        id,
      },
    });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
export const deleteAllNotifications = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.findAll({
      where: { userId: userId },
      attributes: ['id'],
    });

    if (notifications.length === 0) {
      res.status(404).json({
        ok: false,
        message: 'No notifications found for this user',
      });
      return;
    }
    const deletedCount = await Notification.destroy({
      where: { id: notifications.map(n => n.id) },
    });

    res.status(200).json({
      ok: true,
      message: `Successfully deleted ${deletedCount} notification(s)`,
    });
  } catch (error) {
    logger.error('Error deleting notifications:', error);
    sendInternalErrorResponse(res, error);
  }
};
