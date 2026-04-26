import mongoose from 'mongoose';
import Course from '../course/course.model.js';
import Lesson from './lesson.model.js';

import { LESSON_TYPES, createAppError } from '../../utils/constants.js';

export const createLesson = async ({ courseId, title, fileUrl, mimeType, duration, order, description }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	const type = mimeType === 'application/pdf' ? LESSON_TYPES.PDF : LESSON_TYPES.VIDEO;
	const parsedOrder = Number(order);
	let resolvedOrder = Number.isFinite(parsedOrder) && parsedOrder > 0 ? parsedOrder : null;

	if (!resolvedOrder) {
		const lessonCount = await Lesson.countDocuments({ courseId });
		resolvedOrder = lessonCount + 1;
	}

	return Lesson.create({
		courseId,
		title,
		contentUrl: fileUrl,
		type,
		duration,
		order: resolvedOrder,
		description,
	});
};

export const getLessonsByCourse = async (courseId) => {
	// Match by both ObjectId and string courseId for resilience against manual imports
	let objectId = null;
	try { objectId = new mongoose.Types.ObjectId(courseId); } catch (_) {}

	const query = objectId
		? { $or: [{ courseId: objectId }, { courseId: courseId.toString() }] }
		: { courseId: courseId.toString() };

	return Lesson.find(query).sort({ order: 1, _id: 1 });
};

export const getLessonById = async (lessonId) => {
	const lesson = await Lesson.findById(lessonId).populate('courseId', 'title');
	if (!lesson) {
		throw createAppError('Lesson not found', 404);
	}
	return lesson;
};
