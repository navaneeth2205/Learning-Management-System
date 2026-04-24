import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    HiSearch, HiFilter, HiDotsVertical, HiUserAdd,
    HiShieldCheck, HiMail, HiTrash, HiPencil,
    HiBadgeCheck, HiBan, HiUsers
} from 'react-icons/hi';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { ROLES } from '../../constants/roles';

export default function UserManagement() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [openMenuId, setOpenMenuId] = useState(null);

    const [users, setUsers] = useState([
        // Learners
        { id: 1, name: 'John Doe', email: 'john@example.com', role: ROLES.LEARNER, status: 'active', joined: '2023-10-12' },
        { id: 2, name: 'Mark Wilson', email: 'mark.w@example.com', role: ROLES.LEARNER, status: 'inactive', joined: '2023-11-05' },
        { id: 3, name: 'Alice Walker', email: 'alice.w@example.com', role: ROLES.LEARNER, status: 'active', joined: '2023-11-15' },
        { id: 4, name: 'Bob Marley', email: 'bob.m@example.com', role: ROLES.LEARNER, status: 'active', joined: '2023-12-01' },
        { id: 5, name: 'Charlie Brown', email: 'charlie.b@example.com', role: ROLES.LEARNER, status: 'active', joined: '2023-09-14' },
        // Instructors
        { id: 6, name: 'Dr. Sarah Smith', email: 'sarah.smith@eduverse.com', role: ROLES.INSTRUCTOR, status: 'active', joined: '2023-01-15' },
        { id: 7, name: 'Prof. James Bond', email: '007@eduverse.com', role: ROLES.INSTRUCTOR, status: 'active', joined: '2023-06-10' },
        { id: 8, name: 'Eve Carter', email: 'eve.c@eduverse.com', role: ROLES.INSTRUCTOR, status: 'inactive', joined: '2023-08-22' },
        { id: 9, name: 'Grace Hopper', email: 'grace.h@eduverse.com', role: ROLES.INSTRUCTOR, status: 'active', joined: '2023-04-12' },
        { id: 10, name: 'Alan Turing', email: 'alan.t@eduverse.com', role: ROLES.INSTRUCTOR, status: 'active', joined: '2023-02-18' },
        // Admins
        { id: 11, name: 'Admin Alex', email: 'admin@eduverse.com', role: ROLES.ADMIN, status: 'active', joined: '2022-05-20' },
        { id: 12, name: 'Admin Beatrice', email: 'bea@eduverse.com', role: ROLES.ADMIN, status: 'active', joined: '2022-11-11' },
        { id: 13, name: 'Admin Charles', email: 'charles@eduverse.com', role: ROLES.ADMIN, status: 'inactive', joined: '2023-01-09' },
        { id: 14, name: 'Admin Diana', email: 'diana@eduverse.com', role: ROLES.ADMIN, status: 'active', joined: '2023-03-22' },
        { id: 15, name: 'Admin Eric', email: 'eric@eduverse.com', role: ROLES.ADMIN, status: 'active', joined: '2023-07-30' },
    ]);

    const handleToggleStatus = (userId) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
        ));
        const user = users.find(u => u.id === userId);
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        toast(newStatus === 'inactive' ? `${user.name} deactivated.` : `${user.name} activated!`,
            { icon: newStatus === 'inactive' ? '🚫' : '✅' });
    };

    const handleDelete = (userId) => {
        const user = users.find(u => u.id === userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        setOpenMenuId(null);
        toast.error(`${user.name} removed from platform.`);
    };

    const handleEdit = (user) => toast.success(`Editing profile for ${user.name}`);
    const handleMessage = (user) => toast.success(`Opening message thread with ${user.name}`);
    const handleResetPassword = (user) => { setOpenMenuId(null); toast.success(`Password reset email sent to ${user.email}`); };

    const filtered = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginatedUsers = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
                    <p className="text-text-secondary">Oversee all platform participants, adjust permissions, and manage accounts.</p>
                </div>
                <Button onClick={() => toast.success('Add New User wizard opened!')} icon={<HiUserAdd />} className="bg-slate-900 text-white hover:bg-slate-800">Add New User</Button>
            </div>

            {/* Control Bar */}
            <div className="bg-white p-4 rounded-xl border border-surface-border shadow-card flex flex-col md:flex-row gap-4 items-center">
                <SearchBar
                    value={search}
                    onChange={(val) => { setSearch(val); setPage(1); }}
                    onClear={() => { setSearch(''); setPage(1); }}
                    placeholder="Search by name or email..."
                    className="w-full md:max-w-md"
                />
                <div className="flex gap-2 p-1 bg-surface-muted rounded-lg overflow-x-auto">
                    {['All', ROLES.LEARNER, ROLES.INSTRUCTOR, ROLES.ADMIN].map(role => (
                        <button
                            key={role}
                            onClick={() => { setRoleFilter(role); setPage(1); }}
                            className={clsx(
                                "px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap",
                                roleFilter === role ? "bg-white text-slate-900 shadow-sm" : "text-text-muted hover:text-text-primary"
                            )}
                        >
                            {role.toUpperCase()}s
                        </button>
                    ))}
                </div>
                <div className="flex-1" />
                <div className="relative">
                    <Button
                        variant="outline"
                        icon={<HiFilter className={showFilters ? 'text-violet-600' : ''} />}
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? '!border-violet-500 !bg-violet-50 !text-violet-700 ring-2 ring-violet-500/20' : ''}
                    >
                        More Filters
                    </Button>
                    {showFilters && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-surface-border p-4 z-20 animate-fade-in">
                            <h4 className="font-bold text-sm text-text-primary mb-3">Filter Options</h4>
                            <div className="space-y-4">
                                <Select
                                    label={<span className="text-[10px] uppercase font-bold text-text-muted">Status</span>}
                                    value={filterStatus}
                                    onChange={(val) => { setFilterStatus(val); setPage(1); }}
                                    options={[
                                        { label: 'All Statuses', value: 'all' },
                                        { label: 'Active', value: 'active' },
                                        { label: 'Inactive', value: 'inactive' }
                                    ]}
                                />
                                <Button size="sm" fullWidth className="bg-slate-900 text-white hover:bg-slate-800 shadow-md mt-2" onClick={() => setShowFilters(false)}>
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
                <Table>
                    <Thead>
                        <Th>User</Th>
                        <Th>Role</Th>
                        <Th>Status</Th>
                        <Th>Joined Date</Th>
                        <Th align="center">Actions</Th>
                    </Thead>
                    <Tbody>
                        {paginatedUsers.map(user => (
                            <Tr key={user.id}>
                                <Td>
                                    <div className="flex items-center gap-3">
                                        <Avatar name={user.name} size="sm" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-text-primary truncate">{user.name}</p>
                                            <p className="text-xs text-text-muted truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </Td>
                                <Td>
                                    <Badge color={
                                        user.role === ROLES.ADMIN ? 'purple' :
                                            user.role === ROLES.INSTRUCTOR ? 'blue' : 'gray'
                                    } className="font-bold uppercase text-[10px]">
                                        {user.role}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge color={user.status === 'active' ? 'green' : 'red'} dot>
                                        {user.status}
                                    </Badge>
                                </Td>
                                <Td className="text-sm text-text-secondary">{user.joined}</Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(user)} title="Edit" className="p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                            <HiPencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleMessage(user)} title="Message" className="p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                            <HiMail className="w-4 h-4" />
                                        </button>
                                        {user.status === 'active' ? (
                                            <button onClick={() => handleToggleStatus(user.id)} title="Deactivate" className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <HiBan className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleToggleStatus(user.id)} title="Activate" className="p-2 text-text-muted hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                <HiBadgeCheck className="w-4 h-4" />
                                            </button>
                                        )}
                                        <div className="relative">
                                            <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors">
                                                <HiDotsVertical className="w-4 h-4" />
                                            </button>
                                            {openMenuId === user.id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                                    <div className="absolute right-0 mt-1 w-44 bg-white border border-surface-border rounded-xl shadow-dropdown py-1.5 z-50 animate-fade-in origin-top-right">
                                                        <button onClick={() => { handleEdit(user); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2">
                                                            <HiPencil className="w-4 h-4 text-text-muted" /> Edit Profile
                                                        </button>
                                                        <button onClick={() => handleResetPassword(user)} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2">
                                                            <HiShieldCheck className="w-4 h-4 text-text-muted" /> Reset Password
                                                        </button>
                                                        <div className="my-1 border-t border-surface-border" />
                                                        <button onClick={() => handleDelete(user.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                                            <HiTrash className="w-4 h-4 text-red-500" /> Delete User
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <HiUsers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-text-primary">No users found</h3>
                        <p className="text-sm text-text-secondary">Adjust your filters or search terms.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}

// Utility for class merging locally if wanted, but I'll use template literals for simple ones
function clsx(...classes) {
    return classes.filter(Boolean).join(' ');
}
