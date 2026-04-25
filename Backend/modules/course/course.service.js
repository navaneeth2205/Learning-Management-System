import Course from './course.model.js';
import Enrollment from '../enrollment/enrollment.model.js';
import Lesson from '../lesson/lesson.model.js';

import { createAppError } from '../../utils/constants.js';

export const createCourse = async ({ title, description, instructorId, category, difficulty, duration, thumbnail, tags, status }) =>
	Course.create({
		title,
		description,
		instructorId,
		category,
		difficulty,
		duration,
		thumbnail,
		tags,
		status,
	});

export const getCourses = async (query = {}) => {
	const filter = { status: 'published' };

	if (query.category && query.category !== 'All') {
		filter.category = query.category;
	}
	if (query.difficulty && query.difficulty !== 'All') {
		filter.difficulty = query.difficulty;
	}
	if (query.search) {
		filter.$or = [
			{ title: { $regex: query.search, $options: 'i' } },
			{ description: { $regex: query.search, $options: 'i' } },
			{ tags: { $regex: query.search, $options: 'i' } },
		];
	}
	if (query.instructorId) {
		filter.instructorId = query.instructorId;
	}

	return Course.find(filter)
		.populate('instructorId', 'name email role')
		.sort({ createdAt: -1 });
};

export const getAllCoursesUnfiltered = async () =>
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

export const getCourseWithDetails = async (courseId) => {
	const course = await Course.findById(courseId).populate('instructorId', 'name email role');

	if (!course) {
		throw createAppError('Course not found', 404);
	}

	const lessons = await Lesson.find({ courseId }).sort({ order: 1, _id: 1 });
	const enrollmentCount = await Enrollment.countDocuments({ courseId });

	return {
		...course.toObject(),
		lessons,
		enrolledCount: enrollmentCount,
	};
};

export const updateCourse = async (courseId, updateData) => {
	const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true, runValidators: true });
	if (!course) {
		throw createAppError('Course not found', 404);
	}
	return course;
};

export const deleteCourse = async (courseId) => {
	const course = await Course.findByIdAndDelete(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}
	return course;
};
