/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddlewares';
import { handlePayments, handleWebHooks } from '../controllers/handlePaymentsController';

export const paymentRouter = Router();

paymentRouter.post('/:orderId/charge', isAuthenticated, handlePayments);
paymentRouter.post('/webhook', handleWebHooks);
