import AgoraRTC from 'agora-rtc-sdk-ng';
import { AGORA_APP_ID } from '../config/agora';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export const useAgora = () => {
    const joinChannel = async (channelName, token = null, uid = null) => {
        await client.join(AGORA_APP_ID, channelName, token, uid);
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        await client.publish([audioTrack, videoTrack]);
        return { audioTrack, videoTrack, uid: client.uid };
    };

    const leaveChannel = async (tracks) => {
        if (tracks) {
            tracks.forEach(track => {
                track.stop();
                track.close();
            });
        }
        await client.leave();
    };

    return { client, joinChannel, leaveChannel };
};
