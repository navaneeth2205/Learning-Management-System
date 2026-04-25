import Course from '../course/course.model.js';
import Quiz from './quiz.model.js';
import QuizAttempt from './quizAttempt.model.js';
import Enrollment from '../enrollment/enrollment.model.js';

import { createAppError } from '../../utils/constants.js';

export const createQuiz = async ({ courseId, title, questions, timeLimit, passingScore, createdBy }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	return Quiz.create({
		courseId,
		title,
		questions,
		timeLimit,
		passingScore,
		createdBy,
	});
};

export const submitQuizAnswers = async ({ quizId, userId, answers, timeTaken }) => {
	const quiz = await Quiz.findById(quizId);
	if (!quiz) {
		throw createAppError('Quiz not found', 404);
	}

	if (!Array.isArray(answers)) {
		throw createAppError('Answers must be an array', 400);
	}

	let score = 0;
	const results = [];
	quiz.questions.forEach((question, index) => {
		const userAnswer = answers[index] || '';
		const isCorrect = userAnswer === question.correctAnswer;
		if (isCorrect) {
			score += 1;
		}
		results.push({
			question: question.question,
			userAnswer,
			correctAnswer: question.correctAnswer,
			isCorrect,
		});
	});

	const total = quiz.questions.length;
	const percentage = total ? Number(((score / total) * 100).toFixed(2)) : 0;
	const passed = percentage >= (quiz.passingScore || 70);

	const attempt = await QuizAttempt.create({
		quizId,
		userId,
		answers,
		score,
		total,
		percentage,
		passed,
		timeTaken: timeTaken || 0,
	});

	return {
		attemptId: attempt._id,
		quizId: quiz._id,
		quizTitle: quiz.title,
		score,
		total,
		percentage,
		passed,
		passingScore: quiz.passingScore,
		results,
	};
};

export const getQuizzesByCourse = async (courseId) =>
	Quiz.find({ courseId }).select('-questions.correctAnswer').sort({ createdAt: -1 });

export const getQuizById = async (quizId) => {
	const quiz = await Quiz.findById(quizId)
		.select('-questions.correctAnswer')
		.populate('courseId', 'title');
	if (!quiz) {
		throw createAppError('Quiz not found', 404);
	}
	return quiz;
};

export const getQuizzesForLearner = async (userId) => {
	const enrollments = await Enrollment.find({ userId }).select('courseId');
	const courseIds = enrollments.map((e) => e.courseId);

	const quizzes = await Quiz.find({ courseId: { $in: courseIds } })
		.select('-questions.correctAnswer')
		.populate('courseId', 'title category')
		.sort({ createdAt: -1 });

	const attempts = await QuizAttempt.find({ userId, quizId: { $in: quizzes.map((q) => q._id) } })
		.sort({ completedAt: -1 });

	const attemptMap = {};
	attempts.forEach((a) => {
		const key = a.quizId.toString();
		if (!attemptMap[key]) {
			attemptMap[key] = [];
		}
		attemptMap[key].push(a);
	});

	return quizzes.map((q) => {
		const quizAttempts = attemptMap[q._id.toString()] || [];
		const bestAttempt = quizAttempts.reduce((best, a) => (!best || a.percentage > best.percentage ? a : best), null);

		return {
			...q.toObject(),
			attempts: quizAttempts.length,
			status: quizAttempts.length > 0 ? 'completed' : 'available',
			score: bestAttempt?.percentage ?? null,
			bestScore: bestAttempt?.score ?? null,
			bestTotal: bestAttempt?.total ?? null,
			passed: bestAttempt?.passed ?? null,
		};
	});
};

export const getQuizAttemptResult = async (attemptId) => {
	const attempt = await QuizAttempt.findById(attemptId)
		.populate('quizId', 'title courseId passingScore questions');

	if (!attempt) {
		throw createAppError('Quiz attempt not found', 404);
	}

	return attempt;
};

export const getQuizAttemptsByUser = async (userId, quizId) => {
	const attempts = await QuizAttempt.find({ userId, quizId })
		.sort({ completedAt: -1 })
		.populate('quizId', 'title passingScore');

	return attempts;
};
