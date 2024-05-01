import logger from '../logs/config';
import { Request, Response } from 'express';
import Role from '../database/models/role';
import Permission from '../database/models/permission';
import { sendInternalErrorResponse, validateFields } from '../validations';
import sequelize from '../database/models/index';

const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, permissionIds } = req.body;
    const missingFields = validateFields(req, ['name', 'permissionIds']);
    if (missingFields.length > 0) {
      res.status(400).json({ ok: false, message: `Required fields: ${missingFields.join(', ')}` });
      return;
    }

    const permissions = await Permission.findAll({ where: { id: permissionIds } });
    if (permissions.length !== permissionIds.length) {
      logger.error('Adding role: One or more permissions not found');
      res.status(404).json({ ok: false, message: 'Roles create permissions not found' });
      return;
    }

    const transaction = await sequelize.transaction();
    try {
      const role = await Role.create({ name }, { transaction });
      await (role as any).addPermissions(permissions, { transaction });
      await transaction.commit();
      res.status(201).json({ ok: true, message: 'Role created successfully' });
    } catch (err) {
      logger.error('Error creating role');
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
  }
};
const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll({ include: { model: Permission, attributes: ['name'] } });
    res.status(200).json({ ok: true, data: roles });
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
const getSingleRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = await Role.findByPk(req.params.id, { include: { model: Permission, attributes: ['name'] } });
    if (!role) {
      res.status(404).json({ ok: false, message: 'Roles can not be found' });
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
  try {
    const transaction = await sequelize.transaction();
    try {
      const role = await Role.findByPk(req.params.id, { transaction });
      if (!role) {
        logger.error(`Role not found`);
        res.status(404).json({ ok: false, errorMessage: 'Role not found' });
        return;
      }
      const missingFields = validateFields(req, ['name', 'permissionIds']);
      if (missingFields.length > 0) {
        res.status(400).json({ ok: false, errorMessage: `the required fields: ${missingFields.join(', ')}` });
      }
      role.name = req.body.name;
      const updatedRole = await role.save({ transaction });
      await (updatedRole as any).setPermissions(req.body.permissionIds, { transaction });
      await transaction.commit();
      res.status(200).json({ ok: true, message: 'role updated successfully' });
    } catch (err) {
      logger.error('error updating role');
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};
const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedCount = await Role.destroy({ where: { id: req.params.id } });
    if (deletedCount === 1) {
      res.status(200).json({ ok: true, message: 'Role deleted successfully' });
    } else {
      res.status(404).json({ ok: false, message: 'Role not found' });
    }
  } catch (error) {
    logger.error(error);
    sendInternalErrorResponse(res, error);
    return;
  }
};

export { createRole, getAllRoles, getSingleRole, updateRole, deleteRole };
