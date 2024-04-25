import logger from '../logs/config';
import { Request, Response } from 'express';
import Role from '../database/models/role';

const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, displayName } = req.body;
    const createdRole = await Role.create({ name, displayName });
    res.status(201).json({ ok: true, data: createdRole });
  } catch (error) {
    logger.error(error);
    res.status(400).json({
      ok: false,
      message: 'Role could not be created successfully',
    });
    return;
  }
};
const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll();
    res.status(200).json({ ok: true, data: roles });
  } catch (error) {
    logger.error(error);
    res.status(404).json({ ok: false, data: error });
    return;
  }
};
const getSingleRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id);
    res.status(200).json({ ok: true, data: role });
  } catch (error) {
    logger.error(error);
    res.status(404).json({ ok: false, message: "Role can't be found" });
    return;
  }
};
const updateRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const contentsToUpdate = { ...req.body };
  try {
    const roleToupdate = await Role.findByPk(id);
    if (!roleToupdate) {
      res.status(404).json({ ok: false, message: 'Role not found' });
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
    logger.error(error);
    res.status(500).json({ ok: false, data: error });
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
      res.status(404).json({ ok: false, message: 'Role not found' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ ok: false, message: 'Role not found' });
    return;
  }
};

export { createRole, getAllRoles, getSingleRole, updateRole, deleteRole };
