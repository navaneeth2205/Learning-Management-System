import { useEffect, useRef, useState } from 'react';
import { HiPhoneMissedCall, HiMicrophone, HiVideoCamera, HiX, HiChevronDoubleRight, HiChevronDoubleLeft } from 'react-icons/hi';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AGORA_APP_ID } from '../../config/agora';
import clsx from 'clsx';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export default function CallModal({ channelName, isOpen, onClose, isVideo = true }) {
    const [localTracks, setLocalTracks] = useState([]);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});

    useEffect(() => {
        if (!isOpen) return;

        const init = async () => {
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
                await client.join(AGORA_APP_ID, channelName, null, null);
                const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                let videoTrack = null;
                
                if (isVideo) {
                    videoTrack = await AgoraRTC.createCameraVideoTrack();
                    setLocalTracks([audioTrack, videoTrack]);
                    await client.publish([audioTrack, videoTrack]);
                    videoTrack.play(localVideoRef.current);
                } else {
                    setLocalTracks([audioTrack]);
                    await client.publish([audioTrack]);
                }
            } catch (error) {
                console.error('Agora join error:', error);
            }
        };

        init();

        return () => {
            const cleanup = async () => {
                localTracks.forEach(track => {
                    track.stop();
                    track.close();
                });
                await client.leave();
            };
            cleanup();
        };
    }, [isOpen, channelName]);

    useEffect(() => {
        remoteUsers.forEach(user => {
            if (user.videoTrack && remoteVideoRefs.current[user.uid]) {
                user.videoTrack.play(remoteVideoRefs.current[user.uid]);
            }
        });
    }, [remoteUsers]);

    const handleEndCall = async () => {
        localTracks.forEach(track => {
            track.stop();
            track.close();
        });
        await client.leave();
        onClose();
    };

    const toggleMute = () => {
        if (localTracks[0]) {
            localTracks[0].setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localTracks[1]) {
            localTracks[1].setEnabled(isVideoOff);
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
                    onClick={onClose}
                    className="p-3 bg-rose-500/80 hover:bg-rose-600 text-white rounded-2xl backdrop-blur-md transition-all"
                >
                    <HiX />
                </button>
            </div>

            {/* Video Grid */}
            <div className="flex-1 relative bg-slate-950 flex flex-wrap items-center justify-center p-4 gap-4">
                {/* Local Video */}
                <div className={clsx(
                    "relative overflow-hidden rounded-3xl bg-slate-800 border-2 border-white/10 shadow-lg",
                    remoteUsers.length === 0 ? "w-full h-full" : "w-1/3 aspect-video absolute bottom-6 left-6 z-20"
                )}>
                    <div ref={localVideoRef} className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] text-white font-black uppercase tracking-widest">
                        You {isVideoOff && "(Video Off)"}
                    </div>
                </div>

                {/* Remote Videos */}
                {remoteUsers.map(user => (
                    <div 
                        key={user.uid} 
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

                {remoteUsers.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                            <HiPhoneMissedCall className="w-10 h-10 text-indigo-400" />
                        </div>
                        <p className="text-indigo-200/50 font-black uppercase tracking-[0.3em] text-[10px]">
                            Waiting for others to join...
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
