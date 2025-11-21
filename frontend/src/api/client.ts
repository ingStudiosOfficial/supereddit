import axios from 'axios';

const VITE_API_URL: string = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login or show auth modal
            console.log('Unauthorized - please login');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
