import Course from './course.model.js';
import Enrollment from '../enrollment/enrollment.model.js';
import { findLessonsByCourseId } from '../lesson/lesson.service.js';
import { createNotificationsForUsers } from '../notification/notification.service.js';
import { createGoogleClassroomCourse } from './googleClassroom.service.js';

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

export const getCoursesByInstructor = async (instructorId) =>
	Course.find({ instructorId })
		.populate('instructorId', 'name email role')
		.sort({ createdAt: -1 });

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

	const lessons = await findLessonsByCourseId(courseId);
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

export const createClassroomForInstructorCourse = async ({ courseId, instructorId }) => {
	const course = await Course.findOne({ _id: courseId, instructorId }).populate('instructorId', 'name email');
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	if (course.googleClassroom?.id) {
		return {
			course,
			classroom: course.googleClassroom,
			alreadyExists: true,
			notifiedStudents: 0,
		};
	}

	const classroom = await createGoogleClassroomCourse({
		title: course.title,
		description: course.description,
		section: course.category || 'LMS Course',
	});

	course.googleClassroom = classroom;
	await course.save();

	const enrollments = await Enrollment.find({ courseId: course._id }).populate('userId', 'name email');
	const learnerIds = enrollments
		.map((enrollment) => enrollment.userId?._id || enrollment.userId)
		.filter(Boolean);

	await createNotificationsForUsers(learnerIds, {
		title: `Join ${course.title} on Google Classroom`,
		message: classroom.alternateLink
			? `Your instructor created a live Google Classroom. Open the join link and use code ${classroom.enrollmentCode || 'shared in the classroom page'}.`
			: `Your instructor created a live Google Classroom for ${course.title}. Use code ${classroom.enrollmentCode || 'shared by your instructor'} to join.`,
		type: 'classroom',
		link: classroom.alternateLink || '',
		data: {
			courseId: String(course._id),
			courseTitle: course.title,
			classroomId: classroom.id,
			classroomLink: classroom.alternateLink || '',
			enrollmentCode: classroom.enrollmentCode || '',
		},
	});

	return {
		course,
		classroom,
		alreadyExists: false,
		notifiedStudents: learnerIds.length,
	};
};
