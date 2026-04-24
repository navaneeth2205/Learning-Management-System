import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isLearnerOrAdmin } from '../../middleware/role.middleware.js';
import { enrollCourseController, listMyEnrollmentsController } from './enrollment.controller.js';

const router = express.Router();

router.post('/', authenticate, isLearnerOrAdmin, enrollCourseController);
router.get('/me', authenticate, listMyEnrollmentsController);

export default router;
