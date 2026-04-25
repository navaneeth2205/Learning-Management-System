import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiSearch, HiFilter, HiCheck, HiX,
    HiDownload, HiExternalLink, HiChatAlt2,
    HiClock, HiUser
} from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import { fetchPendingSubmissions } from '../../services/instructorApi';
import toast from 'react-hot-toast';

export default function SubmissionsReview() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modalConfig, setModalConfig] = useState({ open: false, title: '', message: '' });
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingSubmission, setEditingSubmission] = useState(null);
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([
        {
            id: 1,
            student: { name: 'Alex Johnson', email: 'alex@example.com' },
            assignment: 'Design Case Study: FinTech App',
            course: 'UI/UX Design Masterclass',
            submittedAt: '2h ago',
            status: 'needs_grading',
            file: 'UX_Case_Study_v1.pdf'
        }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingSubmissions()
            .then(data => {
                if (data && data.length > 0) {
                    setSubmissions(data.map(s => ({
                        id: s._id || s.id,
                        student: { 
                            name: s.studentId?.name || 'Unknown Student', 
                            email: s.studentId?.email || 'student@example.com' 
                        },
                        assignment: s.assignmentId?.title || 'Assignment',
                        course: s.courseId?.title || 'Course',
                        submittedAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Today',
                        status: s.status || 'needs_grading',
                        grade: s.grade,
                        file: s.fileUrl || 'attachment.pdf'
                    })));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredSubmissions = submissions.filter(s => {
        const matchesSearch =
            s.student.name.toLowerCase().includes(search.toLowerCase()) ||
            s.student.email.toLowerCase().includes(search.toLowerCase()) ||
            s.assignment.toLowerCase().includes(search.toLowerCase()) ||
            s.course.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-text-primary text-slate-900">Student Submissions</h1>
                    <p className="text-text-secondary">Review, grade, and provide feedback on pending assignments.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={<HiDownload />} onClick={() => setModalConfig({ open: true, title: 'Export Report', message: 'Preparing the comprehensive report for download. This may take a moment...' })}>Export Report</Button>
                    <Badge color="amber" size="lg" className="px-4 py-2 font-bold">24 Pending</Badge>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-card flex items-center gap-4">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search students, assignments, or courses..."
                    className="flex-1"
                />
                <div className="w-48">
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: 'All Statuses', value: 'all' },
                            { label: 'Needs Grading', value: 'needs_grading' },
                            { label: 'Graded', value: 'graded' },
                            { label: 'Returned', value: 'returned' }
                        ]}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-surface-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Assignment</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Submitted</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {filteredSubmissions.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={s.student.name} size="sm" />
                                            <div>
                                                <p className="text-sm font-bold text-text-primary">{s.student.name}</p>
                                                <p className="text-[10px] text-text-muted">{s.student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-text-primary">{s.assignment}</p>
                                        <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">{s.course}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                            <HiClock className="w-4 h-4 text-text-muted" /> {s.submittedAt}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={
                                            s.status === 'needs_grading' ? 'amber' :
                                                s.status === 'graded' ? 'green' : 'red'
                                        } dot>
                                            {s.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        {s.grade && <span className="ml-2 text-xs font-bold text-text-primary">({s.grade})</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {s.status === 'needs_grading' ? (
                                            <Button size="sm" icon={<HiPencil />} onClick={() => navigate(`/instructor/grading/${s.id}`, { state: { submission: s } })}>Review & Grade</Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" className="text-primary-600" onClick={() => { setEditingSubmission(s); setEditModalOpen(true); }}>Edit Grade</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                open={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="ghost" onClick={() => setModalConfig({ ...modalConfig, open: false })}>Cancel</Button>
                        <Button onClick={() => setModalConfig({ ...modalConfig, open: false })}>Confirm</Button>
                    </div>
                }
            >
                <div className="py-4">
                    <p className="text-sm text-text-secondary leading-relaxed">{modalConfig.message}</p>
                </div>
            </Modal>

            <EditGradeModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                submission={editingSubmission}
            />
        </div>
    );
}

function EditGradeModal({ open, onClose, submission }) {
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setGrade(submission?.grade || '');
            setFeedback('');
        }
    }, [open, submission]);

    if (!submission) return null;

    const handleConfirm = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-lg bg-white rounded-xl shadow-card p-6 flex flex-col gap-6 border border-surface-border"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
                                <HiPencil className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Edit Grade</h2>
                                <p className="text-sm text-text-muted mt-0.5">Update assessment for this submission</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-sm text-amber-800">
                                You are editing the grade for <span className="font-bold">{submission.student.name}</span>. The previous grade was <Badge color="gray" size="sm" className="ml-1 px-1.5 py-0.5 rounded-md inline-flex">{submission.grade || 'N/A'}</Badge>.
                            </p>
                        </div>

                        <div className="h-px bg-surface-border w-full"></div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-1.5">New Grade <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    placeholder="e.g. A, 95, Pass"
                                    className="w-full px-4 py-2 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Feedback <span className="text-red-500">*</span></label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Provide detailed feedback for this grade change..."
                                    className="w-full px-4 py-2 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow resize-none text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-2">
                            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={!grade || !feedback || isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Confirm'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function HiPencil(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>;
}
