import { useEffect, useRef, useState } from 'react';
import { HiPhoneMissedCall, HiMicrophone, HiVideoCamera, HiX, HiChevronDoubleRight, HiChevronDoubleLeft, HiArrowsExpand } from 'react-icons/hi';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AGORA_APP_ID } from '../../config/agora';
import { api } from '../../services/api';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const formatCallDurationLabel = (durationSeconds = 0) => {
    if (!durationSeconds || durationSeconds <= 0) return '0s';
    if (durationSeconds < 60) return `${durationSeconds}s`;

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
};

export default function CallModal({ channelName, isOpen, onClose, isVideo = true, calleeName = null, calleeId = null }) {
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    const remoteVideoRefs = useRef({});
    const tracksRef = useRef({ audio: null, video: null });
    const clientRef = useRef(null);
    const isJoiningRef = useRef(false);
    const joinedChannelRef = useRef(null);
    const effectRunIdRef = useRef(0);
    const callStartTimeRef = useRef(null);

    // Initialize Agora client once
    if (clientRef.current === null) {
        try {
            clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        } catch (err) {
            console.error('Failed to create Agora client:', err);
        }
    }

    const localVideoRef = useRef(null);
    const containerRef = useRef(null);
    const setLocalVideoRef = (el) => {
        localVideoRef.current = el;
        if (el && tracksRef.current.video) {
            tracksRef.current.video.play(el);
        }
    };

    useEffect(() => {
        if (localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
        }
    }, [localVideoTrack]);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        const runId = ++effectRunIdRef.current;
        const client = clientRef.current;

        const cleanupTracks = () => {
            if (tracksRef.current.audio) {
                tracksRef.current.audio.stop();
                tracksRef.current.audio.close();
                tracksRef.current.audio = null;
            }
            if (tracksRef.current.video) {
                tracksRef.current.video.stop();
                tracksRef.current.video.close();
                tracksRef.current.video = null;
            }
        };

        const leaveClient = async () => {
            if (client.connectionState !== 'DISCONNECTED') {
                try {
                    await client.leave();
                } catch (leaveError) {
                    console.error('Agora leave error:', leaveError);
                }
            }
            joinedChannelRef.current = null;
            isJoiningRef.current = false;
        };

        const init = async () => {
            if (isJoiningRef.current || client.connectionState !== 'DISCONNECTED') {
                return;
            }

            isJoiningRef.current = true;
            setIsConnecting(true);
            setConnectionError(null);

            client.removeAllListeners();

            client.on('user-published', async (user, mediaType) => {
                await client.subscribe(user, mediaType);
                if (mediaType === 'video') {
                    setRemoteUsers((prev) => {
                        if (prev.find((entry) => entry.uid === user.uid)) return prev;
                        return [...prev, user];
                    });
                }
                if (mediaType === 'audio') {
                    user.audioTrack.play();
                }
            });

            client.on('user-unpublished', (user) => {
                setRemoteUsers((prev) => prev.filter((entry) => entry.uid !== user.uid));
            });

            try {
                const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                if (!isMounted || effectRunIdRef.current !== runId) {
                    audioTrack.stop();
                    audioTrack.close();
                    isJoiningRef.current = false;
                    return;
                }

                tracksRef.current.audio = audioTrack;
                if (isMounted) setLocalAudioTrack(audioTrack);

                if (isVideo) {
                    const videoTrack = await AgoraRTC.createCameraVideoTrack();
                    if (!isMounted || effectRunIdRef.current !== runId) {
                        videoTrack.stop();
                        videoTrack.close();
                        cleanupTracks();
                        isJoiningRef.current = false;
                        return;
                    }

                    tracksRef.current.video = videoTrack;
                    if (isMounted) {
                        setLocalVideoTrack(videoTrack);
                        if (localVideoRef.current) {
                            videoTrack.play(localVideoRef.current);
                        }
                    }
                }
            } catch (mediaErr) {
                console.error('Media permission error:', mediaErr);
                cleanupTracks();
                if (isMounted) {
                    setConnectionError('Camera/Microphone permission denied.');
                    setIsConnecting(false);
                }
                isJoiningRef.current = false;
                return;
            }

            try {
                let token = null;
                let appId = AGORA_APP_ID;

                try {
                    const response = await api.post('/agora/token', {
                        channelName,
                        calleeName: calleeName || null,
                        calleeId: calleeId || null,
                    });
                    const data = response.data?.data;
                    if (data?.token) token = data.token;
                    if (data?.appId) appId = data.appId;
                } catch (tokenErr) {
                    console.error('Token fetch failed strictly:', tokenErr);
                    toast.error(`Backend Token Error: ${tokenErr?.response?.data?.message || tokenErr.message}`);
                }

                if (!isMounted || effectRunIdRef.current !== runId) {
                    cleanupTracks();
                    isJoiningRef.current = false;
                    return;
                }

                await client.join(appId, channelName, token, null);
                joinedChannelRef.current = channelName;

                if (isMounted && effectRunIdRef.current === runId) {
                    if (isVideo && tracksRef.current.video) {
                        await client.publish([tracksRef.current.audio, tracksRef.current.video]);
                    } else if (tracksRef.current.audio) {
                        await client.publish([tracksRef.current.audio]);
                    }
                    callStartTimeRef.current = Date.now();
                    setIsConnecting(false);
                    toast.success(isVideo ? 'Video call connected!' : 'Audio call connected!');
                }
                isJoiningRef.current = false;
            } catch (error) {
                console.error('Agora join error:', error);
                cleanupTracks();
                await leaveClient();
                if (isMounted) {
                    setIsConnecting(false);
                    setConnectionError(error.message || 'Failed to connect to the call');
                    toast.error(`Connection failed: ${error.message}`);
                }
                isJoiningRef.current = false;
            }
        };

        init();

        return () => {
            isMounted = false;
            cleanupTracks();
            setLocalAudioTrack(null);
            setLocalVideoTrack(null);
            setRemoteUsers([]);
            client.removeAllListeners();
            leaveClient();
        };
    }, [isOpen, channelName, isVideo, calleeId, calleeName]);

    useEffect(() => {
        remoteUsers.forEach((remoteUser) => {
            if (remoteUser.videoTrack && remoteVideoRefs.current[remoteUser.uid]) {
                remoteUser.videoTrack.play(remoteVideoRefs.current[remoteUser.uid]);
            }
        });
    }, [remoteUsers]);

    const handleEndCall = async () => {
        const client = clientRef.current;
        const durationSeconds = callStartTimeRef.current
            ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
            : 0;

        if (tracksRef.current.audio) {
            tracksRef.current.audio.stop();
            tracksRef.current.audio.close();
            tracksRef.current.audio = null;
        }
        if (tracksRef.current.video) {
            tracksRef.current.video.stop();
            tracksRef.current.video.close();
            tracksRef.current.video = null;
        }

        setLocalAudioTrack(null);
        setLocalVideoTrack(null);
        setRemoteUsers([]);
        isJoiningRef.current = false;
        joinedChannelRef.current = null;

        if (client && client.connectionState !== 'DISCONNECTED') {
            await client.leave();
        }

        callStartTimeRef.current = null;

        try {
            await api.post('/audit-logs/call-end', {
                channelName,
                calleeName: calleeName || null,
                calleeId: calleeId || null,
                durationSeconds,
                callType: isVideo ? 'video' : 'audio',
            });
        } catch (err) {
            console.warn('Failed to log call end:', err);
        }

        if (calleeId) {
            try {
                const callTypeLabel = isVideo ? 'Video' : 'Audio';
                const durationLabel = formatCallDurationLabel(durationSeconds);

                await api.post('/messages', {
                    receiverId: calleeId,
                    subject: `${callTypeLabel} call log`,
                    content: `${callTypeLabel} call ended. Talked for ${durationLabel}.`,
                });
            } catch (err) {
                console.warn('Failed to send call log message:', err);
            }
        }

        onClose();
    };

    const toggleMute = () => {
        if (localAudioTrack) {
            localAudioTrack.setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        // If currently in audio-only call, offer to convert to video
        if (!isVideo && !localVideoTrack) {
            convertToVideo();
            return;
        }

        if (localVideoTrack) {
            localVideoTrack.setEnabled(isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = async () => {
        const el = containerRef.current;
        if (!el) return;
        try {
            if (!isFullscreen) {
                if (el.requestFullscreen) await el.requestFullscreen();
                else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
                else if (el.msRequestFullscreen) await el.msRequestFullscreen();
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
                else if (document.msExitFullscreen) await document.msExitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error', err);
        }
    };

    const convertToVideo = async () => {
        setIsConnecting(true);
        try {
            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            tracksRef.current.video = videoTrack;
            setLocalVideoTrack(videoTrack);
            if (localVideoRef.current) videoTrack.play(localVideoRef.current);

            const client = clientRef.current;
            if (client && client.connectionState !== 'DISCONNECTED') {
                try {
                    await client.publish([tracksRef.current.audio, tracksRef.current.video]);
                    toast.success('Switched to video call');
                } catch (pubErr) {
                    console.error('Publish video error:', pubErr);
                    toast.error('Could not publish video track');
                }
            }
        } catch (err) {
            console.error('Camera permission or creation failed:', err);
            toast.error('Unable to access camera. Please allow camera permission.');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div ref={containerRef} className={clsx(
            'fixed z-[1000] transition-all duration-500 shadow-2xl overflow-hidden flex flex-col',
            isMinimized
                ? 'bottom-6 right-6 w-72 h-48 rounded-3xl'
                : 'inset-6 md:inset-12 rounded-[40px] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900'
        )}>
            <div className="absolute top-6 right-6 z-10 flex gap-2">
                <button
                    onClick={toggleFullscreen}
                    className="p-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl backdrop-blur-md transition-all"
                >
                    <HiArrowsExpand />
                </button>
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl backdrop-blur-md transition-all"
                >
                    {isMinimized ? <HiChevronDoubleLeft /> : <HiChevronDoubleRight />}
                </button>
                <button
                    onClick={handleEndCall}
                    className="p-3 bg-rose-500/80 hover:bg-rose-600 text-white rounded-2xl backdrop-blur-md transition-all"
                >
                    <HiX />
                </button>
            </div>

            <div className="flex-1 relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 flex items-center justify-center p-4">
                {isConnecting && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 z-30 bg-primary-950/90 backdrop-blur-sm">
                        <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-primary-200 font-black uppercase tracking-[0.3em] text-[10px]">Connecting...</p>
                    </div>
                )}

                {connectionError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 z-30 bg-primary-950/90 backdrop-blur-sm">
                        <HiPhoneMissedCall className="w-12 h-12 text-primary-300" />
                        <p className="text-primary-200 font-bold text-sm max-w-xs">{connectionError}</p>
                        <button
                            onClick={handleEndCall}
                            className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold text-xs hover:bg-primary-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Main stage: remote (first) fills, otherwise local waiting view */}
                <div className="relative w-full h-full max-h-[calc(100vh-160px)] overflow-hidden rounded-2xl">
                    {remoteUsers.length > 0 ? (
                        // show first remote as full stage
                        <div className="absolute inset-0">
                            <div ref={(el) => { const u = remoteUsers[0]; if (u && el) remoteVideoRefs.current[u.uid] = el; }} className="w-full h-full object-cover absolute inset-0" />
                            <div className="absolute bottom-4 left-4 px-3 py-1 bg-primary-900/60 backdrop-blur-md rounded-full text-[12px] text-white font-semibold">
                                {remoteUsers[0]?.name || `Peer ${remoteUsers[0]?.uid}`}
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                            <div className="w-full h-full" ref={setLocalVideoRef} />
                            <div className="absolute text-center">
                                <div className="w-28 h-28 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HiPhoneMissedCall className="w-10 h-10 text-primary-300" />
                                </div>
                                <p className="text-white font-semibold uppercase tracking-widest text-sm">Waiting for others to join...</p>
                                <p className="text-primary-200 text-xs mt-1">Channel: {channelName}</p>
                            </div>
                        </div>
                    )}

                    {/* Local preview when remote exists */}
                    {remoteUsers.length > 0 && (
                        <div className="absolute bottom-6 right-6 w-40 h-28 rounded-2xl overflow-hidden border-2 border-primary-400/40 shadow-card-lg bg-primary-950 z-30">
                            <div ref={setLocalVideoRef} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary-900/60 backdrop-blur-md rounded-full text-[11px] text-white font-semibold">You</div>
                        </div>
                    )}
                </div>
            </div>

            {!isMinimized && (
                <div className="p-6 flex justify-center items-center gap-6 bg-gradient-to-t from-primary-950/80 to-transparent border-t border-primary-700/30">
                    <button
                        onClick={toggleMute}
                        className={clsx(
                            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                            isMuted ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/40' : 'bg-white/15 text-white hover:bg-white/25'
                        )}
                    >
                        <HiMicrophone className={clsx('w-6 h-6', isMuted && 'opacity-50')} />
                    </button>

                    <button
                        onClick={handleEndCall}
                        className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-rose-500/50"
                    >
                        <HiPhoneMissedCall className="w-8 h-8 rotate-[135deg]" />
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={clsx(
                            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                            (isVideoOff || (!isVideo && localVideoTrack)) ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/40' : 'bg-white/15 text-white hover:bg-white/25'
                        )}
                    >
                        <HiVideoCamera className={clsx('w-6 h-6', (isVideoOff || (!isVideo && localVideoTrack)) && 'opacity-60')} />
                        {!isVideo && !localVideoTrack && (
                            <span className="absolute -bottom-5 text-[10px] text-primary-300">Convert to Video</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
