import mongoose from 'mongoose';
import Course from '../course/course.model.js';
import Quiz from './quiz.model.js';
import QuizAttempt from './quizAttempt.model.js';
import Enrollment from '../enrollment/enrollment.model.js';
import Lesson from '../lesson/lesson.model.js';
import Progress from '../progress/progress.model.js';

import { ROLES, createAppError } from '../../utils/constants.js';

const DEFAULT_MAX_ATTEMPTS = 3;

const toIdString = (value) => {
	if (!value) {
		return '';
	}

	if (typeof value === 'object' && value._id) {
		return value._id.toString();
	}

	return value.toString();
};

const buildAttemptMap = (attempts) => {
	const attemptMap = new Map();

	attempts.forEach((attempt) => {
		const key = toIdString(attempt.quizId);
		if (!attemptMap.has(key)) {
			attemptMap.set(key, []);
		}
		attemptMap.get(key).push(attempt);
	});

	return attemptMap;
};

const buildCompletedLessonsMap = (progressRecords) => {
	const progressMap = new Map();

	progressRecords.forEach((progress) => {
		progressMap.set(
			toIdString(progress.courseId),
			new Set((progress.completedLessons || []).map((lessonId) => toIdString(lessonId)))
		);
	});

	return progressMap;
};

const buildLessonsByCourseMap = (lessons) => {
	const lessonsByCourse = new Map();

	lessons.forEach((lesson) => {
		const courseKey = toIdString(lesson.courseId);
		if (!lessonsByCourse.has(courseKey)) {
			lessonsByCourse.set(courseKey, new Map());
		}
		lessonsByCourse.get(courseKey).set(Number(lesson.order), lesson);
	});

	return lessonsByCourse;
};

const buildCourseIdMatchers = (courseIds) => {
	const stringIds = [...new Set(courseIds.map((courseId) => toIdString(courseId)).filter(Boolean))];
	const objectIds = stringIds
		.filter((courseId) => mongoose.isValidObjectId(courseId))
		.map((courseId) => new mongoose.Types.ObjectId(courseId));

	return [...stringIds, ...objectIds];
};

const findLessonsForCourseIds = async (courseIds) => {
	return Lesson.collection
		.find({ courseId: { $in: buildCourseIdMatchers(courseIds) } })
		.project({ _id: 1, courseId: 1, title: 1, order: 1 })
		.sort({ order: 1, _id: 1 })
		.toArray();
};

const findQuizIdsByCourseIds = async (courseIds) => {
	const matchers = buildCourseIdMatchers(courseIds);
	if (matchers.length === 0) {
		return [];
	}

	const rawQuizzes = await Quiz.collection
		.find({ courseId: { $in: matchers } }, { projection: { _id: 1 } })
		.toArray();

	return rawQuizzes.map((quiz) => quiz._id);
};

const findQuizIdByCourseAndLessonOrder = async (courseId, lessonOrder) => {
	const rawQuiz = await Quiz.collection.findOne(
		{
			courseId: { $in: buildCourseIdMatchers([courseId]) },
			lessonOrder: Number(lessonOrder),
		},
		{ projection: { _id: 1 } }
	);

	return rawQuiz?._id || null;
};

const getBestAttempt = (attempts = []) =>
	attempts.reduce((best, attempt) => (!best || attempt.percentage > best.percentage ? attempt : best), null);

const buildLockedRequirement = (lessonOrder, lessonTitle) => {
	if (lessonTitle) {
		return `Complete "${lessonTitle}" to unlock this quiz.`;
	}

	if (lessonOrder) {
		return `Complete Lesson ${lessonOrder} to unlock this quiz.`;
	}

	return 'Complete the lesson video to unlock this quiz.';
};

const normalizeMaxAttempts = (value) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_ATTEMPTS;
};

const decorateLearnerQuiz = (quiz, attemptMap, completedLessonsMap, lessonsByCourse) => {
	const quizObject = typeof quiz.toObject === 'function' ? quiz.toObject() : { ...quiz };
	const quizId = toIdString(quizObject._id);
	const courseKey = toIdString(quizObject.courseId);
	const lessonOrder = Number(quizObject.lessonOrder);
	const mappedLesson = Number.isFinite(lessonOrder) && lessonOrder > 0
		? lessonsByCourse.get(courseKey)?.get(lessonOrder) || null
		: null;
	const completedLessons = completedLessonsMap.get(courseKey) || new Set();
	const quizAttempts = attemptMap.get(quizId) || [];
	const bestAttempt = getBestAttempt(quizAttempts);
	const questionCount = Array.isArray(quizObject.questions) ? quizObject.questions.length : 0;
	const lessonCompleted = !!mappedLesson && completedLessons.has(toIdString(mappedLesson._id));
	const isLocked = !!mappedLesson && !lessonCompleted;
	const isPassed = !!bestAttempt?.passed;

	return {
		...quizObject,
		attempts: quizAttempts.length,
		attemptsUsed: quizAttempts.length,
		bestScore: bestAttempt?.score ?? null,
		bestTotal: bestAttempt?.total ?? null,
		score: bestAttempt?.percentage ?? null,
		passed: bestAttempt?.passed ?? null,
		status: isPassed ? 'completed' : isLocked ? 'locked' : 'available',
		isLocked,
		lessonTitle: mappedLesson?.title ?? null,
		requirement: isLocked ? buildLockedRequirement(lessonOrder, mappedLesson?.title) : null,
		questionCount,
		maxAttempts: normalizeMaxAttempts(quizObject.maxAttempts),
	};
};

const decorateLearnerQuizzes = async (quizzes, userId) => {
	if (!Array.isArray(quizzes) || quizzes.length === 0) {
		return [];
	}

	const courseIds = [...new Set(quizzes.map((quiz) => toIdString(quiz.courseId)).filter(Boolean))];
	const quizIds = quizzes.map((quiz) => quiz._id);

	const [attempts, progressRecords, lessons] = await Promise.all([
		QuizAttempt.find({ userId, quizId: { $in: quizIds } }).sort({ completedAt: -1 }),
		Progress.find({ userId, courseId: { $in: courseIds } }).select('courseId completedLessons'),
		findLessonsForCourseIds(courseIds),
	]);

	const attemptMap = buildAttemptMap(attempts);
	const completedLessonsMap = buildCompletedLessonsMap(progressRecords);
	const lessonsByCourse = buildLessonsByCourseMap(lessons);

	return quizzes.map((quiz) => decorateLearnerQuiz(quiz, attemptMap, completedLessonsMap, lessonsByCourse));
};

const getLearnerQuizView = async (quiz, userId) => {
	const [learnerQuiz] = await decorateLearnerQuizzes([quiz], userId);
	return learnerQuiz || null;
};

const assertLearnerQuizAccess = async (quiz, userId) => {
	const courseId = quiz.courseId?._id || quiz.courseId;
	const isEnrolled = await Enrollment.exists({ userId, courseId });

	if (!isEnrolled) {
		throw createAppError('You are not enrolled in this course', 403);
	}

	const learnerQuiz = await getLearnerQuizView(quiz, userId);
	if (learnerQuiz?.isLocked) {
		throw createAppError(learnerQuiz.requirement || 'Complete the lesson video to unlock this quiz.', 403);
	}

	return learnerQuiz;
};

export const createQuiz = async ({ courseId, title, questions, timeLimit, passingScore, lessonOrder, createdBy }) => {
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
		lessonOrder: Number.isFinite(Number(lessonOrder)) ? Number(lessonOrder) : null,
		createdBy,
	});
};

export const submitQuizAnswers = async ({ quizId, userId, answers, timeTaken, requester }) => {
	const quiz = await Quiz.findById(quizId);
	if (!quiz) {
		throw createAppError('Quiz not found', 404);
	}

	if (requester?.role === ROLES.LEARNER) {
		await assertLearnerQuizAccess(quiz, requester._id);
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

export const getQuizzesByCourse = async (courseId, requester) => {
	const quizIds = await findQuizIdsByCourseIds([courseId]);
	if (quizIds.length === 0) {
		return [];
	}

	const quizzes = await Quiz.find({ _id: { $in: quizIds } })
		.select('-questions.correctAnswer')
		.populate('courseId', 'title category difficulty')
		.sort({ lessonOrder: 1, createdAt: -1 });

	if (requester?.role === ROLES.LEARNER) {
		return decorateLearnerQuizzes(quizzes, requester._id);
	}

	return quizzes;
};

export const getQuizByLessonOrder = async (courseId, lessonOrder, requester) => {
	const quizId = await findQuizIdByCourseAndLessonOrder(courseId, lessonOrder);
	if (!quizId) {
		return null;
	}

	const quiz = await Quiz.findById(quizId)
		.select('-questions.correctAnswer')
		.populate('courseId', 'title difficulty');

	if (requester?.role === ROLES.LEARNER) {
		const learnerQuiz = await getLearnerQuizView(quiz, requester._id);
		if (learnerQuiz?.isLocked) {
			return {
				...learnerQuiz,
				questions: [],
			};
		}
		return learnerQuiz;
	}

	return quiz;
};

export const getQuizById = async (quizId, requester) => {
	const quiz = await Quiz.findById(quizId)
		.select('-questions.correctAnswer')
		.populate('courseId', 'title difficulty');
	if (!quiz) {
		throw createAppError('Quiz not found', 404);
	}

	if (requester?.role === ROLES.LEARNER) {
		return assertLearnerQuizAccess(quiz, requester._id);
	}

	return quiz;
};

export const getQuizzesForLearner = async (userId) => {
	const enrollments = await Enrollment.find({ userId }).select('courseId');
	const courseIds = enrollments.map((e) => e.courseId);
	const quizIds = await findQuizIdsByCourseIds(courseIds);

	if (quizIds.length === 0) {
		return [];
	}

	const quizzes = await Quiz.find({ _id: { $in: quizIds } })
		.select('-questions.correctAnswer')
		.populate('courseId', 'title category difficulty')
		.sort({ lessonOrder: 1, createdAt: -1 });

	return decorateLearnerQuizzes(quizzes, userId);
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
