import User from './user.model.js';

import { createAppError } from '../../utils/constants.js';
import { logEvent } from '../auditLog/auditLog.service.js';

export const getAllUsers = async (filters = {}) => {
	const query = {};

	if (filters.role) {
		query.role = filters.role;
	}

	if (filters.search) {
		query.$or = [
			{ name: { $regex: filters.search, $options: 'i' } },
			{ email: { $regex: filters.search, $options: 'i' } },
		];
	}

	return User.find(query).select('-password').sort({ createdAt: -1 });
};

export const getUserById = async (userId) => {
	const user = await User.findById(userId).select('-password');
	if (!user) {
		throw createAppError('User not found', 404);
	}
	return user;
};

export const updateUserRole = async ({ userId, role, actorName = 'admin' }) => {
	const updated = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select(
		'-password'
	);

	if (!updated) {
		throw createAppError('User not found', 404);
	}

	await logEvent({
		type: 'security',
		event: `User role changed — "${updated.name}" is now ${role}`,
		user: actorName,
		userId: updated._id,
		severity: 'high',
		meta: { targetUserId: userId, newRole: role },
	});

	return updated;
};
