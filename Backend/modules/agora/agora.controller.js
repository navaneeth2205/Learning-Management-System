import AgoraToken from 'agora-access-token';

import { successResponse } from '../../utils/responseHandler.js';
import { createAppError } from '../../utils/constants.js';
import { env } from '../../config/env.js';

const { RtcRole, RtcTokenBuilder } = AgoraToken;

export const generateAgoraTokenController = async (req, res, next) => {
	try {
		const effectiveAppId = String(req.body.appId || env.agoraAppId || '').trim();

		if (!effectiveAppId) {
			throw createAppError('Agora server configuration is missing', 500);
		}

		const channelName = String(req.body.channelName || '').trim();
		if (!channelName) {
			throw createAppError('channelName is required', 400);
		}

		const uid = String(req.body.uid || req.user?._id || '').trim();
		if (!uid) {
			throw createAppError('uid is required', 400);
		}

		const expireSeconds = Number(req.body.expireSeconds) || env.agoraTokenExpireSeconds;
		let token = null;
		let privilegeExpiredTs = null;

		if (env.agoraAppCertificate) {
			privilegeExpiredTs = Math.floor(Date.now() / 1000) + expireSeconds;
			const role = RtcRole.PUBLISHER;
			token = RtcTokenBuilder.buildTokenWithUid(
				effectiveAppId,
				env.agoraAppCertificate,
				channelName,
				uid,
				role,
				privilegeExpiredTs
			);
		}

		return successResponse(res, {
			message: token ? 'Agora token generated successfully' : 'Agora token not required for this configuration',
			data: {
				token,
				appId: effectiveAppId,
				channelName,
				uid,
				expiresAt: privilegeExpiredTs,
			},
		});
	} catch (error) {
		return next(error);
	}
};