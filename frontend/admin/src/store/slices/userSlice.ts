<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>userSlice.ts</title>
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
// frontend/admin/src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersApi, User, UserFilters, PaginatedUsers, UpdateUserRequest } from '../../api/users.api';

export interface UserState {
    users: User[];
    selectedUser: User | null;
    total: number;
    currentPage: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
    filters: UserFilters;
}

const initialState: UserState = {
    users: [],
    selectedUser: null,
    total: 0,
    currentPage: 1,
    pageSize: 20,
    isLoading: false,
    error: null,
    filters: {},
};

// Async thunk барои гирифтани ҳамаи корбарон
export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (filters: UserFilters = {}, { rejectWithValue }) => {
        try {
            const response = await usersApi.getAllUsers(filters);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани корбарон');
        }
    }
);

// Async thunk барои гирифтани корбар бо ID
export const fetchUserById = createAsyncThunk(
    'users/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await usersApi.getUserById(id);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани корбар');
        }
    }
);

// Async thunk барои навсозии корбар
export const updateUser = createAsyncThunk(
    'users/update',
    async ({ id, data }: { id: string; data: UpdateUserRequest }, { rejectWithValue }) => {
        try {
            const response = await usersApi.updateUser(id, data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми навсозии корбар');
        }
    }
);

// Async thunk барои нест кардани корбар
export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await usersApi.deleteUser(id);
            if (response.success) {
                return id;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми нест кардани корбар');
        }
    }
);

// Async thunk барои гирифтани курьерҳо
export const fetchCouriers = createAsyncThunk(
    'users/fetchCouriers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await usersApi.getCouriers();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани курьерҳо');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<UserFilters>) => {
            state.filters = { ...state.filters, ...action.payload };
            state.currentPage = 1;
        },
        clearFilters: (state) => {
            state.filters = {};
            state.currentPage = 1;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
            state.currentPage = 1;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchUsers
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PaginatedUsers>) => {
                state.isLoading = false;
                state.users = action.payload.data;
                state.total = action.payload.total;
                state.currentPage = action.payload.page;
                state.pageSize = action.payload.limit;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // fetchUserById
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // updateUser
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // deleteUser
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.users = state.users.filter(u => u.id !== action.payload);
                if (state.selectedUser?.id === action.payload) {
                    state.selectedUser = null;
                }
                state.total -= 1;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // fetchCouriers
            .addCase(fetchCouriers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCouriers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.isLoading = false;
                // Курьерҳоро дар ҷойи алоҳида нигоҳ доштан мумкин аст
            })
            .addCase(fetchCouriers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFilters, clearFilters, setPage, setPageSize, clearSelectedUser, clearError } = userSlice.actions;
export default userSlice.reducer;
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
