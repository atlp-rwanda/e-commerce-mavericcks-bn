import logger from '../logs/config';
import { Request, Response } from 'express';
import Role from '../database/models/role';
import { sendInternalErrorResponse, validateFields } from '../validations';

const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    if (validateFields(req, ['name']).length !== 0) {
      res.status(400).json({ ok: false, errorMessage: 'Role name is required' });
      return;
    }
    const { name, displayName } = req.body;
    const createdRole = await Role.create({ name, displayName });
    res.status(201).json({ ok: true, data: createdRole });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll();
    res.status(200).json({ ok: true, data: roles });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
const getSingleRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404).json({ ok: false, errorMessage: 'Roles can not be found' });
      return;
    }
    res.status(200).json({ ok: true, data: role });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
const updateRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const contentsToUpdate = { ...req.body };
  try {
    const roleToupdate = await Role.findByPk(id);
    if (!roleToupdate) {
      res.status(404).json({ ok: false, errorMessage: 'Role not found' });
      return;
    }
    if (contentsToUpdate.name) {
      roleToupdate.name = contentsToUpdate.name;
    }
    if (contentsToUpdate.displayName) {
      roleToupdate.displayName = contentsToUpdate.displayName;
    }
    await roleToupdate.save();
    res.status(200).json({ ok: true, data: roleToupdate });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
const deleteRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deletedCount = await Role.destroy({ where: { id } });
    if (deletedCount === 1) {
      res.status(200).json({ ok: true, data: deletedCount });
    } else {
      res.status(404).json({ ok: false, errorMessage: 'Role not found' });
    }
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};

export { createRole, getAllRoles, getSingleRole, updateRole, deleteRole };
