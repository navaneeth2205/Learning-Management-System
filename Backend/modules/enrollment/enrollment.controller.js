import { successResponse } from '../../utils/responseHandler.js';

import { enrollInCourse, getEnrollmentsByUser } from './enrollment.service.js';

export const enrollCourseController = async (req, res, next) => {
	try {
		const enrollment = await enrollInCourse({
			userId: req.user._id,
			courseId: req.body.courseId,
		});

		return successResponse(res, {
			statusCode: 201,
			message: 'Enrollment successful',
			data: enrollment,
		});
	} catch (error) {
		return next(error);
	}
};

export const listMyEnrollmentsController = async (req, res, next) => {
	try {
		const enrollments = await getEnrollmentsByUser(req.user._id);
		return successResponse(res, {
			message: 'Enrollments fetched successfully',
			data: enrollments,
		});
	} catch (error) {
		return next(error);
	}
};
