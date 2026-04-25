import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiLightningBolt, HiCheckCircle, HiPlay, HiQuestionMarkCircle,
    HiClock, HiChevronRight, HiLockClosed, HiTrendingUp,
    HiSparkles, HiSearch, HiX
} from 'react-icons/hi';
import Select from '../../components/ui/Select';
import clsx from 'clsx';
import { fetchMyQuizzes } from '../../services/learnerApi';

/* ─── Font helpers ─────────────────────────────────────────── */
const sora = { fontFamily: "'Sora', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

/* ─── Status config ────────────────────────────────────────── */
const STATUS = {
    available: {
        border: 'border-l-[4px] border-l-violet-500',
        pill: 'bg-violet-500/10 text-violet-600',
        glow: 'group-hover:ring-1 group-hover:ring-violet-200',
        iconBg: 'bg-violet-100 text-violet-600',
        Icon: HiPlay,
    },
    completed: {
        border: 'border-l-[4px] border-l-emerald-500',
        pill: 'bg-emerald-500/10 text-emerald-600',
        glow: 'group-hover:ring-1 group-hover:ring-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-600',
        Icon: HiCheckCircle,
    },
    upcoming: {
        border: 'border-l-[4px] border-l-amber-400',
        pill: 'bg-amber-500/10 text-amber-600',
        glow: 'group-hover:ring-1 group-hover:ring-amber-200',
        iconBg: 'bg-amber-100 text-amber-600',
        Icon: HiClock,
    },
    locked: {
        border: 'border-l-[4px] border-l-slate-300',
        pill: 'bg-slate-500/10 text-slate-500',
        glow: 'group-hover:ring-1 group-hover:ring-slate-200',
        iconBg: 'bg-slate-100 text-slate-400',
        Icon: HiLockClosed,
    },
};

const TABS = ['All', 'Available', 'Completed', 'Upcoming', 'Locked'];

const scoreBar = s => s >= 90 ? 'bg-emerald-500' : s >= 70 ? 'bg-amber-400' : 'bg-red-400';
const scoreTxt = s => s >= 90 ? 'text-emerald-600' : s >= 70 ? 'text-amber-600' : 'text-red-500';

/* ─── Data ─────────────────────────────────────────────────── */
const QUIZZES = [
    {
        id: 'q1', status: 'available',
        title: 'React Hooks Fundamentals',
        course: 'Advanced React Patterns',
        duration: '38m', questions: 10, passRate: 70, xp: 150,
        maxAttempts: 3, attemptsUsed: 1,
        desc: 'Master useState, useEffect, useReducer, and custom hooks with real-world scenarios.',
    },
    {
        id: 'q2', status: 'completed',
        title: 'Advanced Next.js Routing',
        course: 'Fullstack Next.js 14',
        duration: '45m', questions: 15, passRate: 80, xp: 200, score: 87,
        maxAttempts: 2, attemptsUsed: 2,
        desc: 'App router, server components, dynamic segments, and parallel routes.',
    },
    {
        id: 'q5', status: 'completed',
        title: 'CSS Grid & Flexbox Mastery',
        course: 'UI/UX Design Masterclass',
        duration: '20m', questions: 18, passRate: 70, xp: 180, score: 95,
        maxAttempts: 5, attemptsUsed: 1,
        desc: 'Responsive layouts, auto-fill/fit grids, alignment, and gap utilities.',
    },
    {
        id: 'q3', status: 'locked',
        title: 'GraphQL Security Basics',
        course: 'Backend API Design',
        duration: '28m', questions: 5, passRate: 60, xp: 120,
        requirement: 'Complete Module 3',
        desc: 'Authentication, depth limiting, rate-limiting, and query cost analysis.',
    },
    {
        id: 'q4', status: 'upcoming',
        title: 'State Management Masterclass',
        course: 'Advanced React Patterns',
        duration: '60m', questions: 20, passRate: 75, xp: 250,
        availableOn: 'May 1, 2026',
        desc: 'Redux Toolkit, Zustand, Jotai — when to use each and migration patterns.',
    },
];

/* ══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function LearnerQuizzes() {
    const [tab, setTab] = useState('All');
    const [search, setSearch] = useState('');
    const [course, setCourse] = useState('All Courses');
    const [diff, setDiff] = useState('All Difficulties');
    const [liveQuizzes, setLiveQuizzes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyQuizzes()
            .then(data => {
                if (data && data.length > 0) {
                    const mapped = data.map(q => ({
                        id: q._id,
                        status: q.status || 'available',
                        title: q.title,
                        course: q.courseId?.title || 'Course',
                        duration: `${q.timeLimit || 30}m`,
                        questions: q.questions?.length || 0,
                        passRate: q.passingScore || 70,
                        xp: (q.questions?.length || 5) * 15,
                        maxAttempts: 3,
                        attemptsUsed: q.attempts || 0,
                        score: q.score || undefined,
                        desc: `Quiz for ${q.courseId?.title || 'this course'}. ${q.questions?.length || 0} questions.`,
                    }));
                    setLiveQuizzes(mapped);
                }
            })
            .catch(() => {});
    }, []);

    const allQuizzes = liveQuizzes.length > 0 ? [...liveQuizzes, ...QUIZZES] : QUIZZES;
    const completed = allQuizzes.filter(q => q.status === 'completed');
    const avgScore = completed.length
        ? Math.round(completed.reduce((s, q) => s + (q.score || 0), 0) / completed.length)
        : 0;
    const totalXP = completed.reduce((s, q) => s + q.xp, 0);

    const visible = allQuizzes.filter(q => {
        const matchTab = tab === 'All' || q.status === tab.toLowerCase();
        const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
            q.course.toLowerCase().includes(search.toLowerCase());
        const matchCourse = course === 'All Courses' || q.course === course;
        return matchTab && matchSearch && matchCourse;
    });

    const availableGroup = visible.filter(q => q.status !== 'upcoming');
    const upcomingGroup = visible.filter(q => q.status === 'upcoming');

    const courses = ['All Courses', ...new Set(allQuizzes.map(q => q.course))];

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8" style={sora}>

            {/* ── Header ─────────────────────────────────────── */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    My Quizzes
                </h1>
                <p className="text-sm text-violet-600 font-semibold mt-1">
                    Test your knowledge and earn certifications.
                </p>
            </div>

            {/* ── Stats Banner ───────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: <HiCheckCircle className="w-5 h-5 text-emerald-500" />, label: 'Completed', value: completed.length, sub: `of ${QUIZZES.length} quizzes`, bg: 'from-emerald-50 to-white border-emerald-100' },
                    { icon: <HiTrendingUp className="w-5 h-5 text-violet-500" />, label: 'Avg Score', value: `${avgScore}%`, sub: 'pass mark: 70%', bg: 'from-violet-50 to-white border-violet-100' },
                    { icon: <HiSparkles className="w-5 h-5 text-amber-500" />, label: 'XP Earned', value: `+${totalXP}`, sub: 'this month', bg: 'from-amber-50 to-white border-amber-100' },
                ].map(s => (
                    <div key={s.label}
                        className={`bg-gradient-to-br ${s.bg} border rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-2xl font-bold text-slate-900 leading-none mt-0.5" style={mono}>{s.value}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Controls ───────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 flex-wrap">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${tab === t
                                ? 'bg-white text-violet-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search quizzes…"
                        className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all placeholder-slate-400 font-medium"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <HiX className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="w-full sm:w-64">
                    <Select
                        value={course}
                        onChange={setCourse}
                        options={courses.map(c => ({ label: c, value: c }))}
                        className="font-semibold !h-10"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select
                        value={diff}
                        onChange={setDiff}
                        options={[
                            { label: 'All Difficulties', value: 'All Difficulties' },
                            { label: 'Beginner', value: 'Beginner' },
                            { label: 'Intermediate', value: 'Intermediate' },
                            { label: 'Advanced', value: 'Advanced' }
                        ]}
                        className="font-semibold !h-10"
                    />
                </div>
            </div>

            {/* ── Empty State ────────────────────────────────── */}
            {visible.length === 0 && (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
                    <HiQuestionMarkCircle className="w-12 h-12 mx-auto text-slate-200" />
                    <p className="font-bold text-slate-400">No quizzes found matching your criteria.</p>
                </div>
            )}

            {/* ── AVAILABLE section ──────────────────────────── */}
            {availableGroup.length > 0 && (
                <section className="space-y-4">
                    <SectionLabel>Available Assessments</SectionLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {availableGroup.map(q => <QuizCard key={q.id} quiz={q} navigate={navigate} />)}
                    </div>
                </section>
            )}

            {/* ── UPCOMING section ───────────────────────────── */}
            {upcomingGroup.length > 0 && (
                <section className="space-y-4">
                    <SectionLabel>Coming Soon</SectionLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {upcomingGroup.map(q => <QuizCard key={q.id} quiz={q} navigate={navigate} />)}
                    </div>
                </section>
            )}
        </div>
    );
}

/* ─── Section Label ────────────────────────────────────────── */
function SectionLabel({ children }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
                {children}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

/* ─── Quiz Card ────────────────────────────────────────────── */
function QuizCard({ quiz, navigate }) {
    const cfg = STATUS[quiz.status];
    const { Icon } = cfg;

    return (
        <div className={`
            group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col
            hover:-translate-y-1 hover:shadow-lg transition-all duration-300
            ${cfg.border} ${cfg.glow}
        `}>
            <div className="p-4 flex-1 space-y-4">

                {/* Top row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconBg} shadow-sm`}>
                            <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.pill}`}>
                            {quiz.status}
                        </span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold" style={mono}>
                        <HiClock className="w-3.5 h-3.5" />{quiz.duration}
                    </span>
                </div>

                {/* Title + course */}
                <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-snug">
                        {quiz.title}
                    </h3>
                    <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mt-1">{quiz.course}</p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">{quiz.desc}</p>

                {/* Meta chips */}
                <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-2 border-t border-slate-50" style={mono}>
                    <span className="flex items-center gap-1">
                        <HiQuestionMarkCircle className="w-3.5 h-3.5 text-slate-300" />
                        {quiz.questions} Qs
                    </span>
                    <span className="flex items-center gap-1">
                        <HiLightningBolt className="w-3.5 h-3.5 text-amber-400" />
                        {quiz.passRate}%
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-violet-500 font-bold">
                        <HiSparkles className="w-3.5 h-3.5" />
                        +{quiz.xp}
                    </span>
                </div>

                {/* Score bar (completed) */}
                {quiz.status === 'completed' && (
                    <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold">YOUR PERFORMANCE</span>
                            <span className={`font-black tracking-tighter ${scoreTxt(quiz.score)}`} style={mono}>{quiz.score}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                            <div
                                className={`h-full rounded-full transition-all ${scoreBar(quiz.score)} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                                style={{ width: `${quiz.score}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Unlock date (upcoming) */}
                {quiz.status === 'upcoming' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100/50 flex items-center gap-3">
                        <HiClock className="w-4 h-4 text-amber-500" />
                        <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider" style={mono}>
                            Available on — {quiz.availableOn}
                        </p>
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
                {quiz.status === 'available' && (
                    <button
                        onClick={() => navigate(`/learner/quiz/${quiz.id}/attempt`)}
                        className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-100 active:scale-[0.98]"
                    >
                        Start Quiz <HiChevronRight className="w-4 h-4" />
                    </button>
                )}
                {quiz.status === 'completed' && (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => navigate(`/learner/quiz/${quiz.id}/results`)}
                            className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-emerald-100 active:scale-[0.98]"
                        >
                            Review
                        </button>
                        <button
                            disabled={quiz.attemptsUsed >= quiz.maxAttempts}
                            onClick={() => navigate(`/learner/quiz/${quiz.id}/attempt`)}
                            className={clsx(
                                "py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]",
                                quiz.attemptsUsed >= quiz.maxAttempts 
                                    ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-60" 
                                    : "border-slate-100 hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            {quiz.attemptsUsed >= quiz.maxAttempts ? 'Attempts Exhausted' : 'Retake'}
                        </button>
                    </div>
                )}
                {quiz.status === 'locked' && (
                    <button
                        disabled
                        className="w-full py-2 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-100 cursor-not-allowed"
                    >
                        <HiLockClosed className="w-3.5 h-3.5" /> {quiz.requirement}
                    </button>
                )}
                {quiz.status === 'upcoming' && (
                    <button
                        disabled
                        className="w-full py-2 rounded-xl bg-slate-50 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-100 cursor-not-allowed"
                    >
                        Coming Soon
                    </button>
                )}
            </div>
        </div>
    );
}
