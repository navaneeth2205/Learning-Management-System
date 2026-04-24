import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HiAcademicCap, HiClock, HiPlay, HiCheckCircle,
    HiCollection, HiFilter, HiSearch, HiChevronRight, HiStar, HiUsers
} from 'react-icons/hi';
import { mockCourses } from '../../data/mockData';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Tabs from '../../components/ui/Tabs';
import SearchBar from '../../components/ui/SearchBar';

export default function MyLearning() {
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');

    const enrolled = mockCourses.filter(c => c.progress !== undefined && c.progress !== 100);
    const completed = mockCourses.filter(c => c.progress === 100);

    const tabs = [
        { key: 'all', label: 'All Courses', count: mockCourses.length },
        { key: 'inprogress', label: 'In Progress', count: enrolled.length },
        { key: 'completed', label: 'Completed', count: completed.length },
    ];

    const filtered = mockCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
        if (activeTab === 'inprogress' && (course.progress === undefined || course.progress === 100)) return false;
        if (activeTab === 'completed' && course.progress !== 100) return false;
        return matchesSearch;
    });

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-800 tracking-tighter">My Learning</h1>
                    <p className="text-gray-600 font-medium tracking-tight">Track your progress and continue your skill mastery.</p>
                </div>
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onClear={() => setSearch('')}
                    placeholder="Search your courses..."
                    className="max-w-md w-full shadow-lg shadow-slate-100"
                />
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map(course => (
                    <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-md hover-lift group flex flex-col transition-all duration-300">
                        {/* Premium Thumbnail */}
                        <div className="relative h-32 overflow-hidden rounded-t-xl mb-3">
                            <img
                                src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop&${course.id}`}
                                alt={course.title}
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'; e.currentTarget.onerror = null; }}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="absolute top-2 left-2">
                                <Badge color={course.progress === 100 ? "emerald" : "blue"} variant="glass" className="font-black uppercase tracking-widest text-[8px] py-1 shadow-md backdrop-blur-md">
                                    {course.progress === 100 ? "COMPLETED" : "IN PROGRESS"}
                                </Badge>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="flex flex-col flex-1 p-4 pt-1">
                            <h4 className="text-sm font-black text-gray-800 leading-tight mb-3 group-hover:text-[#2563eb] transition-colors line-clamp-1">{course.title}</h4>

                            <div className="space-y-1.5 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-600">
                                    <span>Progress</span>
                                    <span className="text-[#2563eb]">{course.progress || 0}%</span>
                                </div>
                                <ProgressBar value={course.progress || 0} size="xs" color={course.progress === 100 ? "emerald" : "primary"} className="shadow-none" />
                            </div>

                            <div className="flex items-center justify-between text-[9px] font-bold text-gray-600 mb-4 pt-2 border-t border-gray-100">
                                <span className="flex items-center gap-1"><HiClock className="w-3.5 h-3.5" /> {course.duration}</span>
                                <span className="flex items-center gap-1"><HiCollection className="w-3.5 h-3.5" /> {course.lessons} Lessons</span>
                            </div>

                            <div className="mt-auto">
                                <Link to={ROUTES.LEARNER_LESSON.replace(':courseId', course.id).replace(':lessonId', 1)}>
                                    <Button fullWidth size="sm" className="font-black uppercase tracking-widest text-[10px] py-2 shadow-md hover:shadow-lg transition-all rounded-lg">
                                        {course.progress === 100 ? "Review" : "Continue Learning"}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <HiAcademicCap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-gray-800 mb-2">No Courses Found</h3>
                        <p className="text-gray-600 font-medium">Explore the catalog to find your next challenge.</p>
                        <Link to={ROUTES.LEARNER_BROWSE}>
                            <Button className="mt-8 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px]">Explore Catalog</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
