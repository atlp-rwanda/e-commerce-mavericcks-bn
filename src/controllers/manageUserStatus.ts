import { Request, Response } from 'express';
import User from '../database/models/user';
import logger from '../logs/config';
import { sendEmail } from '../helpers/send-email';
import { sendInternalErrorResponse } from '../validations';

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

const activateUserAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.status === 'active') {
      res.json({ message: 'User is already active' });
      return;
    }

    user.status = UserStatus.ACTIVE;
    await user.save();

    res.json({ message: 'User activated successfully' });
    sendEmail('User_Account_unblocked', { name: user.firstName, email: user.email });
  } catch (error) {
    logger.error('Internal server error', error);
    sendInternalErrorResponse(res, error);
  }
};

const deactivateUserAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.status === 'inactive') {
      res.json({ message: 'User is already deactivated' });
      return;
    }

    user.status = UserStatus.INACTIVE;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
    sendEmail('User_Account_Blocked', { name: user.firstName, email: user.email });
  } catch (error) {
    logger.error('Internal server error', error);
    sendInternalErrorResponse(res, error);
  }
};

export { deactivateUserAccount, activateUserAccount };
