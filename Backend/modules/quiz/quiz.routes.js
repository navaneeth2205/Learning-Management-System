import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isInstructorOrAdmin, isLearnerOrAdmin } from '../../middleware/role.middleware.js';
import { createQuizController, listQuizzesByCourseController, submitQuizController } from './quiz.controller.js';

const router = express.Router();

router.post('/', authenticate, isInstructorOrAdmin, createQuizController);
router.get('/course/:courseId', authenticate, listQuizzesByCourseController);
router.post('/:quizId/submit', authenticate, isLearnerOrAdmin, submitQuizController);

export default router;
