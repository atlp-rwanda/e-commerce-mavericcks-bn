import request from 'supertest';
import { app } from '../server';
import Notification from '../database/models/notification';
import { sendInternalErrorResponse } from '../validations';

jest.mock('../database/models/notification');
jest.mock('../validations');
jest.mock('../logs/config');

describe('Notification Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return 200 and notifications for a valid userId', async () => {
      const userId = 'test-user-id';
      const notifications = [
        { id: '1', userId, message: 'Test message 1', isRead: false },
        { id: '2', userId, message: 'Test message 2', isRead: true },
      ];

      (Notification.findAll as jest.Mock).mockResolvedValue(notifications);

      const response = await request(app).get(`/api/notifications/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true, data: notifications });
    });

    it('should return 404 if no notifications are found', async () => {
      const userId = 'test-user-id';

      (Notification.findAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get(`/api/notifications/${userId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        ok: false,
        message: 'No notifications that were found',
      });
    });

    it('should return 500 on internal server error', async () => {
      const userId = 'test-user-id';

      (Notification.findAll as jest.Mock).mockRejectedValue(new Error('Internal Error'));

      const response = await request(app).get(`/api/notifications/${userId}`);

      expect(response.status).toBe(500);
      expect(sendInternalErrorResponse).toHaveBeenCalled();
    }, 10000);
  });

  describe('markNotificationAsRead', () => {
    it('should return 200 and update the notification', async () => {
      const notification = {
        id: '1',
        userId: 'test-user-id',
        message: 'Test message',
        isRead: false,
        save: jest.fn().mockResolvedValue(true),
      };

      (Notification.findByPk as jest.Mock).mockResolvedValue(notification);

      const response = await request(app).patch(`/api/notifications/${notification.id}`).send({ isRead: true });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ok: true,
        message: 'Notification were updated successfully',
      });
      expect(notification.isRead).toBe(true);
      expect(notification.save).toHaveBeenCalled();
    });

    it('should return 401 if notification is not found', async () => {
      const id = 'non-existent-id';

      (Notification.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).patch(`/api/notifications/${id}`).send({ isRead: true });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        ok: false,
        errorMessage: 'No such notification that were found! Try again',
      });
    });

    it('should return 500 on internal server error', async () => {
      const id = '1';

      (Notification.findByPk as jest.Mock).mockRejectedValue(new Error('Internal Error'));

      const response = await request(app).patch(`/api/notifications/${id}`).send({ isRead: true });

      expect(response.status).toBe(500);
      expect(sendInternalErrorResponse).toHaveBeenCalled();
    }, 10000); // Extend timeout to 10 seconds
  });
});
