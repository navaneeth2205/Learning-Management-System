import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    HiShieldCheck, HiUserGroup, HiLockClosed, HiPencilAlt,
    HiCheck, HiX, HiPlus, HiDotsHorizontal, HiDuplicate, HiTrash, HiBan
} from 'react-icons/hi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';

export default function RoleManagement() {
    const [openMenuId, setOpenMenuId] = useState(null);
    const roles = [
        {
            id: 1,
            name: 'System Admin',
            users: 5,
            permissions: ['Full Access', 'User Management', 'Billing', 'System Logs'],
            status: 'active'
        },
        {
            id: 2,
            name: 'Instructor',
            users: 124,
            permissions: ['Course Creation', 'Grading', 'Analytics', 'Student Interaction'],
            status: 'active'
        },
        {
            id: 3,
            name: 'Learner',
            users: 12500,
            permissions: ['Course Enrollment', 'Lessons', 'Quizzes', 'Personal Profile'],
            status: 'active'
        },
        {
            id: 4,
            name: 'Moderator',
            users: 12,
            permissions: ['Course Review', 'Content Flagging', 'Support Tickets'],
            status: 'active'
        }
    ];

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary text-slate-900">Roles & Permissions</h1>
                    <p className="text-text-secondary">Define and manage platform access levels and security policies.</p>
                </div>
                <Button icon={<HiPlus />} onClick={() => toast.success('Create Custom Role wizard opened!')}>Create Custom Role</Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-visible">
                    <Table>
                        <Thead>
                            <Th>Role Name</Th>
                            <Th>Users</Th>
                            <Th>Core Permissions</Th>
                            <Th>Status</Th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </Thead>
                        <Tbody>
                            {roles.map(role => (
                                <Tr key={role.id}>
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                                                <HiShieldCheck className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-text-primary">{role.name}</span>
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-1.5 font-medium text-text-secondary">
                                            <HiUserGroup className="w-4 h-4" /> {role.users.toLocaleString()}
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="flex flex-wrap gap-2 max-w-md">
                                            {role.permissions.map(p => (
                                                <span key={p} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-md border border-slate-200">
                                                    {p.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </Td>
                                    <Td>
                                        <Badge color="green" dot>Active</Badge>
                                    </Td>
                                    <Td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" icon={<HiLockClosed />} onClick={() => toast.success(`Editing permissions for ${role.name}`)}>Permissions</Button>
                                            <div className="relative">
                                                <button onClick={() => setOpenMenuId(openMenuId === role.id ? null : role.id)} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"><HiDotsHorizontal /></button>
                                                {openMenuId === role.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                                        <div className="absolute right-0 mt-1 w-44 bg-white border border-surface-border rounded-xl shadow-dropdown py-1.5 z-50 animate-fade-in origin-top-right">
                                                            <button onClick={() => { setOpenMenuId(null); toast.success(`Editing role: ${role.name}`); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2">
                                                                <HiPencilAlt className="w-4 h-4 text-text-muted" /> Edit Role
                                                            </button>
                                                            <button onClick={() => { setOpenMenuId(null); toast.success(`Cloned role: ${role.name}`); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2">
                                                                <HiDuplicate className="w-4 h-4 text-text-muted" /> Clone Role
                                                            </button>
                                                            <button onClick={() => { setOpenMenuId(null); toast(`${role.name} deactivated.`, { icon: '🚫' }); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors flex items-center gap-2">
                                                                <HiBan className="w-4 h-4 text-text-muted" /> Deactivate
                                                            </button>
                                                            <div className="my-1 border-t border-surface-border" />
                                                            <button onClick={() => { setOpenMenuId(null); toast.error(`Deleted role: ${role.name}`); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                                                <HiTrash className="w-4 h-4 text-red-500" /> Delete Role
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
                </div>

                {/* Security Audit Log Shortcut */}
                <div className="bg-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-card border border-surface-border border-l-4 border-l-violet-500">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-text-primary">Recent Permission Changes</h3>
                        <p className="text-text-secondary text-sm max-w-md">Track all changes made to role definitions and user assignments for compliance and safety.</p>
                    </div>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 px-8">View Security Audit</Button>
                </div>
            </div>
        </div>
    );
}
