import { Request, Response } from 'express';
import { sendInternalErrorResponse } from '../validations';
import logger from '../logs/config';
import VendorRequest from '../database/models/sellerRequest';
import uploadImage from '../helpers/claudinary';
import User from '../database/models/user';
const fileUploadService = async (req: Request) => {
  const store: string[] = [];
  for (const file of req.files as Express.Multer.File[]) {
    store.push(await uploadImage(file.buffer));
  }
  return store;
};
export const createSellerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req.user as User).id;
    const exisistingUser = await VendorRequest.findOne({ where: { vendorId } });
    if (exisistingUser) {
      logger.error('user request exists!');
      res.status(400).json({ ok: false, message: 'This user has sent the request already!' });
      return;
    }
    if (!req.files || +req.files.length < 6) {
      res.status(400).json({ ok: false, message: 'Please upload  all required documents(6)' });
      return;
    }
    if (req.body.agreement !== 'true') {
      res.status(400).json({ ok: false, message: 'Please agree to the terms and conditions' });
      return;
    }
    const documents = await fileUploadService(req);

    logger.info('Documents uploaded successfully!');
    const { agreement } = req.body;

    const result = await VendorRequest.create({
      vendorId,
      agreement,
      documents,
    });
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
export const getSellerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await VendorRequest.findByPk(req.params.id);
    if (!request) {
      res.status(404).json({ ok: false, message: `No request found by id: ${req.params.id}` });
    }
    res.status(200).json({ ok: true, data: request });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
export const updateSellerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.agreement !== 'true') {
      res.status(400).json({
        ok: false,
        errorMessage: `Please agree to our terms and conditions first`,
      });
      return;
    }
    const request = await VendorRequest.findByPk(req.params.id);
    if (request === null) {
      res.status(404).json({
        ok: false,
        message: 'request not found',
      });
    }
    if (!req.files || +req.files.length !== 6) {
      res.status(400).json({ ok: false, message: '6 files are required' });
      return;
    }
    const docs = await fileUploadService(req);
    request!.documents = docs;
    req.body.agreement === 'true'
      ? (request!.agreement = req.body.agreement)
      : (request!.agreement = request!.agreement);
    await request?.save();

    res.status(200).json({ ok: true, message: 'request updated successfully', data: request });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
export const deleteSellerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await VendorRequest.findByPk(req.params.id);
    if (request === null) {
      res.status(404).json({
        ok: false,
        message: 'request not found',
      });
    }
    await request?.destroy();

    res.status(200).json({ ok: true, message: 'Vendor request deleted successfully' });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
export const getAllSellerRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await VendorRequest.findAll({
      include: {
        model: User,
      },
    });

    res.status(200).json({ ok: true, data: requests });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
