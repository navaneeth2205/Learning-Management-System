import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, BarChart2, Trash2, Search, ChevronDown, FileText, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';

import { fetchInstructorQuizzes, fetchMyAssignments } from '../../services/instructorApi';



export default function InstructorQuizzes() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Assignments');
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

    // Outside click ref for Create Dropdown
    const dropdownRef = useRef(null);
    const [quizzes, setQuizzes] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [quizData, assignData] = await Promise.all([
                    fetchInstructorQuizzes(),
                    fetchMyAssignments()
                ]);

                if (quizData && quizData.length > 0) {
                    setQuizzes(quizData.map(q => ({
                        id: q._id || q.id,
                        title: q.title,
                        course: q.courseId?.title || 'Unknown Course',
                        questions: q.questions || [],
                        timeLimit: q.duration || 30,
                        enrolled: q.submissionsCount || 0
                    })));
                }

                if (assignData && assignData.length > 0) {
                    setAssignments(assignData.map(a => ({
                        id: a._id || a.id,
                        title: a.title,
                        course: a.courseId?.title || 'Unknown Course',
                        dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A',
                        totalMarks: a.maxScore || 100,
                        submissions: a.submissionsCount || 0,
                        status: a.status || 'Active'
                    })));
                }
            } catch (err) {} finally {
                setLoading(false);
            }
        };

        load();

        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCreateDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredQuizzes = quizzes.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));
    const filteredAssignments = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Assignments & Quizzes</h1>
                    <p className="text-slate-500 font-medium mt-1">Create and manage assignments, quizzes, exams, and grading.</p>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <Button
                        onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                        icon={<Plus className="w-5 h-5" />}
                    >
                        Create New <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>

                    <AnimatePresence>
                        {createDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden z-20"
                            >
                                <button
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#6d28d9] transition-colors border-b border-slate-50"
                                    onClick={() => {
                                        setIsAssignmentModalOpen(true);
                                        setCreateDropdownOpen(false);
                                    }}
                                >
                                    Create Assignment
                                </button>
                                <button
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#6d28d9] transition-colors"
                                    onClick={() => {
                                        navigate('/instructor/quiz/create');
                                        setCreateDropdownOpen(false);
                                    }}
                                >
                                    Create Quiz
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-200">
                {['Assignments', 'Quizzes'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === tab
                            ? 'text-[#6d28d9]'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeAssessmentTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6d28d9] rounded-t-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <SearchBar value={search} onChange={setSearch} placeholder={`Search ${activeTab.toLowerCase()}...`} className="w-full max-w-md" />
            </div>

            <div className="grid gap-4">
                {activeTab === 'Quizzes' ? (
                    filteredQuizzes.length > 0 ? filteredQuizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between transition-all hover:border-slate-200">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{quiz.title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{quiz.course}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 font-bold text-slate-500 text-xs items-center">
                                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> {quiz.questions?.length || 0} Questions</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {quiz.timeLimit} Minutes</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[#6d28d9] bg-[#f3f0ff] px-2 py-0.5 rounded-md">{quiz.enrolled || Math.floor(Math.random() * 100 + 10)} Submissions</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 self-end md:self-auto border-t border-slate-100 md:border-none w-full md:w-auto pt-4 md:pt-0">
                                <Button variant="ghost" onClick={() => navigate(`/instructor/quiz/${quiz.id}/analytics`)} icon={<BarChart2 className="w-4 h-4" />}>Analytics</Button>
                                <Button variant="outline" onClick={() => navigate(`/instructor/quiz/${quiz.id}/edit`)} icon={<Pencil className="w-4 h-4" />}>Edit</Button>
                                <button className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors ml-2"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                    )) : (
                        <EmptyState type="quizzes" />
                    )
                ) : (
                    filteredAssignments.length > 0 ? filteredAssignments.map(assignment => (
                        <div key={assignment.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between transition-all hover:border-slate-200 group">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{assignment.title}</h3>
                                    <Badge color={assignment.status === 'Active' ? 'green' : 'gray'} dot>{assignment.status}</Badge>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assignment.course}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 font-bold text-slate-500 text-xs items-center">
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Due: {assignment.dueDate}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-slate-400" /> {assignment.totalMarks} Marks</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[#6d28d9] bg-[#f3f0ff] px-2 py-0.5 rounded-md">{assignment.submissions} Submissions</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 self-end md:self-auto border-t border-slate-100 md:border-none w-full md:w-auto pt-4 md:pt-0">
                                <Button variant="ghost" icon={<BarChart2 className="w-4 h-4" />}>Analytics</Button>
                                <Button variant="outline" icon={<Pencil className="w-4 h-4" />}>Edit</Button>
                                <button className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors ml-2"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                    )) : (
                        <EmptyState type="assignments" />
                    )
                )}
            </div>

            <CreateAssignmentModal open={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} />
        </div>
    );
}

function EmptyState({ type }) {
    return (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <h3 className="font-bold text-slate-800 mb-1">No {type} found</h3>
            <p className="text-sm text-slate-500">Adjust your search or create a new assessment.</p>
        </div>
    );
}

function CreateAssignmentModal({ open, onClose }) {
    if (!open) return null;

    return (
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
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-0 flex flex-col border border-slate-100 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Create Assignment</h2>
                        <p className="text-sm text-slate-500 mt-1">Configure details and submission requirements.</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Assignment Title <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                placeholder="e.g. Midterm Case Study"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6d28d9]/20 focus:border-[#6d28d9] outline-none transition-shadow"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Course Selection <span className="text-rose-500">*</span></label>
                            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6d28d9]/20 focus:border-[#6d28d9] outline-none transition-shadow bg-white text-slate-700">
                                <option value="" disabled selected>Select a Course</option>
                                <option value="ui">UI/UX Design Masterclass</option>
                                <option value="react">Advanced React Patterns</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Description</label>
                        <textarea
                            rows={3}
                            placeholder="Provide a brief overview of this assignment..."
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6d28d9]/20 focus:border-[#6d28d9] outline-none transition-shadow resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Due Date <span className="text-rose-500">*</span></label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6d28d9]/20 focus:border-[#6d28d9] outline-none transition-shadow text-slate-700"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Total Marks <span className="text-rose-500">*</span></label>
                            <input
                                type="number"
                                placeholder="100"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6d28d9]/20 focus:border-[#6d28d9] outline-none transition-shadow"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Submission Allowed Types</label>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {['PDF Upload', 'External Link', 'Rich Text Input'].map(type => (
                                <label key={type} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                                    <input type="checkbox" className="w-4 h-4 text-[#6d28d9] rounded border-slate-300 focus:ring-[#6d28d9]" defaultChecked />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Detailed Instructions</label>
                        <textarea
                            rows={4}
                            placeholder="Add specific grading criteria or step-by-step instructions for the learner..."
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6d28d9]/20 focus:border-[#6d28d9] outline-none transition-shadow resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Resources & Attachments</label>
                        <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                            <Plus className="w-6 h-6 text-slate-400 group-hover:text-[#6d28d9]" />
                            <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide group-hover:text-[#6d28d9]">Click to Upload Files</p>
                            <p className="text-[10px] text-slate-400 mt-1">PDF, DOCX, ZIP (Max 50MB)</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button className="bg-[#6d28d9] hover:bg-purple-800 text-white" onClick={onClose}>Publish Assignment</Button>
                </div>
            </motion.div>
        </div>
    );
}
