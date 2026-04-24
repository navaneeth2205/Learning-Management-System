import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    HiTerminal, HiSearch, HiFilter, HiTrash,
    HiDatabase, HiShieldCheck, HiCog, HiExclamationCircle,
    HiChevronRight, HiDownload, HiCalendar, HiKey,
    HiUser, HiOutlineShieldCheck, HiDotsVertical,
    HiEye
} from 'react-icons/hi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Table, Thead, Tbody, Th, Tr, Td } from '../../components/ui/Table';
import Select from '../../components/ui/Select';

const SOURCE_CONFIG = {
    auth: { color: 'bg-violet-100 text-violet-700', icon: HiKey },
    system: { color: 'bg-slate-100 text-slate-700', icon: HiCog },
    mod: { color: 'bg-blue-100 text-blue-700', icon: HiUser },
    security: { color: 'bg-rose-100 text-rose-700', icon: HiOutlineShieldCheck },
};

const PRIORITY_CONFIG = {
    low: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    medium: { color: 'text-amber-700 bg-amber-50 border-amber-200' },
    high: { color: 'text-rose-700 bg-rose-50 border-rose-200' },
};

const INITIAL_LOGS = [
    { id: 1, type: 'auth', event: 'Failed login attempt', user: 'anonymous', ip: '192.168.1.1', time: '2m ago', severity: 'medium' },
    { id: 2, type: 'system', event: 'Database replication complete', user: 'SYSTEM', ip: 'internal', time: '15m ago', severity: 'low' },
    { id: 3, type: 'mod', event: 'Course #8542 published', user: 'admin_sarah', ip: '10.0.4.22', time: '1h ago', severity: 'low' },
    { id: 4, type: 'security', event: 'API Key regenerated', user: 'super_admin', ip: '10.0.0.1', time: '3h ago', severity: 'high' },
    { id: 5, type: 'auth', event: 'User account locked', user: 'learner_bob', ip: '92.44.1.2', time: '5h ago', severity: 'medium' },
    { id: 6, type: 'system', event: 'Server health check passed', user: 'SYSTEM', ip: 'internal', time: '6h ago', severity: 'low' },
    { id: 7, type: 'security', event: 'Suspicious IP blocked', user: 'SYSTEM', ip: '45.22.11.9', time: '8h ago', severity: 'high' },
];

export default function SystemLogs() {
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [search, setSearch] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('All');
    const [filterSource, setFilterSource] = useState('All');

    const filtered = useMemo(() => logs.filter(log => {
        const matchSearch = log.event.toLowerCase().includes(search.toLowerCase()) ||
            log.user.toLowerCase().includes(search.toLowerCase()) ||
            log.ip.toLowerCase().includes(search.toLowerCase());
        const matchSeverity = filterSeverity === 'All' || log.severity === filterSeverity;
        const matchSource = filterSource === 'All' || log.type === filterSource;
        return matchSearch && matchSeverity && matchSource;
    }), [logs, search, filterSeverity, filterSource]);

    const stats = [
        { label: 'Total Logs', value: logs.length, icon: HiTerminal, color: 'bg-slate-100 text-slate-600' },
        { label: 'Security Alerts', value: logs.filter(l => l.type === 'security').length, icon: HiOutlineShieldCheck, color: 'bg-rose-50 text-rose-600' },
        { label: 'Failed Logins', value: logs.filter(l => l.event.includes('Failed login')).length, icon: HiKey, color: 'bg-amber-50 text-amber-600' },
        { label: 'System Events', value: logs.filter(l => l.type === 'system').length, icon: HiDatabase, color: 'bg-blue-50 text-blue-600' },
    ];

    const handleClearLogs = () => {
        setLogs([]);
        toast.success("All logs cleared successfully.");
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header + Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif italic">System Audit logs</h1>
                    <p className="text-slate-500">Immutable record of platform activity and security events.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={<HiDownload />} onClick={() => toast.success("Downloading CSV Export...")}>Export CSV</Button>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white border-none" icon={<HiTrash />} onClick={handleClearLogs}>Clear Logs</Button>
                </div>
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
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="relative flex-1 max-w-md">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search events, users, or IP addresses..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                    />
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                    <div className="w-32">
                        <Select
                            value={filterSeverity}
                            onChange={setFilterSeverity}
                            options={[
                                { label: 'Priority', value: 'All' },
                                { label: 'Low', value: 'low' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'High', value: 'high' },
                            ]}
                        />
                    </div>
                    <div className="w-32">
                        <Select
                            value={filterSource}
                            onChange={setFilterSource}
                            options={[
                                { label: 'Source', value: 'All' },
                                ...Object.keys(SOURCE_CONFIG).map(s => ({ label: s.toUpperCase(), value: s }))
                            ]}
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="text-xs bg-slate-50 border-slate-200 h-9"
                        icon={<HiCalendar />}
                        onClick={() => toast('Date range filtering will be available shortly!', { icon: '📅' })}
                    >
                        Date Range
                    </Button>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                    <Thead>
                        <Th>Time</Th>
                        <Th>Priority</Th>
                        <Th>Source</Th>
                        <Th>Event Description</Th>
                        <Th>User</Th>
                        <Th>IP Address</Th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </Thead>
                    <Tbody>
                        {filtered.length === 0 ? (
                            <Tr>
                                <Td colSpan={7} className="text-center py-8 text-slate-500">No logs match your filters.</Td>
                            </Tr>
                        ) : filtered.map(log => {
                            const srcCfg = SOURCE_CONFIG[log.type];
                            const sevCfg = PRIORITY_CONFIG[log.severity];
                            const SrcIcon = srcCfg?.icon || HiTerminal;

                            return (
                                <Tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <Td><span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{log.time}</span></Td>
                                    <Td>
                                        <Badge className={`text-[10px] font-black tracking-wider uppercase border px-2 py-0.5 rounded-md ${sevCfg?.color}`}>
                                            {log.severity}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${srcCfg?.color}`}>
                                            <SrcIcon className="w-4 h-4" />
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{log.event}</span>
                                    </Td>
                                    <Td><code className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{log.user}</code></Td>
                                    <Td><span className="text-xs text-slate-500 font-mono tracking-tight">{log.ip}</span></Td>
                                    <Td className="text-right">
                                        <button
                                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                            onClick={() => toast.success(`Viewing log trace for Event ${log.id}`)}
                                        >
                                            <HiEye className="w-5 h-5" />
                                        </button>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Showing {filtered.length} of {logs.length} entries</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded-lg opacity-50 cursor-not-allowed">Previous</button>
                        <button className="px-3 py-1 text-xs font-bold text-white bg-violet-600 rounded-lg">1</button>
                        <button className="px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">2</button>
                        <button className="px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
