import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    HiChevronLeft, HiChevronRight, HiCheckCircle,
    HiPlay, HiDocumentText, HiBookmark, HiChatAlt,
    HiMenu, HiX, HiAcademicCap, HiClock, HiPause,
    HiClipboardList, HiDownload, HiExternalLink, HiLockClosed, HiArrowsExpand
} from 'react-icons/hi';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import { fetchLessonsByCourse, fetchCourseById, updateProgress, fetchMyProgress } from '../../services/learnerApi';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';

export default function LessonPlayer() {
    const { courseId, lessonOrder } = useParams();
    const lessonOrderNum = Number(lessonOrder);
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const playerRef = useRef(null);       // ReactPlayer ref
    const playerContainerRef = useRef(null); // outer container for fullscreen

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('notes');
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Live data states
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [allLessons, setAllLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Video player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [canComplete, setCanComplete] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    
    // Strict watch time tracking
    const watchTimeRef = useRef(0);
    const lastTimeRef = useRef(0);
    const hasCompletedRef = useRef(false);

    // Completed lessons state
    const [completedLessons, setCompletedLessons] = useState(new Set());

    const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

    const resolveLessonRawUrl = (lesson) => {
        if (!lesson) return '';
        const candidate = lesson.contentUrl || lesson.videoUrl || lesson.fileUrl || lesson.url || '';
        return String(candidate || '').trim();
    };

    const inferLessonType = (lesson) => {
        const explicitType = String(lesson?.type || '').toLowerCase().trim();
        if (explicitType === 'video' || explicitType === 'pdf') return explicitType;

        const rawUrl = resolveLessonRawUrl(lesson).toLowerCase();
        if (!rawUrl) return 'video';
        if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) return 'video';
        if (rawUrl.endsWith('.pdf')) return 'pdf';
        return 'video';
    };

    // Fullscreen change listener + F key shortcut
    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);

        const onKeyDown = (e) => {
            // Only trigger when not typing in an input/textarea
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) return;
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    playerContainerRef.current?.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', onFsChange);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            playerContainerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleSpeedChange = (speed) => {
        setPlaybackRate(speed);
        setShowSpeedMenu(false);

        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }

        // Also notify the YouTube internal player directly
        try { playerRef.current?.getInternalPlayer()?.setPlaybackRate(speed); } catch (_) {}
    };

    // Load ALL lessons for the course sorted by order, plus course info and progress
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [lessonsData, courseData, progressData] = await Promise.all([
                    fetchLessonsByCourse(courseId),
                    fetchCourseById(courseId),
                    fetchMyProgress().catch(() => null),
                ]);

                // Sort lessons by order and normalize missing/invalid orders to a stable 1..N sequence
                const sorted = (lessonsData || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
                const normalized = sorted.map((lesson, index) => {
                    const orderValue = Number(lesson.order);
                    return {
                        ...lesson,
                        order: Number.isFinite(orderValue) && orderValue > 0 ? orderValue : index + 1,
                    };
                });
                setAllLessons(normalized);

                // Resolve route param as either lesson order or lesson id
                const routeParam = String(lessonOrder || '').trim();
                let lesson = null;

                if (Number.isFinite(lessonOrderNum) && lessonOrderNum > 0) {
                    lesson = normalized.find((l) => Number(l.order) === lessonOrderNum) || null;
                }

                if (!lesson && routeParam) {
                    lesson = normalized.find((l) => String(l._id || l.id || '') === routeParam) || null;
                }

                if (!lesson) {
                    lesson = normalized[0] || null;
                }

                if (!lesson) throw new Error('No lessons found for this course');
                setCurrentLesson(lesson);

                setCourse(courseData);

                if (progressData) {
                    const myProgress = progressData.find(p => String(p.courseId?._id || p.courseId) === String(courseId));
                    if (myProgress && myProgress.completedLessons) {
                        setCompletedLessons(new Set(myProgress.completedLessons.map(id => String(id))));
                    }
                }
            } catch (err) {
                console.error('LessonPlayer load error:', err);
                setError(err.message || 'Failed to load lesson data');
                toast.error('Failed to load lesson. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [courseId, lessonOrderNum]);

    // Reset player state on lesson order change
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        
        watchTimeRef.current = 0;
        lastTimeRef.current = 0;
        hasCompletedRef.current = false;
        
        // If they already completed this lesson previously, unlock completion button instantly
        const lessonId = currentLesson?._id;
        if (lessonId && completedLessons.has(String(lessonId))) {
            setCanComplete(true);
            hasCompletedRef.current = true;
        } else {
            setCanComplete(false);
        }
        
        setIsBookmarked(false);
    }, [lessonOrderNum, completedLessons, currentLesson]);

    // Navigation helpers — use order numbers for URLs, not ObjectIds
    const currentLessonOrder = Number(currentLesson?.order);
    const currentIndex = allLessons.findIndex(l => Number(l.order) === currentLessonOrder);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    const goToLesson = (lesson) => {
        if (lesson) navigate(`/learner/courses/${courseId}/lessons/${lesson.order}`);
    };

    // Progress
    const progressPercent = allLessons.length > 0
        ? Math.round(((currentIndex + 1) / allLessons.length) * 100)
        : 0;

    // Video event handlers for ReactPlayer
    const handleProgress = (state) => {
        const currentVideoTime = state.playedSeconds;
        const delta = currentVideoTime - lastTimeRef.current;
        
        // Only add to watch time if the delta is positive and less than 2 seconds (not a seek)
        if (delta > 0 && delta < 2) {
            watchTimeRef.current += delta;
        }
        
        lastTimeRef.current = currentVideoTime;
        setCurrentTime(currentVideoTime);
        
        // Enable completion after genuinely watching 80% of the video
        if (!hasCompletedRef.current && duration > 0 && watchTimeRef.current >= duration * 0.8) {
            setCanComplete(true);
            hasCompletedRef.current = true;
        }
    };

    const handleDuration = (dur) => {
        setDuration(dur);
        lastTimeRef.current = 0; // Reset last time when video loads
    };

    const handleReady = (player) => {
        playerRef.current = player;
        // Get duration via the internal player API
        try {
            const dur = player.getDuration();
            if (dur && !isNaN(dur)) {
                setDuration(dur);
                lastTimeRef.current = 0;
            }
        } catch (e) {
            // getDuration may not be available immediately for some sources
        }
    };

    const handleComplete = async () => {
        if (!canComplete) {
            toast.error('Please actually watch at least 80% of the video before continuing');
            return;
        }

        try {
            await updateProgress(courseId, currentLesson._id);
            setCompletedLessons(prev => new Set([...prev, String(currentLesson._id)]));
        } catch (err) {
            console.error('Failed to update progress:', err);
            toast.error('Failed to save progress, but you can proceed.');
        }

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#8b5cf6', '#10b981']
        });

        if (nextLesson) {
            goToLesson(nextLesson);
        } else {
            toast.success('🎉 Congratulations! You finished the course!');
            navigate(`/learner/courses/${courseId}`);
        }
    };

    // Build the full content URL
    const getContentUrl = (lesson) => {
        const rawUrl = resolveLessonRawUrl(lesson);
        if (!rawUrl) return null;
        
        // Convert YouTube embed URLs to watch URLs (ReactPlayer requires watch format)
        // e.g. https://www.youtube.com/embed/pQN-pnXPaVg -> https://www.youtube.com/watch?v=pQN-pnXPaVg
        if (rawUrl.includes('youtube.com/embed/')) {
            const videoId = rawUrl.split('youtube.com/embed/')[1]?.split('?')[0];
            if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
        }
        
        // Handle youtu.be short links
        if (rawUrl.includes('youtu.be/')) {
            const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
        }
        
        // If it's already an absolute URL (CDN, direct video, etc.)
        if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
        
        // Otherwise, prefix with the backend base URL (local uploads)
        const normalizedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
        return `${API_BASE}${normalizedPath}`;
    };

    const isYouTubeUrl = (url) => {
        if (!url) return false;
        return /youtube\.com|youtu\.be/i.test(url);
    };

    const isDirectVideoFileUrl = (url) => {
        if (!url) return false;
        return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) || /\/uploads\//i.test(url);
    };

    // ── Loading State ──
    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-slate-900 text-white">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Loading lesson...</p>
            </div>
        );
    }

    // ── Error State ──
    if (error || !currentLesson) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-slate-900 text-white space-y-4">
                <HiX className="w-16 h-16 text-rose-500" />
                <h2 className="text-xl font-bold">Lesson Not Found</h2>
                <p className="text-slate-400">{error || 'This lesson could not be loaded.'}</p>
                <Link to={`/learner/courses/${courseId}`}>
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                        Back to Course
                    </Button>
                </Link>
            </div>
        );
    }

    const contentUrl = getContentUrl(currentLesson);
    const lessonType = inferLessonType(currentLesson);
    const isVideo = lessonType === 'video';
    const isPdf = lessonType === 'pdf';
    const useNativeVideo = isVideo && contentUrl && !isYouTubeUrl(contentUrl) && isDirectVideoFileUrl(contentUrl);
    const courseTitle = course?.title || currentLesson.courseId?.title || 'Course';

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            {/* Top Header */}
            <header className="h-14 bg-slate-900 text-white border-b border-white/10 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-4">
                    <Link to={`/learner/courses/${courseId}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <HiChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-white/20 hidden sm:block" />
                    <div className="hidden sm:block">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{courseTitle}</p>
                        <h1 className="text-sm font-semibold truncate max-w-xs">{currentLesson.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 mr-4">
                        <p className="text-xs text-slate-400">Progress</p>
                        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="text-xs font-bold">{progressPercent}%</span>
                    </div>
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        className={clsx(
                            "border-none transition-all",
                            isBookmarked ? "bg-amber-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                        onClick={() => {
                            setIsBookmarked(!isBookmarked);
                            toast.success(isBookmarked ? 'Bookmark removed' : 'Lesson bookmarked');
                        }}
                    >
                        <HiBookmark className="w-4 h-4 mr-1" /> {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    <Button 
                        size="sm" 
                        className={clsx(
                            "border-none transition-all",
                            !canComplete ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50" : "bg-primary-600 active:scale-95"
                        )}
                        onClick={handleComplete}
                    >
                        {!canComplete ? (
                            <span className="flex items-center gap-2">
                                Watch to continue <HiClock className="w-3 h-3 animate-pulse" />
                            </span>
                        ) : (
                            nextLesson ? 'Complete & Continue' : 'Finish Course'
                        )}
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                    {/* Player / Content Container */}
                    <div className="flex-1 bg-black relative flex items-center justify-center">
                        {isVideo && contentUrl ? (
                            /* ── ReactPlayer with YouTube native controls (fullscreen + speed built-in) ── */
                            <div
                                ref={playerContainerRef}
                                className="w-full h-full bg-black"
                            >
                                {useNativeVideo ? (
                                    <video
                                        ref={videoRef}
                                        src={contentUrl}
                                        className="w-full h-full"
                                        controls
                                        playsInline
                                        preload="metadata"
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={() => {
                                            setIsPlaying(false);
                                            setCanComplete(true);
                                        }}
                                        onLoadedMetadata={(event) => {
                                            const loadedDuration = event.currentTarget.duration;
                                            if (Number.isFinite(loadedDuration)) {
                                                setDuration(loadedDuration);
                                            }
                                            event.currentTarget.playbackRate = playbackRate;
                                            lastTimeRef.current = 0;
                                        }}
                                        onTimeUpdate={(event) => {
                                            const currentVideoTime = event.currentTarget.currentTime || 0;
                                            const delta = currentVideoTime - lastTimeRef.current;

                                            if (delta > 0 && delta < 2) {
                                                watchTimeRef.current += delta;
                                            }

                                            lastTimeRef.current = currentVideoTime;
                                            setCurrentTime(currentVideoTime);

                                            if (!hasCompletedRef.current && duration > 0 && watchTimeRef.current >= duration * 0.8) {
                                                setCanComplete(true);
                                                hasCompletedRef.current = true;
                                            }
                                        }}
                                        onError={() => {
                                            toast.error('Video failed to load. Please check the lesson file URL.');
                                        }}
                                    />
                                ) : (
                                    <ReactPlayer
                                        ref={playerRef}
                                        src={contentUrl}
                                        url={contentUrl}
                                        width="100%"
                                        height="100%"
                                        controls={true}
                                        playsInline={true}
                                        playbackRate={playbackRate}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={() => { setIsPlaying(false); setCanComplete(true); }}
                                        onProgress={handleProgress}
                                        onReady={handleReady}
                                        onError={() => {
                                            toast.error('Video failed to load. Please check the lesson URL.');
                                        }}
                                        progressInterval={1000}
                                        config={{
                                            youtube: {
                                                playerVars: {
                                                    rel: 0,
                                                    modestbranding: 1,
                                                    fs: 1,
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        ) : isPdf && contentUrl ? (
                            /* ── PDF Viewer ── */
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-8">
                                <div className="max-w-2xl w-full space-y-6 text-center">
                                    <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto">
                                        <HiDocumentText className="w-12 h-12 text-rose-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">{currentLesson.title}</h3>
                                    <p className="text-slate-400">PDF Document</p>
                                    <div className="flex gap-4 justify-center">
                                        <a href={contentUrl} target="_blank" rel="noopener noreferrer">
                                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" icon={<HiExternalLink className="w-4 h-4" />}>
                                                Open PDF
                                            </Button>
                                        </a>
                                        <a href={contentUrl} download>
                                            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" icon={<HiDownload className="w-4 h-4" />}>
                                                Download
                                            </Button>
                                        </a>
                                    </div>
                                    <iframe
                                        src={contentUrl}
                                        className="w-full h-[400px] rounded-2xl border border-white/10 mt-6"
                                        title={currentLesson.title}
                                    />
                                </div>
                                {/* Auto-enable completion for PDF lessons */}
                                {!canComplete && setTimeout(() => setCanComplete(true), 5000) && null}
                            </div>
                        ) : (
                            /* ── No Content Fallback ── */
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                                    <HiAcademicCap className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-bold">{currentLesson.title}</h3>
                                <p className="text-slate-400 text-sm max-w-md text-center">
                                    {currentLesson.description || 'No video content available for this lesson yet. Check back soon!'}
                                </p>
                                {/* Enable completion after 3 seconds for content-less lessons */}
                                {!canComplete && setTimeout(() => setCanComplete(true), 3000) && null}
                            </div>
                        )}

                        {/* Float Controls Overlay */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl z-30">
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                disabled={!prevLesson} 
                                className="text-white hover:bg-white/10"
                                onClick={() => goToLesson(prevLesson)}
                            >
                                <HiChevronLeft /> Prev
                            </Button>
                            {isVideo && contentUrl && (
                                <>
                                    <div className="h-4 w-px bg-white/20 mx-1" />
                                    <div className="relative">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-white hover:bg-white/10"
                                            onClick={() => setShowSpeedMenu((prev) => !prev)}
                                        >
                                            {playbackRate}x
                                        </Button>
                                        {showSpeedMenu && (
                                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/20 rounded-xl p-1 min-w-24">
                                                {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => handleSpeedChange(speed)}
                                                        className={clsx(
                                                            'w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors',
                                                            playbackRate === speed ? 'bg-indigo-600 text-white' : 'text-slate-200 hover:bg-white/10'
                                                        )}
                                                    >
                                                        {speed}x
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-white hover:bg-white/10"
                                        onClick={toggleFullscreen}
                                    >
                                        <HiArrowsExpand /> Fullscreen
                                    </Button>
                                </>
                            )}
                            <div className="h-4 w-px bg-white/20 mx-1" />
                            <span className="text-xs text-white px-2">Lesson {currentIndex >= 0 ? currentIndex + 1 : 1} of {allLessons.length}</span>
                            <div className="h-4 w-px bg-white/20 mx-1" />
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                disabled={!nextLesson || (!hasCompletedRef.current && !completedLessons.has(String(currentLesson?._id)))} 
                                className="text-white hover:bg-white/10"
                                onClick={() => {
                                    if (nextLesson && (hasCompletedRef.current || completedLessons.has(String(currentLesson?._id)))) {
                                        goToLesson(nextLesson);
                                    } else {
                                        toast.error('Please complete this lesson to unlock the next one!');
                                    }
                                }}
                            >
                                Next <HiChevronRight />
                            </Button>
                        </div>
                    </div>

                    {/* Bottom Content / Tabs */}
                    <div className="h-1/3 bg-white border-t border-surface-border overflow-y-auto">
                        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-text-primary">{currentLesson.title}</h2>
                                <div className="flex gap-4">
                                    <button className={clsx("text-sm font-semibold pb-2 border-b-2 transition-all", activeTab === 'notes' ? "border-primary-600 text-primary-600" : "border-transparent text-text-muted")} onClick={() => setActiveTab('notes')}>Notes</button>
                                    <button className={clsx("text-sm font-semibold pb-2 border-b-2 transition-all", activeTab === 'resources' ? "border-primary-600 text-primary-600" : "border-transparent text-text-muted")} onClick={() => setActiveTab('resources')}>Resources</button>
                                    <button className={clsx("text-sm font-semibold pb-2 border-b-2 transition-all", activeTab === 'discussion' ? "border-primary-600 text-primary-600" : "border-transparent text-text-muted")} onClick={() => setActiveTab('discussion')}>Discussion</button>
                                </div>
                            </div>

                            {activeTab === 'notes' && (
                                <div className="space-y-4">
                                    {currentLesson.description ? (
                                        <p className="text-text-secondary leading-relaxed">{currentLesson.description}</p>
                                    ) : (
                                        <p className="text-text-secondary leading-relaxed">
                                            No notes available for this lesson yet.
                                        </p>
                                    )}
                                    <div className="bg-surface-muted rounded-xl p-4 border border-surface-border">
                                        <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                                            <HiBookmark className="text-amber-500" /> Lesson Info
                                        </h4>
                                        <ul className="text-sm text-text-secondary space-y-2">
                                            <li className="flex items-center gap-2">
                                                <HiClock className="w-4 h-4 text-slate-400" />
                                                Duration: {currentLesson.duration || 'N/A'}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <HiDocumentText className="w-4 h-4 text-slate-400" />
                                                Type: <Badge color={isVideo ? 'blue' : 'rose'} className="text-[10px]">{currentLesson.type?.toUpperCase()}</Badge>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <HiAcademicCap className="w-4 h-4 text-slate-400" />
                                                Course: {courseTitle}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div className="space-y-4">
                                    {contentUrl && (
                                        <div className="bg-surface-muted rounded-xl p-4 border border-surface-border flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {isVideo ? <HiPlay className="w-5 h-5 text-indigo-500" /> : <HiDocumentText className="w-5 h-5 text-rose-500" />}
                                                <div>
                                                    <p className="text-sm font-bold text-text-primary">{currentLesson.title}</p>
                                                    <p className="text-xs text-text-muted">{isVideo ? 'Video File' : 'PDF Document'}</p>
                                                </div>
                                            </div>
                                            <a href={contentUrl} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline" icon={<HiExternalLink className="w-3 h-3" />}>Open</Button>
                                            </a>
                                        </div>
                                    )}
                                    {!contentUrl && (
                                        <p className="text-text-muted text-sm">No downloadable resources for this lesson.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'discussion' && (
                                <div className="text-center py-8 space-y-3">
                                    <HiChatAlt className="w-10 h-10 text-slate-300 mx-auto" />
                                    <p className="text-sm font-medium text-text-secondary">Discussion feature coming soon!</p>
                                    <p className="text-xs text-text-muted">Use the Messages tab to ask your instructor directly.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Lesson Navigator */}
                <aside className={clsx(
                    "bg-white border-l border-surface-border flex flex-col transition-all duration-300",
                    sidebarOpen ? "w-80" : "w-0 overflow-hidden"
                )}>
                    <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
                        <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">Course Content</h3>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden"><HiX /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {allLessons.length > 0 ? (
                            <div className="divide-y divide-surface-border">
                                {allLessons.map((lesson) => {
                                    const lid = String(lesson._id || lesson.id);
                                    const active = lesson.order === lessonOrderNum;
                                    const isCompleted = completedLessons.has(lid) || (active && hasCompletedRef.current);
                                    
                                    // Locked if the previous lesson (by order) is not completed
                                    const prevLesson = allLessons.find(l => l.order === lesson.order - 1);
                                    const isLocked = lesson.order > 1 && !!prevLesson && !completedLessons.has(String(prevLesson._id || prevLesson.id));

                                    return (
                                        <button
                                            key={lid}
                                            onClick={() => {
                                                if (isLocked) {
                                                    toast.error('Complete the previous lessons to unlock this one!');
                                                    return;
                                                }
                                                navigate(`/learner/courses/${courseId}/lessons/${lesson.order}`);
                                            }}
                                            className={clsx(
                                                "w-full flex items-center gap-3 p-4 transition-all group/item text-left",
                                                active ? "bg-indigo-50 border-l-2 border-indigo-600" : "hover:bg-slate-50",
                                                isLocked && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <div className="relative flex-shrink-0">
                                                {isCompleted ? (
                                                    <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                                                ) : isLocked ? (
                                                    <div className="w-5 h-5 flex items-center justify-center">
                                                        <HiLockClosed className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                ) : (
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-black",
                                                        active ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-300 text-slate-400"
                                                    )}>
                                                        {lesson.order}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={clsx(
                                                    "text-xs font-bold truncate",
                                                    active ? "text-indigo-600" : "text-slate-700"
                                                )}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {lesson.type === 'pdf' ? (
                                                        <HiDocumentText className="w-3 h-3 text-rose-400" />
                                                    ) : (
                                                        <HiPlay className="w-3 h-3 text-slate-300" />
                                                    )}
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {lesson.duration || lesson.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-sm text-text-muted">
                                No lessons available for this course.
                            </div>
                        )}
                    </div>
                </aside>

                {/* Mini Toggle handle for sidebar if closed */}
                {!sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-1 rounded-l-lg z-50 shadow-xl"
                    >
                        <HiMenu className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
