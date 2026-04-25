import Course from '../course/course.model.js';
import Assignment from './assignment.model.js';
import Enrollment from '../enrollment/enrollment.model.js';
import Submission from '../submission/submission.model.js';

import { createAppError } from '../../utils/constants.js';

export const createAssignment = async ({ courseId, title, description, deadline, points }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	return Assignment.create({
		courseId,
		title,
		description,
		deadline,
		points,
	});
};

export const getAssignmentsByCourse = async (courseId) => Assignment.find({ courseId }).sort({ deadline: 1 });

export const getAssignmentById = async (assignmentId) => {
	const assignment = await Assignment.findById(assignmentId).populate('courseId', 'title');
	if (!assignment) {
		throw createAppError('Assignment not found', 404);
	}
	return assignment;
};

export const getAssignmentsForLearner = async (userId) => {
	const enrollments = await Enrollment.find({ userId }).select('courseId');
	const courseIds = enrollments.map((e) => e.courseId);

	const assignments = await Assignment.find({ courseId: { $in: courseIds } })
		.populate('courseId', 'title category')
		.sort({ deadline: 1 });

	const submissions = await Submission.find({ userId, assignmentId: { $in: assignments.map((a) => a._id) } });
	const submissionMap = {};
	submissions.forEach((s) => {
		submissionMap[s.assignmentId.toString()] = s;
	});

	return assignments.map((a) => {
		const sub = submissionMap[a._id.toString()];
		return {
			...a.toObject(),
			submitted: !!sub,
			submittedAt: sub?.createdAt || null,
			grade: sub?.grade ?? null,
			submissionId: sub?._id || null,
			status: sub ? (sub.grade !== null && sub.grade !== undefined ? 'graded' : 'submitted') : 'pending',
		};
	});
};
