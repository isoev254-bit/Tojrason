<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>useAuth.ts</title>
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
// frontend/admin/src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, UserResponse } from '../api/auth.api';

export interface UseAuthReturn {
    /** Маълумоти корбари ҷорӣ */
    user: UserResponse | null;
    /** Оям дар ҳоли боркунӣ аст */
    loading: boolean;
    /** Оям корбар ворид шудааст */
    isAuthenticated: boolean;
    /** Функсия барои логин */
    login: (email: string, password: string) => Promise&lt;boolean&gt;;
    /** Функсия барои регистратсия */
    register: (data: {
        email: string;
        phone: string;
        password: string;
        fullName: string;
        role?: 'CLIENT' | 'COURIER' | 'ADMIN' | 'DISPATCHER';
    }) => Promise&lt;boolean&gt;;
    /** Функсия барои баромадан */
    logout: () => void;
    /** Функсия барои навсозии профил */
    updateUser: (user: UserResponse) => void;
}

export const useAuth = (): UseAuthReturn => {
    const navigate = useNavigate();
    const [user, setUser] = useState&lt;UserResponse | null&gt;(null);
    const [loading, setLoading] = useState&lt;boolean&gt;(true);

    // Боркунии маълумоти корбар аз localStorage ва тасдиқ бо сервер
    const loadUser = useCallback(async () => {
        const token = authApi.getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await authApi.getMe();
            if (response.success) {
                setUser(response.data);
                authApi.setUser(response.data);
            } else {
                authApi.logout();
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            authApi.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Логин
    const login = useCallback(async (email: string, password: string): Promise&lt;boolean&gt; => {
        setLoading(true);
        try {
            const response = await authApi.login({ email, password });
            if (response.success) {
                const { token, user: userData } = response.data;
                authApi.setToken(token);
                authApi.setUser(userData);
                setUser(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Регистратсия
    const register = useCallback(async (data: {
        email: string;
        phone: string;
        password: string;
        fullName: string;
        role?: 'CLIENT' | 'COURIER' | 'ADMIN' | 'DISPATCHER';
    }): Promise&lt;boolean&gt; => {
        setLoading(true);
        try {
            const response = await authApi.register(data);
            if (response.success) {
                const { token, user: userData } = response.data;
                authApi.setToken(token);
                authApi.setUser(userData);
                setUser(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration failed:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Баромадан
    const logout = useCallback(() => {
        authApi.logout();
        setUser(null);
        navigate('/login');
    }, [navigate]);

    // Навсозии маълумоти корбар дар state
    const updateUser = useCallback((updatedUser: UserResponse) => {
        setUser(updatedUser);
        authApi.setUser(updatedUser);
    }, []);

    // Боркунии аввала
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
    };
};

export default useAuth;
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
