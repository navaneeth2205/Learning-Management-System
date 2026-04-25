import AgoraToken from 'agora-access-token';

import { successResponse } from '../../utils/responseHandler.js';
import { createAppError } from '../../utils/constants.js';
import { env } from '../../config/env.js';

const { RtcRole, RtcTokenBuilder } = AgoraToken;

export const generateAgoraTokenController = async (req, res, next) => {
	try {
		const effectiveAppId = String(env.agoraAppId || '').trim();

		if (!effectiveAppId) {
			throw createAppError('Agora App ID is not configured on the server', 500);
		}

		if (!env.agoraAppCertificate) {
			throw createAppError('Agora App Certificate is not configured on the server', 500);
		}

		const channelName = String(req.body.channelName || '').trim();
		if (!channelName) {
			throw createAppError('channelName is required', 400);
		}

		// Use 0 for uid to allow any user to join (Agora supports uid=0 for auto-assign)
		const uid = 0;

		const expireSeconds = Number(req.body.expireSeconds) || env.agoraTokenExpireSeconds || 3600;
		const currentTimestamp = Math.floor(Date.now() / 1000);
		const privilegeExpiredTs = currentTimestamp + expireSeconds;

		const role = RtcRole.PUBLISHER;
		const token = RtcTokenBuilder.buildTokenWithUid(
			effectiveAppId,
			env.agoraAppCertificate,
			channelName,
			uid,
			role,
			privilegeExpiredTs
		);

		return successResponse(res, {
			message: 'Agora token generated successfully',
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