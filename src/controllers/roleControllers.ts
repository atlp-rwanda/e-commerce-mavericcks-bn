import logger from '../logs/config';
import { Request, Response } from 'express';
import Role from '../database/models/role';

const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, displayName } = req.body;
    const createdRole = await Role.create({ name, displayName });

    res.send(createdRole);
  } catch (error) {
    logger.info(error);
    res.send('Role could not be created successfully');
  }
};
const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll();
    res.send(roles);
  } catch (error) {
    logger.info(error);
    res.send(`Roles can't be found`);
  }
};
const getSingleRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id);
    res.send(role);
  } catch (error) {
    res.send('Role could not be found');
    logger.info(error);
  }
};
const updateRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const contentsToUpdate = { ...req.body };
  try {
    const roleToupdate = await Role.findByPk(id);
    if (!roleToupdate) {
      res.status(404).send('Role not found');
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
    res.send('Error! Could not be updated');
  }
};
const deleteRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deletedCount = await Role.destroy({ where: { id } });
    if (deletedCount === 1) {
      res.status(200).send('Role deleted successfully');
    } else {
      res.status(404).send('Role not found');
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send('Error! Could not delete role');
  }
};

export { createRole, getAllRoles, getSingleRole, updateRole, deleteRole };
