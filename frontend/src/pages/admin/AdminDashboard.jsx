import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    HiUsers, HiAcademicCap, HiCollection, HiTrendingUp,
    HiShieldCheck, HiBell, HiExclamation, HiCheckCircle,
    HiCurrencyDollar, HiLightningBolt, HiChevronRight, HiTerminal,
    HiDotsHorizontal, HiFire, HiDotsVertical
} from 'react-icons/hi';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
    LineChart, Line
} from 'recharts';

import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import clsx from 'clsx';

// Simple CountUp Component
const CountUp = ({ end, duration = 1000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);
    return <span>{count}</span>;
};

export default function AdminDashboard() {
    const { user } = useSelector(s => s.auth);
    const navigate = useNavigate();
    const [logs, setLogs] = useState([
        { id: 1, text: 'SEC_AUDIT: Success - Root access verified', time: '12:04:22' },
        { id: 2, text: 'DB_SYNC: Cluster 04 synchronized', time: '12:04:25' },
        { id: 3, text: 'AUTH_SRV: New token issued (0x...82f6)', time: '12:04:28' },
        { id: 4, text: 'LMS_API: GET /v1/analytics - 200 OK', time: '12:04:30' },
    ]);
    const logScrollRef = useRef(null);

    // Simulated log stream
    useEffect(() => {
        const interval = setInterval(() => {
            setLogs(prev => [...prev.slice(-9), {
                id: Date.now(),
                text: `SYS_EVENT: ${['NODE_OK', 'CACHE_HIT', 'PING_ACK', 'TASK_DONE'][Math.floor(Math.random() * 4)]} (200)`,
                time: new Date().toLocaleTimeString().split(' ')[0]
            }]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const kpis = [
        { label: 'Platform Users', value: 0, icon: HiUsers, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
        { label: 'System Uptime', value: 99.98, icon: HiLightningBolt, color: 'blue', suffix: '%', gradient: 'from-blue-500 to-indigo-600' },
        { label: 'Active Orgs', value: 124, icon: HiShieldCheck, color: 'violet', gradient: 'from-violet-500 to-purple-600' },
        { label: 'Daily Active Users', value: 8450, icon: HiTrendingUp, color: 'amber', prefix: '', gradient: 'from-amber-400 to-orange-500' },
    ];

    const healthData = Array.from({ length: 20 }).map((_, i) => ({
        time: i,
        load: 30 + Math.random() * 20,
        requests: 200 + Math.random() * 100
    }));

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Top Bar Health Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-8 shadow-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Normal Load</span>
                                </div>
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cluster 04: Active</span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-800 tracking-tighter leading-none">
                                Platform Command Center
                            </h1>
                            <div className="flex gap-4">
                                <Button size="sm" onClick={() => toast.success('System cache flushed successfully!')} className="bg-emerald-500 text-white border-none font-black text-[10px] uppercase tracking-widest shadow-md px-6">
                                    System Flush
                                </Button>
                                <Button size="sm" onClick={() => toast('Security log downloading...', { icon: '🛡️' })} variant="outline" className="border-gray-200 text-gray-800 hover:bg-gray-50 font-black text-[10px] uppercase tracking-widest px-6">
                                    Security Log
                                </Button>
                            </div>
                        </div>
                        <div className="md:w-48 h-32 bg-gray-50 rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Request Throughput</p>
                            <div className="h-12 flex items-end gap-1 px-1">
                                {[4, 7, 3, 9, 5, 8, 4, 6, 10].map((h, i) => (
                                    <div key={i} className="flex-1 bg-emerald-500/40 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                                ))}
                            </div>
                            <p className="text-xl font-black text-gray-800 font-mono">1.2k<span className="text-xs text-gray-400 ml-1">r/s</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md flex flex-col justify-between group overflow-hidden relative">
                    <HiShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-rose-500/5 rotate-12 group-hover:rotate-6 transition-transform" />
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Audit Status</p>
                        <h3 className="text-2xl font-black text-gray-800 mb-1">Threat Defense</h3>
                        <p className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                            <HiCheckCircle /> No vulnerabilities
                        </p>
                    </div>
                    <div className="space-y-3 mt-6">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-full shadow-md" />
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Secure Score</span>
                            <span className="text-gray-800">100/100</span>
                        </div>
                    </div>
                    <button onClick={() => toast.success('Scan complete. No vulnerabilities found.')} className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 transition-all">
                        Refresh Scan
                    </button>
                </div>
            </div>

            {/* Emerald Theme KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((k, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md hover-lift group relative overflow-hidden">
                        <div className={clsx('absolute -right-2 -top-2 w-16 h-16 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform bg-gradient-to-br', k.gradient)} />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white bg-gradient-to-br', k.gradient)}>
                                <k.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{k.label}</p>
                                <p className="text-2xl font-black text-gray-800">
                                    {k.prefix}<CountUp end={k.value} />{k.suffix}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* System Health Area Chart */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 tracking-tight">Backend Latency</h2>
                                <p className="text-sm font-medium text-gray-600">Global response times (ms) across clusters</p>
                            </div>
                            <button onClick={() => toast('Options menu opened', { icon: '⚙️' })} className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400">
                                <HiDotsHorizontal />
                            </button>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={healthData}>
                                    <defs>
                                        <linearGradient id="adminHealth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis hide />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="load"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#adminHealth)"
                                        animationDuration={3000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Live Terminal Log Feed */}
                    {/* Live Terminal Log Feed */}
                    <section className="bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden group">
                        <div className="relative z-10 flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                                    <HiTerminal className="text-indigo-600 w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-gray-800 font-black text-lg tracking-tight leading-none mb-1">Global Event Stream</h3>
                                    <p className="text-gray-400 text-xs font-semibold">Real-time system activity</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-emerald-700 text-[9px] font-black uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                        <div className="relative z-10 min-h-[220px] space-y-3 overflow-y-hidden overflow-y-auto no-scrollbar" ref={logScrollRef}>
                            {logs.map((log) => {
                                const parts = log.text.split(': ');
                                const tag = parts.length > 1 ? parts[0] : 'SYS';
                                const msg = parts.length > 1 ? parts.slice(1).join(': ') : log.text;

                                let tagColor = 'text-gray-600 bg-gray-100 border-gray-200';
                                if (tag.includes('SEC')) tagColor = 'text-rose-600 bg-rose-50 border-rose-200';
                                else if (tag.includes('DB') || tag.includes('NODE')) tagColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
                                else if (tag.includes('AUTH') || tag.includes('SYS')) tagColor = 'text-amber-600 bg-amber-50 border-amber-200';
                                else if (tag.includes('LMS') || tag.includes('PING') || tag.includes('TASK')) tagColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';

                                return (
                                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group/item border-b border-gray-100 last:border-0 pb-3 last:pb-0 font-mono animate-in slide-in-from-right-2 fade-in duration-300">
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-gray-400 font-bold text-[10px] tabular-nums">{log.time}</span>
                                            <span className={clsx("px-2 py-0.5 rounded border text-[9px] font-black tracking-widest uppercase", tagColor)}>{tag}</span>
                                        </div>
                                        <span className="text-gray-600 group-hover/item:text-indigo-600 transition-colors text-[11px] break-all sm:truncate leading-relaxed font-semibold">{msg}</span>
                                        <span className="text-gray-300 font-bold opacity-0 group-hover/item:opacity-100 uppercase text-[9px] tracking-tighter sm:ml-auto">ack_0x{log.id.toString(16).slice(-4)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
                    </section>
                </div>

                {/* Sidebar: System Alerts & Users */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Critical Alerts */}
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                                <HiExclamation className="text-amber-500" /> Maintenance
                            </h3>
                            <Badge color="amber">Action Required</Badge>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: 'Cluster 03 Scaling', desc: 'Auto-scaling triggered due to peak load', time: '5m ago', t: 'info' },
                                { title: 'Update Available', desc: 'Core Engine v2.4.1 ready for deployment', time: '1h ago', t: 'warning' },
                                { title: 'Daily Backup Done', desc: 'Snapshot stored in AWS region us-east-1', time: '2h ago', t: 'success' },
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                                    <div className={clsx(
                                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110',
                                        alert.t === 'warning' ? 'bg-amber-100 text-amber-600' :
                                            alert.t === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                    )}>
                                        <HiLightningBolt className="w-5 h-5" />
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); toast('Action menu opened', { icon: '⚙️' }); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <HiDotsVertical className="w-5 h-5" />
                                    </button>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-gray-800 truncate">{alert.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1 line-clamp-1">{alert.desc}</p>
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Regional Spotlight Widget */}
                    <div className="bg-primary-500 rounded-xl p-8 text-white shadow-md border border-gray-200 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                                <HiLightningBolt className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl tracking-tight mb-2">Regional Traffic</h3>
                                <p className="text-emerald-50 text-xs font-bold leading-relaxed mb-6 uppercase tracking-widest">
                                    Southeast Asia is experiencing a 112% surge in concurrent connections.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[88%] animate-pulse" />
                                </div>
                                <span className="text-[10px] font-black uppercase">88% Capacity</span>
                            </div>
                            <button onClick={() => toast.success('Infrastructure scaled: +2 Nodes in active region.')} className="w-full bg-white text-[#6d28d9] border-none hover:bg-slate-50 hover:text-[#5b21b6] font-black uppercase tracking-widest text-xs py-3 shadow-md rounded-xl transition-all">
                                Scale Infrastructure →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

