import Course from './course.model.js';

import { createAppError } from '../../utils/constants.js';

export const createCourse = async ({ title, description, instructorId }) =>
	Course.create({
		title,
		description,
		instructorId,
	});

export const getCourses = async () =>
	Course.find()
		.populate('instructorId', 'name email role')
		.sort({ createdAt: -1 });

export const getCourseById = async (courseId) => {
	const course = await Course.findById(courseId).populate('instructorId', 'name email role');

	if (!course) {
		throw createAppError('Course not found', 404);
	}

	return course;
};
