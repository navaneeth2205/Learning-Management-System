import { useState } from 'react';
import {
    HiTrendingUp, HiUsers, HiCursorClick, HiClock,
    HiDownload, HiSearch, HiRefresh
} from 'react-icons/hi';
import clsx from 'clsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area,
    LineChart, Line
} from 'recharts';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function CourseAnalytics() {
    const [activeTab, setActiveTab] = useState('Overview');

    const mainStats = [
        { label: 'Total Enrollment', value: '4,582', change: '+12%', icon: HiUsers, color: 'blue' },
        { label: 'Completion Rate', value: '68%', change: '+5%', icon: HiTrendingUp, color: 'emerald' },
        { label: 'Avg. Quiz Score', value: '82%', change: '-2%', icon: HiCursorClick, color: 'amber' },
        { label: 'Avg. Time spent', value: '14.2h', change: '+1h', icon: HiClock, color: 'purple' },
    ];

    const enrollmentData = [
        { week: 'W1', students: 120 },
        { week: 'W2', students: 240 },
        { week: 'W3', students: 180 },
        { week: 'W4', students: 450 },
        { week: 'W5', students: 380 },
        { week: 'W6', students: 600 },
    ];

    const engagementData = [
        { day: 'Mon', active: 310 },
        { day: 'Tue', active: 400 },
        { day: 'Wed', active: 390 },
        { day: 'Thu', active: 520 },
        { day: 'Fri', active: 480 },
        { day: 'Sat', active: 610 },
        { day: 'Sun', active: 300 },
    ];

    const retentionData = [
        { week: 'W1', returning: 95 },
        { week: 'W2', returning: 88 },
        { week: 'W3', returning: 85 },
        { week: 'W4', returning: 82 },
        { week: 'W5', returning: 78 },
        { week: 'W6', returning: 75 },
    ];

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary text-slate-900">Course Performance</h1>
                    <p className="text-text-secondary">Visualize and track student engagement across your portfolio.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-surface-border shadow-sm">
                    {['Overview', 'Engagement', 'Retention'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-5 py-2 text-sm font-bold rounded-lg transition-all",
                                activeTab === tab ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'Overview' ? (
                <>
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mainStats.map((s, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center`}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <span className={`text-xs font-bold ${s.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {s.change}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-text-primary">{s.value}</p>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Graph */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-surface-border shadow-card space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-text-primary">Enrollment Growth</h2>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" icon={<HiDownload />}>Export</Button>
                                    <Button size="sm" variant="outline" icon={<HiRefresh />}>Sync</Button>
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={enrollmentData}>
                                        <defs>
                                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorStudents)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Sidebar Metrics */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-indigo-100/50 space-y-6">
                                <h3 className="font-black text-lg text-slate-900 mb-2">Top Performing Course</h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Advanced React Patterns</p>
                                        <h4 className="font-bold text-sm text-slate-800">Active Learners: 1,240</h4>
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-4/5 rounded-full" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500">85% completion rate</p>
                                    </div>
                                    <Button fullWidth variant="outline" className="bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-100 rounded-xl font-bold shadow-sm">Deep Dive Details</Button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                                <h3 className="font-bold text-text-primary">Student Satisfaction</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Course Quality', score: 4.9 },
                                        { label: 'Instructor Feedback', score: 4.8 },
                                        { label: 'Assigned Work', score: 4.5 },
                                    ].map(m => (
                                        <div key={m.label} className="flex items-center justify-between">
                                            <span className="text-sm text-text-secondary">{m.label}</span>
                                            <span className="text-sm font-bold text-text-primary">{m.score}/5.0</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : activeTab === 'Engagement' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-surface-border shadow-card space-y-8">
                        <h2 className="text-xl font-bold text-text-primary">Active Students Daily</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={engagementData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="active" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                            <h3 className="font-bold text-text-primary">Engagement Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Videos Watched</span><span className="text-sm font-bold text-text-primary">12,450</span></div>
                                <div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Quizzes Done</span><span className="text-sm font-bold text-text-primary">3,210</span></div>
                                <div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Discussions</span><span className="text-sm font-bold text-text-primary">854</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-surface-border shadow-card space-y-8">
                        <h2 className="text-xl font-bold text-text-primary">Kept Learning (Retention)</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={retentionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="returning" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                            <h3 className="font-bold text-text-primary">Retention Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Finished Course</span><span className="text-sm font-bold text-emerald-600">68%</span></div>
                                <div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Left Course</span><span className="text-sm font-bold text-rose-600">12%</span></div>
                                <div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Returning Students</span><span className="text-sm font-bold text-indigo-600">85%</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
