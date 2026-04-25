import crypto from 'crypto';

import Certificate from './certificate.model.js';
import Progress from '../progress/progress.model.js';
import Enrollment from '../enrollment/enrollment.model.js';
import Course from '../course/course.model.js';

import { createAppError } from '../../utils/constants.js';

const generateCertificateNumber = () => {
	const prefix = 'LMS';
	const year = new Date().getFullYear();
	const random = crypto.randomBytes(4).toString('hex').toUpperCase();
	return `${prefix}-${year}-${random}`;
};

export const issueCertificate = async ({ userId, courseId }) => {
	const enrollment = await Enrollment.findOne({ userId, courseId });
	if (!enrollment) {
		throw createAppError('User is not enrolled in this course', 400);
	}

	const progress = await Progress.findOne({ userId, courseId });
	if (!progress || progress.completionPercentage < 100) {
		throw createAppError('Course not fully completed yet', 400);
	}

	const existingCert = await Certificate.findOne({ userId, courseId });
	if (existingCert) {
		return existingCert;
	}

	return Certificate.create({
		userId,
		courseId,
		certificateNumber: generateCertificateNumber(),
		grade: 'Pass',
	});
};

export const getCertificatesByUser = async (userId) =>
	Certificate.find({ userId })
		.populate('courseId', 'title category thumbnail instructorId')
		.populate({
			path: 'courseId',
			populate: { path: 'instructorId', select: 'name email' },
		})
		.sort({ issuedAt: -1 });

export const getCertificateById = async (certId) => {
	const cert = await Certificate.findById(certId)
		.populate('userId', 'name email')
		.populate('courseId', 'title category thumbnail instructorId')
		.populate({
			path: 'courseId',
			populate: { path: 'instructorId', select: 'name email' },
		});

	if (!cert) {
		throw createAppError('Certificate not found', 404);
	}
	return cert;
};

export const verifyCertificate = async (certificateNumber) => {
	const cert = await Certificate.findOne({ certificateNumber })
		.populate('userId', 'name email')
		.populate('courseId', 'title category');

	if (!cert) {
		throw createAppError('Certificate not found', 404);
	}
	return cert;
};
