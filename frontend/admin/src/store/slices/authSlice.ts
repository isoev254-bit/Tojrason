<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>authSlice.ts</title>
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
// frontend/admin/src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, UserResponse, LoginRequest, RegisterRequest } from '../../api/auth.api';

export interface AuthState {
    user: UserResponse | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('accessToken'),
    isLoading: false,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    error: null,
};

// Async thunk барои логин
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials);
            if (response.success) {
                const { token, user } = response.data;
                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { token, user };
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми воридшавӣ');
        }
    }
);

// Async thunk барои регистратсия
export const register = createAsyncThunk(
    'auth/register',
    async (data: RegisterRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.register(data);
            if (response.success) {
                const { token, user } = response.data;
                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { token, user };
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми сабти ном');
        }
    }
);

// Async thunk барои гирифтани маълумоти корбари ҷорӣ
export const getMe = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authApi.getMe();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани маълумот');
        }
    }
);

// Async thunk барои баромадан
export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        authApi.logout();
        return null;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<UserResponse>) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            // GetMe
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(getMe.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            });
    },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
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
