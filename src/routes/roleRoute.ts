import { Router } from 'express';
import { createRole, deleteRole, getAllRoles, getSingleRole, updateRole } from '../controllers/roleControllers';

const router = Router();

router.get('/', getAllRoles);
router.get('/:id', getSingleRole);
router.post('/', createRole);
router.patch('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;
