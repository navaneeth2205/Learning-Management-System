import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isInstructorOrAdmin } from '../../middleware/role.middleware.js';
import { createAssignmentController, listAssignmentsByCourseController } from './assignment.controller.js';

const router = express.Router();

router.post('/', authenticate, isInstructorOrAdmin, createAssignmentController);
router.get('/course/:courseId', authenticate, listAssignmentsByCourseController);

export default router;
