<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>axios.config.ts</title>
    <style>
        .code-container {
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            position: relative;
            margin: 20px 0;
        }
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #007acc;
            color: white;
            border: none;
            padding: 5px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }
        .copy-btn:hover {
            background-color: #005a9e;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
<div class="code-container">
    <button class="copy-btn" onclick="copyCode()">Копия кардан</button>
    <pre id="codeBlock">
// frontend/admin/src/api/axios.config.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// URL-и асосии API аз .env гирифта мешавад
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Эҷоди инстанси Axios
export const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 📌 Interceptor барои илова кардани токен ба ҳар дархост
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError): Promise&lt;AxiosError&gt; => {
        return Promise.reject(error);
    }
);

// 📌 Interceptor барои коркарди хатогиҳои глобалӣ
axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        return response;
    },
    async (error: AxiosError): Promise&lt;any&gt; => {
        const originalRequest = error.config as any;
        
        // Агар хатогии 401 (Unauthorized) бошад ва ин дархости refresh набошад
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Тоза кардани токен ва бозгашт ба саҳифаи логин
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            
            // Агар дар браузер бошем, ба логин равона кун
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

// Функсияи ёвар барои API дархостҳо
export const api = {
    get: &lt;T = any&gt;(url: string, params?: any): Promise&lt;T&gt; => {
        return axiosInstance.get&lt;T&gt;(url, { params }).then(res => res.data);
    },
    post: &lt;T = any&gt;(url: string, data?: any): Promise&lt;T&gt; => {
        return axiosInstance.post&lt;T&gt;(url, data).then(res => res.data);
    },
    put: &lt;T = any&gt;(url: string, data?: any): Promise&lt;T&gt; => {
        return axiosInstance.put&lt;T&gt;(url, data).then(res => res.data);
    },
    patch: &lt;T = any&gt;(url: string, data?: any): Promise&lt;T&gt; => {
        return axiosInstance.patch&lt;T&gt;(url, data).then(res => res.data);
    },
    delete: &lt;T = any&gt;(url: string): Promise&lt;T&gt; => {
        return axiosInstance.delete&lt;T&gt;(url).then(res => res.data);
    },
};

export default axiosInstance;
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ Код копия карда шуд!');
    }).catch(() => {
        alert('❌ Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
