/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { isAuthenticated, checkUserRoles } from '../middlewares/authMiddlewares';
import {
  createPermission,
  getAllPermissions,
  getSinglePermission,
  updatePermission,
  deletePermission,
} from '../controllers/permissionController';
export const permissionRoute = Router();
permissionRoute
  .route('/')
  .post(isAuthenticated, checkUserRoles('admin'), createPermission)
  .get(isAuthenticated, checkUserRoles('admin'), getAllPermissions);
permissionRoute
  .route('/:id')
  .get(isAuthenticated, checkUserRoles('admin'), getSinglePermission)
  .put(isAuthenticated, checkUserRoles('admin'), updatePermission)
  .delete(isAuthenticated, checkUserRoles('admin'), deletePermission);
