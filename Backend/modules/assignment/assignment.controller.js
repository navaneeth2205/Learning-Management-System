import { successResponse } from '../../utils/responseHandler.js';

import { createAssignment, getAssignmentsByCourse } from './assignment.service.js';

export const createAssignmentController = async (req, res, next) => {
	try {
		const assignment = await createAssignment(req.body);
		return successResponse(res, {
			statusCode: 201,
			message: 'Assignment created successfully',
			data: assignment,
		});
	} catch (error) {
		return next(error);
	}
};

export const listAssignmentsByCourseController = async (req, res, next) => {
	try {
		const assignments = await getAssignmentsByCourse(req.params.courseId);
		return successResponse(res, {
			message: 'Assignments fetched successfully',
			data: assignments,
		});
	} catch (error) {
		return next(error);
	}
};
