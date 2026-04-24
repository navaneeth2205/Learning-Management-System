import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    HiStar, HiClock, HiAcademicCap, HiChevronRight,
    HiCheckCircle, HiLockClosed, HiPlay, HiDocumentText,
    HiUserGroup, HiOutlineBadgeCheck
} from 'react-icons/hi';
import { mockCourses } from '../../data/mockData';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Avatar from '../../components/ui/Avatar';
import ProgressBar from '../../components/ui/ProgressBar';

export default function CourseDetail() {
    const { courseId } = useParams();
    const [activeTab, setActiveTab] = useState('curriculum');

    // Find course or use default for demo
    const course = mockCourses.find(c => c.id === parseInt(courseId)) || mockCourses[0];

    const tabs = [
        { key: 'curriculum', label: 'Curriculum', icon: <HiAcademicCap /> },
        { key: 'description', label: 'Description', icon: <HiDocumentText /> },
        { key: 'instructor', label: 'Instructor', icon: <HiUserGroup /> },
        { key: 'reviews', label: 'Reviews', icon: <HiStar /> },
    ];

    return (
        <div className="bg-surface-bg min-h-screen">
            {/* Course Hero */}
            <div className="bg-white border-b border-surface-border">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <Badge color="blue">{course.category}</Badge>
                                <Badge color="gray">{course.difficulty}</Badge>
                            </div>
                            <h1 className="text-4xl font-extrabold text-text-primary leading-tight">
                                {course.title}
                            </h1>
                            <p className="text-lg text-text-secondary max-w-2xl">
                                {course.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                                        <HiStar /> {course.rating}
                                    </span>
                                    <span className="text-text-muted text-sm">({course.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary text-sm">
                                    <HiUserGroup className="text-primary-600" />
                                    <span>{course.enrolled} students enrolled</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary text-sm">
                                    <Avatar name={course.instructorName} size="xs" />
                                    <span>Created by <span className="font-semibold text-text-primary underline cursor-pointer">{course.instructorName}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Preview Card */}
                        <div className="lg:w-96 flex-shrink-0">
                            <div className="bg-white rounded-2xl border border-surface-border shadow-card-lg overflow-hidden sticky top-6">
                                <div className="h-52 bg-slate-100 flex items-center justify-center relative">
                                    <HiAcademicCap className="w-16 h-16 text-slate-300" />
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-primary-600 hover:scale-110 transition-transform">
                                            <HiPlay className="w-6 h-6 ml-1" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-3 pt-2">
                                        <Button fullWidth size="lg">Start Learning</Button>
                                        <Button variant="outline" fullWidth size="lg">Bookmark Course</Button>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-surface-border">
                                        <p className="text-sm font-bold text-text-primary">This course includes:</p>
                                        <ul className="space-y-2">
                                            {[
                                                { icon: HiPlay, text: `${course.duration} hours of video` },
                                                { icon: HiAcademicCap, text: `${course.lessons} lessons` },
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
                                    <p className="text-sm text-text-muted">{course.curriculum.length} modules • {course.lessons} lessons</p>
                                </div>
                                <div className="space-y-4">
                                    {course.curriculum.map((module, i) => (
                                        <div key={i} className="bg-white border border-surface-border rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-surface-muted px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-text-primary">{module.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-text-muted">
                                                    <span>{module.lessons.length} lessons</span>
                                                    <HiChevronRight />
                                                </div>
                                            </div>
                                            <div className="divide-y divide-surface-border">
                                                {module.lessons.map((lesson, j) => (
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
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'description' && (
                            <div className="space-y-6 prose prose-slate max-w-none">
                                <h2 className="text-2xl font-bold text-text-primary">About this course</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    {course.description}
                                </p>
                                <h3 className="text-xl font-bold text-text-primary">What you'll learn</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        'Master professional React patterns used in production',
                                        'Build highly performant applications from scratch',
                                        'State management deep dive with Redux Toolkit',
                                        'Advanced UI/UX principles for enterprise apps',
                                        'Unit and Integration testing workflows',
                                        'Optimization strategies for complex SPAs'
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-3">
                                            <HiCheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-text-secondary">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'instructor' && (
                            <div className="bg-white p-8 rounded-2xl border border-surface-border shadow-card flex flex-col md:flex-row gap-8">
                                <div className="flex flex-col items-center gap-4 flex-shrink-0">
                                    <Avatar name={course.instructorName} size="xl" />
                                    <div className="text-center space-y-1">
                                        <Badge color="blue">Top Instructor</Badge>
                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm justify-center">
                                            <HiStar /> 4.9 Rating
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-text-primary">{course.instructorName}</h3>
                                        <p className="text-primary-600 font-medium">Senior Software Architect & Educator</p>
                                    </div>
                                    <p className="text-text-secondary leading-relaxed">
                                        Dr. Torres has over 15 years of experience building scalable web solutions for Fortune 500 companies.
                                        He specializes in modern JavaScript ecosystems and has taught over 500,000 students worldwide.
                                    </p>
                                    <div className="flex gap-8 pt-2">
                                        <div>
                                            <p className="text-xl font-bold text-text-primary">1.2M</p>
                                            <p className="text-xs text-text-muted">Total Students</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-text-primary">12</p>
                                            <p className="text-xs text-text-muted">Courses</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-text-primary">45k</p>
                                            <p className="text-xs text-text-muted">Reviews</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">View Profile</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
