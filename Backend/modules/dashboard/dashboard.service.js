import Enrollment from '../enrollment/enrollment.model.js';
import Progress from '../progress/progress.model.js';
import Course from '../course/course.model.js';
import Certificate from '../certificate/certificate.model.js';
import QuizAttempt from '../quiz/quizAttempt.model.js';
import Submission from '../submission/submission.model.js';
import User from '../user/user.model.js';
import Assignment from '../assignment/assignment.model.js';
import { recalculateProgressForCourse } from '../progress/progress.service.js';

export const getLearnerDashboardStats = async (userId) => {
	const enrollments = await Enrollment.find({ userId }).populate('courseId', 'title category thumbnail');
	const progressRecords = await Progress.find({ userId });
	await Promise.all(
		progressRecords.map((progress) =>
			recalculateProgressForCourse({ userId, courseId: progress.courseId, progressRecord: progress })
		)
	);
	const refreshedProgressRecords = await Progress.find({ userId });
	const certificates = await Certificate.find({ userId });
	const quizAttempts = await QuizAttempt.find({ userId });

	const enrolledCourses = enrollments.length;
	const completedCourses = refreshedProgressRecords.filter((p) => p.completionPercentage >= 100).length;
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
			progress: refreshedProgressRecords.find((p) => p.courseId.toString() === e.courseId._id.toString())?.completionPercentage || 0,
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
	const courses = await Course.find({ instructorId }).lean();
	const courseIds = courses.map((course) => course._id);

	if (courseIds.length === 0) {
		return {
			totalEnrollments: 0,
			pendingGrading: 0,
			avgRating: 0,
			totalCourses: 0,
			avgAttendance: 0,
			recentEnrollments: [],
			retentionData: [],
			recentEvents: [],
			topCourse: null,
			creatorInsight: {
				title: 'Build your first live course signal',
				body: 'Publish a course and enroll learners to unlock live retention, activity, and performance insights here.',
				ctaLabel: 'Create Course',
			},
		};
	}

	const courseMap = new Map(courses.map((course) => [course._id.toString(), course]));

	const [enrollmentCounts, progressStats, assignments, recentEnrollments] = await Promise.all([
		Enrollment.aggregate([
			{ $match: { courseId: { $in: courseIds } } },
			{
				$group: {
					_id: '$courseId',
					count: { $sum: 1 },
					latestEnrollmentAt: { $max: '$enrolledAt' },
				},
			},
		]),
		Progress.aggregate([
			{ $match: { courseId: { $in: courseIds } } },
			{
				$group: {
					_id: '$courseId',
					completed: {
						$sum: {
							$cond: [{ $gte: ['$completionPercentage', 100] }, 1, 0],
						},
					},
					active: {
						$sum: {
							$cond: [{ $gt: ['$completionPercentage', 0] }, 1, 0],
						},
					},
					averageProgress: { $avg: '$completionPercentage' },
				},
			},
		]),
		Assignment.find({ courseId: { $in: courseIds } }).select('_id courseId title').lean(),
		Enrollment.find({ courseId: { $in: courseIds } })
			.sort({ enrolledAt: -1 })
			.limit(5)
			.populate('userId', 'name email'),
	]);

	const assignmentIds = assignments.map((assignment) => assignment._id);
	const assignmentMap = new Map(assignments.map((assignment) => [assignment._id.toString(), assignment]));
	const enrollmentCountMap = new Map(enrollmentCounts.map((item) => [item._id.toString(), item]));
	const progressMap = new Map(progressStats.map((item) => [item._id.toString(), item]));

	const pendingSubmissionFilter = assignmentIds.length > 0 ? { assignmentId: { $in: assignmentIds }, grade: null } : null;
	const [pendingGrading, recentPendingSubmissions] = pendingSubmissionFilter
		? await Promise.all([
				Submission.countDocuments(pendingSubmissionFilter),
				Submission.find(pendingSubmissionFilter)
					.sort({ createdAt: -1 })
					.limit(5)
					.populate('userId', 'name email')
					.populate({
						path: 'assignmentId',
						select: 'title courseId',
						populate: {
							path: 'courseId',
							select: 'title',
						},
					}),
		  ])
		: [0, []];

	const coursePerformance = courses
		.map((course) => {
			const courseId = course._id.toString();
			const enrollments = enrollmentCountMap.get(courseId)?.count || 0;
			const progress = progressMap.get(courseId);
			const completed = progress?.completed || 0;
			const activeLearners = progress?.active || 0;
			const retentionRate = enrollments > 0 ? Math.round((completed / enrollments) * 100) : 0;
			const dropoffRate = enrollments > 0 ? Math.max(0, 100 - retentionRate) : 0;
			const averageProgress = progress?.averageProgress ? Number(progress.averageProgress.toFixed(1)) : 0;

			return {
				courseId: course._id,
				title: course.title,
				category: course.category || 'General',
				status: course.status,
				rating: Number((course.rating || 0).toFixed(1)),
				reviewCount: course.reviewCount || 0,
				enrollments,
				activeLearners,
				completedLearners: completed,
				retentionRate,
				dropoffRate,
				averageProgress,
				googleClassroom: course.googleClassroom || {},
				createdAt: course.createdAt,
			};
		})
		.sort((a, b) => {
			if (b.enrollments !== a.enrollments) {
				return b.enrollments - a.enrollments;
			}

			if (b.retentionRate !== a.retentionRate) {
				return b.retentionRate - a.retentionRate;
			}

			return b.rating - a.rating;
		});

	const totalEnrollments = coursePerformance.reduce((sum, course) => sum + course.enrollments, 0);
	const totalActiveLearners = coursePerformance.reduce((sum, course) => sum + course.activeLearners, 0);
	const avgAttendance = totalEnrollments > 0 ? Number(((totalActiveLearners / totalEnrollments) * 100).toFixed(1)) : 0;
	const avgRating =
		coursePerformance.length > 0
			? Number(
					(
						coursePerformance.reduce((sum, course) => sum + (course.rating || 0), 0) /
						coursePerformance.length
					).toFixed(1)
			  )
			: 0;

	const retentionData = coursePerformance.slice(0, 6).map((course) => ({
		name: course.title,
		completion: course.retentionRate,
		dropoff: course.dropoffRate,
		enrollments: course.enrollments,
		averageProgress: course.averageProgress,
	}));

	const recentEvents = [
		...recentEnrollments.map((enrollment) => ({
			type: 'enrollment',
			title: 'New Student Enrollment',
			description: `${enrollment.userId?.name || 'A learner'} joined ${
				courseMap.get(enrollment.courseId.toString())?.title || 'your course'
			}`,
			occurredAt: enrollment.enrolledAt,
		})),
		...recentPendingSubmissions.map((submission) => ({
			type: 'submission',
			title: 'Submission Ready to Grade',
			description: `${submission.userId?.name || 'A learner'} submitted ${
				submission.assignmentId?.title || 'an assignment'
			}`,
			occurredAt: submission.createdAt,
		})),
		...coursePerformance
			.filter((course) => course.status === 'published')
			.slice(0, 3)
			.map((course) => ({
				type: 'course',
				title: 'Published Course Active',
				description: `${course.title} is live with ${course.enrollments} enrolled learners`,
				occurredAt: course.createdAt,
			})),
	]
		.filter((event) => event.occurredAt)
		.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
		.slice(0, 6);

	const topCourse = coursePerformance[0] || null;
	const creatorInsight = topCourse
		? {
				title: `${topCourse.title} leads your catalog`,
				body: `${topCourse.enrollments} learners enrolled, ${topCourse.retentionRate}% course completion, and a ${topCourse.rating.toFixed(
					1
				)}/5 rating are making it your strongest performer right now.`,
				ctaLabel: 'View Trends',
		  }
		: {
				title: 'Build your first live course signal',
				body: 'Publish a course and enroll learners to unlock live retention, activity, and performance insights here.',
				ctaLabel: 'Create Course',
		  };

	return {
		totalEnrollments,
		pendingGrading,
		avgRating,
		totalCourses: courses.length,
		avgAttendance,
		recentEnrollments: recentEnrollments.map((enrollment) => ({
			studentName: enrollment.userId?.name,
			courseTitle: courseMap.get(enrollment.courseId.toString())?.title,
			date: enrollment.enrolledAt,
		})),
		retentionData,
		recentEvents,
		topCourse,
		coursePerformance,
		creatorInsight,
	};
};
