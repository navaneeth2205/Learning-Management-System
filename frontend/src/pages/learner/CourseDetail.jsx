import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    HiStar, HiClock, HiAcademicCap, HiChevronRight,
    HiCheckCircle, HiLockClosed, HiPlay, HiDocumentText,
    HiUserGroup, HiOutlineBadgeCheck, HiVideoCamera, HiPhone
} from 'react-icons/hi';
import { mockCourses } from '../../data/mockData';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Avatar from '../../components/ui/Avatar';
import ProgressBar from '../../components/ui/ProgressBar';
import { fetchCourseDetails, enrollInCourse, checkEnrollment } from '../../services/learnerApi';
import CallModal from '../../components/communication/CallModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function CourseDetail() {
    const { courseId } = useParams();
    const { token } = useSelector(s => s.auth);
    const [activeTab, setActiveTab] = useState('curriculum');
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [callConfig, setCallConfig] = useState({ isOpen: false, channel: '', isVideo: true });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchCourseDetails(courseId);
                setCourse(data);
            } catch {
                // Fallback to mock
                const mock = mockCourses.find(c => c.id === parseInt(courseId)) || mockCourses[0];
                setCourse(mock);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId]);

    useEffect(() => {
        if (!token || !courseId) return;
        checkEnrollment(courseId)
            .then(data => setEnrolled(data?.enrolled || false))
            .catch(() => {});
    }, [courseId, token]);

    const handleEnroll = async () => {
        if (!token) {
            toast.error('Please login to enroll');
            return;
        }
        try {
            setEnrolling(true);
            await enrollInCourse(courseId);
            setEnrolled(true);
            toast.success('Enrolled successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const c = course || mockCourses[0];
    const instructorName = c.instructorId?.name || c.instructorName || 'Instructor';
    const lessons = c.lessons || c.curriculum?.flatMap(m => m.lessons) || [];
    const lessonCount = Array.isArray(lessons) ? lessons.length : (typeof lessons === 'number' ? lessons : 0);

    const tabs = [
        { key: 'curriculum', label: 'Curriculum', icon: <HiAcademicCap /> },
        { key: 'description', label: 'Description', icon: <HiDocumentText /> },
        { key: 'instructor', label: 'Instructor', icon: <HiUserGroup /> },
    ];

    return (
        <div className="bg-surface-bg min-h-screen">
            {/* Course Hero */}
            <div className="bg-white border-b border-surface-border">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <Badge color="blue">{c.category || 'General'}</Badge>
                                <Badge color="gray">{c.difficulty || 'Beginner'}</Badge>
                            </div>
                            <h1 className="text-4xl font-extrabold text-text-primary leading-tight">
                                {c.title}
                            </h1>
                            <p className="text-lg text-text-secondary max-w-2xl">
                                {c.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                                        <HiStar /> {c.rating || 0}
                                    </span>
                                    <span className="text-text-muted text-sm">({c.reviewCount || c.reviews || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary text-sm">
                                    <HiUserGroup className="text-primary-600" />
                                    <span>{c.enrolledCount || c.enrolled || 0} students enrolled</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary text-sm">
                                    <Avatar name={instructorName} size="xs" />
                                    <span>Created by <span className="font-semibold text-text-primary">{instructorName}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Preview Card */}
                        <div className="lg:w-96 flex-shrink-0">
                            <div className="bg-white rounded-2xl border border-surface-border shadow-card-lg overflow-hidden sticky top-6">
                                <div className="h-52 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                    {c.thumbnail ? (
                                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <HiAcademicCap className="w-16 h-16 text-slate-300" />
                                    )}
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-primary-600 hover:scale-110 transition-transform">
                                            <HiPlay className="w-6 h-6 ml-1" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-3 pt-2">
                                        {enrolled ? (
                                            <Link to={`/learner/courses/${courseId}/lessons/${Array.isArray(lessons) && lessons[0] ? (lessons[0]._id || lessons[0].id || 1) : 1}`}>
                                                <Button fullWidth size="lg">Continue Learning</Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                fullWidth
                                                size="lg"
                                                onClick={handleEnroll}
                                                disabled={enrolling}
                                            >
                                                {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-surface-border">
                                        <p className="text-sm font-bold text-text-primary">This course includes:</p>
                                        <ul className="space-y-2">
                                            {[
                                                { icon: HiPlay, text: `${c.duration || 'Video'} content` },
                                                { icon: HiAcademicCap, text: `${lessonCount} lessons` },
                                                { icon: HiDocumentText, text: 'Downloadable resources' },
                                                { icon: HiOutlineBadgeCheck, text: 'Certificate of completion' },
                                                { icon: HiClock, text: 'Full lifetime access' },
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                                                    <item.icon className="w-4 h-4 text-primary-500" />
                                                    {item.text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="lg:w-2/3">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        className="mb-8"
                    />

                    <div className="mt-8 space-y-12">
                        {activeTab === 'curriculum' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-text-primary">Course Curriculum</h2>
                                    <p className="text-sm text-text-muted">{lessonCount} lessons</p>
                                </div>
                                <div className="space-y-4">
                                    {/* If we have real lessons from API */}
                                    {Array.isArray(lessons) && lessons.length > 0 ? (
                                        <div className="bg-white border border-surface-border rounded-xl overflow-hidden shadow-sm">
                                            <div className="divide-y divide-surface-border">
                                                {lessons.map((lesson, j) => (
                                                    <Link
                                                        key={lesson._id || lesson.id || j}
                                                        to={enrolled ? `/learner/courses/${courseId}/lessons/${lesson._id || lesson.id || j + 1}` : '#'}
                                                        className={`px-6 py-4 flex items-center justify-between group hover:bg-primary-50/30 transition-colors ${!enrolled ? 'cursor-not-allowed opacity-60' : ''}`}
                                                        onClick={(e) => !enrolled && e.preventDefault()}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-text-muted group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                                {lesson.type === 'pdf' ? <HiDocumentText className="w-4 h-4" /> : <HiPlay className="w-4 h-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-text-secondary truncate">{lesson.title}</p>
                                                                {lesson.duration && <p className="text-xs text-text-muted">{lesson.duration}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-text-muted">
                                                            <span className="capitalize">{lesson.type || 'video'}</span>
                                                            {!enrolled && <HiLockClosed className="opacity-40" />}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Fallback to mock curriculum */
                                        (c.curriculum || []).map((module, i) => (
                                            <div key={i} className="bg-white border border-surface-border rounded-xl overflow-hidden shadow-sm">
                                                <div className="bg-surface-muted px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-bold text-text-primary">{module.title}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-text-muted">
                                                        <span>{module.lessons?.length || 0} lessons</span>
                                                        <HiChevronRight />
                                                    </div>
                                                </div>
                                                <div className="divide-y divide-surface-border">
                                                    {(module.lessons || []).map((lesson, j) => (
                                                        <div key={j} className="px-6 py-4 flex items-center justify-between group hover:bg-primary-50/30 transition-colors">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-text-muted group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                                    <HiPlay className="w-4 h-4" />
                                                                </div>
                                                                <p className="text-sm font-medium text-text-secondary truncate">{lesson.title}</p>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-text-muted">
                                                                {lesson.completed ? (
                                                                    <HiCheckCircle className="text-emerald-500 w-5 h-5" />
                                                                ) : (
                                                                    <>
                                                                        <span className="hidden sm:inline">{lesson.duration}</span>
                                                                        <HiLockClosed className="opacity-40" />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'description' && (
                            <div className="space-y-6 prose prose-slate max-w-none">
                                <h2 className="text-2xl font-bold text-text-primary">About this course</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    {c.description}
                                </p>
                                {c.tags && c.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-4">
                                        {c.tags.map((tag, i) => (
                                            <Badge key={i} color="gray">{tag}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'instructor' && (
                            <div className="bg-white p-8 rounded-2xl border border-surface-border shadow-card flex flex-col md:flex-row gap-8">
                                <div className="flex flex-col items-center gap-4 flex-shrink-0">
                                    <Avatar name={instructorName} size="xl" />
                                    <div className="text-center space-y-1">
                                        <Badge color="blue">Instructor</Badge>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-text-primary">{instructorName}</h3>
                                        <p className="text-primary-600 font-medium">{c.instructorId?.email || 'instructor@lms.com'}</p>
                                    </div>
                                    <p className="text-text-secondary leading-relaxed">
                                        Experienced educator passionate about teaching and helping students achieve their learning goals.
                                    </p>
                                    {enrolled && (
                                        <div className="pt-4 flex gap-3">
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                icon={<HiVideoCamera className="w-4 h-4" />}
                                                onClick={() => setCallConfig({ 
                                                    isOpen: true, 
                                                    channel: `course_${courseId}`, 
                                                    isVideo: true 
                                                })}
                                            >
                                                Start Live Session
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                icon={<HiPhone className="w-4 h-4" />}
                                                onClick={() => setCallConfig({ 
                                                    isOpen: true, 
                                                    channel: `course_${courseId}`, 
                                                    isVideo: false 
                                                })}
                                            >
                                                Audio Call
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <CallModal 
                isOpen={callConfig.isOpen}
                channelName={callConfig.channel}
                isVideo={callConfig.isVideo}
                onClose={() => setCallConfig({ ...callConfig, isOpen: false })}
            />
        </div>
    );
}
