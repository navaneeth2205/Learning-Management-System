import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    HiDocumentReport, HiPlus, HiDownload, HiShare,
    HiCalendar, HiDotsVertical, HiSearch, HiFilter,
    HiCurrencyDollar, HiChartBar, HiBookOpen,
    HiShieldCheck, HiDatabase, HiX, HiDocumentText,
    HiRefresh, HiArchive, HiCheckCircle, HiClock
} from 'react-icons/hi';
import Button from '../../components/ui/Button';

const CATEGORY_CONFIG = {
    Financial: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: HiCurrencyDollar, dot: 'bg-emerald-500' },
    Engagement: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: HiChartBar, dot: 'bg-blue-500' },
    Content: { color: 'bg-violet-100 text-violet-700 border-violet-200', icon: HiBookOpen, dot: 'bg-violet-500' },
    Security: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: HiShieldCheck, dot: 'bg-rose-500' },
    Data: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: HiDatabase, dot: 'bg-amber-500' },
};

const FORMAT_CONFIG = {
    pdf: { color: 'bg-rose-50 text-rose-600 border-rose-200' },
    xlsx: { color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    json: { color: 'bg-amber-50 text-amber-600 border-amber-200' },
};

const STATUS_CONFIG = {
    ready: { color: 'bg-emerald-100 text-emerald-700', icon: HiCheckCircle, label: 'Ready' },
    processing: { color: 'bg-orange-100 text-orange-700', icon: HiClock, label: 'Processing' },
    archived: { color: 'bg-slate-100 text-slate-500', icon: HiArchive, label: 'Archived' },
};

const INITIAL_REPORTS = [
    { id: 1, name: 'Monthly Financial Statement', type: 'Financial', date: 'Oct 01, 2023', status: 'ready', format: 'pdf' },
    { id: 2, name: 'User Engagement Report Q3', type: 'Engagement', date: 'Sep 30, 2023', status: 'ready', format: 'xlsx' },
    { id: 3, name: 'Course Quality Audit', type: 'Content', date: 'Sep 15, 2023', status: 'ready', format: 'pdf' },
    { id: 4, name: 'Annual Security Assessment', type: 'Security', date: 'Jul 20, 2023', status: 'archived', format: 'pdf' },
    { id: 5, name: 'Custom Platform Export', type: 'Data', date: 'Just now', status: 'processing', format: 'json' },
];

export default function SystemReports() {
    const [reports] = useState(INITIAL_REPORTS);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterFormat, setFilterFormat] = useState('All');
    const [openMenuId, setOpenMenuId] = useState(null);

    const filtered = useMemo(() => reports.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === 'All' || r.type === filterCategory;
        const matchStatus = filterStatus === 'All' || r.status === filterStatus;
        const matchFormat = filterFormat === 'All' || r.format === filterFormat;
        return matchSearch && matchCategory && matchStatus && matchFormat;
    }), [reports, search, filterCategory, filterStatus, filterFormat]);

    const stats = [
        { label: 'Total Reports', value: reports.length, icon: HiDocumentReport, color: 'bg-violet-50 text-violet-600' },
        { label: 'Ready', value: reports.filter(r => r.status === 'ready').length, icon: HiCheckCircle, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Processing', value: reports.filter(r => r.status === 'processing').length, icon: HiRefresh, color: 'bg-orange-50 text-orange-600' },
        { label: 'Archived', value: reports.filter(r => r.status === 'archived').length, icon: HiArchive, color: 'bg-slate-100 text-slate-500' },
    ];

    const clearFilters = () => { setSearch(''); setFilterCategory('All'); setFilterStatus('All'); setFilterFormat('All'); };
    const hasFilters = search || filterCategory !== 'All' || filterStatus !== 'All' || filterFormat !== 'All';

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900">Operational Reports</h1>
                    <p className="text-slate-500 text-sm">Generate and manage enterprise-grade platform insights.</p>
                </div>
                <button
                    onClick={() => toast.success('Generate New Report wizard opened!')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-md shadow-violet-200 transition-all hover:shadow-lg hover:shadow-violet-200 active:scale-95"
                >
                    <HiPlus className="w-4 h-4" /> Generate New Report
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(stat => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search + Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="relative flex-1 max-w-sm">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search reports..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Category */}
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="px-3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {Object.keys(CATEGORY_CONFIG).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {/* Status */}
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="ready">Ready</option>
                        <option value="processing">Processing</option>
                        <option value="archived">Archived</option>
                    </select>
                    {/* Format */}
                    <select
                        value={filterFormat}
                        onChange={e => setFilterFormat(e.target.value)}
                        className="px-3 py-2.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all cursor-pointer"
                    >
                        <option value="All">All Formats</option>
                        <option value="pdf">PDF</option>
                        <option value="xlsx">XLSX</option>
                        <option value="json">JSON</option>
                    </select>
                    {hasFilters && (
                        <button onClick={clearFilters} className="px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-50 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1.5">
                            <HiX className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Report Cards Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <HiDocumentText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No reports found</h3>
                    <p className="text-sm text-slate-400 mb-4">Try adjusting your search or filter criteria.</p>
                    <button onClick={clearFilters} className="text-sm font-bold text-violet-600 hover:text-violet-700 underline underline-offset-2">Clear all filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(report => {
                        const catCfg = CATEGORY_CONFIG[report.type] || CATEGORY_CONFIG.Data;
                        const fmtCfg = FORMAT_CONFIG[report.format] || FORMAT_CONFIG.pdf;
                        const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.archived;
                        const CatIcon = catCfg.icon;
                        const StatusIcon = statusCfg.icon;

                        return (
                            <div
                                key={report.id}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col gap-5 relative overflow-hidden group"
                            >
                                {/* Category color accent line at top */}
                                <div className={`absolute top-0 left-0 w-full h-1 ${catCfg.dot}`} />

                                {/* Processing progress bar */}
                                {report.status === 'processing' && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-orange-400 animate-pulse" />
                                )}

                                {/* Top row: Icon + Dots */}
                                <div className="flex items-start justify-between">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${catCfg.color}`}>
                                        <CatIcon className="w-5 h-5" />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}
                                            className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            <HiDotsVertical className="w-4 h-4" />
                                        </button>
                                        {openMenuId === report.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50">
                                                    <button onClick={() => { setOpenMenuId(null); toast.success(`Viewing details for ${report.name}`); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors flex items-center gap-2">
                                                        <HiDocumentReport className="w-3.5 h-3.5" /> View Details
                                                    </button>
                                                    <button onClick={() => { setOpenMenuId(null); toast('Report duplicated!', { icon: '📋' }); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors flex items-center gap-2">
                                                        <HiDocumentText className="w-3.5 h-3.5" /> Duplicate
                                                    </button>
                                                    <div className="my-1 border-t border-slate-100" />
                                                    <button onClick={() => { setOpenMenuId(null); toast('Report archived.', { icon: '📦' }); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2">
                                                        <HiArchive className="w-3.5 h-3.5" /> Archive
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Name + Badges */}
                                <div className="space-y-2">
                                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-violet-600 transition-colors line-clamp-2">{report.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Category badge */}
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${catCfg.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${catCfg.dot}`} />
                                            {report.type}
                                        </span>
                                        {/* Format badge */}
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${fmtCfg.color}`}>
                                            .{report.format}
                                        </span>
                                    </div>
                                </div>

                                {/* Date + Status */}
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                        <HiCalendar className="w-3.5 h-3.5" /> {report.date}
                                    </div>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusCfg.label}
                                    </span>
                                </div>

                                {/* Actions */}
                                {report.status === 'ready' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => toast.success(`Downloading ${report.name}...`)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300 transition-all"
                                        >
                                            <HiDownload className="w-3.5 h-3.5" /> Download
                                        </button>
                                        <button
                                            onClick={() => toast.success(`Share link copied for ${report.name}!`)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-600 hover:text-white transition-all"
                                        >
                                            <HiShare className="w-3.5 h-3.5" /> Share
                                        </button>
                                    </div>
                                )}
                                {report.status === 'processing' && (
                                    <div className="flex items-center gap-2 text-xs text-orange-600 font-semibold bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                                        <HiRefresh className="w-3.5 h-3.5 animate-spin" /> Generating report, please wait…
                                    </div>
                                )}
                                {report.status === 'archived' && (
                                    <button
                                        onClick={() => toast('Report restored from archive!', { icon: '📂' })}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                                    >
                                        <HiArchive className="w-3.5 h-3.5" /> Restore from Archive
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
