import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import courseReducer from '../features/courses/courseSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import quizReducer from '../features/quiz/quizSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        courses: courseReducer,
        notifications: notificationReducer,
        quiz: quizReducer,
    },
});

export default store;
