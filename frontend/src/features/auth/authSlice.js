import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    pendingVerificationEmail: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart(state) {
            state.loading = true;
            state.error = null;
        },
        loginSuccess(state, action) {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
        },
        loginFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        setPendingVerificationEmail(state, action) {
            state.pendingVerificationEmail = action.payload;
        },
        clearPendingVerificationEmail(state) {
            state.pendingVerificationEmail = null;
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.pendingVerificationEmail = null;
        },
        updateUser(state, action) {
            state.user = { ...state.user, ...action.payload };
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    setPendingVerificationEmail,
    clearPendingVerificationEmail,
    logout,
    updateUser,
} = authSlice.actions;
export default authSlice.reducer;
