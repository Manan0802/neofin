import axios from 'axios';

// Use environment variable with fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable credentials for CORS
});

// Log the API URL being used (helpful for debugging)
console.log('🌐 API URL:', API_URL);

export default api;
