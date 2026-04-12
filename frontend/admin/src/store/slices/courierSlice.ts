<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>courierSlice.ts</title>
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
// frontend/admin/src/store/slices/courierSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { couriersApi, CourierStats, CourierOrderResponse, UpdateLocationRequest } from '../../api/couriers.api';
import { User } from '../../api/users.api';

export interface CourierState {
    couriers: User[];
    selectedCourier: User | null;
    courierStats: CourierStats | null;
    availableOrders: CourierOrderResponse[];
    currentOrder: CourierOrderResponse | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CourierState = {
    couriers: [],
    selectedCourier: null,
    courierStats: null,
    availableOrders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
};

// Async thunk барои гирифтани ҳамаи курьерҳо
export const fetchCouriers = createAsyncThunk(
    'couriers/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await couriersApi.getAllCouriers();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани курьерҳо');
        }
    }
);

// Async thunk барои гирифтани профили курьер
export const fetchCourierProfile = createAsyncThunk(
    'couriers/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await couriersApi.getProfile();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани профили курьер');
        }
    }
);

// Async thunk барои гирифтани омори курьер
export const fetchCourierStats = createAsyncThunk(
    'couriers/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await couriersApi.getStats();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани омор');
        }
    }
);

// Async thunk барои навсозии ҷойгиршавӣ
export const updateLocation = createAsyncThunk(
    'couriers/updateLocation',
    async (data: UpdateLocationRequest, { rejectWithValue }) => {
        try {
            const response = await couriersApi.updateLocation(data);
            if (response.success) {
                return response;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми навсозии ҷойгиршавӣ');
        }
    }
);

// Async thunk барои гирифтани фармоишҳои дастрас
export const fetchAvailableOrders = createAsyncThunk(
    'couriers/fetchAvailableOrders',
    async (radius?: number, { rejectWithValue }) => {
        try {
            const response = await couriersApi.getAvailableOrders(radius);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани фармоишҳои дастрас');
        }
    }
);

// Async thunk барои гирифтани фармоиши ҷорӣ
export const fetchCurrentOrder = createAsyncThunk(
    'couriers/fetchCurrentOrder',
    async (_, { rejectWithValue }) => {
        try {
            const response = await couriersApi.getCurrentOrder();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани фармоиши ҷорӣ');
        }
    }
);

// Async thunk барои қабули фармоиш
export const acceptOrder = createAsyncThunk(
    'couriers/acceptOrder',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await couriersApi.acceptOrder(orderId);
            if (response.success) {
                return orderId;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми қабули фармоиш');
        }
    }
);

// Async thunk барои тамом кардани фармоиш
export const completeOrder = createAsyncThunk(
    'couriers/completeOrder',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await couriersApi.completeOrder(orderId);
            if (response.success) {
                return orderId;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми тамом кардани фармоиш');
        }
    }
);

const courierSlice = createSlice({
    name: 'couriers',
    initialState,
    reducers: {
        clearSelectedCourier: (state) => {
            state.selectedCourier = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearAvailableOrders: (state) => {
            state.availableOrders = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchCouriers
            .addCase(fetchCouriers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCouriers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.isLoading = false;
                state.couriers = action.payload;
            })
            .addCase(fetchCouriers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // fetchCourierProfile
            .addCase(fetchCourierProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCourierProfile.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.selectedCourier = action.payload;
            })
            .addCase(fetchCourierProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // fetchCourierStats
            .addCase(fetchCourierStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCourierStats.fulfilled, (state, action: PayloadAction<CourierStats>) => {
                state.isLoading = false;
                state.courierStats = action.payload;
            })
            .addCase(fetchCourierStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // fetchAvailableOrders
            .addCase(fetchAvailableOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAvailableOrders.fulfilled, (state, action: PayloadAction<CourierOrderResponse[]>) => {
                state.isLoading = false;
                state.availableOrders = action.payload;
            })
            .addCase(fetchAvailableOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // fetchCurrentOrder
            .addCase(fetchCurrentOrder.fulfilled, (state, action: PayloadAction<CourierOrderResponse | null>) => {
                state.currentOrder = action.payload;
            })
            // acceptOrder
            .addCase(acceptOrder.fulfilled, (state, action: PayloadAction<string>) => {
                state.availableOrders = state.availableOrders.filter(o => o.id !== action.payload);
                if (state.currentOrder === null) {
                    const acceptedOrder = state.availableOrders.find(o => o.id === action.payload);
                    if (acceptedOrder) {
                        state.currentOrder = acceptedOrder;
                    }
                }
            })
            // completeOrder
            .addCase(completeOrder.fulfilled, (state, action: PayloadAction<string>) => {
                if (state.currentOrder?.id === action.payload) {
                    state.currentOrder = null;
                }
            });
    },
});

export const { clearSelectedCourier, clearError, clearAvailableOrders } = courierSlice.actions;
export default courierSlice.reducer;
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
