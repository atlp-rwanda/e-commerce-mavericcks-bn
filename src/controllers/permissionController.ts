import { Request, Response } from 'express';
import { sendInternalErrorResponse } from '../validations';
import Permission from '../database/models/permission';
import { validateFields } from '../validations/index';

// create a permission
export const createPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const missingFields = validateFields(req, ['name']);
    if (missingFields.length) {
      res.status(400).json({ ok: false, errorMessage: `Missing required fields: ${missingFields.join(', ')}` });
      return;
    }
    const createdPermission = await Permission.create({ name: req.body.name });
    res.status(201).json({ ok: true, data: createdPermission });
  } catch (error) {
    sendInternalErrorResponse(res, error);
    return;
  }
};
// get all permissions
export const getAllPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const permissions = await Permission.findAll({ attributes: ['id', 'name'] });
    res.status(200).json({ ok: true, data: permissions });
  } catch (error) {
    sendInternalErrorResponse(res, error);
    return;
  }
};
// get a single permission
export const getSinglePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      res.status(404).json({ ok: false, errorMessage: 'Permission not found' });
      return;
    }
    res.status(200).json({ ok: true, data: permission });
  } catch (error) {
    sendInternalErrorResponse(res, error);
    return;
  }
};
// update a permission
export const updatePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const missingFields = validateFields(req, ['name']);
    if (missingFields.length) {
      res.status(400).json({ ok: false, errorMessage: `Missing required fields: ${missingFields.join(', ')}` });
      return;
    }
    const permissionToUpdate = await Permission.findByPk(req.params.id);
    if (!permissionToUpdate) {
      res.status(404).json({ ok: false, errorMessage: 'Permission not found' });
      return;
    }
    if (!req.body.name) res.status(400).json({ ok: false, errorMessage: 'Name is required' });

    permissionToUpdate.name = req.body.name;

    await permissionToUpdate.save();
    res.status(200).json({ ok: true, data: permissionToUpdate });
  } catch (error) {
    sendInternalErrorResponse(res, error);
    return;
  }
};
// delete a permission
export const deletePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const permissionToDelete = await Permission.findByPk(req.params.id);
    if (!permissionToDelete) {
      res.status(404).json({ ok: false, errorMessage: 'Permission not found' });
      return;
    }
    await permissionToDelete.destroy();
    res.status(200).json({ ok: true, message: 'permission deleted successfully!' });
  } catch (error) {
    sendInternalErrorResponse(res, error);
    return;
  }
};
