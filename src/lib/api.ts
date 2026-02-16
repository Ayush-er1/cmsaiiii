import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
});

// Request interceptor to add the access token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors (optional but good practice)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // You can handle 401 Unauthorized here, e.g., redirect to login or refresh token
        if (error.response && error.response.status === 401) {
            // Potentially clear token or redirect
            // localStorage.removeItem('access_token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
