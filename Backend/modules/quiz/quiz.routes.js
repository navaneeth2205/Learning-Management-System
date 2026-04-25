import express from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { isInstructorOrAdmin, isLearnerOrAdmin } from '../../middleware/role.middleware.js';
import {
	createQuizController,
	listQuizzesByCourseController,
	getQuizController,
	submitQuizController,
	myQuizzesController,
	getAttemptResultController,
	myQuizAttemptsController,
} from './quiz.controller.js';

const router = express.Router();

router.post('/', authenticate, isInstructorOrAdmin, createQuizController);
router.get('/me', authenticate, myQuizzesController);
router.get('/course/:courseId', authenticate, listQuizzesByCourseController);
router.get('/:quizId', authenticate, getQuizController);
router.post('/:quizId/submit', authenticate, isLearnerOrAdmin, submitQuizController);
router.get('/attempt/:attemptId', authenticate, getAttemptResultController);
router.get('/:quizId/my-attempts', authenticate, myQuizAttemptsController);

export default router;
