import Course from '../course/course.model.js';
import Enrollment from './enrollment.model.js';
import Progress from '../progress/progress.model.js';

import { createAppError } from '../../utils/constants.js';

export const enrollInCourse = async ({ userId, courseId }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	const existingEnrollment = await Enrollment.findOne({ userId, courseId });
	if (existingEnrollment) {
		throw createAppError('User is already enrolled in this course', 409);
	}

	const enrollment = await Enrollment.create({ userId, courseId });

	// Initialize progress record
	await Progress.findOneAndUpdate(
		{ userId, courseId },
		{ completionPercentage: 0 },
		{ upsert: true, new: true, setDefaultsOnInsert: true }
	);

	// Increment enrolled count on course
	await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

	return enrollment;
};

export const getEnrollmentsByUser = async (userId) =>
	Enrollment.find({ userId })
		.populate({
			path: 'courseId',
			select: 'title description instructorId category difficulty thumbnail tags status enrolledCount rating createdAt',
			populate: { path: 'instructorId', select: 'name email' },
		})
		.sort({ enrolledAt: -1 });

export const checkEnrollment = async ({ userId, courseId }) => {
	const enrollment = await Enrollment.findOne({ userId, courseId });
	return !!enrollment;
};

export const unenrollFromCourse = async ({ userId, courseId }) => {
	const enrollment = await Enrollment.findOneAndDelete({ userId, courseId });
	if (!enrollment) {
		throw createAppError('Enrollment not found', 404);
	}
	await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: -1 } });
	return enrollment;
};
