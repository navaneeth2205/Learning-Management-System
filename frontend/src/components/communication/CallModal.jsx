import { useEffect, useRef, useState } from 'react';
import { HiPhoneMissedCall, HiMicrophone, HiVideoCamera, HiX, HiChevronDoubleRight, HiChevronDoubleLeft } from 'react-icons/hi';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AGORA_APP_ID } from '../../config/agora';
import { api } from '../../services/api';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export default function CallModal({ channelName, isOpen, onClose, isVideo = true }) {
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    
    const remoteVideoRefs = useRef({});
    // Keep refs to tracks so we can synchronously clean them up on unmount
    const tracksRef = useRef({ audio: null, video: null });

    // Use a callback ref for the local video
    const localVideoRef = useRef(null);
    const setLocalVideoRef = (el) => {
        localVideoRef.current = el;
        if (el && tracksRef.current.video) {
            tracksRef.current.video.play(el);
        }
    };

    // We MUST use an effect to play the track when it becomes available,
    // because the track is created async AFTER the DOM element mounts.
    useEffect(() => {
        if (localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
        }
    }, [localVideoTrack]);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;

        const init = async () => {
            setIsConnecting(true);
            setConnectionError(null);

            client.on('user-published', async (user, mediaType) => {
                await client.subscribe(user, mediaType);
                if (mediaType === 'video') {
                    setRemoteUsers(prev => {
                        if (prev.find(u => u.uid === user.uid)) return prev;
                        return [...prev, user];
                    });
                }
                if (mediaType === 'audio') {
                    user.audioTrack.play();
                }
            });

            client.on('user-unpublished', (user) => {
                setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
            });

            try {
                // Step 1: Request permissions and create local tracks FIRST
                const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                tracksRef.current.audio = audioTrack;
                if (isMounted) setLocalAudioTrack(audioTrack);
                
                if (isVideo) {
                    const videoTrack = await AgoraRTC.createCameraVideoTrack();
                    tracksRef.current.video = videoTrack;
                    if (isMounted) {
                        setLocalVideoTrack(videoTrack);
                        // If the ref is already attached to DOM, play it
                        if (localVideoRef.current) {
                            videoTrack.play(localVideoRef.current);
                        }
                    }
                }
            } catch (mediaErr) {
                console.error('Media permission error:', mediaErr);
                if (isMounted) {
                    setConnectionError('Camera/Microphone permission denied.');
                    setIsConnecting(false);
                }
                return;
            }

            try {
                // Step 2: Fetch a token from the backend
                let token = null;
                let appId = AGORA_APP_ID;

                try {
                    const response = await api.post('/agora/token', { channelName });
                    const data = response.data?.data;
                    if (data?.token) token = data.token;
                    if (data?.appId) appId = data.appId;
                } catch (tokenErr) {
                    console.error('Token fetch failed strictly:', tokenErr);
                    toast.error(`Backend Token Error: ${tokenErr?.response?.data?.message || tokenErr.message}`);
                }

                // Step 3: Join the channel
                await client.join(appId, channelName, token, null);

                // Step 4: Publish tracks
                if (isMounted) {
                    if (isVideo && tracksRef.current.video) {
                        await client.publish([tracksRef.current.audio, tracksRef.current.video]);
                    } else if (tracksRef.current.audio) {
                        await client.publish([tracksRef.current.audio]);
                    }
                    setIsConnecting(false);
                    toast.success(isVideo ? 'Video call connected!' : 'Audio call connected!');
                }
            } catch (error) {
                console.error('Agora join error:', error);
                if (isMounted) {
                    setIsConnecting(false);
                    setConnectionError(error.message || 'Failed to connect to the call');
                    toast.error('Connection failed: ' + error.message);
                }
            }
        };

        init();

        return () => {
            isMounted = false;
            // Synchronous cleanup to prevent track leaks in React Strict Mode
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
            if (client.connectionState === 'CONNECTED') {
                client.leave().catch(console.error);
            }
            client.removeAllListeners();
        };
    }, [isOpen, channelName, isVideo]);

    useEffect(() => {
        remoteUsers.forEach(user => {
            if (user.videoTrack && remoteVideoRefs.current[user.uid]) {
                user.videoTrack.play(remoteVideoRefs.current[user.uid]);
            }
        });
    }, [remoteUsers]);

    const handleEndCall = async () => {
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
        if (client.connectionState === 'CONNECTED') {
            await client.leave();
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
        if (localVideoTrack) {
            localVideoTrack.setEnabled(isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={clsx(
            "fixed z-[1000] transition-all duration-500 shadow-2xl overflow-hidden flex flex-col",
            isMinimized 
                ? "bottom-6 right-6 w-72 h-48 rounded-3xl" 
                : "inset-6 md:inset-12 rounded-[40px] bg-slate-900"
        )}>
            {/* Header / Controls */}
            <div className="absolute top-6 right-6 z-10 flex gap-2">
                <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all"
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

            {/* Video Grid */}
            <div className="flex-1 relative bg-slate-950 flex flex-wrap items-center justify-center p-4 gap-4">
                {/* Connecting State */}
                {isConnecting && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 z-30 bg-slate-950">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-indigo-200/70 font-black uppercase tracking-[0.3em] text-[10px]">
                            Connecting...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {connectionError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 z-30 bg-slate-950">
                        <HiPhoneMissedCall className="w-12 h-12 text-rose-400" />
                        <p className="text-rose-300 font-bold text-sm max-w-xs">{connectionError}</p>
                        <button 
                            onClick={handleEndCall}
                            className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs hover:bg-rose-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Local Video */}
                {!connectionError && (
                    <div className={clsx(
                        "relative overflow-hidden rounded-3xl bg-slate-800 border-2 border-white/10 shadow-lg",
                        remoteUsers.length === 0 ? "w-full h-full" : "w-1/3 aspect-video absolute bottom-6 left-6 z-20"
                    )}>
                        <div ref={setLocalVideoRef} className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] text-white font-black uppercase tracking-widest">
                            You {isVideoOff && "(Video Off)"}
                        </div>
                    </div>
                )}

                {/* Remote Videos */}
                {remoteUsers.map((user, idx) => (
                    <div 
                        key={`${user.uid}-${idx}`} 
                        className={clsx(
                            "relative overflow-hidden rounded-3xl bg-slate-800 border-2 border-white/10 shadow-lg",
                            remoteUsers.length === 1 ? "w-full h-full" : "w-[45%] aspect-video"
                        )}
                    >
                        <div 
                            ref={el => remoteVideoRefs.current[user.uid] = el} 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] text-white font-black uppercase tracking-widest">
                            Peer ID: {user.uid}
                        </div>
                    </div>
                ))}

                {!isConnecting && !connectionError && remoteUsers.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                            <HiPhoneMissedCall className="w-10 h-10 text-indigo-400" />
                        </div>
                        <p className="text-indigo-200/50 font-black uppercase tracking-[0.3em] text-[10px]">
                            Waiting for others to join...
                        </p>
                        <p className="text-indigo-200/30 text-[10px] font-medium">
                            Channel: {channelName}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Controls Bar */}
            {!isMinimized && (
                <div className="p-8 flex justify-center items-center gap-6 bg-gradient-to-t from-black/60 to-transparent">
                    <button 
                        onClick={toggleMute}
                        className={clsx(
                            "w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl",
                            isMuted ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        <HiMicrophone className={clsx("w-6 h-6", isMuted && "opacity-50")} />
                    </button>
                    
                    <button 
                        onClick={handleEndCall}
                        className="w-20 h-20 rounded-[32px] bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-rose-900/40"
                    >
                        <HiPhoneMissedCall className="w-8 h-8 rotate-[135deg]" />
                    </button>

                    {isVideo && (
                        <button 
                            onClick={toggleVideo}
                            className={clsx(
                                "w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl",
                                isVideoOff ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                            )}
                        >
                            <HiVideoCamera className={clsx("w-6 h-6", isVideoOff && "opacity-50")} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
