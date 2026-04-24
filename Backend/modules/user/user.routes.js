import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isAdmin } from '../../middleware/role.middleware.js';
import { changeUserRole, getUser, listUsers } from './user.controller.js';

const router = express.Router();

router.get('/', authenticate, isAdmin, listUsers);
router.get('/:userId', authenticate, isAdmin, getUser);
router.patch('/:userId/role', authenticate, isAdmin, changeUserRole);

export default router;