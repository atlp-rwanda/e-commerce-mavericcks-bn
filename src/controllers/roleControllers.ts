import logger from '../logs/config';
import { Request, Response } from 'express';
import Role from '../database/models/role';
import { trimSpaces } from '../validations/validation';
const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, displayName } = req.body;
    const createdRole = await Role.create({ name: trimSpaces(name), displayName });
    res.status(201).json({ ok: true, data: createdRole, message: 'Role successfully created' });
  } catch (error) {
    logger.info(error);
    res.status(400).json({ ok: false, data: error, message: 'Role could not be created successfully' });
  }
};
const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll();
    res.status(200).json({ ok: true, data: roles, message: 'Roles found successfully' });
  } catch (error) {
    logger.info(error);
    res.status(404).json({ ok: false, data: error, message: `Roles can't be found` });
  }
};
const getSingleRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id);
    res.status(200).json({ ok: true, data: role, message: 'Role found successfully' });
  } catch (error) {
    res.status(404).json({ ok: false, data: error, message: 'Role could not be found' });
  }
};
const updateRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const contentsToUpdate = { ...req.body };
  try {
    const roleToupdate = await Role.findByPk(id);
    if (!roleToupdate) {
      res.status(404).json({ ok: false, data: null, message: 'Role to update could not be found' });

      return;
    }
    if (contentsToUpdate.name) {
      roleToupdate.name = contentsToUpdate.name;
    }
    if (contentsToUpdate.displayName) {
      roleToupdate.displayName = contentsToUpdate.displayName;
    }
    await roleToupdate.save();
  } catch (error) {
    logger.info(error);
    res.status(500).json({ ok: false, data: error, message: 'Role could not be updated!' });
  }
};
const deleteRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deletedCount = await Role.destroy({ where: { id } });
    if (deletedCount === 1) {
      res.status(200).json({ ok: true, data: deletedCount, message: 'Role deleted successfully' });
    } else {
      res.status(404).json({ ok: false, data: null, message: 'Role not found' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ ok: false, data: error, message: 'Role not found' });
  }
};

export { createRole, getAllRoles, getSingleRole, updateRole, deleteRole };
