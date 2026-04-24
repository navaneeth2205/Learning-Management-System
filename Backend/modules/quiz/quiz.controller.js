import { successResponse } from '../../utils/responseHandler.js';

import { createQuiz, getQuizzesByCourse, submitQuizAnswers } from './quiz.service.js';

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
			answers: req.body.answers,
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
		const quizzes = await getQuizzesByCourse(req.params.courseId);
		return successResponse(res, {
			message: 'Quizzes fetched successfully',
			data: quizzes,
		});
	} catch (error) {
		return next(error);
	}
};
