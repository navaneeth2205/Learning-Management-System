import Course from '../course/course.model.js';
import Assignment from './assignment.model.js';

import { createAppError } from '../../utils/constants.js';

export const createAssignment = async ({ courseId, title, description, deadline }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	return Assignment.create({
		courseId,
		title,
		description,
		deadline,
	});
};

export const getAssignmentsByCourse = async (courseId) => Assignment.find({ courseId }).sort({ deadline: 1 });
