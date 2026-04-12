<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>paymentSlice.ts</title>
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
// frontend/admin/src/store/slices/paymentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentsApi, Payment, PaymentFilters, PaginatedPayments, CreatePaymentRequest, RefundPaymentRequest } from '../../api/payments.api';

export interface PaymentState {
    payments: Payment[];
    selectedPayment: Payment | null;
    total: number;
    currentPage: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
    filters: PaymentFilters;
}

const initialState: PaymentState = {
    payments: [],
    selectedPayment: null,
    total: 0,
    currentPage: 1,
    pageSize: 20,
    isLoading: false,
    error: null,
    filters: {},
};

// Async thunk барои гирифтани ҳамаи пардохтҳо
export const fetchPayments = createAsyncThunk(
    'payments/fetchAll',
    async (filters: PaymentFilters = {}, { rejectWithValue }) => {
        try {
            const response = await paymentsApi.getAllPayments(filters);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани пардохтҳо');
        }
    }
);

// Async thunk барои гирифтани пардохтҳои корбари ҷорӣ
export const fetchMyPayments = createAsyncThunk(
    'payments/fetchMyPayments',
    async (filters: Omit<PaymentFilters, 'userId'> = {}, { rejectWithValue }) => {
        try {
            const response = await paymentsApi.getMyPayments(filters);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани пардохтҳои шумо');
        }
    }
);

// Async thunk барои гирифтани ҳолати пардохт
export const fetchPaymentStatus = createAsyncThunk(
    'payments/fetchStatus',
    async (paymentId: string, { rejectWithValue }) => {
        try {
            const response = await paymentsApi.getPaymentStatus(paymentId);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми гирифтани ҳолати пардохт');
        }
    }
);

// Async thunk барои эҷоди пардохт
export const createPayment = createAsyncThunk(
    'payments/create',
    async (data: CreatePaymentRequest, { rejectWithValue }) => {
        try {
            const response = await paymentsApi.createPayment(data);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми эҷоди пардохт');
        }
    }
);

// Async thunk барои бозгардонидани пардохт
export const refundPayment = createAsyncThunk(
    'payments/refund',
    async (data: RefundPaymentRequest, { rejectWithValue }) => {
        try {
            const response = await paymentsApi.refundPayment(data);
            if (response.success) {
                return { paymentId: data.paymentId, ...response };
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Хатогӣ ҳангоми бозгардон');
        }
    }
);

const paymentSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<PaymentFilters>) => {
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
        clearSelectedPayment: (state) => {
            state.selectedPayment = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchPayments
            .addCase(fetchPayments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<PaginatedPayments>) => {
                state.isLoading = false;
                state.payments = action.payload.data;
                state.total = action.payload.total;
                state.currentPage = action.payload.page;
                state.pageSize = action.payload.limit;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // fetchPaymentStatus
            .addCase(fetchPaymentStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentStatus.fulfilled, (state, action: PayloadAction<Payment>) => {
                state.isLoading = false;
                state.selectedPayment = action.payload;
            })
            .addCase(fetchPaymentStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // createPayment
            .addCase(createPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPayment.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // refundPayment
            .addCase(refundPayment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(refundPayment.fulfilled, (state, action: PayloadAction<{ paymentId: string }>) => {
                state.isLoading = false;
                // Навсозии пардохт дар рӯйхат
                const index = state.payments.findIndex(p => p.id === action.payload.paymentId);
                if (index !== -1 && state.payments[index]) {
                    state.payments[index].status = 'REFUNDED';
                }
                if (state.selectedPayment?.id === action.payload.paymentId) {
                    state.selectedPayment.status = 'REFUNDED';
                }
            })
            .addCase(refundPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFilters, clearFilters, setPage, setPageSize, clearSelectedPayment, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
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
