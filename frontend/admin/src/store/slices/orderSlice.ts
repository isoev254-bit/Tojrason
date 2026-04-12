<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>orderSlice.ts</title>
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
// frontend/admin/src/store/slices/orderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersApi, Order, OrderFilters, PaginatedOrders, UpdateOrderRequest } from '../../api/orders.api';

export interface OrderState {
    orders: Order[];
    selectedOrder: Order | null;
    total: number;
    currentPage: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
    filters: OrderFilters;
}

const initialState: OrderState = {
    orders: [],
    selectedOrder: null,
    total: 0,
    currentPage: 1,
    pageSize: 20,
    isLoading: false,
    error: null,
    filters: {},
};

// Async thunk барои гирифтани ҳамаи фармоишҳо
export const fetchOrders = createAsyncThunk(
    'orders/fetchAll',
    async (filters: OrderFilters = {}, { rejectWithValue }) => {
        try {
            const response = await ordersApi.getAllOrders(filters);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани фармоишҳо');
        }
    }
);

// Async thunk барои гирифтани фармоишҳои клиенти ҷорӣ
export const fetchMyOrders = createAsyncThunk(
    'orders/fetchMyOrders',
    async (filters: Omit<OrderFilters, 'clientId'> = {}, { rejectWithValue }) => {
        try {
            const response = await ordersApi.getMyOrders(filters);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани фармоишҳои шумо');
        }
    }
);

// Async thunk барои гирифтани фармоишҳои курьери ҷорӣ
export const fetchMyCourierOrders = createAsyncThunk(
    'orders/fetchMyCourierOrders',
    async (filters: Omit<OrderFilters, 'courierId'> = {}, { rejectWithValue }) => {
        try {
            const response = await ordersApi.getMyCourierOrders(filters);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани фармоишҳои курьер');
        }
    }
);

// Async thunk барои гирифтани фармоиш бо ID
export const fetchOrderById = createAsyncThunk(
    'orders/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await ordersApi.getOrderById(id);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани фармоиш');
        }
    }
);

// Async thunk барои навсозии статуси фармоиш
export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
        try {
            const response = await ordersApi.updateOrderStatus(id, status as any);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми навсозии статус');
        }
    }
);

// Async thunk барои таъини курьер
export const assignCourier = createAsyncThunk(
    'orders/assignCourier',
    async ({ id, courierId }: { id: string; courierId: string }, { rejectWithValue }) => {
        try {
            const response = await ordersApi.assignCourier(id, courierId);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми таъини курьер');
        }
    }
);

// Async thunk барои бекор кардани фармоиш
export const cancelOrder = createAsyncThunk(
    'orders/cancel',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await ordersApi.cancelOrder(id);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми бекор кардани фармоиш');
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<OrderFilters>) => {
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
        clearSelectedOrder: (state) => {
            state.selectedOrder = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchOrders
            .addCase(fetchOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<PaginatedOrders>) => {
                state.isLoading = false;
                state.orders = action.payload.data;
                state.total = action.payload.total;
                state.currentPage = action.payload.page;
                state.pageSize = action.payload.limit;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // fetchOrderById
            .addCase(fetchOrderById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
                state.isLoading = false;
                state.selectedOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // updateOrderStatus
            .addCase(updateOrderStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
                state.isLoading = false;
                const index = state.orders.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                if (state.selectedOrder?.id === action.payload.id) {
                    state.selectedOrder = action.payload;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // assignCourier
            .addCase(assignCourier.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(assignCourier.fulfilled, (state, action: PayloadAction<Order>) => {
                state.isLoading = false;
                const index = state.orders.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                if (state.selectedOrder?.id === action.payload.id) {
                    state.selectedOrder = action.payload;
                }
            })
            .addCase(assignCourier.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // cancelOrder
            .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<Order>) => {
                const index = state.orders.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                if (state.selectedOrder?.id === action.payload.id) {
                    state.selectedOrder = action.payload;
                }
            });
    },
});

export const { setFilters, clearFilters, setPage, setPageSize, clearSelectedOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
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
