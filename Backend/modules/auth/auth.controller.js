import { successResponse } from '../../utils/responseHandler.js';

import {
	forgotPassword,
	loginUser,
	loginWithGoogle,
	registerAdmin,
	registerUser,
	resendRegistrationOtp,
	resetPassword,
	verifyRegistrationOtp,
} from './auth.service.js';

export const register = async (req, res, next) => {
	try {
		const data = await registerUser({ ...req.body, _ip: req.ip || 'unknown' });
		return successResponse(res, {
			statusCode: 201,
			message: 'User registered successfully',
			data,
		});
	} catch (error) {
		return next(error);
	}
};

export const registerAdminController = async (req, res, next) => {
	try {
		const data = await registerAdmin(req.body);
		return successResponse(res, {
			statusCode: 201,
			message: 'Admin registered successfully',
			data,
		});
	} catch (error) {
		return next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const data = await loginUser({ ...req.body, _ip: req.ip || 'unknown' });
		return successResponse(res, {
			statusCode: 200,
			message: 'Login successful',
			data,
		});
	} catch (error) {
		return next(error);
	}
};

export const verifyOtp = async (req, res, next) => {
	try {
		const data = await verifyRegistrationOtp(req.body);
		return successResponse(res, {
			statusCode: 200,
			message: 'OTP verified successfully',
			data,
		});
	} catch (error) {
		return next(error);
	}
};

export const resendOtp = async (req, res, next) => {
	try {
		const data = await resendRegistrationOtp(req.body);
		return successResponse(res, {
			statusCode: 200,
			message: 'OTP sent successfully',
			data,
		});
	} catch (error) {
		return next(error);
	}
};

export const googleLogin = async (req, res, next) => {
	try {
		const data = await loginWithGoogle(req.body);
		return successResponse(res, {
			statusCode: 200,
			message: 'Google sign-in successful',
			data,
		});
	} catch (error) {
		return next(error);
	}
};

export const requestPasswordReset = async (req, res, next) => {
	try {
		const data = await forgotPassword(req.body);
		return successResponse(res, {
			statusCode: 200,
			message: 'Password reset OTP sent if the account exists',
			data,
		});
	} catch (error) {
		return next(error);
	}
};

export const confirmPasswordReset = async (req, res, next) => {
	try {
		const data = await resetPassword(req.body);
		return successResponse(res, {
			statusCode: 200,
			message: 'Password reset successful',
			data,
		});
	} catch (error) {
		return next(error);
	}
};
