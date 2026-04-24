import { successResponse } from '../../utils/responseHandler.js';

import { createCourse, getCourseById, getCourses } from './course.service.js';

export const createCourseController = async (req, res, next) => {
	try {
		const course = await createCourse({ ...req.body, instructorId: req.user._id });
		return successResponse(res, {
			statusCode: 201,
			message: 'Course created successfully',
			data: course,
		});
	} catch (error) {
		return next(error);
	}
};

export const getAllCoursesController = async (req, res, next) => {
	try {
		const courses = await getCourses();
		return successResponse(res, {
			message: 'Courses fetched successfully',
			data: courses,
		});
	} catch (error) {
		return next(error);
	}
};

export const getSingleCourseController = async (req, res, next) => {
	try {
		const course = await getCourseById(req.params.courseId);
		return successResponse(res, {
			message: 'Course fetched successfully',
			data: course,
		});
	} catch (error) {
		return next(error);
	}
};
