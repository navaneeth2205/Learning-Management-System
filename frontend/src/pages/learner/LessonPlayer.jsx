import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    HiChevronLeft, HiChevronRight, HiCheckCircle,
    HiPlay, HiDocumentText, HiBookmark, HiChatAlt,
    HiMenu, HiX, HiAcademicCap, HiClock, HiPause,
    HiClipboardList, HiDownload, HiExternalLink
} from 'react-icons/hi';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import { fetchLessonById, fetchLessonsByCourse, fetchCourseById } from '../../services/learnerApi';
import toast from 'react-hot-toast';

export default function LessonPlayer() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);

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

    const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

    // Load course, lesson, and all lessons from DB
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [lessonData, lessonsData, courseData] = await Promise.all([
                    fetchLessonById(lessonId),
                    fetchLessonsByCourse(courseId),
                    fetchCourseById(courseId),
                ]);

                setCurrentLesson(lessonData);
                setAllLessons(lessonsData || []);
                setCourse(courseData);
            } catch (err) {
                console.error('LessonPlayer load error:', err);
                setError(err.message || 'Failed to load lesson data');
                toast.error('Failed to load lesson. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [courseId, lessonId]);

    // Reset player state on lesson change
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setCanComplete(false);
        setIsBookmarked(false);
    }, [lessonId]);

    // Navigation helpers
    const currentIndex = allLessons.findIndex(l => (l._id || l.id) === lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    // Progress
    const progressPercent = allLessons.length > 0
        ? Math.round(((currentIndex + 1) / allLessons.length) * 100)
        : 0;

    // Video event handlers
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            // Enable completion after watching 80% of the video
            if (videoRef.current.currentTime >= videoRef.current.duration * 0.8) {
                setCanComplete(true);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleComplete = () => {
        if (!canComplete) {
            toast.error('Please watch at least 80% of the lesson before continuing');
            return;
        }

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#8b5cf6', '#10b981']
        });

        if (nextLesson) {
            navigate(`/learner/courses/${courseId}/lessons/${nextLesson._id || nextLesson.id}`);
        } else {
            toast.success('🎉 Congratulations! You finished the course!');
            navigate(`/learner/courses/${courseId}`);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Build the full content URL
    const getContentUrl = (lesson) => {
        if (!lesson?.contentUrl) return null;
        // If it's already an absolute URL (e.g., from YouTube or a CDN)
        if (lesson.contentUrl.startsWith('http')) return lesson.contentUrl;
        // Otherwise, prefix with the backend base URL
        return `${API_BASE}${lesson.contentUrl}`;
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
    const isVideo = currentLesson.type === 'video';
    const isPdf = currentLesson.type === 'pdf';
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
                            /* ── Real Video Player ── */
                            <div className="w-full h-full relative group">
                                <video
                                    ref={videoRef}
                                    src={contentUrl}
                                    className="w-full h-full object-contain bg-black"
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={() => { setIsPlaying(false); setCanComplete(true); }}
                                    onClick={handlePlayPause}
                                    controlsList="nodownload"
                                />
                                
                                {/* Custom Overlay Controls */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    {/* Progress Bar */}
                                    <div 
                                        className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative group/bar"
                                        onClick={(e) => {
                                            if (videoRef.current) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const ratio = (e.clientX - rect.left) / rect.width;
                                                videoRef.current.currentTime = ratio * videoRef.current.duration;
                                            }
                                        }}
                                    >
                                        <div 
                                            className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full transition-all"
                                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                        />
                                        <div 
                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity"
                                            style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                                            className="text-white hover:text-indigo-400 transition-colors"
                                        >
                                            {isPlaying ? <HiPause className="w-6 h-6" /> : <HiPlay className="w-6 h-6" />}
                                        </button>
                                        <span className="text-[11px] font-bold text-white/70 tracking-wider font-mono">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>
                                        <div className="flex-1" />
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                                            {currentLesson.title}
                                        </span>
                                    </div>
                                </div>

                                {/* Center Play/Pause overlay (shown when paused) */}
                                {!isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl animate-pulse">
                                            <HiPlay className="w-10 h-10 text-white ml-1" />
                                        </div>
                                    </div>
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
                                onClick={() => prevLesson && navigate(`/learner/courses/${courseId}/lessons/${prevLesson._id || prevLesson.id}`)}
                            >
                                <HiChevronLeft /> Prev
                            </Button>
                            <div className="h-4 w-px bg-white/20 mx-1" />
                            <span className="text-xs text-white px-2">Lesson {currentIndex + 1} of {allLessons.length}</span>
                            <div className="h-4 w-px bg-white/20 mx-1" />
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                disabled={!nextLesson} 
                                className="text-white hover:bg-white/10"
                                onClick={() => nextLesson && navigate(`/learner/courses/${courseId}/lessons/${nextLesson._id || nextLesson.id}`)}
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
                                {allLessons.map((lesson, i) => {
                                    const lid = lesson._id || lesson.id;
                                    const active = lid === lessonId;
                                    return (
                                        <button
                                            key={lid}
                                            onClick={() => navigate(`/learner/courses/${courseId}/lessons/${lid}`)}
                                            className={clsx(
                                                "w-full flex items-center gap-3 p-4 transition-all group/item text-left",
                                                active ? "bg-indigo-50 border-l-2 border-indigo-600" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="relative flex-shrink-0">
                                                {i < currentIndex ? (
                                                    <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-black",
                                                        active ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-400"
                                                    )}>
                                                        {i + 1}
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
