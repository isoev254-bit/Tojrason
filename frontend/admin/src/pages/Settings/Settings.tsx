<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Settings.tsx</title>
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
// frontend/admin/src/pages/Settings/Settings.tsx
import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../api/users.api';
import './Settings.module.css';

type SettingsTab = 'general' | 'profile' | 'security' | 'notifications';

export const Settings: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Танзимоти умумӣ
    const [generalSettings, setGeneralSettings] = useState({
        companyName: 'Tojrason',
        companyPhone: '+992 44 600 0000',
        companyEmail: 'info@tojrason.com',
        language: 'tg',
        currency: 'TJS',
        timezone: 'Asia/Dushanbe',
    });

    // Профили корбар
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        email: user?.email || '',
    });

    // Танзимоти амният
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Танзимоти уведомлениеҳо
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        orderCreated: true,
        orderDelivered: true,
        complaintNew: true,
    });

    const handleSaveGeneral = async () => {
        setLoading(true);
        try {
            // Дар лоиҳаи воқеӣ, маълумотро дар сервер захира кунед
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccessMessage('Танзимот бомуваффақият захира шуд');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error saving general settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const response = await usersApi.updateProfile({
                fullName: profileData.fullName,
                phone: profileData.phone,
                email: profileData.email,
            });
            if (response.success && updateUser) {
                updateUser(response.data);
                setSuccessMessage('Профил бомуваффақият навсозӣ шуд');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert('Паролҳо мувофиқат намекунанд');
            return;
        }
        if (securityData.newPassword.length < 6) {
            alert('Парол бояд ҳадди ақал 6 рамз дошта бошад');
            return;
        }
        setLoading(true);
        try {
            await usersApi.updatePassword({
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword,
            });
            setSuccessMessage('Парол бомуваффақият иваз карда шуд');
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error changing password:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        try {
            // Дар лоиҳаи воқеӣ, маълумотро дар сервер захира кунед
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccessMessage('Танзимоти уведомлениеҳо захира шуд');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error saving notification settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'general', label: '⚙️ Умумӣ', icon: '⚙️' },
        { key: 'profile', label: '👤 Профил', icon: '👤' },
        { key: 'security', label: '🔒 Амният', icon: '🔒' },
        { key: 'notifications', label: '🔔 Уведомлениеҳо', icon: '🔔' },
    ];

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div>
                    <h1 className="settings-title">Танзимот</h1>
                    <p className="settings-subtitle">Идоракунии танзимоти система ва профили шахсӣ</p>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">
                    ✅ {successMessage}
                </div>
            )}

            <div className="settings-container">
                <div className="settings-sidebar">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key as SettingsTab)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="settings-content">
                    {/* Танзимоти умумӣ */}
                    {activeTab === 'general' && (
                        <Card title="Танзимоти умумӣ">
                            <div className="settings-form">
                                <div className="form-row">
                                    <Input
                                        label="Номи ширкат"
                                        value={generalSettings.companyName}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                                        fullWidth
                                    />
                                    <Input
                                        label="Телефон"
                                        value={generalSettings.companyPhone}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, companyPhone: e.target.value })}
                                        fullWidth
                                    />
                                </div>
                                <div className="form-row">
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={generalSettings.companyEmail}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, companyEmail: e.target.value })}
                                        fullWidth
                                    />
                                    <div className="form-field">
                                        <label className="form-label">Забон</label>
                                        <select
                                            className="form-select"
                                            value={generalSettings.language}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                                        >
                                            <option value="tg">Тоҷикӣ</option>
                                            <option value="ru">Русӣ</option>
                                            <option value="en">Англисӣ</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label className="form-label">Валюта</label>
                                        <select
                                            className="form-select"
                                            value={generalSettings.currency}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                                        >
                                            <option value="TJS">Сомонӣ (TJS)</option>
                                            <option value="USD">Доллар (USD)</option>
                                            <option value="RUB">Рубл (RUB)</option>
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">Минтақаи вақт</label>
                                        <select
                                            className="form-select"
                                            value={generalSettings.timezone}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                                        >
                                            <option value="Asia/Dushanbe">Душанбе (GMT+5)</option>
                                            <option value="Asia/Tashkent">Тошкент (GMT+5)</option>
                                            <option value="Asia/Almaty">Алмаато (GMT+6)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <Button variant="primary" onClick={handleSaveGeneral} loading={loading}>
                                        Захира кардан
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Профили корбар */}
                    {activeTab === 'profile' && (
                        <Card title="Профили шахсӣ">
                            <div className="settings-form">
                                <Input
                                    label="Номи пурра"
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    fullWidth
                                />
                                <Input
                                    label="Телефон"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    fullWidth
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    fullWidth
                                />
                                <div className="form-actions">
                                    <Button variant="primary" onClick={handleSaveProfile} loading={loading}>
                                        Захира кардан
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Танзимоти амният */}
                    {activeTab === 'security' && (
                        <Card title="Тағйири парол">
                            <div className="settings-form">
                                <Input
                                    label="Пароли ҷорӣ"
                                    type="password"
                                    value={securityData.currentPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                    fullWidth
                                />
                                <Input
                                    label="Пароли нав"
                                    type="password"
                                    value={securityData.newPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                    fullWidth
                                    helper="Парол бояд ҳадди ақал 6 рамз дошта бошад"
                                />
                                <Input
                                    label="Тасдиқи пароли нав"
                                    type="password"
                                    value={securityData.confirmPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                    fullWidth
                                />
                                <div className="form-actions">
                                    <Button variant="primary" onClick={handleChangePassword} loading={loading}>
                                        Иваз кардан
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Танзимоти уведомлениеҳо */}
                    {activeTab === 'notifications' && (
                        <Card title="Танзимоти уведомлениеҳо">
                            <div className="settings-form">
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.emailNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                        />
                                        <span>📧 Уведомлениеҳои почта</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.smsNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                                        />
                                        <span>📱 Уведомлениеҳои SMS</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.pushNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                                        />
                                        <span>🔔 Уведомлениеҳои Push</span>
                                    </label>
                                </div>
                                <div className="separator"></div>
                                <h4>Навъҳои уведомлениеҳо</h4>
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.orderCreated}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, orderCreated: e.target.checked })}
                                        />
                                        <span>📦 Эҷоди фармоиш</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.orderDelivered}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, orderDelivered: e.target.checked })}
                                        />
                                        <span>✅ Расонидани фармоиш</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.complaintNew}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, complaintNew: e.target.checked })}
                                        />
                                        <span>📢 Шикоятҳои нав</span>
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <Button variant="primary" onClick={handleSaveNotifications} loading={loading}>
                                        Захира кардан
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
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
