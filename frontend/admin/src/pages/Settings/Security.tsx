<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Security.tsx</title>
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
// frontend/admin/src/pages/Settings/Security.tsx
import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { usersApi } from '../../api/users.api';
import './Settings.module.css';

export const Security: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChangePassword = async () => {
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert('Паролҳо мувофиқат намекунанд');
            return;
        }
        if (securityData.newPassword.length < 6) {
            alert('Парол бояд ҳадди ақал 6 рамз дошта бошад');
            return;
        }
        if (!securityData.currentPassword) {
            alert('Пароли ҷориро ворид кунед');
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
        } catch (error: any) {
            console.error('Error changing password:', error);
            alert(error.response?.data?.message || 'Хатогӣ ҳангоми иваз кардани парол');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="security-page">
            <div className="security-header">
                <div>
                    <h1 className="security-title">Амният</h1>
                    <p className="security-subtitle">Идоракунии парол ва танзимоти амният</p>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">
                    ✅ {successMessage}
                </div>
            )}

            <div className="security-container">
                <Card title="Тағйири парол" className="security-card">
                    <div className="security-form">
                        <Input
                            label="Пароли ҷорӣ"
                            type="password"
                            value={securityData.currentPassword}
                            onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                            fullWidth
                            required
                        />
                        <Input
                            label="Пароли нав"
                            type="password"
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                            fullWidth
                            required
                            helper="Парол бояд ҳадди ақал 6 рамз дошта бошад"
                        />
                        <Input
                            label="Тасдиқи пароли нав"
                            type="password"
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                            fullWidth
                            required
                        />
                        <div className="form-actions">
                            <Button variant="primary" onClick={handleChangePassword} loading={loading}>
                                Иваз кардан
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card title="Маслиҳатҳои амният" className="tips-card">
                    <ul className="security-tips">
                        <li>🔒 Пароли қавӣ истифода баред (ҳадди ақал 8 рамз, ҳарфҳои калон ва хурд, рақамҳо)</li>
                        <li>🚫 Пароли худро бо касе мубодила накунед</li>
                        <li>🔄 Паролро ҳар 3-6 моҳ иваз кунед</li>
                        <li>📱 Агар ба система аз дастгоҳи нав ворид шавед, ҳатман паролро иваз кунед</li>
                        <li>⚠️ Ҳангоми воридшавӣ аз компютерҳои ҷамъиятӣ эҳтиёт бошед</li>
                    </ul>
                </Card>

                <Card title="Сессияҳои фаъол" className="sessions-card">
                    <div className="sessions-list">
                        <div className="session-item">
                            <div className="session-info">
                                <div className="session-device">💻 Chrome on Windows</div>
                                <div className="session-location">📍 Душанбе, Тоҷикистон</div>
                                <div className="session-time">🕐 Фаъол ҳоло</div>
                            </div>
                            <Button variant="danger" size="sm">Баромад</Button>
                        </div>
                        <div className="session-item">
                            <div className="session-info">
                                <div className="session-device">📱 Safari on iPhone</div>
                                <div className="session-location">📍 Душанбе, Тоҷикистон</div>
                                <div className="session-time">🕐 Охирин фаъолият: 2 соат пеш</div>
                            </div>
                            <Button variant="danger" size="sm">Баромад</Button>
                        </div>
                    </div>
                    <div className="form-actions">
                        <Button variant="ghost">Баромад аз ҳамаи сессияҳо</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Security;
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
