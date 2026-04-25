import Enrollment from '../enrollment/enrollment.model.js';
import Progress from '../progress/progress.model.js';
import Course from '../course/course.model.js';
import Certificate from '../certificate/certificate.model.js';
import QuizAttempt from '../quiz/quizAttempt.model.js';
import Submission from '../submission/submission.model.js';
import User from '../user/user.model.js';

export const getLearnerDashboardStats = async (userId) => {
	const enrollments = await Enrollment.find({ userId }).populate('courseId', 'title category thumbnail');
	const progressRecords = await Progress.find({ userId });
	const certificates = await Certificate.find({ userId });
	const quizAttempts = await QuizAttempt.find({ userId });

	const enrolledCourses = enrollments.length;
	const completedCourses = progressRecords.filter((p) => p.completionPercentage >= 100).length;
	const certificateCount = certificates.length;

	const avgScore =
		quizAttempts.length > 0
			? Number((quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length).toFixed(1))
			: 0;

	return {
		enrolledCourses,
		completedCourses,
		certificates: certificateCount,
		avgScore,
		totalQuizAttempts: quizAttempts.length,
		enrollments: enrollments.map((e) => ({
			_id: e._id,
			courseId: e.courseId,
			enrolledAt: e.enrolledAt,
			progress: progressRecords.find((p) => p.courseId.toString() === e.courseId._id.toString())?.completionPercentage || 0,
		})),
	};
};

export const getLeaderboard = async () => {
	const quizAttempts = await QuizAttempt.aggregate([
		{
			$group: {
				_id: '$userId',
				totalScore: { $sum: '$score' },
				totalQuizzes: { $sum: 1 },
				avgPercentage: { $avg: '$percentage' },
			},
		},
		{ $sort: { totalScore: -1 } },
		{ $limit: 50 },
	]);

	const userIds = quizAttempts.map((a) => a._id);
	const users = await User.find({ _id: { $in: userIds } }).select('name email role');

	const userMap = {};
	users.forEach((u) => {
		userMap[u._id.toString()] = u;
	});

	const enrollmentCounts = await Enrollment.aggregate([
		{ $match: { userId: { $in: userIds } } },
		{ $group: { _id: '$userId', courseCount: { $sum: 1 } } },
	]);
	const enrollMap = {};
	enrollmentCounts.forEach((e) => {
		enrollMap[e._id.toString()] = e.courseCount;
	});

	const completedCounts = await Progress.aggregate([
		{ $match: { userId: { $in: userIds }, completionPercentage: 100 } },
		{ $group: { _id: '$userId', completed: { $sum: 1 } } },
	]);
	const completedMap = {};
	completedCounts.forEach((c) => {
		completedMap[c._id.toString()] = c.completed;
	});

	return quizAttempts.map((a, index) => ({
		rank: index + 1,
		user: userMap[a._id.toString()] || { name: 'Unknown', email: '' },
		totalScore: a.totalScore,
		totalQuizzes: a.totalQuizzes,
		avgPercentage: Number(a.avgPercentage.toFixed(1)),
		coursesEnrolled: enrollMap[a._id.toString()] || 0,
		coursesCompleted: completedMap[a._id.toString()] || 0,
	}));
};

export const getGradesForLearner = async (userId) => {
	const quizAttempts = await QuizAttempt.find({ userId })
		.populate('quizId', 'title courseId passingScore')
		.sort({ completedAt: -1 });

	const submissions = await Submission.find({ userId })
		.populate('assignmentId', 'title courseId points')
		.sort({ _id: -1 });

	const courseIds = [
		...new Set([
			...quizAttempts.filter((a) => a.quizId?.courseId).map((a) => a.quizId.courseId.toString()),
			...submissions.filter((s) => s.assignmentId?.courseId).map((s) => s.assignmentId.courseId.toString()),
		]),
	];

	const courses = await Course.find({ _id: { $in: courseIds } }).select('title category');
	const courseMap = {};
	courses.forEach((c) => {
		courseMap[c._id.toString()] = c;
	});

	return {
		quizGrades: quizAttempts.map((a) => ({
			_id: a._id,
			quizTitle: a.quizId?.title || 'Unknown Quiz',
			courseTitle: courseMap[a.quizId?.courseId?.toString()]?.title || 'Unknown Course',
			score: a.score,
			total: a.total,
			percentage: a.percentage,
			passed: a.passed,
			completedAt: a.completedAt,
		})),
		assignmentGrades: submissions
			.filter((s) => s.grade !== null && s.grade !== undefined)
			.map((s) => ({
				_id: s._id,
				assignmentTitle: s.assignmentId?.title || 'Unknown Assignment',
				courseTitle: courseMap[s.assignmentId?.courseId?.toString()]?.title || 'Unknown Course',
				grade: s.grade,
				totalPoints: s.assignmentId?.points || 100,
				percentage: s.assignmentId?.points ? Number(((s.grade / s.assignmentId.points) * 100).toFixed(1)) : 0,
			})),
	};
};

export const getInstructorDashboardStats = async (instructorId) => {
    // 1. Get all courses by this instructor
    const courses = await Course.find({ instructorId });
    const courseIds = courses.map(c => c._id);

    // 2. Count total enrollments for these courses
    const totalEnrollments = await Enrollment.countDocuments({ courseId: { $in: courseIds } });

    // 3. Count pending submissions (needs_grading)
    const pendingGrading = await Submission.countDocuments({ 
        courseId: { $in: courseIds }, 
        status: 'needs_grading' 
    });

    // 4. Calculate average rating
    const avgRating = courses.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (courses.length || 1);

    // 5. Get recent activity (newest enrollments)
    const recentEnrollments = await Enrollment.find({ courseId: { $in: courseIds } })
        .sort({ enrolledAt: -1 })
        .limit(5)
        .populate('userId', 'name email');

    return {
        totalEnrollments,
        pendingGrading,
        avgRating: Number(avgRating.toFixed(1)),
        totalCourses: courses.length,
        avgAttendance: 92, // Mock for now
        recentEnrollments: recentEnrollments.map(e => ({
            studentName: e.userId?.name,
            courseTitle: courses.find(c => c._id.toString() === e.courseId.toString())?.title,
            date: e.enrolledAt
        }))
    };
};
