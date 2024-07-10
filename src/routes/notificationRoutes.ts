import express from 'express';
import {
  deleteAllNotifications,
  deleteSingleNotification,
  getNotifications,
  getSingleNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../controllers/notificationsController';

const route = express.Router();

route.get('/:userId', getNotifications);
route.patch('/:id', markNotificationAsRead);
route.patch('/update/:userId', markAllNotificationsAsRead);
route.get('/:id', getSingleNotification);
route.delete('/:id', deleteSingleNotification);
route.delete('/delete/:userId', deleteAllNotifications);

export default route;
