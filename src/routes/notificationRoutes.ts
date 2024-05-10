import express from 'express';
import { getNotifications, markNotificationAsRead } from '../controllers/notificationsController';

const route = express.Router();

route.get('/:userId', getNotifications);
route.patch('/:id', markNotificationAsRead);

export default route;
