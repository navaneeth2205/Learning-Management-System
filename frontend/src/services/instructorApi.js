import { api } from './api';

const unwrap = (response) => response.data?.data;

// ── Dashboard / Stats ──
export const fetchInstructorDashboard = () => api.get('/dashboard/instructor').then(unwrap);
export const fetchInstructorStats = () => api.get('/dashboard/instructor/stats').then(unwrap);
export const fetchCoursePerformance = () => api.get('/dashboard/instructor/performance').then(unwrap);

// ── Courses ──
export const fetchInstructorCourses = () => api.get('/courses/instructor/me').then(unwrap);
export const createCourse = (formData) => 
    api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
export const updateCourse = (courseId, formData) =>
    api.put(`/courses/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
export const deleteCourse = (courseId) => api.delete(`/courses/${courseId}`).then(unwrap);

// ── Lessons ──
export const createLesson = (formData) =>
    api.post('/lessons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
export const updateLesson = (lessonId, formData) =>
    api.put(`/lessons/${lessonId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
export const deleteLesson = (lessonId) => api.delete(`/lessons/${lessonId}`).then(unwrap);

// ── Assignments ──
export const fetchMyAssignments = () => api.get('/assignments/me').then(unwrap);
export const createAssignment = (payload) => api.post('/assignments', payload).then(unwrap);
export const updateAssignment = (assignmentId, payload) => api.put(`/assignments/${assignmentId}`, payload).then(unwrap);
export const deleteAssignment = (assignmentId) => api.delete(`/assignments/${assignmentId}`).then(unwrap);

// ── Submissions & Grading ──
export const fetchPendingSubmissions = () => api.get('/submissions/pending').then(unwrap);
export const fetchSubmissionById = (id) => api.get(`/submissions/${id}`).then(unwrap);
export const gradeSubmission = (submissionId, payload) => api.post(`/submissions/${submissionId}/grade`, payload).then(unwrap);

// ── Quizzes ──
export const fetchInstructorQuizzes = () => api.get('/quizzes/me').then(unwrap);
export const createQuiz = (payload) => api.post('/quizzes', payload).then(unwrap);
export const updateQuiz = (quizId, payload) => api.put(`/quizzes/${quizId}`, payload).then(unwrap);
export const deleteQuiz = (quizId) => api.delete(`/quizzes/${quizId}`).then(unwrap);
export const fetchQuizAnalytics = (quizId) => api.get(`/quizzes/${quizId}/analytics`).then(unwrap);

// ── Analytics ──
export const fetchPlatformAnalytics = () => api.get('/analytics/platform').then(unwrap);
export const fetchCourseAnalytics = (courseId) => api.get(`/analytics/course/${courseId}`).then(unwrap);

// ── Communications ──
export const fetchQuestions = () => api.get('/communication/questions').then(unwrap);
export const answerQuestion = (questionId, answer) => api.post(`/communication/questions/${questionId}/answer`, { answer }).then(unwrap);

// ── Message Access Requests ──
export const fetchIncomingMessageAccessRequests = () => api.get('/message-access/instructor/me').then(unwrap);
export const approveMessageAccessRequest = (requestId) => api.patch(`/message-access/${requestId}/approve`).then(unwrap);
export const rejectMessageAccessRequest = (requestId) => api.patch(`/message-access/${requestId}/reject`).then(unwrap);
