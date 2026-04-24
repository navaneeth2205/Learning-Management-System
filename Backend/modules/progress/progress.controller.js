import { successResponse } from '../../utils/responseHandler.js';

import { getProgressByUser, upsertProgress } from './progress.service.js';

export const updateProgressController = async (req, res, next) => {
	try {
		const progress = await upsertProgress({
			userId: req.user._id,
			courseId: req.body.courseId,
			completionPercentage: req.body.completionPercentage,
		});

		return successResponse(res, {
			message: 'Progress updated successfully',
			data: progress,
		});
	} catch (error) {
		return next(error);
	}
};

export const getMyProgressController = async (req, res, next) => {
	try {
		const progress = await getProgressByUser(req.user._id);
		return successResponse(res, {
			message: 'Progress fetched successfully',
			data: progress,
		});
	} catch (error) {
		return next(error);
	}
};
