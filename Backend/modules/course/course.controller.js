import { successResponse } from '../../utils/responseHandler.js';

import {
	createCourse,
	getCourses,
	getCoursesByInstructor,
	getCourseById,
	getCourseWithDetails,
	updateCourse,
	deleteCourse,
	getAllCoursesUnfiltered,
} from './course.service.js';

export const createCourseController = async (req, res, next) => {
	try {
		const courseData = { ...req.body, instructorId: req.user._id };
		if (req.file) {
			courseData.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
		}
		const course = await createCourse(courseData);
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
		const { category, difficulty, search, instructorId } = req.query;
		const courses = await getCourses({ category, difficulty, search, instructorId });
		return successResponse(res, {
			message: 'Courses fetched successfully',
			data: courses,
		});
	} catch (error) {
		return next(error);
	}
};

export const getInstructorCoursesController = async (req, res, next) => {
	try {
		const courses = await getCoursesByInstructor(req.user._id);
		return successResponse(res, {
			message: 'Instructor courses fetched successfully',
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

export const getCourseDetailController = async (req, res, next) => {
	try {
		const course = await getCourseWithDetails(req.params.courseId);
		return successResponse(res, {
			message: 'Course details fetched successfully',
			data: course,
		});
	} catch (error) {
		return next(error);
	}
};

export const updateCourseController = async (req, res, next) => {
	try {
		const course = await updateCourse(req.params.courseId, req.body);
		return successResponse(res, {
			message: 'Course updated successfully',
			data: course,
		});
	} catch (error) {
		return next(error);
	}
};

export const deleteCourseController = async (req, res, next) => {
	try {
		await deleteCourse(req.params.courseId);
		return successResponse(res, {
			message: 'Course deleted successfully',
		});
	} catch (error) {
		return next(error);
	}
};
