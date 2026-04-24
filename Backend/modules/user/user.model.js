import mongoose from 'mongoose';

import { ROLES } from '../../utils/constants.js';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		role: {
			type: String,
			enum: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.LEARNER],
			required: true,
			default: ROLES.LEARNER,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		versionKey: false,
	}
);

const User = mongoose.model('User', userSchema);

export default User;
