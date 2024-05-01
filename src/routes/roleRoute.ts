/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { createRole, deleteRole, getAllRoles, getSingleRole, updateRole } from '../controllers/roleControllers';
import { isAuthenticated, checkUserRoles } from '../middlewares/authMiddlewares';
const router = Router();

router.get('/', isAuthenticated, getAllRoles);
router.get('/:id', isAuthenticated, getSingleRole);
router.post('/', isAuthenticated, checkUserRoles('admin'), createRole);
router.patch('/:id', isAuthenticated, checkUserRoles('admin'), updateRole);
router.delete('/:id', isAuthenticated, checkUserRoles('admin'), deleteRole);

export default router;
