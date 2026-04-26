import { successResponse } from '../../utils/responseHandler.js';

import { createQuiz, getQuizzesByCourse, getQuizByLessonOrder, getQuizById, submitQuizAnswers, getQuizzesForLearner, getQuizAttemptResult, getQuizAttemptsByUser } from './quiz.service.js';

export const createQuizController = async (req, res, next) => {
	try {
		const quiz = await createQuiz({ ...req.body, createdBy: req.user._id });
		return successResponse(res, {
			statusCode: 201,
			message: 'Quiz created successfully',
			data: quiz,
		});
	} catch (error) {
		return next(error);
	}
};

export const submitQuizController = async (req, res, next) => {
	try {
		const result = await submitQuizAnswers({
			quizId: req.params.quizId,
			userId: req.user._id,
			answers: req.body.answers,
			timeTaken: req.body.timeTaken,
			requester: req.user,
		});

		return successResponse(res, {
			message: 'Quiz submitted successfully',
			data: result,
		});
	} catch (error) {
		return next(error);
	}
};

export const listQuizzesByCourseController = async (req, res, next) => {
	try {
		const quizzes = await getQuizzesByCourse(req.params.courseId, req.user);
		return successResponse(res, {
			message: 'Quizzes fetched successfully',
			data: quizzes,
		});
	} catch (error) {
		return next(error);
	}
};

export const getQuizByLessonController = async (req, res, next) => {
	try {
		const { courseId, lessonOrder } = req.params;
		const quiz = await getQuizByLessonOrder(courseId, lessonOrder, req.user);
		return successResponse(res, {
			message: quiz ? 'Quiz fetched' : 'No quiz for this lesson',
			data: quiz, // null means no quiz — not an error
		});
	} catch (error) {
		return next(error);
	}
};

export const getQuizController = async (req, res, next) => {
	try {
		const quiz = await getQuizById(req.params.quizId, req.user);
		return successResponse(res, {
			message: 'Quiz fetched successfully',
			data: quiz,
		});
	} catch (error) {
		return next(error);
	}
};

export const myQuizzesController = async (req, res, next) => {
	try {
		const quizzes = await getQuizzesForLearner(req.user._id);
		return successResponse(res, {
			message: 'Quizzes fetched successfully',
			data: quizzes,
		});
	} catch (error) {
		return next(error);
	}
};

export const getAttemptResultController = async (req, res, next) => {
	try {
		const result = await getQuizAttemptResult(req.params.attemptId);
		return successResponse(res, {
			message: 'Quiz result fetched successfully',
			data: result,
		});
	} catch (error) {
		return next(error);
	}
};

export const myQuizAttemptsController = async (req, res, next) => {
	try {
		const attempts = await getQuizAttemptsByUser(req.user._id, req.params.quizId);
		return successResponse(res, {
			message: 'Quiz attempts fetched successfully',
			data: attempts,
		});
	} catch (error) {
		return next(error);
	}
};
