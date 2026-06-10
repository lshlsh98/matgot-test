// api/index.js - axios 인스턴스 설정
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor (토큰 자동 첨부)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor (에러 공통 처리)
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 처리
        }
        return Promise.reject(error);
    }
);

export default apiClient;