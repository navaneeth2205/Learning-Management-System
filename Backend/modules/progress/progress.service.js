import Course from '../course/course.model.js';
import Progress from './progress.model.js';

import { createAppError } from '../../utils/constants.js';

export const upsertProgress = async ({ userId, courseId, completionPercentage }) => {
	const course = await Course.findById(courseId);
	if (!course) {
		throw createAppError('Course not found', 404);
	}

	return Progress.findOneAndUpdate(
		{ userId, courseId },
		{ completionPercentage },
		{
			upsert: true,
			new: true,
			runValidators: true,
			setDefaultsOnInsert: true,
		}
	);
};

export const getProgressByUser = async (userId) => Progress.find({ userId }).populate('courseId', 'title description');
