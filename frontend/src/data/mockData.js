// Mock data for learners, instructors, admins

export const mockUsers = [
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'learner', avatar: null, status: 'active', joinedAt: '2024-01-15' },
    { id: 2, name: 'Sarah Chen', email: 'sarah@example.com', role: 'learner', avatar: null, status: 'active', joinedAt: '2024-02-20' },
    { id: 3, name: 'Dr. Michael Torres', email: 'michael@example.com', role: 'instructor', avatar: null, status: 'active', joinedAt: '2023-11-10' },
    { id: 4, name: 'Emily Rodriguez', email: 'emily@example.com', role: 'instructor', avatar: null, status: 'active', joinedAt: '2023-09-05' },
    { id: 5, name: 'Admin User', email: 'admin@example.com', role: 'admin', avatar: null, status: 'active', joinedAt: '2023-01-01' },
    { id: 6, name: 'James Wilson', email: 'james@example.com', role: 'learner', avatar: null, status: 'inactive', joinedAt: '2024-03-10' },
    { id: 7, name: 'Lisa Park', email: 'lisa@example.com', role: 'learner', avatar: null, status: 'active', joinedAt: '2024-04-01' },
    { id: 8, name: 'Prof. David Kim', email: 'david@example.com', role: 'instructor', avatar: null, status: 'active', joinedAt: '2023-08-15' },
];

export const mockCourses = [
    {
        id: 1, title: 'Advanced React Development', slug: 'advanced-react',
        description: 'Master React hooks, context, performance optimization, and advanced patterns used in enterprise applications.',
        instructorId: 3, instructorName: 'Dr. Michael Torres',
        category: 'Web Development', difficulty: 'Advanced', duration: '32 hours',
        lessons: 48, enrolled: 1240, rating: 4.8, reviews: 312,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800', status: 'published', progress: 65,
        tags: ['React', 'JavaScript', 'Frontend'],
        curriculum: [
            {
                id: 1, title: 'Module 1: React Fundamentals Review', lessons: [
                    { id: 1, title: 'Introduction to Advanced Patterns', duration: '12:30', type: 'video', completed: true },
                    { id: 2, title: 'React Hooks Deep Dive', duration: '28:45', type: 'video', completed: true },
                    { id: 3, title: 'Custom Hooks Workshop', duration: '35:20', type: 'video', completed: false },
                    { id: 'q1', title: 'Module 1 Quiz Assessment', questions: 10, type: 'quiz', completed: false },
                ]
            },
            {
                id: 2, title: 'Module 2: State Management', lessons: [
                    { id: 4, title: 'Redux Toolkit Mastery', duration: '42:15', type: 'video', completed: false },
                    { id: 5, title: 'Context API Patterns', duration: '22:10', type: 'video', completed: false },
                    { id: 'q2', title: 'State Management Quiz', questions: 8, type: 'quiz', completed: false },
                ]
            },
            {
                id: 3, title: 'Module 3: Performance', lessons: [
                    { id: 6, title: 'React Profiler & Optimization', duration: '31:00', type: 'video', completed: false },
                    { id: 7, title: 'Lazy Loading & Code Splitting', duration: '24:30', type: 'video', completed: false },
                    { id: 'q3', title: 'Performance Optimization Quiz', questions: 12, type: 'quiz', completed: false },
                ]
            },
        ],
    },
    {
        id: 2, title: 'Data Science with Python', slug: 'data-science-python',
        description: 'Comprehensive data science curriculum covering pandas, numpy, matplotlib, sklearn and real-world projects.',
        instructorId: 4, instructorName: 'Emily Rodriguez',
        category: 'Data Science', difficulty: 'Intermediate', duration: '45 hours',
        lessons: 62, enrolled: 2850, rating: 4.9, reviews: 780,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', status: 'published', progress: 30,
        tags: ['Python', 'Data Science', 'ML'],
        curriculum: [
            {
                id: 1, title: 'Module 1: Python Fundamentals', lessons: [
                    { id: 1, title: 'Python for Data Science Setup', duration: '18:00', type: 'video', completed: true },
                    { id: 2, title: 'NumPy Essentials', duration: '32:00', type: 'video', completed: false },
                ]
            },
        ],
    },
    {
        id: 3, title: 'UI/UX Design Fundamentals', slug: 'ux-design',
        description: 'Learn design thinking, wireframing, prototyping, and user research to create exceptional digital experiences.',
        instructorId: 8, instructorName: 'Prof. David Kim',
        category: 'Design', difficulty: 'Beginner', duration: '24 hours',
        lessons: 36, enrolled: 3100, rating: 4.7, reviews: 560,
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800', status: 'published', progress: 80,
        tags: ['Design', 'UX', 'Figma'],
        curriculum: [],
    },
    {
        id: 4, title: 'Cloud Architecture on AWS', slug: 'aws-cloud',
        description: 'Design scalable, secure cloud architectures. Covers EC2, S3, Lambda, RDS, and enterprise cloud patterns.',
        instructorId: 3, instructorName: 'Dr. Michael Torres',
        category: 'Cloud', difficulty: 'Advanced', duration: '38 hours',
        lessons: 55, enrolled: 980, rating: 4.6, reviews: 210,
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800', status: 'published', progress: 0,
        tags: ['AWS', 'Cloud', 'DevOps'],
        curriculum: [],
    },
    {
        id: 5, title: 'Project Management Professional', slug: 'pmp-prep',
        description: 'Comprehensive PMP exam preparation covering PMBOK 7th edition, agile frameworks and real-world case studies.',
        instructorId: 4, instructorName: 'Emily Rodriguez',
        category: 'Business', difficulty: 'Intermediate', duration: '28 hours',
        lessons: 40, enrolled: 1560, rating: 4.5, reviews: 420,
        thumbnail: 'https://images.unsplash.com/photo-1454165833767-027ffea10c45?auto=format&fit=crop&q=80&w=800', status: 'published', progress: 45,
        tags: ['PMP', 'Agile', 'Management'],
        curriculum: [],
    },
    {
        id: 6, title: 'Full-Stack Node.js & MongoDB', slug: 'fullstack-node',
        description: 'Build production-ready REST APIs and full-stack apps with Node.js, Express, MongoDB and authentication.',
        instructorId: 8, instructorName: 'Prof. David Kim',
        category: 'Web Development', difficulty: 'Intermediate', duration: '40 hours',
        lessons: 58, enrolled: 2100, rating: 4.8, reviews: 490,
        thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800', status: 'published', progress: 0,
        tags: ['Node.js', 'MongoDB', 'API'],
        curriculum: [],
    },
];

export const mockAssignments = [
    { id: 1, courseId: 1, title: 'Build a Custom Hook Library', description: 'Create at least 5 custom React hooks with documentation and tests.', deadline: '2026-05-15', points: 100, status: 'pending', submitted: false },
    { id: 2, courseId: 2, title: 'Exploratory Data Analysis Project', description: 'Analyze the provided dataset and present insights with visualizations.', deadline: '2026-05-10', points: 150, status: 'submitted', submitted: true, submittedAt: '2026-05-08', grade: null },
    { id: 3, courseId: 3, title: 'UX Redesign Case Study', description: 'Pick any popular app and redesign 3 key screens with rationale.', deadline: '2026-04-30', points: 120, status: 'graded', submitted: true, submittedAt: '2026-04-28', grade: 108 },
    { id: 4, courseId: 5, title: 'Project Charter Document', description: 'Create a full project charter for a hypothetical enterprise project.', deadline: '2026-05-20', points: 80, status: 'pending', submitted: false },
];

export const mockQuizzes = [
    { id: 1, courseId: 1, title: 'React Hooks Quiz', questions: 15, timeLimit: 20, attempts: 1, status: 'completed', score: 87, passingScore: 70 },
    { id: 2, courseId: 2, title: 'Python Data Structures', questions: 20, timeLimit: 30, attempts: 2, status: 'available', score: null, passingScore: 75 },
    { id: 3, courseId: 3, title: 'Design Principles Assessment', questions: 10, timeLimit: 15, attempts: 1, status: 'completed', score: 90, passingScore: 70 },
    { id: 4, courseId: 5, title: 'PMBOK Knowledge Check', questions: 25, timeLimit: 40, attempts: 0, status: 'locked', score: null, passingScore: 70 },
];

export const mockNotifications = [
    { id: 1, type: 'assignment', title: 'Assignment Due Soon', message: 'Build a Custom Hook Library is due in 3 days.', time: '2 hours ago', read: false },
    { id: 2, type: 'grade', title: 'Assignment Graded', message: 'Your UX Redesign Case Study has been graded: 108/120.', time: '1 day ago', read: false },
    { id: 3, type: 'course', title: 'New Lesson Available', message: 'A new lesson "Redux Toolkit Mastery" is now available.', time: '2 days ago', read: true },
    { id: 4, type: 'announcement', title: 'Platform Maintenance', message: 'Scheduled maintenance on May 1st from 2-4 AM UTC.', time: '3 days ago', read: true },
    { id: 5, type: 'achievement', title: '🎉 Achievement Unlocked!', message: 'You earned the "7-Day Streak" badge. Keep it up!', time: '4 days ago', read: true },
];

export const mockAnnouncements = [
    { id: 1, title: 'Welcome to Q2 2026 Learning Sprint', content: 'We have added 12 new courses this quarter. Explore the catalog and earn your next certification!', author: 'Admin Team', date: '2026-04-20', pinned: true, audience: 'all' },
    { id: 2, title: 'React Course: New Module Added', content: 'Module 4 on Testing with React Testing Library is now live. Enroll to access it.', author: 'Dr. Michael Torres', date: '2026-04-18', pinned: false, audience: 'course' },
    { id: 3, title: 'Certificate Redesign', content: 'We have updated all completion certificates with a new professional design. Download your updated certificates from your profile.', author: 'Admin Team', date: '2026-04-15', pinned: false, audience: 'all' },
];

export const mockSubmissions = [
    { id: 1, assignmentId: 1, studentId: 1, studentName: 'Alex Johnson', courseTitle: 'Advanced React Development', assignmentTitle: 'Build a Custom Hook Library', submittedAt: '2026-05-08T10:30:00', status: 'submitted', grade: null, feedback: '' },
    { id: 2, assignmentId: 2, studentId: 2, studentName: 'Sarah Chen', courseTitle: 'Data Science with Python', assignmentTitle: 'Exploratory Data Analysis Project', submittedAt: '2026-05-07T14:20:00', status: 'graded', grade: 138, feedback: 'Excellent analysis with clear visualizations.' },
    { id: 3, assignmentId: 3, studentId: 6, studentName: 'James Wilson', courseTitle: 'Advanced React Development', assignmentTitle: 'Build a Custom Hook Library', submittedAt: '2026-05-09T09:15:00', status: 'reviewed', grade: null, feedback: 'Please fix the TypeScript types issue.' },
    { id: 4, assignmentId: 4, studentId: 7, studentName: 'Lisa Park', courseTitle: 'UI/UX Design Fundamentals', assignmentTitle: 'UX Redesign Case Study', submittedAt: '2026-04-29T16:45:00', status: 'graded', grade: 115, feedback: 'Great work! Very thorough case study.' },
];

export const mockMessages = [
    { id: 1, from: 'Dr. Michael Torres', avatar: null, subject: 'Feedback on your assignment', preview: 'Hi Alex, I reviewed your custom hook library...', time: '10:30 AM', read: false, full: 'Hi Alex, I reviewed your custom hook library submission and it looks great! A few minor suggestions on the useDebounce hook — consider adding a cancel function...' },
    { id: 2, from: 'Sarah Chen', avatar: null, subject: 'Study group invite', preview: 'Hey! Want to join our React study group this weekend?', time: 'Yesterday', read: false, full: 'Hey! Want to join our React study group this weekend? We are meeting on Saturday at 2 PM on Zoom.' },
    { id: 3, from: 'Admin Team', avatar: null, subject: 'Account verification complete', preview: 'Your instructor account has been verified...', time: 'Apr 20', read: true, full: 'Your instructor account has been verified and you can now create and publish courses. Welcome to the platform!' },
];

export const mockLearnerStats = {
    enrolledCourses: 5,
    completedCourses: 2,
    hoursLearned: 48,
    currentStreak: 7,
    certificates: 2,
    avgScore: 88,
    weeklyHours: [2, 3.5, 1.5, 4, 2.5, 5, 3],
    weeklyLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export const mockInstructorStats = {
    totalCourses: 4,
    totalLearners: 5220,
    pendingGrading: 8,
    avgRating: 4.75,
    completionRate: 72,
    recentActivity: [
        { type: 'submission', text: 'Alex Johnson submitted Assignment 1', time: '2h ago' },
        { type: 'enrollment', text: '3 new students enrolled in Advanced React', time: '4h ago' },
        { type: 'review', text: 'New 5-star review on Data Science course', time: '1d ago' },
        { type: 'question', text: 'Sarah Chen asked a question in Module 2', time: '1d ago' },
    ],
};

export const mockAdminStats = {
    totalUsers: 4850,
    activeLearners: 3200,
    activeInstructors: 45,
    totalCourses: 120,
    completionRate: 68,
    monthlyActiveUsers: 2100,
    newUsersThisWeek: 142,
    systemAlerts: [
        { id: 1, type: 'warning', message: 'Storage usage at 78% capacity', time: '1h ago' },
        { id: 2, type: 'info', message: 'Scheduled maintenance in 2 days', time: '3h ago' },
        { id: 3, type: 'success', message: 'Backup completed successfully', time: '6h ago' },
    ],
};

export const mockSkills = [
    { name: 'React Development', level: 85, color: 'blue' },
    { name: 'UI/UX Design', level: 72, color: 'violet' },
    { name: 'Node.js Backend', level: 60, color: 'indigo' },
    { name: 'Cloud Architecture', level: 45, color: 'sky' },
];

export const mockDailyGoal = {
    completed: 4.5,
    target: 6,
    percentage: 75,
    message: 'Keep going 🔥',
};
