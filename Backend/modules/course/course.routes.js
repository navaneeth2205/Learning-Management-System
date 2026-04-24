import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isInstructorOrAdmin } from '../../middleware/role.middleware.js';
import {
	createCourseController,
	getAllCoursesController,
	getSingleCourseController,
} from './course.controller.js';

const router = express.Router();

router.post('/', authenticate, isInstructorOrAdmin, createCourseController);
router.get('/', getAllCoursesController);
router.get('/:courseId', getSingleCourseController);

export default router;
