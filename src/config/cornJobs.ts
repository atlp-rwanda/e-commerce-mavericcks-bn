import cron from 'node-cron';
import checkProductExpiryAndNotifySeller from '../helpers/checkProductExpiry';

const sheduledTasks = () => {
  cron.schedule('0 0 * * *', async () => {
    await checkProductExpiryAndNotifySeller();
  });
};

export default sheduledTasks;
