import { useEffect, useState, useRef } from 'react';
import { HiPhone, HiPhoneMissedCall, HiVideoCamera, HiX } from 'react-icons/hi';
import { useSocket } from '../../context/SocketContext';
import CallModal from './CallModal';
import clsx from 'clsx';

// Ring sound (using Web Audio API — no external files needed)
function useRingSound() {
    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);

    const startRing = () => {
        stopRing();
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioCtx();

            const playTone = () => {
                if (!audioCtxRef.current) return;
                const osc = audioCtxRef.current.createOscillator();
                const gain = audioCtxRef.current.createGain();
                osc.connect(gain);
                gain.connect(audioCtxRef.current.destination);
                osc.frequency.value = 440;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.5);
                osc.start();
                osc.stop(audioCtxRef.current.currentTime + 0.5);
            };

            playTone();
            intervalRef.current = setInterval(playTone, 1500);
        } catch (e) {
            console.warn('Ring sound not available:', e);
        }
    };

    const stopRing = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
    };

    return { startRing, stopRing };
}

export default function CallManager() {
    const { socket } = useSocket();
    const { startRing, stopRing } = useRingSound();
    const acceptingRef = useRef(false);

    // Incoming call state
    const [incomingCall, setIncomingCall] = useState(null);
    // Active call state
    const [activeCall, setActiveCall] = useState(null);

    useEffect(() => {
        if (!socket) return;

        // Listen for incoming calls
        const handleIncoming = ({ callerId, callerName, channelName, isVideo }) => {
            console.log('[CallManager] Incoming call from:', callerName);
            setIncomingCall({ callerId, callerName, channelName, isVideo });
            startRing();
        };

        // Caller: call was accepted
        const handleAccepted = ({ channelName }) => {
            console.log('[CallManager] Call accepted on channel:', channelName);
            // The caller is already in the channel via CallModal
        };

        // Caller: call was rejected
        const handleRejected = () => {
            console.log('[CallManager] Call was rejected');
            setActiveCall(null);
        };

        // Either: other party ended the call
        const handleEnded = () => {
            console.log('[CallManager] Call ended by other party');
            setActiveCall(null);
            setIncomingCall(null);
            stopRing();
        };

        // Caller: receiver is offline
        const handleUnavailable = ({ message }) => {
            console.log('[CallManager] User unavailable:', message);
        };

        socket.on('call:incoming', handleIncoming);
        socket.on('call:accepted', handleAccepted);
        socket.on('call:rejected', handleRejected);
        socket.on('call:ended', handleEnded);
        socket.on('call:unavailable', handleUnavailable);

        return () => {
            socket.off('call:incoming', handleIncoming);
            socket.off('call:accepted', handleAccepted);
            socket.off('call:rejected', handleRejected);
            socket.off('call:ended', handleEnded);
            socket.off('call:unavailable', handleUnavailable);
        };
    }, [socket]);

    const handleAcceptCall = () => {
        if (!incomingCall || !socket || acceptingRef.current) return;
        acceptingRef.current = true;
        stopRing();
        socket.emit('call:accept', {
            callerId: incomingCall.callerId,
            channelName: incomingCall.channelName,
        });
        setActiveCall({
            channelName: incomingCall.channelName,
            isVideo: incomingCall.isVideo,
            otherUserId: incomingCall.callerId,
        });
        setIncomingCall(null);
        window.setTimeout(() => {
            acceptingRef.current = false;
        }, 300);
    };

    const handleRejectCall = () => {
        if (!incomingCall || !socket) return;
        acceptingRef.current = false;
        stopRing();
        socket.emit('call:reject', {
            callerId: incomingCall.callerId,
            channelName: incomingCall.channelName,
        });
        setIncomingCall(null);
    };

    const handleEndActiveCall = () => {
        if (activeCall && socket) {
            socket.emit('call:end', {
                otherUserId: activeCall.otherUserId,
                channelName: activeCall.channelName,
            });
        }
        acceptingRef.current = false;
        setActiveCall(null);
    };

    return (
        <>
            {/* ── Incoming Call Overlay ── */}
            {incomingCall && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-6 animate-in zoom-in-95 fade-in duration-300">
                        {/* Pulsing Avatar */}
                        <div className="relative inline-flex">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                                {incomingCall.callerName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-400 animate-ping opacity-30" />
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-300 animate-pulse" />
                        </div>

                        {/* Caller Info */}
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{incomingCall.callerName}</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center justify-center gap-2">
                                {incomingCall.isVideo ? (
                                    <><HiVideoCamera className="w-4 h-4" /> Incoming Video Call</>
                                ) : (
                                    <><HiPhone className="w-4 h-4" /> Incoming Audio Call</>
                                )}
                            </p>
                        </div>

                        {/* Ringing indicator */}
                        <div className="flex items-center justify-center gap-1">
                            {[0, 1, 2, 3, 4].map(i => (
                                <div
                                    key={i}
                                    className="w-1 bg-indigo-500 rounded-full animate-pulse"
                                    style={{
                                        height: `${12 + Math.random() * 16}px`,
                                        animationDelay: `${i * 0.15}s`,
                                    }}
                                />
                            ))}
                            <span className="ml-3 text-xs font-black text-slate-400 uppercase tracking-widest">Ringing...</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-6 pt-2">
                            {/* Reject */}
                            <button
                                onClick={handleRejectCall}
                                className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 hover:scale-110 active:scale-95 transition-all"
                            >
                                <HiPhoneMissedCall className="w-7 h-7 rotate-[135deg]" />
                            </button>
                            {/* Accept */}
                            <button
                                onClick={handleAcceptCall}
                                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 hover:scale-110 active:scale-95 transition-all"
                            >
                                <HiPhone className="w-7 h-7" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Active Call Modal ── */}
            {activeCall && (
                <CallModal
                    isOpen={true}
                    channelName={activeCall.channelName}
                    isVideo={activeCall.isVideo}
                    onClose={handleEndActiveCall}
                />
            )}
        </>
    );
}
