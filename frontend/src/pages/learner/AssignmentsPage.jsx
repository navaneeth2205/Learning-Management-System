import { useState, useRef, useEffect } from 'react';
import {
    HiSearch, HiClock, HiPaperClip,
    HiChevronRight, HiExternalLink, HiCheckCircle,
    HiTrendingUp, HiBadgeCheck, HiPlus, HiX,
    HiUpload, HiLightBulb
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import clsx from 'clsx';
import { fetchMyAssignments, submitAssignment } from '../../services/learnerApi';

/* ─── Font helpers ─────────────────────────────────────────── */
const sora = { fontFamily: "'Sora', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

/* ─── Status Colors ────────────────────────────────────────── */
const STATUS_CFG = {
    submitted: {
        border: 'border-l-emerald-500',
        pill: 'bg-emerald-50 text-emerald-600',
        iconBg: 'bg-emerald-100 text-emerald-600',
        actionBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        gradeTxt: 'text-emerald-600',
    },
    active: {
        border: 'border-l-amber-500',
        pill: 'bg-amber-50 text-amber-600',
        iconBg: 'bg-amber-100 text-amber-600',
        actionBg: 'bg-indigo-600 text-white shadow-indigo-100',
        deadlineTxt: 'text-amber-600',
    },
    evaluated: {
        border: 'border-l-sky-500',
        pill: 'bg-sky-50 text-sky-600',
        iconBg: 'bg-sky-100 text-sky-600',
        actionBg: 'bg-slate-100 text-slate-700 border-slate-200',
        gradeTxt: 'text-sky-600',
    }
};

/* ─── Data ─────────────────────────────────────────────────── */
const INITIAL_ASSIGNMENTS = [
    {
        id: '001',
        title: 'React Hooks Deep Dive — Final Project',
        course: 'Advanced React Patterns',
        desc: 'Build a custom hook library handling complex form validation and persistent local storage sync.',
        status: 'evaluated',
        dueDate: 'Oct 15, 2026',
        lastActive: '2h ago',
        attachments: 2,
        files: ['Project_Brief.pdf', 'Hook_Core_Specs.md'],
        grade: 'A+',
    },
    {
        id: '002',
        title: 'Next.js App Router Migration',
        course: 'Fullstack Next.js 14',
        desc: 'Migrate a Pages Router app to App Router using React Server Components and streaming SSR.',
        status: 'active',
        dueDate: 'Nov 3, 2026',
        lastActive: '5h ago',
        attachments: 0,
        files: [],
        deadline: '3 days left',
    },
    {
        id: '003',
        title: 'State Management with Zustand',
        course: 'Advanced React Patterns',
        desc: 'Refactor a Redux-heavy app to Zustand with slices, devtools integration, and persist middleware.',
        status: 'active',
        dueDate: 'Nov 10, 2026',
        lastActive: '1d ago',
        attachments: 1,
        files: ['Zustand_Architecture_Diagram.png'],
        deadline: '15 days left',
    },
    {
        id: '004',
        title: 'REST API Design with Express',
        course: 'Backend API Design',
        desc: 'Design a fully RESTful API with JWT auth, rate limiting, versioning, and OpenAPI documentation.',
        status: 'evaluated',
        dueDate: 'Sep 20, 2026',
        lastActive: '3d ago',
        attachments: 4,
        files: ['API_Specs.pdf', 'Auth_Flow_Chart.png', 'Rate_Limiting_Best_Practices.pdf', 'Seed_Data.zip'],
        grade: 'B+',
    },
    {
        id: '005',
        title: 'Microservices Architecture with Docker',
        course: 'Cloud Native Development',
        desc: 'Containerize a multi-service app and orchestrate with Docker Compose, handling network and volume configuration.',
        status: 'submitted',
        dueDate: 'Oct 28, 2026',
        lastActive: '12m ago',
        attachments: 3,
        files: ['Docker_Compose_Basics.pdf', 'Service_Network_Graph.svg', 'Volume_Migration_Guide.md'],
    }
];

const TABS = ['All', 'Submitted', 'Active', 'Evaluated'];

/* ══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function AssignmentsPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchMyAssignments()
            .then(data => {
                if (data && data.length > 0) {
                    const mapped = data.map((a, i) => {
                        const dueDate = a.deadline ? new Date(a.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                        const now = new Date();
                        const deadlineDate = new Date(a.deadline);
                        const daysLeft = Math.max(0, Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)));
                        return {
                            id: a._id || String(i + 1).padStart(3, '0'),
                            title: a.title,
                            course: a.courseId?.title || 'Unknown Course',
                            desc: a.description || '',
                            status: a.status === 'graded' ? 'evaluated' : a.status === 'submitted' ? 'submitted' : 'active',
                            dueDate,
                            lastActive: daysLeft > 0 ? `${daysLeft}d left` : 'Overdue',
                            attachments: 0,
                            files: [],
                            grade: a.grade != null ? (a.grade >= 90 ? 'A+' : a.grade >= 80 ? 'A' : a.grade >= 70 ? 'B+' : a.grade >= 60 ? 'B' : 'C') : undefined,
                            deadline: daysLeft > 0 ? `${daysLeft} days left` : 'Overdue',
                            points: a.points || 100,
                        };
                    });
                    setAssignments(prev => [...mapped, ...prev]);
                }
            })
            .catch(() => { /* keep mock data */ });
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
        // Reset input value to allow re-selecting the same file if needed
        e.target.value = '';
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const filtered = assignments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.course.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === 'All' || a.status === activeTab.toLowerCase();
        return matchesSearch && matchesTab;
    });

    const stats = [
        { label: 'DONE', value: assignments.filter(a => a.status === 'submitted').length, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
        { label: 'ACTIVE', value: assignments.filter(a => a.status === 'active').length, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
        { label: 'GRADED', value: assignments.filter(a => a.status === 'evaluated').length, color: 'text-sky-500', bg: 'bg-sky-50 border-sky-100' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8" style={sora}>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Header ───────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                            MY WORKSPACE
                        </p>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Assignments
                        </h1>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3">
                        {stats.map(s => (
                            <div key={s.label} className={`bg-white border ${s.bg} rounded-2xl p-3 px-5 min-w-[100px] text-center shadow-sm`}>
                                <p className={`text-xl font-black ${s.color}`} style={mono}>{s.value}</p>
                                <p className={`text-[9px] font-black tracking-widest mt-0.5 text-slate-400`}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Controls ─────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-center gap-4 py-6 border-y border-slate-200/60">
                    <div className="relative w-full sm:w-64">
                        <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search assignments..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder-slate-400 font-medium"
                        />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                                    activeTab === tab ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => toast.success('Assistance requested. Our instructors will reach out via the message inbox shortly.')}
                        className="sm:ml-auto flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-white transition-all border border-indigo-100 shadow-sm"
                    >
                        + Need Help? <HiExternalLink className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Workspace Area ───────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* List */}
                    <div className="lg:col-span-2 space-y-4">
                        {filtered.map(a => (
                            <AssignmentRow
                                key={a.id}
                                a={a}
                                isSelected={selectedAssignment?.id === a.id}
                                onSelect={() => setSelectedAssignment(a)}
                            />
                        ))}

                        {filtered.length === 0 && (
                            <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
                                <HiSearch className="w-10 h-10 mx-auto text-slate-200" />
                                <p className="font-bold text-slate-400 uppercase tracking-widest text-[11px]">No assignments found</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Panel / Help */}
                    <div className="space-y-6">
                        {selectedAssignment ? (
                            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-indigo-100/30 animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                                <div className="flex items-center justify-between">
                                    <Badge color="blue" variant="glass" className="font-black text-[9px] uppercase tracking-widest">Selected Draft</Badge>
                                    <button onClick={() => setSelectedAssignment(null)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><HiX className="w-5 h-5" /></button>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedAssignment.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{selectedAssignment.desc}</p>
                                </div>

                                {/* Shared Resources */}
                                <div className="space-y-3 pt-6 border-t border-slate-50">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resources / Attachments</h4>
                                    <div className="space-y-2">
                                        {selectedAssignment.files && selectedAssignment.files.length > 0 ? (
                                            selectedAssignment.files.map((file, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group transition-all hover:bg-indigo-50 border border-transparent hover:border-indigo-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                                                            <HiPaperClip className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[140px]">{file}</span>
                                                    </div>
                                                    <button onClick={() => toast.success(`Downloading ${file}...`)} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700">Download</button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 font-medium italic ml-1">No additional resources shared.</p>
                                        )}
                                    </div>
                                </div>

                                {selectedAssignment.status === 'active' && (
                                    <div className="pt-6 border-t border-slate-50 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission URL / Repo</label>
                                            <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all" placeholder="https://github.com/alex/project" />
                                        </div>
                                        <div
                                            onClick={triggerFileInput}
                                            className="border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center cursor-pointer group hover:border-indigo-100 transition-colors"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept=".zip,.pdf,application/pdf,application/zip,application/x-zip-compressed"
                                                className="hidden"
                                            />
                                            <HiUpload className="w-8 h-8 mx-auto text-slate-200 group-hover:text-indigo-500 transition-colors mb-2" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                                {selectedFile ? (
                                                    <span className="text-indigo-600 flex flex-col items-center gap-1">
                                                        <HiPaperClip className="w-4 h-4" />
                                                        {selectedFile.name}
                                                    </span>
                                                ) : (
                                                    'Upload .ZIP or .PDF'
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                if (!selectedFile) {
                                                    toast.error('Please select a file first.');
                                                    return;
                                                }

                                                // Update assignment status
                                                setAssignments(prev => prev.map(a =>
                                                    a.id === selectedAssignment.id
                                                        ? { 
                                                            ...a, 
                                                            status: 'submitted', 
                                                            lastActive: 'Just now', 
                                                            attachments: (a.attachments || 0) + 1,
                                                            submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                          }
                                                        : a
                                                ));

                                                toast.success(`Work (${selectedFile.name}) submitted successfully!`);
                                                setSelectedFile(null);
                                                setSelectedAssignment(null); // Return to list view
                                                setActiveTab('Submitted'); // Switch to submitted tab to show result
                                            }}
                                            className="w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-100"
                                        >
                                            Submit Work
                                        </Button>
                                    </div>
                                )}

                                {selectedAssignment.status === 'submitted' && (
                                    <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                                        <div className="flex items-center gap-3 text-emerald-600">
                                            <HiCheckCircle className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Grade</span>
                                        </div>
                                        <p className="text-[11px] text-emerald-800/70 font-bold leading-relaxed">
                                            Your work was received on <b>{selectedAssignment.submittedAt || 'Oct 23, 2026'}</b>. You will be notified via broadcast once evaluation is complete.
                                        </p>
                                    </div>
                                )}

                                {selectedAssignment.status === 'evaluated' && (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                                            <div className="flex items-center gap-3 text-indigo-600">
                                                <HiBadgeCheck className="w-5 h-5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Instructor Feedback</span>
                                            </div>
                                            <p className="text-[11px] text-indigo-800/70 font-bold leading-relaxed italic">
                                                "Excellent understanding of async patterns. Your implementation of the custom hook was flawless, Alex!"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-8 shadow-xl shadow-indigo-100/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
                                <div className="relative space-y-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                        <HiLightBulb className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight leading-tight text-slate-900">Focus & Finish</h3>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                        Complete current assignments to unlock your next certification path. Select an item to start working.
                                    </p>
                                </div>
                                <div className="relative pt-6 border-t border-slate-50 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upcoming Milestone</span>
                                        <span className="text-[10px] font-black text-indigo-600" style={mono}>75%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                        <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)]" style={{ width: '75%' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Row Component ─────────────────────────────────────────── */
function AssignmentRow({ a, onSelect, isSelected }) {
    const cfg = STATUS_CFG[a.status];

    return (
        <div
            onClick={onSelect}
            className={clsx(
                "group bg-white rounded-[24px] border border-l-8 shadow-sm transition-all duration-500 cursor-pointer overflow-hidden",
                cfg.border,
                isSelected ? "shadow-xl shadow-indigo-100/50 -translate-x-2 border-indigo-400 ring-2 ring-indigo-50" : "hover:shadow-md hover:-translate-x-1 border-slate-50"
            )}
        >
            <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-300 tracking-wider" style={mono}>#{a.id}</span>
                        <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full ${cfg.pill}`}>
                            {a.status}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                            {a.title}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {a.course}
                        </p>
                    </div>

                    <div className="flex items-center gap-5 pt-4 border-t border-slate-50">
                        <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400" style={mono}>
                            <HiClock className="w-3.5 h-3.5 opacity-40" />
                            {a.lastActive.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400" style={mono}>
                            <HiPaperClip className="w-3.5 h-3.5 opacity-40" />
                            {a.attachments} FILES
                        </span>
                    </div>
                </div>

                {/* Score/Actions */}
                <div className="flex items-center gap-8 w-full md:w-auto md:border-l border-slate-50 md:pl-8 pt-4 md:pt-0">
                    <div className="text-right min-w-[80px]">
                        {a.grade ? (
                            <>
                                <p className={`text-4xl font-black ${cfg.gradeTxt} tracking-tighter`} style={mono}>{a.grade}</p>
                                <p className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">GRADE</p>
                            </>
                        ) : (
                            <>
                                <p className={`text-[11px] font-black ${cfg.deadlineTxt}`} style={mono}>{a.deadline}</p>
                                <p className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">DEADLINE</p>
                            </>
                        )}
                    </div>
                    <div className="flex items-center text-slate-200 group-hover:text-indigo-600 transition-colors">
                        <HiChevronRight className="w-6 h-6" />
                    </div>
                </div>

            </div>
        </div>
    );
}
