import express from 'express';

import { confirmPasswordReset, googleLogin, login, register, requestPasswordReset, resendOtp, verifyOtp } from './auth.controller.js';
import {
	forgotPasswordValidation,
	googleLoginValidation,
	loginValidation,
	registerValidation,
	resetPasswordValidation,
	resendOtpValidation,
	validateRequest,
	verifyOtpValidation,
} from './auth.validation.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Auth API is active',
		endpoints: {
			register: 'POST /api/auth/register',
			verifyOtp: 'POST /api/auth/verify-otp',
			resendOtp: 'POST /api/auth/resend-otp',
			login: 'POST /api/auth/login',
			google: 'POST /api/auth/google',
			forgotPassword: 'POST /api/auth/forgot-password',
			resetPassword: 'POST /api/auth/reset-password',
		},
	});
});

router.get('/register', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Use POST /api/register or POST /api/auth/register to register',
	});
});

router.get('/login', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Use POST /api/login or POST /api/auth/login to authenticate',
	});
});

router.post('/register', registerValidation, validateRequest, register);
router.post('/verify-otp', verifyOtpValidation, validateRequest, verifyOtp);
router.post('/resend-otp', resendOtpValidation, validateRequest, resendOtp);
router.post('/login', loginValidation, validateRequest, login);
router.post('/google', googleLoginValidation, validateRequest, googleLogin);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, validateRequest, confirmPasswordReset);

export default router;
