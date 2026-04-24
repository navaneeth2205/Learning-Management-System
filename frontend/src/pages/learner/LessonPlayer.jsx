import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    HiChevronLeft, HiChevronRight, HiCheckCircle,
    HiPlay, HiDocumentText, HiBookmark, HiChatAlt,
    HiMenu, HiX, HiAcademicCap, HiClock, HiPause,
    HiClipboardList
} from 'react-icons/hi';
import { mockCourses } from '../../data/mockData';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Avatar from '../../components/ui/Avatar';
import clsx from 'clsx';

import confetti from 'canvas-confetti';

export default function LessonPlayer() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('notes');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Helper to parse "MM:SS" into total seconds
    const parseDuration = (dur) => {
        if (!dur) return 60;
        const parts = dur.split(':').map(Number);
        return (parts[0] || 0) * 60 + (parts[1] || 0);
    };

    const course = mockCourses.find(c => c.id === parseInt(courseId)) || mockCourses[0];
    const flatLessons = course.curriculum.flatMap(m => m.lessons);
    const currentLessonIndex = flatLessons.findIndex(l => l.id === parseInt(lessonId)) || 0;
    const currentLesson = flatLessons[currentLessonIndex] || flatLessons[0];

    const [timeLeft, setTimeLeft] = useState(() => Math.floor(parseDuration(currentLesson.duration || "0:00") * 0.8));

    const prevLesson = currentLessonIndex > 0 ? flatLessons[currentLessonIndex - 1] : null;
    const nextLesson = currentLessonIndex < flatLessons.length - 1 ? flatLessons[currentLessonIndex + 1] : null;

    // Calculate progress
    const completedCount = flatLessons.filter(l => l.completed).length;
    const progressPercent = Math.round((completedCount / flatLessons.length) * 100);

    // Timer logic - only counts down if isPlaying is true
    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, isPlaying]);

    // Reset on lesson change
    useEffect(() => {
        const required = Math.floor(parseDuration(currentLesson.duration || "0:00") * 0.8);
        setTimeLeft(required);
        setIsBookmarked(false);
        setIsPlaying(false);
    }, [lessonId, currentLesson.duration]);

    const handleComplete = () => {
        if (timeLeft > 0) return;

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#8b5cf6', '#10b981']
        });

        if (nextLesson) {
            navigate(ROUTES.LEARNER_LESSON.replace(':courseId', course.id).replace(':lessonId', nextLesson.id));
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            {/* Top Header */}
            <header className="h-14 bg-slate-900 text-white border-b border-white/10 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-4">
                    <Link to={ROUTES.LEARNER_DASHBOARD} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <HiChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-white/20 hidden sm:block" />
                    <div className="hidden sm:block">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{course.title}</p>
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
                        }}
                    >
                        <HiBookmark className="w-4 h-4 mr-1" /> {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    <Button 
                        size="sm" 
                        className={clsx(
                            "border-none transition-all",
                            timeLeft > 0 ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50" : "bg-primary-600 active:scale-95"
                        )}
                        onClick={handleComplete}
                    >
                        {timeLeft > 0 ? (
                            <span className="flex items-center gap-2">
                                Wait {timeLeft}s <HiClock className="w-3 h-3 animate-pulse" />
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
                    {/* Player Container */}
                    <div className="flex-1 bg-black relative flex items-center justify-center">
                        <div className="w-full h-full max-w-6xl aspect-video bg-slate-900 flex flex-col items-center justify-center text-white relative group overflow-hidden border border-white/5 rounded-2xl shadow-2xl">
                             {/* Video Background Simulation */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-slate-900" />
                            
                            <div className="relative text-center z-10 transition-transform hover:scale-105 duration-500">
                                <button 
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-2xl shadow-black/50 overflow-hidden relative group/btn"
                                >
                                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    {isPlaying ? (
                                        <HiPause className="w-10 h-10 text-white" />
                                    ) : (
                                        <HiPlay className="w-10 h-10 text-white ml-1" />
                                    )}
                                </button>
                                <p className="text-slate-400 mt-6 font-black uppercase tracking-[0.3em] text-[10px] drop-shadow-lg">
                                    {isPlaying ? 'PLAYING' : 'PAUSED'}
                                </p>
                            </div>

                            {/* Simulation Bottom Bar */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <button 
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="text-white hover:text-indigo-400 transition-colors"
                                >
                                    {isPlaying ? <HiPause className="w-6 h-6" /> : <HiPlay className="w-6 h-6" />}
                                </button>
                                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden relative">
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-1000" 
                                        style={{ width: `${((Math.floor(parseDuration(currentLesson.duration || "0:00") * 0.8) - timeLeft) / Math.floor(parseDuration(currentLesson.duration || "0:00") * 0.8)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-white/50 tracking-widest">{currentLesson.duration}</span>
                            </div>
                        </div>

                        {/* Float Controls Overlay (UX Design) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                disabled={!prevLesson} 
                                className="text-white hover:bg-white/10"
                                onClick={() => prevLesson && navigate(ROUTES.LEARNER_LESSON.replace(':courseId', course.id).replace(':lessonId', prevLesson.id))}
                            >
                                <HiChevronLeft /> Prev
                            </Button>
                            <div className="h-4 w-px bg-white/20 mx-1" />
                            <span className="text-xs text-white px-2">Lesson {currentLessonIndex + 1} of {flatLessons.length}</span>
                            <div className="h-4 w-px bg-white/20 mx-1" />
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                disabled={!nextLesson} 
                                className="text-white hover:bg-white/10"
                                onClick={() => nextLesson && navigate(ROUTES.LEARNER_LESSON.replace(':courseId', course.id).replace(':lessonId', nextLesson.id))}
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
                                    <p className="text-text-secondary leading-relaxed">
                                        In this lesson, we cover the core concepts of enterprise-grade software architecture.
                                        Focus on the separation of concerns and the layout system we implemented.
                                    </p>
                                    <div className="bg-surface-muted rounded-xl p-4 border border-surface-border">
                                        <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                                            <HiBookmark className="text-amber-500" /> Key Takeaways
                                        </h4>
                                        <ul className="text-sm text-text-secondary space-y-2 list-disc pl-5">
                                            <li>Scalability is about modular folder structures.</li>
                                            <li>Redux Toolkit simplifies complex state management.</li>
                                            <li>Consistent UI components improve developer speed and UX.</li>
                                        </ul>
                                    </div>
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
                        {course.curriculum.map((module, i) => (
                            <div key={i} className="border-b border-surface-border">
                                <div className="bg-surface-muted/30 px-4 py-3 flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-text-secondary uppercase">Module {i + 1}: {module.title}</h4>
                                </div>
                                <div className="divide-y divide-surface-border">
                                    {module.lessons.map((lesson, j) => {
                                        const active = lesson.id === parseInt(lessonId);
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => {
                                                    if (lesson.type === 'quiz') {
                                                        navigate(ROUTES.LEARNER_QUIZ_ATTEMPT.replace(':id', lesson.id));
                                                    } else {
                                                        navigate(ROUTES.LEARNER_LESSON.replace(':courseId', course.id).replace(':lessonId', lesson.id));
                                                    }
                                                }}
                                                className={clsx(
                                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all group/item",
                                                    active ? "bg-indigo-50" : "hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="relative">
                                                    {lesson.completed ? (
                                                        <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                                                    ) : (
                                                        <div className={clsx(
                                                            "w-5 h-5 rounded-full border-2",
                                                            active ? "border-indigo-600 bg-indigo-50" : "border-slate-200"
                                                        )} />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <p className={clsx(
                                                        "text-xs font-bold truncate",
                                                        active ? "text-indigo-600" : "text-slate-700"
                                                    )}>
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {lesson.type === 'quiz' ? (
                                                            <HiAcademicCap className="w-3 h-3 text-indigo-400" />
                                                        ) : (
                                                            <HiPlay className="w-3 h-3 text-slate-300" />
                                                        )}
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {lesson.type === 'quiz' ? `${lesson.questions} Questions` : lesson.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
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
