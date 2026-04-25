import Assignment from '../assignment/assignment.model.js';
import Submission from './submission.model.js';

import { createAppError } from '../../utils/constants.js';

export const createSubmission = async ({ assignmentId, userId, fileUrl }) => {
	const assignment = await Assignment.findById(assignmentId);
	if (!assignment) {
		throw createAppError('Assignment not found', 404);
	}

	const existingSubmission = await Submission.findOne({ assignmentId, userId });
	if (existingSubmission) {
		throw createAppError('Submission already exists for this assignment', 409);
	}

	return Submission.create({
		assignmentId,
		userId,
		fileUrl,
	});
};

export const assignGrade = async ({ submissionId, grade }) => {
	const submission = await Submission.findByIdAndUpdate(
		submissionId,
		{ grade },
		{ new: true, runValidators: true }
	);

	if (!submission) {
		throw createAppError('Submission not found', 404);
	}

	return submission;
};

export const getSubmissionsByAssignment = async (assignmentId) =>
	Submission.find({ assignmentId }).populate('userId', 'name email').sort({ _id: -1 });

export const getSubmissionsByUser = async (userId) =>
	Submission.find({ userId })
		.populate('assignmentId', 'title courseId deadline points')
		.sort({ _id: -1 });

export const getSubmissionByUserAndAssignment = async (userId, assignmentId) =>
	Submission.findOne({ userId, assignmentId });
