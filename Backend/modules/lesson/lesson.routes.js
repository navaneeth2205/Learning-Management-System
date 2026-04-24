import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isInstructorOrAdmin } from '../../middleware/role.middleware.js';
import { uploadCourseContent } from '../../middleware/upload.middleware.js';
import { createLessonController, listLessonsByCourseController } from './lesson.controller.js';

const router = express.Router();

router.post('/', authenticate, isInstructorOrAdmin, uploadCourseContent.single('content'), createLessonController);
router.get('/course/:courseId', authenticate, listLessonsByCourseController);

export default router;
