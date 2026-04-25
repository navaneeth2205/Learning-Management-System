import { successResponse } from '../../utils/responseHandler.js';

import {
	createDiscussion,
	getDiscussions,
	getDiscussionById,
	addReply,
	toggleLike,
	deleteDiscussion,
} from './community.service.js';

export const createDiscussionController = async (req, res, next) => {
	try {
		const discussion = await createDiscussion({
			userId: req.user._id,
			courseId: req.body.courseId || null,
			title: req.body.title,
			content: req.body.content,
			category: req.body.category,
			tags: req.body.tags,
		});
		return successResponse(res, {
			statusCode: 201,
			message: 'Discussion created successfully',
			data: discussion,
		});
	} catch (error) {
		return next(error);
	}
};

export const listDiscussionsController = async (req, res, next) => {
	try {
		const { courseId, category, search } = req.query;
		const discussions = await getDiscussions({ courseId, category, search });
		return successResponse(res, {
			message: 'Discussions fetched successfully',
			data: discussions,
		});
	} catch (error) {
		return next(error);
	}
};

export const getDiscussionController = async (req, res, next) => {
	try {
		const discussion = await getDiscussionById(req.params.discussionId);
		return successResponse(res, {
			message: 'Discussion fetched successfully',
			data: discussion,
		});
	} catch (error) {
		return next(error);
	}
};

export const addReplyController = async (req, res, next) => {
	try {
		const discussion = await addReply({
			discussionId: req.params.discussionId,
			userId: req.user._id,
			content: req.body.content,
		});
		return successResponse(res, {
			statusCode: 201,
			message: 'Reply added successfully',
			data: discussion,
		});
	} catch (error) {
		return next(error);
	}
};

export const toggleLikeController = async (req, res, next) => {
	try {
		const result = await toggleLike({
			discussionId: req.params.discussionId,
			userId: req.user._id,
		});
		return successResponse(res, {
			message: result.liked ? 'Discussion liked' : 'Discussion unliked',
			data: result,
		});
	} catch (error) {
		return next(error);
	}
};

export const deleteDiscussionController = async (req, res, next) => {
	try {
		await deleteDiscussion(req.params.discussionId, req.user._id);
		return successResponse(res, {
			message: 'Discussion deleted successfully',
		});
	} catch (error) {
		return next(error);
	}
};
