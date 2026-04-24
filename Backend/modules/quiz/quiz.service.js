import Course from '../course/course.model.js';
import Quiz from './quiz.model.js';

import { createAppError } from '../../utils/constants.js';

export const createQuiz = async ({ courseId, title, questions, createdBy }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	return Quiz.create({
		courseId,
		title,
		questions,
		createdBy,
	});
};

export const submitQuizAnswers = async ({ quizId, answers }) => {
	const quiz = await Quiz.findById(quizId);
	if (!quiz) {
		throw createAppError('Quiz not found', 404);
	}

	if (!Array.isArray(answers)) {
		throw createAppError('Answers must be an array', 400);
	}

	let score = 0;
	quiz.questions.forEach((question, index) => {
		if (answers[index] && answers[index] === question.correctAnswer) {
			score += 1;
		}
	});

	const total = quiz.questions.length;
	const percentage = total ? Number(((score / total) * 100).toFixed(2)) : 0;

	return {
		quizId: quiz._id,
		score,
		total,
		percentage,
	};
};

export const getQuizzesByCourse = async (courseId) =>
	Quiz.find({ courseId }).select('-questions.correctAnswer').sort({ createdAt: -1 });
