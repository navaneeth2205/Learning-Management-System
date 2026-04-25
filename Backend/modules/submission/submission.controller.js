import { successResponse } from '../../utils/responseHandler.js';
import { createAppError } from '../../utils/constants.js';
import Submission from './submission.model.js';

import { assignGrade, createSubmission, getSubmissionsByAssignment, getSubmissionsByUser } from './submission.service.js';

export const submitAssignmentController = async (req, res, next) => {
	try {
		if (!req.file) {
			throw createAppError('Submission file is required', 400);
		}

		const submission = await createSubmission({
			assignmentId: req.body.assignmentId,
			userId: req.user._id,
			fileUrl: `/${req.file.path.replace(/\\/g, '/')}`,
		});

		return successResponse(res, {
			statusCode: 201,
			message: 'Assignment submitted successfully',
			data: submission,
		});
	} catch (error) {
		return next(error);
	}
};

export const gradeSubmissionController = async (req, res, next) => {
	try {
		const updatedSubmission = await assignGrade({
			submissionId: req.params.submissionId,
			grade: req.body.grade,
		});

		return successResponse(res, {
			message: 'Submission graded successfully',
			data: updatedSubmission,
		});
	} catch (error) {
		return next(error);
	}
};

export const listSubmissionsByAssignmentController = async (req, res, next) => {
	try {
		const submissions = await getSubmissionsByAssignment(req.params.assignmentId);
		return successResponse(res, {
			message: 'Submissions fetched successfully',
			data: submissions,
		});
	} catch (error) {
		return next(error);
	}
};

export const mySubmissionsController = async (req, res, next) => {
	try {
		const submissions = await getSubmissionsByUser(req.user._id);
		return successResponse(res, {
			message: 'Submissions fetched successfully',
			data: submissions,
		});
	} catch (error) {
		return next(error);
	}
};
export const getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ grade: null })
      .populate('userId', 'name email')
      .populate('assignmentId', 'title');

	return successResponse(res, {
		message: 'Pending submissions fetched successfully',
		data: submissions,
	});
  } catch (error) {
	return res.status(500).json({ message: error.message });
  }
};
