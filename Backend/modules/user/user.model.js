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
			required: false,
			select: false,
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true,
			trim: true,
		},
		isEmailVerified: {
			type: Boolean,
			default: true,
		},
		otpCodeHash: {
			type: String,
			select: false,
		},
		otpExpiresAt: {
			type: Date,
			select: false,
		},
		resetPasswordTokenHash: {
			type: String,
			select: false,
		},
		resetPasswordExpiresAt: {
			type: Date,
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
