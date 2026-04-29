import { successResponse } from '../../utils/responseHandler.js';

import { getAllUsers, getUserById, updateUserRole } from './user.service.js';

export const listUsers = async (req, res, next) => {
	try {
		const users = await getAllUsers({
			role: req.query.role,
			search: req.query.search,
		});
		return successResponse(res, {
			message: 'Users fetched successfully',
			data: users,
		});
	} catch (error) {
		return next(error);
	}
};

export const getUser = async (req, res, next) => {
	try {
		const user = await getUserById(req.params.userId);
		return successResponse(res, {
			message: 'User fetched successfully',
			data: user,
		});
	} catch (error) {
		return next(error);
	}
};

export const changeUserRole = async (req, res, next) => {
	try {
		const updatedUser = await updateUserRole({
			userId: req.params.userId,
			role: req.body.role,
			actorName: req.user?.name || 'admin',
		});
		return successResponse(res, {
			message: 'User role updated successfully',
			data: updatedUser,
		});
	} catch (error) {
		return next(error);
	}
};
