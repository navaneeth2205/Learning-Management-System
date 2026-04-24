import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    HiShieldCheck, HiEye, HiCheck, HiX,
    HiExclamation, HiFilter, HiSearch, HiCollection
} from 'react-icons/hi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { Table, Th, Tr, Td, Thead, Tbody } from '../../components/ui/Table';

export default function CourseModeration() {
    const [courses, setCourses] = useState([
        {
            id: 1,
            title: 'Hacking the Mainframe with COBOL',
            instructor: 'Elliot Alderson',
            category: 'Security',
            submittedAt: '1h ago',
            risk: 'low'
        },
        {
            id: 2,
            title: 'Dark Web Trading 101',
            instructor: 'Unknown User',
            category: 'Finance',
            submittedAt: '3h ago',
            risk: 'high'
        },
        {
            id: 3,
            title: 'Introduction to Quantum Computing',
            instructor: 'Dr. Jane Smith',
            category: 'Science',
            submittedAt: 'Yesterday',
            risk: 'low'
        }
    ]);

    const handlePreview = (course) => toast(`Previewing: "${course.title}"`, { icon: '👁️' });

    const handleApprove = (id) => {
        const course = courses.find(c => c.id === id);
        setCourses(prev => prev.filter(c => c.id !== id));
        toast.success(`"${course.title}" approved and published!`);
    };

    const handleReject = (id) => {
        const course = courses.find(c => c.id === id);
        setCourses(prev => prev.filter(c => c.id !== id));
        toast.error(`"${course.title}" rejected and returned to instructor.`);
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary text-slate-900">Course Moderation</h1>
                    <p className="text-text-secondary">Review pending course submissions and flag potential policy violations.</p>
                </div>
                <div className="flex gap-2">
                    <Badge color="amber" size="lg" className="px-4 py-2 font-bold">12 Pending Review</Badge>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
                <Table>
                    <Thead>
                        <Th>Course Submission</Th>
                        <Th>Instructor</Th>
                        <Th>Category</Th>
                        <Th>Submitted</Th>
                        <Th>Risk Level</Th>
                        <th className="px-6 py-4 text-right">Moderator Actions</th>
                    </Thead>
                    <Tbody>
                        {courses.map(course => (
                            <Tr key={course.id}>
                                <Td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <HiCollection className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary text-sm">{course.title}</p>
                                            <p className="text-[10px] text-text-muted font-bold uppercase">ID: #{course.id}</p>
                                        </div>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <Avatar name={course.instructor} size="xs" />
                                        <span className="text-sm font-medium text-text-secondary">{course.instructor}</span>
                                    </div>
                                </Td>
                                <Td><Badge color="blue">{course.category}</Badge></Td>
                                <Td><span className="text-sm text-text-muted">{course.submittedAt}</span></Td>
                                <Td>
                                    <Badge color={course.risk === 'high' ? 'red' : 'green'} variant="soft">
                                        {course.risk.toUpperCase()}
                                    </Badge>
                                </Td>
                                <Td className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant="outline" icon={<HiEye />} onClick={() => handlePreview(course)}>Preview</Button>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none" icon={<HiCheck />} onClick={() => handleApprove(course.id)}>Approve</Button>
                                        <button onClick={() => handleReject(course.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><HiX /></button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </div>

            {/* Moderation Policies Callout */}
            <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                    <HiExclamation className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-rose-900">Security Warning</h3>
                    <p className="text-xs text-rose-700 leading-relaxed max-w-2xl">
                        Entries flagged as <b>High Risk</b> may contain unauthorized external links or copyright-infringing material. Please perform a manual deep-link audit before approving.
                    </p>
                </div>
            </div>
        </div>
    );
}
