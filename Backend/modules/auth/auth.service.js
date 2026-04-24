import User from './auth.model.js';

import { comparePassword, hashPassword } from '../../utils/hashPassword.js';
import generateToken from '../../utils/generateToken.js';
import { ROLES, createAppError } from '../../utils/constants.js';

const allowedRegisterRoles = [ROLES.INSTRUCTOR, ROLES.LEARNER];

export const registerUser = async ({ name, email, password, role }) => {
	if (!allowedRegisterRoles.includes(role)) {
		throw createAppError('Role must be either instructor or learner', 400);
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw createAppError('User already exists with this email', 409);
	}

	const hashedPassword = await hashPassword(password);

	const user = await User.create({
		name,
		email,
		password: hashedPassword,
		role,
	});

	const token = generateToken({ userId: user._id, role: user.role });

	return {
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
		},
	};
};

export const loginUser = async ({ email, password }) => {
	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		throw createAppError('Invalid email or password', 401);
	}

	const isPasswordValid = await comparePassword(password, user.password);
	if (!isPasswordValid) {
		throw createAppError('Invalid email or password', 401);
	}

	const token = generateToken({ userId: user._id, role: user.role });

	return {
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
		},
	};
};
