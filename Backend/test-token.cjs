const AgoraToken = require('agora-access-token');
const { RtcRole, RtcTokenBuilder } = AgoraToken;

const appId = 'b7de769da3f841ad90e47a36973a88ca';
const appCert = '6e5b6bc96ab84045ba1d2166bd38eab7';
const channelName = 'test';
const uid = 0;
const role = RtcRole.PUBLISHER;
const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;

try {
    const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCert,
        channelName,
        uid,
        role,
        privilegeExpiredTs
    );
    console.log('Token generated successfully:', token);
} catch (e) {
    console.error('Error:', e);
}
