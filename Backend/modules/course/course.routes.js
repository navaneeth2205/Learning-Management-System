import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isInstructorOrAdmin } from '../../middleware/role.middleware.js';
import {
	createCourseController,
	getAllCoursesController,
	getSingleCourseController,
	getCourseDetailController,
	updateCourseController,
	deleteCourseController,
} from './course.controller.js';

const router = express.Router();

router.post('/', authenticate, isInstructorOrAdmin, createCourseController);
router.get('/', getAllCoursesController);
router.get('/:courseId', getSingleCourseController);
router.get('/:courseId/details', getCourseDetailController);
router.put('/:courseId', authenticate, isInstructorOrAdmin, updateCourseController);
router.delete('/:courseId', authenticate, isInstructorOrAdmin, deleteCourseController);

export default router;
