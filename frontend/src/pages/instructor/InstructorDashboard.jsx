import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    HiCollection, HiUsers, HiClipboardList, HiStar,
    HiTrendingUp, HiPlus, HiChevronRight, HiDotsHorizontal,
    HiClock, HiDotsVertical, HiCash, HiPresentationChartLine,
    HiLightningBolt, HiCheckCircle
} from 'react-icons/hi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';

import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import clsx from 'clsx';
import { 
    fetchInstructorDashboard, 
    fetchInstructorStats, 
    fetchPendingSubmissions,
    fetchInstructorCourses,
    createGoogleClassroomForCourse,
} from '../../services/instructorApi';

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

export default function InstructorDashboard() {
    const { user } = useSelector(s => s.auth);
    const navigate = useNavigate();

    const statsItems = [
        { label: 'Total Enrollments', value: 4200, icon: HiUsers, color: 'violet', prefix: '', gradient: 'from-violet-500 to-indigo-600' },
        { label: 'Avg Attendance', value: 92, icon: HiPresentationChartLine, color: 'blue', suffix: '%', gradient: 'from-blue-500 to-cyan-600' },
        { label: 'Pending Assessment', value: 0, icon: HiClipboardList, color: 'rose', gradient: 'from-rose-500 to-pink-600' },
        { label: 'Student Rating', value: 4.9, icon: HiStar, color: 'amber', isFloat: true, gradient: 'from-amber-400 to-orange-500' },
    ];

    const [stats, setStats] = useState(statsItems);
    const [courses, setCourses] = useState([]);
    const [submissions, setSubmissions] = useState([
        { name: 'Alex Rivera', course: 'UI/UX Masterclass', task: 'Design System V1', time: '2h ago' },
        { name: 'Mila Kunis', course: 'React Fundamentals', task: 'Custom Hooks Ex', time: '5h ago' },
        { name: 'Dinesh K.', course: 'Node.js Backend', task: 'API Auth Logic', time: '1d ago' },
    ]);

    useEffect(() => {
        fetchInstructorStats()
            .then(data => {
                if (data) {
                    setStats([
                        { ...statsItems[0], value: Number(data.totalEnrollments) || 4200 },
                        { ...statsItems[1], value: Number(data.avgAttendance) || 92 },
                        { ...statsItems[2], value: Number(data.pendingGrading) || 0 },
                        { ...statsItems[3], value: Number(data.avgRating) || 4.9 },
                    ]);
                }
            })
            .catch(err => {
                console.error("Dashboard Stats Fetch Error:", err);
            });

        fetchPendingSubmissions()
            .then(data => {
                if (data && Array.isArray(data)) {
                    setSubmissions(data.map(s => ({
                        name: s.studentId?.name || 'Student',
                        course: s.courseId?.title || 'Course',
                        task: s.assignmentId?.title || 'Assignment',
                        time: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Today'
                    })));
                }
            })
            .catch(err => {
                console.error("Pending Submissions Fetch Error:", err);
            });

        fetchInstructorCourses()
            .then((data) => {
                setCourses(Array.isArray(data) ? data.slice(0, 4) : []);
            })
            .catch((err) => {
                console.error('Instructor courses fetch error:', err);
            });
    }, []);

    const handleCreateClassroom = async (course) => {
        const toastId = toast.loading(`Creating Google Classroom for ${course.title}...`);

        try {
            const data = await createGoogleClassroomForCourse(course._id || course.id);
            setCourses((prev) =>
                prev.map((item) =>
                    String(item._id || item.id) === String(course._id || course.id)
                        ? { ...item, googleClassroom: data?.classroom || item.googleClassroom }
                        : item
                )
            );

            toast.success(
                data?.alreadyExists
                    ? `Google Classroom already exists for ${course.title}.`
                    : `Google Classroom created and ${data?.notifiedStudents || 0} students alerted.`,
                { id: toastId }
            );

            if (data?.classroom?.alternateLink) {
                window.open(data.classroom.alternateLink, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to create Google Classroom', { id: toastId });
        }
    };

    const performanceData = [
        { name: 'Course A', completion: 85, dropoff: 15 },
        { name: 'Course B', completion: 72, dropoff: 28 },
        { name: 'Course C', completion: 90, dropoff: 10 },
        { name: 'Course D', completion: 65, dropoff: 35 },
    ];

    const instructorCourses = [];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header: Visual Stats Banner */}
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-md flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-instructor-light/20 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge color="violet" variant="soft" className="font-black uppercase tracking-widest text-[10px]">Enrollment Growth</Badge>
                            <span className="text-emerald-500 text-[10px] font-black flex items-center gap-0.5">
                                <HiTrendingUp /> +14.2%
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tighter mb-2">
                            Platform Impact
                        </h1>
                        <p className="text-gray-600 font-medium mb-4">
                            Your content reached <span className="text-primary-500 font-bold">4,200+</span> new students this month.
                        </p>
                    </div>

                    {/* Abstract Bar Chart to fill whitespace elegantly */}
                    <div className="flex-1 flex items-end opacity-60 mb-8 mx-2 overflow-hidden">
                        <div className="flex items-end gap-1.5 h-20 w-full group">
                            {[20, 35, 25, 45, 60, 50, 70, 65, 85, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-violet-200 to-violet-400 rounded-t-sm transition-all duration-300 group-hover:scale-y-105 origin-bottom" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-4 mt-auto">
                        <Link to={ROUTES.INSTRUCTOR_COURSE_CREATE}>
                            <Button className="bg-primary-500 text-white border-none px-6 py-3 font-black uppercase tracking-widest text-[10px] shadow-md">
                                <HiPlus className="mr-2" /> Launch New Course
                            </Button>
                        </Link>
                        <Button variant="outline" className="border-gray-200 text-gray-600 font-black uppercase tracking-widest text-[10px]" onClick={() => toast.success('Report downloaded. Check your files.')}>
                            Download Report
                        </Button>
                    </div>
                </div>

                <div className="lg:w-1/3 bg-white p-6 rounded-xl text-gray-800 border border-gray-200 shadow-md relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Needs Attention</p>
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                            </div>
                            <h3 className="text-2xl font-black mb-1">Student Q&A</h3>
                            <p className="text-gray-500 text-xs font-bold mb-6">14 unanswered questions</p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3 relative overflow-hidden group">
                                <Avatar size="xs" name="John D" className="flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-gray-800">"Why does useEffect run twice?"</p>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mt-0.5">React Patterns • 2h ago</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3 relative overflow-hidden group">
                                <Avatar size="xs" name="Sarah M" className="flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-gray-800">"Stuck on flexbox layout"</p>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mt-0.5">CSS Mastery • 5h ago</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => navigate('/instructor/messages')} className="w-full mt-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200 text-xs font-black uppercase tracking-widest transition-all">
                            View Inbox
                        </button>
                    </div>
                </div>
            </div>

            {/* Violet Theme Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md hover-lift group relative overflow-hidden">
                        <div className={clsx('absolute -right-2 -top-2 w-16 h-16 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform bg-gradient-to-br', s.gradient)} />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white bg-gradient-to-br', s.gradient)}>
                                <s.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                                <p className="text-2xl font-black text-gray-800">
                                    {s.prefix}<CountUp end={s.value} />{s.suffix}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Course Performance: Stacked Bar Chart */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 tracking-tight">Course Retention</h2>
                                <p className="text-sm font-medium text-gray-600">Student completion vs. drop-off rates</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-instructor rounded-full" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Completed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-violet-300 rounded-full" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Drop-off</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800 }}
                                    />
                                    <Bar dataKey="completion" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} barSize={40} />
                                    <Bar dataKey="dropoff" stackId="a" fill="#c4b5fd" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Recent Submissions: Hover Table */}
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                                <HiClipboardList className="text-rose-500" /> Pending Submissions
                            </h3>
                            <button onClick={() => navigate(ROUTES.INSTRUCTOR_SUBMISSIONS)} className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">View All Task</button>
                        </div>
                        <div className="space-y-2">
                            {submissions.map((sub, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer">
                                    <Avatar name={sub.name} size="sm" className="ring-2 ring-white shadow-sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 group-hover:text-primary-500 transition-colors">{sub.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-widest">{sub.course} • {sub.task}</p>
                                    </div>
                                    <div className="hidden sm:block text-right">
                                        <p className="text-xs font-black text-gray-800">{sub.time}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Received</p>
                                    </div>
                                    <button onClick={() => navigate(ROUTES.INSTRUCTOR_SUBMISSIONS)} className="p-2.5 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                        <HiChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-800 tracking-tight">Google Classrooms</h3>
                            <button onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)} className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Manage Courses</button>
                        </div>
                        <div className="space-y-3">
                            {courses.length > 0 ? courses.map((course) => (
                                <div key={course._id || course.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4">
                                    <div>
                                        <p className="font-bold text-gray-800">{course.title}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {course.googleClassroom?.id ? `Live code: ${course.googleClassroom.enrollmentCode || 'Available in Classroom'}` : 'No classroom yet'}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={course.googleClassroom?.id ? 'outline' : 'primary'}
                                        className={course.googleClassroom?.id ? 'border-emerald-300 text-emerald-700' : ''}
                                        onClick={() => handleCreateClassroom(course)}
                                    >
                                        {course.googleClassroom?.id ? 'Open Classroom' : 'Create Classroom'}
                                    </Button>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">Create a course first to provision its Google Classroom.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Activity & Insights */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Activity Feed */}
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                        <h3 className="text-lg font-black text-gray-800 tracking-tight mb-6">Recent Events</h3>
                        <div className="space-y-6 relative border-l-2 border-slate-50 ml-2 pl-6">
                            {[
                                { title: 'New Student Enrollment', desc: '14 new students joined React Patterns', time: '12m ago', icon: HiUsers, color: 'text-violet-500', bg: 'bg-violet-50' },
                                { title: 'Course Review', desc: '5-star review received for Node.js Security', time: '1h ago', icon: HiStar, color: 'text-amber-500', bg: 'bg-amber-50' },
                                { title: 'Assignment Milestone', desc: '80% completion rate hit for Course B', time: '4h ago', icon: HiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            ].map((activity, i) => (
                                <div key={i} className="relative">
                                    <div className={clsx('absolute -left-[35px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm', activity.bg.replace('bg-', 'bg-').replace('50', '500'))} />
                                    <div>
                                        <p className="text-xs font-black text-gray-800">{activity.title}</p>
                                        <p className="text-[10px] text-gray-600 font-medium mb-1">{activity.desc}</p>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Achievement / Tip Card */}
                    <div className="bg-primary-500 rounded-xl p-8 text-white shadow-md border border-gray-200 relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 group-hover:rotate-12 transition-transform">
                                <HiLightningBolt className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl tracking-tight mb-2">Creator Insights</h3>
                                <p className="text-indigo-50 text-xs font-bold leading-relaxed mb-6 uppercase tracking-widest">
                                    Your "Advanced React" course is trending in 4 regions. Update your intro to boost conversions.
                                </p>
                            </div>
                            <Button onClick={() => navigate(ROUTES.INSTRUCTOR_ANALYTICS)} size="sm" variant="outline" className="w-full !bg-white !text-primary-500 !border-transparent hover:!bg-white/90 font-black uppercase tracking-widest text-[10px] py-4 shadow-md rounded-xl mt-4">
                                View Trends →
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HiChatAlt(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path></svg>;
}

