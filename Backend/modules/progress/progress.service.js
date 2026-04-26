import Course from '../course/course.model.js';
import Progress from './progress.model.js';
import { countLessonsByCourseId } from '../lesson/lesson.service.js';

import { createAppError } from '../../utils/constants.js';

export const upsertProgress = async ({ userId, courseId, lessonId }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	let progress = await Progress.findOne({ userId, courseId });
	if (!progress) {
		progress = new Progress({ userId, courseId, completedLessons: [] });
	}

	if (lessonId && !progress.completedLessons.includes(lessonId)) {
		progress.completedLessons.push(lessonId);
	}

	// Recalculate percentage based on total lessons
	const totalLessons = await countLessonsByCourseId(courseId);
	if (totalLessons > 0) {
		progress.completionPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
	} else {
		progress.completionPercentage = 100;
	}

	await progress.save();
	return progress;
};

export const getProgressByUser = async (userId) => Progress.find({ userId }).populate('courseId', 'title description');
