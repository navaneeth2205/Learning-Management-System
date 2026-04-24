import Course from '../course/course.model.js';
import Enrollment from './enrollment.model.js';

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

	return Enrollment.create({ userId, courseId });
};

export const getEnrollmentsByUser = async (userId) =>
	Enrollment.find({ userId }).populate('courseId', 'title description instructorId createdAt').sort({ enrolledAt: -1 });
