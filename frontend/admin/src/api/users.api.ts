<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>users.api.ts</title>
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
// frontend/admin/src/api/users.api.ts - API барои идоракунии корбарон
import { api } from './axios.config';

// Типҳо
export type UserRole = 'CLIENT' | 'COURIER' | 'ADMIN' | 'DISPATCHER';

export interface User {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    role: UserRole;
    locationLat?: number | null;
    locationLng?: number | null;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserRequest {
    fullName?: string;
    phone?: string;
    email?: string;
    locationLat?: number | null;
    locationLng?: number | null;
    isAvailable?: boolean;
}

export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UserFilters {
    role?: UserRole;
    isAvailable?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedUsers {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// API методҳо
export const usersApi = {
    /**
     * Гирифтани профили корбари ҷорӣ
     * @returns Маълумоти корбар
     */
    getProfile: async (): Promise&lt;{ success: boolean; data: User }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: User }&gt;('/users/profile');
        return response;
    },

    /**
     * Навсозии профили корбари ҷорӣ
     * @param data - Маълумоти навсозӣ
     * @returns Маълумоти навсозӣшуда
     */
    updateProfile: async (data: UpdateUserRequest): Promise&lt;{ success: boolean; data: User }&gt; => {
        const response = await api.put&lt;{ success: boolean; data: User }&gt;('/users/profile', data);
        return response;
    },

    /**
     * Навсозии пароли корбар
     * @param data - Пароли ҷорӣ ва нав
     * @returns Натиҷа
     */
    updatePassword: async (data: UpdatePasswordRequest): Promise&lt;{ success: boolean; message: string }&gt; => {
        const response = await api.put&lt;{ success: boolean; message: string }&gt;('/users/password', data);
        return response;
    },

    /**
     * Гирифтани ҳамаи корбарон (танҳо ADMIN)
     * @param params - Филтрҳо
     * @returns Рӯйхати корбарон бо саҳифабандӣ
     */
    getAllUsers: async (params?: UserFilters): Promise&lt;{ success: boolean; data: PaginatedUsers }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: PaginatedUsers }&gt;('/users', params);
        return response;
    },

    /**
     * Гирифтани корбар бо ID (танҳо ADMIN)
     * @param id - ID корбар
     * @returns Маълумоти корбар
     */
    getUserById: async (id: string): Promise&lt;{ success: boolean; data: User }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: User }&gt;(`/users/${id}`);
        return response;
    },

    /**
     * Навсозии корбар (танҳо ADMIN)
     * @param id - ID корбар
     * @param data - Маълумоти навсозӣ
     * @returns Маълумоти навсозӣшуда
     */
    updateUser: async (id: string, data: UpdateUserRequest): Promise&lt;{ success: boolean; data: User }&gt; => {
        const response = await api.put&lt;{ success: boolean; data: User }&gt;(`/users/${id}`, data);
        return response;
    },

    /**
     * Нест кардани корбар (танҳо ADMIN)
     * @param id - ID корбар
     * @returns Натиҷа
     */
    deleteUser: async (id: string): Promise&lt;{ success: boolean; message: string }&gt; => {
        const response = await api.delete&lt;{ success: boolean; message: string }&gt;(`/users/${id}`);
        return response;
    },

    /**
     * Гирифтани ҳамаи курьерҳо (барои таъин кардан)
     * @returns Рӯйхати курьерҳо
     */
    getCouriers: async (): Promise&lt;{ success: boolean; data: User[] }&gt; => {
        const response = await api.get&lt;{ success: boolean; data: User[] }&gt;('/users/couriers');
        return response;
    },
};

export default usersApi;
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
