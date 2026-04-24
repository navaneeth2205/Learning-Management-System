import Course from '../course/course.model.js';
import Lesson from './lesson.model.js';

import { LESSON_TYPES, createAppError } from '../../utils/constants.js';

export const createLesson = async ({ courseId, title, fileUrl, mimeType }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	const type = mimeType === 'application/pdf' ? LESSON_TYPES.PDF : LESSON_TYPES.VIDEO;

	return Lesson.create({
		courseId,
		title,
		contentUrl: fileUrl,
		type,
	});
};

export const getLessonsByCourse = async (courseId) => Lesson.find({ courseId }).sort({ _id: -1 });
