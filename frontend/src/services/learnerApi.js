import { api } from './api';

const unwrap = (response) => response.data?.data;

// ── Courses ──
export const fetchCourses = (params = {}) => api.get('/courses', { params }).then(unwrap);
export const fetchCourseById = (courseId) => api.get(`/courses/${courseId}`).then(unwrap);
export const fetchCourseDetails = (courseId) => api.get(`/courses/${courseId}/details`).then(unwrap);

// ── Enrollments ──
export const enrollInCourse = (courseId) => api.post('/enrollments', { courseId }).then(unwrap);
export const fetchMyEnrollments = () => api.get('/enrollments/me').then(unwrap);
export const checkEnrollment = (courseId) => api.get(`/enrollments/check/${courseId}`).then(unwrap);
export const unenrollFromCourse = (courseId) => api.delete(`/enrollments/${courseId}`).then(unwrap);

// ── Lessons ──
export const fetchLessonsByCourse = (courseId) => api.get(`/lessons/course/${courseId}`).then(unwrap);
export const fetchLessonById = (lessonId) => api.get(`/lessons/${lessonId}`).then(unwrap);

// ── Assignments ──
export const fetchMyAssignments = () => api.get('/assignments/me').then(unwrap);
export const fetchAssignmentsByCourse = (courseId) => api.get(`/assignments/course/${courseId}`).then(unwrap);
export const fetchAssignmentById = (assignmentId) => api.get(`/assignments/${assignmentId}`).then(unwrap);

// ── Submissions ──
export const submitAssignment = (formData) =>
    api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
export const fetchMySubmissions = () => api.get('/submissions/me').then(unwrap);

// ── Quizzes ──
export const fetchMyQuizzes = () => api.get('/quizzes/me').then(unwrap);
export const fetchQuizzesByCourse = (courseId) => api.get(`/quizzes/course/${courseId}`).then(unwrap);
export const fetchQuizById = (quizId) => api.get(`/quizzes/${quizId}`).then(unwrap);
export const submitQuiz = (quizId, payload) => api.post(`/quizzes/${quizId}/submit`, payload).then(unwrap);
export const fetchQuizAttemptResult = (attemptId) => api.get(`/quizzes/attempt/${attemptId}`).then(unwrap);
export const fetchMyQuizAttempts = (quizId) => api.get(`/quizzes/${quizId}/my-attempts`).then(unwrap);

// ── Progress ──
export const fetchMyProgress = () => api.get('/progress/me').then(unwrap);
export const updateProgress = (courseId, lessonId) =>
    api.put('/progress', { courseId, lessonId }).then(unwrap);

// ── Certificates ──
export const fetchMyCertificates = () => api.get('/certificates/me').then(unwrap);
export const issueCertificate = (courseId) => api.post('/certificates', { courseId }).then(unwrap);
export const fetchCertificateById = (certId) => api.get(`/certificates/${certId}`).then(unwrap);
export const verifyCertificate = (certNumber) => api.get(`/certificates/verify/${certNumber}`).then(unwrap);

// ── Community / Discussions ──
export const fetchDiscussions = (params = {}) => api.get('/community', { params }).then(unwrap);
export const fetchDiscussionById = (discussionId) => api.get(`/community/${discussionId}`).then(unwrap);
export const createDiscussion = (payload) => api.post('/community', payload).then(unwrap);
export const addReply = (discussionId, content) => api.post(`/community/${discussionId}/reply`, { content }).then(unwrap);
export const toggleLike = (discussionId) => api.post(`/community/${discussionId}/like`).then(unwrap);
export const deleteDiscussion = (discussionId) => api.delete(`/community/${discussionId}`).then(unwrap);

// ── Messages ──
export const sendMessage = (payload) => api.post('/messages', payload).then(unwrap);
export const fetchInbox = () => api.get('/messages/inbox').then(unwrap);
export const fetchSentMessages = () => api.get('/messages/sent').then(unwrap);
export const fetchMessageById = (messageId) => api.get(`/messages/${messageId}`).then(unwrap);
export const markMessageAsRead = (messageId) => api.patch(`/messages/${messageId}/read`).then(unwrap);
export const deleteMessage = (messageId) => api.delete(`/messages/${messageId}`).then(unwrap);
export const fetchUnreadCount = () => api.get('/messages/unread-count').then(unwrap);

// ── Message Access Requests ──
export const requestMessageAccess = (instructorId, note = '') =>
    api.post('/message-access/request', { instructorId, note }).then(unwrap);
export const fetchMessageAccessStatus = (instructorId) =>
    api.get(`/message-access/status/${instructorId}`).then(unwrap);
export const checkMessageAccessApproved = (instructorId) =>
    api.get(`/message-access/check/${instructorId}`).then(unwrap);

// ── Agora / Calls ──
export const fetchAgoraToken = (payload) => api.post('/agora/token', payload).then(unwrap);

// ── Announcements ──
export const fetchAnnouncements = () => api.get('/announcements').then(unwrap);
export const fetchAnnouncementById = (announcementId) => api.get(`/announcements/${announcementId}`).then(unwrap);
export const createAnnouncement = (payload) => api.post('/announcements', payload).then(unwrap);

// ── Dashboard / Stats ──
export const fetchLearnerDashboard = () => api.get('/dashboard/learner').then(unwrap);
export const fetchLeaderboard = () => api.get('/dashboard/leaderboard').then(unwrap);
export const fetchGrades = () => api.get('/dashboard/grades').then(unwrap);

// ── Communication (existing) ──
export const postCommunication = (payload) => api.post('/communication', payload).then(unwrap);
export const fetchCommunicationsByCourse = (courseId) => api.get(`/communication/course/${courseId}`).then(unwrap);

// ── Users ──
export const fetchUsers = () => api.get('/users').then(unwrap);
export const fetchUserById = (userId) => api.get(`/users/${userId}`).then(unwrap);

// ── Dashboard Stats (for ProgressDashboard) ──
export const fetchDashboardStats = () => api.get('/dashboard/stats').then(unwrap);

// ── Messages (thread-based for MessageInbox) ──
export const fetchMessages = () => api.get('/messages/inbox').then(unwrap);
export const sendMessageAPI = (payload) => api.post('/messages', payload).then(unwrap);

// ── Announcements (create alias) ──
export const createAnnouncementAPI = (payload) => api.post('/announcements', payload).then(unwrap);
