import {
    HiTrendingUp, HiUsers, HiCurrencyDollar, HiPresentationChartLine,
    HiClock, HiDownload, HiRefresh, HiSearch
} from 'react-icons/hi';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function PlatformAnalytics() {
    const growthData = [
        { month: 'Jan', completions: 45000, users: 1200 },
        { month: 'Feb', completions: 52000, users: 1500 },
        { month: 'Mar', completions: 48000, users: 1400 },
        { month: 'Apr', completions: 61000, users: 1800 },
        { month: 'May', completions: 75000, users: 2200 },
        { month: 'Jun', completions: 89000, users: 2800 },
    ];

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary text-slate-900 font-mono tracking-tighter">Platform Intelligence</h1>
                    <p className="text-text-secondary">Enterprise-wide analytics and performance tracking.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={<HiDownload />}>Export Data</Button>
                    <Button className="bg-primary-600 hover:bg-primary-700 text-white border-none" icon={<HiRefresh />}>Refresh</Button>
                </div>
            </div>

            {/* High-Level KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Annual Completions', value: '854,200', change: '+24%', color: 'emerald', icon: HiTrendingUp },
                    { label: 'Active Learners', value: '12.5k', change: '+18%', color: 'blue', icon: HiUsers },
                    { label: 'Course Catalog', value: '450', change: '+5', color: 'purple', icon: HiPresentationChartLine },
                    { label: 'Avg. Retention', value: '78%', change: '+2%', color: 'amber', icon: HiTrendingUp },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-white p-6 rounded-2xl border border-surface-border shadow-card space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center`}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                            <Badge color={kpi.change.startsWith('+') ? 'green' : 'red'}>{kpi.change}</Badge>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue/User Area Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-surface-border shadow-card space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Completions & User Growth</h2>
                        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                            <button className="px-3 py-1 text-xs font-bold text-slate-900 bg-white rounded shadow-sm">Completions</button>
                            <button className="px-3 py-1 text-xs font-bold text-slate-400">Users</button>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#growthGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance by Category */}
                <div className="bg-white p-8 rounded-3xl border border-surface-border shadow-card space-y-8">
                    <h2 className="text-xl font-bold text-slate-900">Course Category Performance</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Tech', val: 85 },
                                { name: 'Design', val: 65 },
                                { name: 'Biz', val: 45 },
                                { name: 'Health', val: 30 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontStyle: 'bold' }} />
                                <Bar dataKey="val" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
