import { successResponse } from '../../utils/responseHandler.js';

import { loginUser, registerUser } from './auth.service.js';

export const register = async (req, res, next) => {
	try {
		const data = await registerUser(req.body);
		return successResponse(res, {
			statusCode: 201,
			message: 'User registered successfully',
			data,
		});
	} catch (error) {
		return next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const data = await loginUser(req.body);
		return successResponse(res, {
			statusCode: 200,
			message: 'Login successful',
			data,
		});
	} catch (error) {
		return next(error);
	}
};
