<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>App.tsx</title>
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
// frontend/admin/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users, UserDetails } from './pages/Users';
import { Orders, OrderDetails, OrderAssign } from './pages/Orders';
import { Couriers, CourierDetails, CourierMap } from './pages/Couriers';
import { Payments, PaymentDetails } from './pages/Payments';
import { Reports, OrderReport, FinanceReport, CourierReport } from './pages/Reports';
import { Settings, Profile, Security, NotificationSettings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { Loader } from './components/common/Loader';
import { connectSocket, disconnectSocket } from './utils/socket';

// Компоненти муҳофизи роутҳо (PrivateRoute)
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <Loader fullScreen text="Боркунӣ..." />;
    }
    
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Компоненти асосии барнома бо логикаи сокет
const AppContent: React.FC = () => {
    const { isAuthenticated, token } = useAuth();
    
    useEffect(() => {
        if (isAuthenticated && token) {
            connectSocket(token);
        } else {
            disconnectSocket();
        }
    }, [isAuthenticated, token]);
    
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <PrivateRoute>
                    <Layout />
                </PrivateRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="users">
                    <Route index element={<Users />} />
                    <Route path=":id" element={<UserDetails />} />
                </Route>
                <Route path="orders">
                    <Route index element={<Orders />} />
                    <Route path=":id" element={<OrderDetails />} />
                    <Route path=":id/assign" element={<OrderAssign />} />
                </Route>
                <Route path="couriers">
                    <Route index element={<Couriers />} />
                    <Route path=":id" element={<CourierDetails />} />
                    <Route path="map" element={<CourierMap />} />
                </Route>
                <Route path="payments">
                    <Route index element={<Payments />} />
                    <Route path=":id" element={<PaymentDetails />} />
                </Route>
                <Route path="reports">
                    <Route index element={<Reports />} />
                    <Route path="orders" element={<OrderReport />} />
                    <Route path="finance" element={<FinanceReport />} />
                    <Route path="couriers" element={<CourierReport />} />
                </Route>
                <Route path="settings">
                    <Route index element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="security" element={<Security />} />
                    <Route path="notifications" element={<NotificationSettings />} />
                </Route>
                <Route path="404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </Provider>
    );
};

export default App;
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
