import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    HiCheck, HiDocumentText
} from 'react-icons/hi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

import { fetchSubmissionById, gradeSubmission } from '../../services/instructorApi';

export default function GradingWorkspace() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState(null);
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id && !location.state?.submission) {
            setIsLoading(false);
            return;
        }

        const load = async () => {
            setIsLoading(true);
            try {
                if (location.state?.submission) {
                    setSubmission(location.state.submission);
                } else if (id) {
                    const data = await fetchSubmissionById(id);
                    if (data) {
                        setSubmission({
                            id: data._id || data.id,
                            student: { 
                                name: data.studentId?.name || 'Unknown Student', 
                                email: data.studentId?.email || 'student@example.com' 
                            },
                            assignment: data.assignmentId?.title || 'Assignment',
                            course: data.courseId?.title || 'Course',
                            submittedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
                            status: data.status || 'needs_grading',
                            grade: data.grade,
                            content: data.content
                        });
                        setScore(data.grade || '');
                        setFeedback(data.feedback || '');
                    }
                }
            } catch (err) {
                toast.error('Failed to load submission');
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [id, location]);

    const handleFinalizeGrade = async () => {
        setIsSubmitting(true);
        try {
            await gradeSubmission(submission.id, { 
                grade: score, 
                feedback: feedback 
            });
            toast.success('Grade submitted successfully!');
            navigate('/instructor/submissions');
        } catch (err) {
            toast.error('Failed to submit grade');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Submission Data...</p>
                </div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 items-center justify-center p-8 text-center">
                <div className="max-w-md">
                    <HiDocumentText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800 mb-2">No Submission Selected</h2>
                    <p className="text-slate-500 mb-6">Select a pending student submission from the submissions list to begin the grading process.</p>
                    <Button onClick={() => navigate('/instructor/submissions')}>Go to Submissions</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
            {/* Main Editor / Submission Preview */}
            <div className="flex-1 flex flex-col p-8 bg-slate-100 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full space-y-8">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 min-h-[1000px] relative">
                        {/* Watermark/Logo */}
                        <div className="absolute top-8 right-8 opacity-10">
                            <HiDocumentText className="w-16 h-16" />
                        </div>

                        <div className="space-y-8">
                            <div className="border-b-2 border-gray-100 pb-8">
                                <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-tight">{submission.assignment}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">
                                    <span className="text-primary-600">{submission.student.name}</span>
                                    <span>•</span>
                                    <span>{submission.student.email}</span>
                                    <span>•</span>
                                    <span>{submission.submittedAt}</span>
                                </div>
                            </div>

                            <article className="prose prose-gray max-w-none text-gray-700 leading-loose">
                                <p className="text-lg">
                                    [Submission Context Payload goes here. Below is a mocked text template.]
                                </p>
                                <p className="text-lg">
                                    This project investigates the impact of micro-interactions on user retention in mobile finance applications.
                                    Throughout the semester, I focused on creating a design system that balances accessibility with high-performance animations.
                                </p>
                                <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">1. Methodology</h2>
                                <p>
                                    I utilized a group of 50 beta testers across different age groups. The goal was to measure
                                    latency perception when performing "Add to Basket" actions...
                                </p>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
                                    <p className="text-sm italic">
                                        Note: All experiments were conducted using Figma and Protopie for high-fidelity prototyping.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grading Sidebar */}
            <aside className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-md z-10">
                <div className="p-8 space-y-8 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest">Grading Panel</h2>
                        <Badge color="blue">Step 2 of 4</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between font-bold text-sm">
                            <span className="text-gray-600 uppercase tracking-widest">Score Assessment <span className="text-red-500">*</span></span>
                            <span className="text-primary-500 text-xl font-black">{score ? `${score}/100` : 'N/A'}</span>
                        </div>
                        <input
                            type="number"
                            min="0" max="100"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder="Enter marks"
                            className="w-full px-4 py-2 border border-surface-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Private Instructor Feedback</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none min-h-[120px] resize-none"
                            placeholder="Add specific comments for the student..."
                        />
                    </div>
                </div>

                <div className="p-8 pt-0 space-y-4">
                    <Button
                        fullWidth
                        icon={<HiCheck />}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md rounded-xl"
                        onClick={handleFinalizeGrade}
                        disabled={!score || isSubmitting}
                    >
                        {isSubmitting ? 'Saving Grade...' : 'Finalize Grade'}
                    </Button>
                    <Button fullWidth variant="outline" className="border-gray-200 text-gray-600 rounded-xl" disabled={isSubmitting}>Return for Revision</Button>
                </div>
            </aside>
        </div>
    );
}
