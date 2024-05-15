import schedule from 'node-schedule';
import User from '../database/models/user';
import { sendEmail } from '../helpers/send-email';
import { EventEmitter } from 'events';
import logger from '../logs/config';

const eventEmitter = new EventEmitter();

const schedulePasswordUpdatePrompts = () => {
  const expirationMinutes = process.env.PASSWORD_EXPIRATION_MINUTES;
  if (!expirationMinutes) {
    logger.error('PASSWORD_EXPIRATION_MINUTES environment variable is not defined.');
    return;
  }

  schedule.scheduleJob(`*/${expirationMinutes} * * * *`, async () => {
    try {
      const users = await User.findAll();

      for (const user of users) {
        const lastPasswordUpdated: Date | undefined = user.lastPasswordUpdated ?? user.createdAt;

        if (!lastPasswordUpdated) {
          logger.error('lastPasswordUpdated is undefined for user:', user);
          continue;
        }

        const now = new Date();
        const passwordExpirationTime = new Date(lastPasswordUpdated);
        passwordExpirationTime.setMinutes(passwordExpirationTime.getMinutes() + parseInt(expirationMinutes));

        if (now >= passwordExpirationTime) {
          await sendEmail('password_prompt', { email: user.email, name: user.firstName }); // Use sendEmail function with 'password_prompt' type
          eventEmitter.emit('passwordUpdatePrompt', { userId: user.id });
        }
      }
    } catch (error) {
      logger.error('Error scheduling password update prompts:', error);
    }
  });
};

export { eventEmitter, schedulePasswordUpdatePrompts };
