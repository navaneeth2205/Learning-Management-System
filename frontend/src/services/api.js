import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete api.defaults.headers.common.Authorization;
};

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error?.response?.data?.message || error?.message || 'Request failed';
        return Promise.reject(new Error(message));
    }
);
