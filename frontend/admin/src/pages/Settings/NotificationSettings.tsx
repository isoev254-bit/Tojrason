<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NotificationSettings.tsx</title>
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
// frontend/admin/src/pages/Settings/NotificationSettings.tsx
import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import './Settings.module.css';

export const NotificationSettings: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [settings, setSettings] = useState({
        // Каналҳо
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        
        // Рӯйдодҳои фармоиш
        orderCreated: true,
        orderAssigned: true,
        orderDelivered: true,
        orderCancelled: true,
        
        // Рӯйдодҳои курьер
        courierAssigned: true,
        courierArrived: true,
        
        // Рӯйдодҳои система
        complaintNew: true,
        paymentFailed: true,
        paymentRefunded: true,
        
        // Дигар
        marketingEmails: false,
        systemUpdates: true,
    });

    const handleSave = async () => {
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

    const handleReset = () => {
        setSettings({
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            orderCreated: true,
            orderAssigned: true,
            orderDelivered: true,
            orderCancelled: true,
            courierAssigned: true,
            courierArrived: true,
            complaintNew: true,
            paymentFailed: true,
            paymentRefunded: true,
            marketingEmails: false,
            systemUpdates: true,
        });
    };

    return (
        <div className="notification-settings-page">
            <div className="settings-header">
                <div>
                    <h1 className="settings-title">Танзимоти уведомлениеҳо</h1>
                    <p className="settings-subtitle">Идоракунии каналҳо ва навъҳои уведомлениеҳо</p>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">
                    ✅ {successMessage}
                </div>
            )}

            <div className="settings-container">
                {/* Каналҳои уведомление */}
                <Card title="📡 Каналҳои уведомление" className="settings-card">
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            />
                            <span>📧 Почтаи электронӣ (Email)</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.smsNotifications}
                                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                            />
                            <span>📱 SMS</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.pushNotifications}
                                onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                            />
                            <span>🔔 Push-уведомлениеҳо</span>
                        </label>
                    </div>
                </Card>

                {/* Фармоишҳо */}
                <Card title="📦 Фармоишҳо" className="settings-card">
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.orderCreated}
                                onChange={(e) => setSettings({ ...settings, orderCreated: e.target.checked })}
                            />
                            <span>Эҷоди фармоиш</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.orderAssigned}
                                onChange={(e) => setSettings({ ...settings, orderAssigned: e.target.checked })}
                            />
                            <span>Таъини курьер</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.orderDelivered}
                                onChange={(e) => setSettings({ ...settings, orderDelivered: e.target.checked })}
                            />
                            <span>Расонидани фармоиш</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.orderCancelled}
                                onChange={(e) => setSettings({ ...settings, orderCancelled: e.target.checked })}
                            />
                            <span>Бекоршавии фармоиш</span>
                        </label>
                    </div>
                </Card>

                {/* Курьерҳо */}
                <Card title="🏍️ Курьерҳо" className="settings-card">
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.courierAssigned}
                                onChange={(e) => setSettings({ ...settings, courierAssigned: e.target.checked })}
                            />
                            <span>Таъини курьер ба фармоиш</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.courierArrived}
                                onChange={(e) => setSettings({ ...settings, courierArrived: e.target.checked })}
                            />
                            <span>Расидани курьер ба суроғаи гирифтан</span>
                        </label>
                    </div>
                </Card>

                {/* Система ва пардохт */}
                <Card title="💰 Пардохт ва система" className="settings-card">
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.complaintNew}
                                onChange={(e) => setSettings({ ...settings, complaintNew: e.target.checked })}
                            />
                            <span>Шикоятҳои нав</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.paymentFailed}
                                onChange={(e) => setSettings({ ...settings, paymentFailed: e.target.checked })}
                            />
                            <span>Нокомии пардохт</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.paymentRefunded}
                                onChange={(e) => setSettings({ ...settings, paymentRefunded: e.target.checked })}
                            />
                            <span>Бозгардонидани пардохт</span>
                        </label>
                    </div>
                </Card>

                {/* Дигар */}
                <Card title="⚙️ Дигар" className="settings-card">
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.marketingEmails}
                                onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                            />
                            <span>📨 Почтаҳои маркетингӣ (аксияҳо, тарғибот)</span>
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.systemUpdates}
                                onChange={(e) => setSettings({ ...settings, systemUpdates: e.target.checked })}
                            />
                            <span>🔄 Навсозиҳои система</span>
                        </label>
                    </div>
                </Card>

                {/* Тугмаҳо */}
                <div className="settings-actions">
                    <Button variant="ghost" onClick={handleReset}>
                        Бекор кардан
                    </Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>
                        Захира кардан
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
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
