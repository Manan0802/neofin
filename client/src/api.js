import axios from 'axios';

// Use environment variable with fallback to localhost for development
let envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Remove trailing slash if present to avoid double slashes
if (envApiUrl.endsWith('/')) {
    envApiUrl = envApiUrl.slice(0, -1);
}

// Ensure the URL ends with /api
const API_URL = envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`;

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('neofin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Log the API URL being used (helpful for debugging)
console.log('🌐 API URL:', API_URL);

export default api;
