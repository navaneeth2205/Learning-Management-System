import User from './user.model.js';

import { createAppError } from '../../utils/constants.js';

export const getAllUsers = async () => User.find().select('-password').sort({ createdAt: -1 });

export const getUserById = async (userId) => {
	const user = await User.findById(userId).select('-password');
	if (!user) {
		throw createAppError('User not found', 404);
	}
	return user;
};

export const updateUserRole = async ({ userId, role }) => {
	const updated = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select(
		'-password'
	);

	if (!updated) {
		throw createAppError('User not found', 404);
	}

	return updated;
};
