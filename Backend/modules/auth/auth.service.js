import crypto from 'crypto';

import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';

import User from './auth.model.js';

import { env } from '../../config/env.js';
import { ROLES, createAppError } from '../../utils/constants.js';
import generateToken from '../../utils/generateToken.js';
import { comparePassword, hashPassword } from '../../utils/hashPassword.js';
import { logEvent } from '../auditLog/auditLog.service.js';

const allowedRegisterRoles = [ROLES.INSTRUCTOR, ROLES.LEARNER];
const otpExpiryMinutes = 10;

const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const buildAuthPayload = (user) => {
	const token = generateToken({ userId: user._id, role: user.role });

	return {
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar || '',
			bio: user.bio || '',
			focus: user.focus || '',
			timezone: user.timezone || '',
			role: user.role,
			createdAt: user.createdAt,
		},
	};
};

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const createOtpFields = (otp) => ({
	otpCodeHash: hashOtp(otp),
	otpExpiresAt: new Date(Date.now() + otpExpiryMinutes * 60 * 1000),
});

const getMailerTransporter = () => {
	if (!env.emailHost || !env.emailHostUser || !env.emailHostPassword) {
		throw createAppError('Email service is not configured on the server', 500);
	}

	return nodemailer.createTransport({
		host: env.emailHost,
		port: env.emailPort,
		secure: false,
		requireTLS: env.emailUseTls,
		tls: {
			rejectUnauthorized: !env.emailAllowSelfSigned,
		},
		auth: {
			user: env.emailHostUser,
			pass: env.emailHostPassword,
		},
	});
};

const sendRegistrationOtpEmail = async ({ email, name, otp }) => {
	const transporter = getMailerTransporter();

	await transporter.sendMail({
		from: env.defaultFromEmail,
		to: email,
		subject: 'EduVerse verification code',
		text: `Hello ${name}, your EduVerse verification code is ${otp}. It will expire in ${otpExpiryMinutes} minutes.`,
		html: `
			<div style="font-family: Arial, sans-serif; line-height:1.5; color:#111827;">
				<h2 style="margin-bottom:8px;">Verify your EduVerse account</h2>
				<p>Hello ${name},</p>
				<p>Your verification code is:</p>
				<div style="font-size:28px; font-weight:700; letter-spacing:6px; margin:16px 0; color:#4f46e5;">${otp}</div>
				<p>This code expires in ${otpExpiryMinutes} minutes.</p>
			</div>
		`,
	});
};

const sendResetPasswordEmail = async ({ email, name, otp }) => {
	const transporter = getMailerTransporter();

	await transporter.sendMail({
		from: env.defaultFromEmail,
		to: email,
		subject: 'EduVerse password reset OTP',
		text: `Hello ${name}, your EduVerse password reset OTP is ${otp}. It will expire in ${env.resetPasswordExpiresMinutes} minutes.`,
		html: `
			<div style="font-family: Arial, sans-serif; line-height:1.5; color:#111827;">
				<h2 style="margin-bottom:8px;">Reset your EduVerse password</h2>
				<p>Hello ${name},</p>
				<p>Your password reset OTP is:</p>
				<div style="font-size:28px; font-weight:700; letter-spacing:6px; margin:16px 0; color:#4f46e5;">${otp}</div>
				<p>This code expires in ${env.resetPasswordExpiresMinutes} minutes.</p>
				<p>If you did not request this, you can ignore this email.</p>
			</div>
		`,
	});
};

export const registerAdmin = async ({ name, email, password, adminToken }) => {
	// Validate admin registration token from environment
	if (!env.adminRegistrationToken) {
		throw createAppError('Admin registration is not enabled on this server', 503);
	}

	if (adminToken !== env.adminRegistrationToken) {
		throw createAppError('Invalid or missing admin registration token', 401);
	}

	const normalizedEmail = normalizeEmail(email);
	const existingUser = await User.findOne({ email: normalizedEmail }).select('+password');

	if (existingUser && existingUser.isEmailVerified) {
		throw createAppError('User already exists with this email', 409);
	}

	if (existingUser && existingUser.googleId && !existingUser.password) {
		throw createAppError('This email is already registered with Google sign-in', 409);
	}

	const hashedPassword = await hashPassword(password);

	let user;
	if (existingUser) {
		existingUser.name = name;
		existingUser.email = normalizedEmail;
		existingUser.password = hashedPassword;
		existingUser.role = ROLES.ADMIN;
		existingUser.isEmailVerified = true; // Admin doesn't need OTP
		user = await existingUser.save();
	} else {
		user = await User.create({
			name,
			email: normalizedEmail,
			password: hashedPassword,
			role: ROLES.ADMIN,
			isEmailVerified: true, // Admin doesn't need OTP
		});
	}

	return buildAuthPayload(user);
};

export const registerUser = async ({ name, email, password, role, _ip = 'unknown' }) => {
	if (!allowedRegisterRoles.includes(role)) {
		throw createAppError('Role must be either instructor or learner', 400);
	}

	const normalizedEmail = normalizeEmail(email);
	const existingUser = await User.findOne({ email: normalizedEmail }).select('+password +otpCodeHash +otpExpiresAt');

	const otp = generateOtp();
	const otpFields = createOtpFields(otp);
	const hashedPassword = await hashPassword(password);

	if (existingUser && existingUser.isEmailVerified) {
		throw createAppError('User already exists with this email', 409);
	}

	if (existingUser && existingUser.googleId && !existingUser.password) {
		throw createAppError('This email is already registered with Google sign-in', 409);
	}

	let user;
	if (existingUser) {
		existingUser.name = name;
		existingUser.password = hashedPassword;
		existingUser.role = role;
		existingUser.isEmailVerified = false;
		existingUser.otpCodeHash = otpFields.otpCodeHash;
		existingUser.otpExpiresAt = otpFields.otpExpiresAt;
		user = await existingUser.save();
	} else {
		user = await User.create({
			name,
			email: normalizedEmail,
			password: hashedPassword,
			role,
			isEmailVerified: false,
			...otpFields,
		});
	}

	await sendRegistrationOtpEmail({ email: user.email, name: user.name, otp });

	await logEvent({
		type: 'auth',
		event: `New ${role} account registered`,
		user: name,
		userId: user._id,
		ip: _ip,
		severity: 'low',
	});

	return {
		email: user.email,
		requiresOtp: true,
		otpExpiresInMinutes: otpExpiryMinutes,
	};
};

export const verifyRegistrationOtp = async ({ email, otp }) => {
	const normalizedEmail = normalizeEmail(email);
	const user = await User.findOne({ email: normalizedEmail }).select('+otpCodeHash +otpExpiresAt');

	if (!user) {
		throw createAppError('User not found for this email', 404);
	}

	if (user.isEmailVerified) {
		return buildAuthPayload(user);
	}

	if (!user.otpCodeHash || !user.otpExpiresAt) {
		throw createAppError('No active OTP found. Please request a new code', 400);
	}

	if (user.otpExpiresAt.getTime() < Date.now()) {
		throw createAppError('OTP has expired. Please request a new code', 410);
	}

	if (hashOtp(String(otp)) !== user.otpCodeHash) {
		throw createAppError('Invalid OTP code', 400);
	}

	user.isEmailVerified = true;
	user.otpCodeHash = undefined;
	user.otpExpiresAt = undefined;
	await user.save();

	return buildAuthPayload(user);
};

export const resendRegistrationOtp = async ({ email }) => {
	const normalizedEmail = normalizeEmail(email);
	const user = await User.findOne({ email: normalizedEmail }).select('+otpCodeHash +otpExpiresAt');

	if (!user) {
		throw createAppError('User not found for this email', 404);
	}

	if (user.isEmailVerified) {
		throw createAppError('Email is already verified. Please login', 400);
	}

	const otp = generateOtp();
	const otpFields = createOtpFields(otp);

	user.otpCodeHash = otpFields.otpCodeHash;
	user.otpExpiresAt = otpFields.otpExpiresAt;
	await user.save();

	await sendRegistrationOtpEmail({ email: user.email, name: user.name, otp });

	return {
		email: user.email,
		requiresOtp: true,
		otpExpiresInMinutes: otpExpiryMinutes,
	};
};

export const loginUser = async ({ email, password, _ip = 'unknown' }) => {
	const normalizedEmail = normalizeEmail(email);
	const user = await User.findOne({ email: normalizedEmail }).select('+password');

	if (!user || !user.password) {
		await logEvent({
			type: 'auth',
			event: 'Failed login attempt — user not found',
			user: normalizedEmail,
			ip: _ip,
			severity: 'medium',
		});
		throw createAppError('Invalid email or password', 401);
	}

	if (user.isEmailVerified === false) {
		await logEvent({
			type: 'auth',
			event: 'Login blocked — email not verified',
			user: user.name,
			userId: user._id,
			ip: _ip,
			severity: 'low',
		});
		throw createAppError('Please verify your email with OTP before login', 403);
	}

	const isPasswordValid = await comparePassword(password, user.password);
	if (!isPasswordValid) {
		await logEvent({
			type: 'auth',
			event: 'Failed login attempt — wrong password',
			user: user.name,
			userId: user._id,
			ip: _ip,
			severity: 'medium',
		});
		throw createAppError('Invalid email or password', 401);
	}

	await logEvent({
		type: 'auth',
		event: `User logged in successfully`,
		user: user.name,
		userId: user._id,
		ip: _ip,
		severity: 'low',
	});

	return buildAuthPayload(user);
};

export const loginWithGoogle = async ({ idToken, role }) => {
	if (!env.googleClientId || !googleClient) {
		throw createAppError('Google login is not configured on the server', 500);
	}

	let verifiedTicket;
	try {
		verifiedTicket = await googleClient.verifyIdToken({
			idToken,
			audience: env.googleClientId,
		});
	} catch {
		throw createAppError('Invalid Google token', 401);
	}

	const payload = verifiedTicket.getPayload();
	if (!payload?.email || !payload?.sub) {
		throw createAppError('Invalid Google token payload', 401);
	}

	if (!payload.email_verified) {
		throw createAppError('Google account email is not verified', 401);
	}

	const normalizedEmail = normalizeEmail(payload.email);
	const requestedRole = allowedRegisterRoles.includes(role) ? role : ROLES.LEARNER;
	let user = await User.findOne({ email: normalizedEmail });

	if (!user) {
		user = await User.create({
			name: payload.name || 'Google User',
			email: normalizedEmail,
			role: requestedRole,
			googleId: payload.sub,
			isEmailVerified: true,
		});
		await logEvent({
			type: 'auth',
			event: `New ${requestedRole} registered via Google Sign-In`,
			user: user.name,
			userId: user._id,
			severity: 'low',
		});
		return buildAuthPayload(user);
	}

	if (user.googleId && user.googleId !== payload.sub) {
		throw createAppError('Google account mismatch for this email', 409);
	}

	if (!user.googleId) {
		user.googleId = payload.sub;
	}

	if (user.isEmailVerified === false) {
		user.isEmailVerified = true;
	}

	await user.save();

	await logEvent({
		type: 'auth',
		event: `User logged in via Google Sign-In`,
		user: user.name,
		userId: user._id,
		severity: 'low',
	});

	return buildAuthPayload(user);
};

export const forgotPassword = async ({ email }) => {
	const normalizedEmail = normalizeEmail(email);
	const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');

	if (!user) {
		return { email: normalizedEmail, sent: true };
	}

	const otp = generateOtp();
	const resetTokenHash = hashOtp(otp);

	user.resetPasswordTokenHash = resetTokenHash;
	user.resetPasswordExpiresAt = new Date(Date.now() + env.resetPasswordExpiresMinutes * 60 * 1000);
	await user.save();

	await sendResetPasswordEmail({
		email: user.email,
		name: user.name,
		otp,
	});

	return {
		email: user.email,
		sent: true,
		requiresOtp: true,
		otpExpiresInMinutes: env.resetPasswordExpiresMinutes,
	};
};

export const resetPassword = async ({ email, otp, password }) => {
	const normalizedEmail = normalizeEmail(email);
	const tokenHash = hashOtp(String(otp));
	const user = await User.findOne({
		email: normalizedEmail,
		resetPasswordTokenHash: tokenHash,
		resetPasswordExpiresAt: { $gt: new Date() },
	}).select('+password +resetPasswordTokenHash +resetPasswordExpiresAt');

	if (!user) {
		throw createAppError('Password reset OTP is invalid or expired', 400);
	}

	user.password = await hashPassword(password);
	user.resetPasswordTokenHash = undefined;
	user.resetPasswordExpiresAt = undefined;
	user.isEmailVerified = true;
	await user.save();

	await logEvent({
		type: 'security',
		event: 'Password reset completed',
		user: user.name,
		userId: user._id,
		severity: 'medium',
	});

	return buildAuthPayload(user);
};
