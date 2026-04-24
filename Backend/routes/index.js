import express from 'express';

import assignmentRoutes from '../modules/assignment/assignment.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import communicationRoutes from '../modules/communication/communication.routes.js';
import courseRoutes from '../modules/course/course.routes.js';
import enrollmentRoutes from '../modules/enrollment/enrollment.routes.js';
import lessonRoutes from '../modules/lesson/lesson.routes.js';
import progressRoutes from '../modules/progress/progress.routes.js';
import quizRoutes from '../modules/quiz/quiz.routes.js';
import submissionRoutes from '../modules/submission/submission.routes.js';
import userRoutes from '../modules/user/user.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'LMS API root',
		health: '/api/health',
		endpoints: [
			'/api/auth',
			'/api/users',
			'/api/courses',
			'/api/enrollments',
			'/api/lessons',
			'/api/assignments',
			'/api/submissions',
			'/api/progress',
			'/api/quizzes',
			'/api/communication',
		],
	});
});

router.get('/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'LMS API is healthy',
	});
});

router.use('/auth', authRoutes);
router.use('/', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/lessons', lessonRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/progress', progressRoutes);
router.use('/quizzes', quizRoutes);
router.use('/communication', communicationRoutes);

export default router;
