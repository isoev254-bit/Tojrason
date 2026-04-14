<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>user.types.ts</title>
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
// frontend/admin/src/types/user.types.ts
// Типҳои корбар барои фронтенд

import { UserRole } from './auth.types';

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

export interface Courier extends User {
    role: 'COURIER';
    vehicle?: string;
    licensePlate?: string;
    experience?: string;
    city?: string;
    rating?: number;
    totalDeliveries?: number;
}

export interface CourierStats {
    courierId: string;
    totalDelivered: number;
    totalEarnings: number;
    activeOrdersCount: number;
    rating: number;
}
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
