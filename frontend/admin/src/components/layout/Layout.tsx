<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Layout.tsx</title>
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
// frontend/admin/src/components/layout/Layout.tsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar, MenuItem } from './Sidebar';
import { Footer } from './Footer';
import './Layout.module.css';

export interface LayoutProps {
    /** Номи корбар */
    userName?: string;
    /** Нақши корбар */
    userRole?: string;
    /** Массиви меню */
    menuItems?: MenuItem[];
    /** Оё Sidebar дар ҳолати компакт аст */
    sidebarCompact?: boolean;
    /** Функсия барои logout */
    onLogout?: () => void;
    /** Функсия барои клик ба уведомление */
    onNotificationClick?: () => void;
    /** Шумораи уведомлениеҳо */
    notificationCount?: number;
    /** Даромадгоҳи фаръӣ */
    children?: React.ReactNode;
}

// Менюи пешфарз барои админ
const defaultMenuItems: MenuItem[] = [
    {
        key: 'dashboard',
        title: 'Асосӣ',
        icon: '📊',
        path: '/',
    },
    {
        key: 'map',
        title: 'Харита',
        icon: '🗺️',
        path: '/map',
    },
    {
        key: 'orders',
        title: 'Фармоишҳо',
        icon: '📦',
        path: '/orders',
        badge: 24,
        badgeVariant: 'primary',
    },
    {
        key: 'couriers',
        title: 'Курерҳо',
        icon: '🏍️',
        path: '/couriers',
        children: [
            {
                key: 'couriers-list',
                title: 'Рӯйхати курерҳо',
                icon: '📋',
                path: '/couriers',
            },
            {
                key: 'couriers-hiring',
                title: 'Қабул',
                icon: '📝',
                path: '/hiring',
                badge: 3,
                badgeVariant: 'warning',
            },
        ],
    },
    {
        key: 'clients',
        title: 'Муштариён',
        icon: '👥',
        path: '/clients',
    },
    {
        key: 'complaints',
        title: 'Шикоятҳо',
        icon: '📢',
        path: '/complaints',
        badge: 7,
        badgeVariant: 'danger',
    },
    {
        key: 'payments',
        title: 'Пардохтҳо',
        icon: '💰',
        path: '/payments',
    },
    {
        key: 'settings',
        title: 'Танзимот',
        icon: '⚙️',
        path: '/settings',
        children: [
            {
                key: 'settings-profile',
                title: 'Профил',
                icon: '👤',
                path: '/settings/profile',
            },
            {
                key: 'settings-security',
                title: 'Амният',
                icon: '🔒',
                path: '/settings/security',
            },
        ],
    },
];

export const Layout: React.FC&lt;LayoutProps&gt; = ({
    userName = 'Администратор',
    userRole = 'ADMIN',
    menuItems = defaultMenuItems,
    sidebarCompact = false,
    onLogout,
    onNotificationClick,
    notificationCount = 0,
    children,
}) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleMenuClick = () => {
        if (window.innerWidth <= 1024) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        } else {
            setIsSidebarOpen(!isSidebarOpen);
        }
    };

    const handleSidebarClose = () => {
        if (window.innerWidth <= 1024) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('accessToken');
            navigate('/login');
        }
    };

    const handleNotificationClick = () => {
        if (onNotificationClick) {
            onNotificationClick();
        } else {
            navigate('/notifications');
        }
    };

    const sidebarVariant = (sidebarCompact || !isSidebarOpen) ? 'compact' : 'default';

    return (
        &lt;div className="layout"&gt;
            &lt;Header
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                onMenuClick={handleMenuClick}
                onNotificationClick={handleNotificationClick}
                notificationCount={notificationCount}
            /&gt;
            &lt;div className="layout-body"&gt;
                &lt;Sidebar
                    menuItems={menuItems}
                    isOpen={isMobileMenuOpen || (window.innerWidth > 1024 && isSidebarOpen)}
                    onClose={handleSidebarClose}
                    variant={sidebarVariant}
                /&gt;
                &lt;main className="layout-main"&gt;
                    &lt;div className="layout-content"&gt;
                        {children || &lt;Outlet /&gt;}
                    &lt;/div&gt;
                    &lt;Footer /&gt;
                &lt;/main&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    );
};

Layout.displayName = 'Layout';

export default Layout;
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
