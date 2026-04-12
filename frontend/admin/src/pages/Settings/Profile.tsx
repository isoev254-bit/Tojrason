<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Profile.tsx</title>
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
// frontend/admin/src/pages/Settings/Profile.tsx
import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../api/users.api';
import './Settings.module.css';

export const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        email: user?.email || '',
    });

    const handleSave = async () => {
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

    const getInitials = (name: string): string => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div>
                    <h1 className="profile-title">Профили шахсӣ</h1>
                    <p className="profile-subtitle">Идоракунии маълумоти шахсии худ</p>
                </div>
            </div>

            {successMessage && (
                <div className="success-message">
                    ✅ {successMessage}
                </div>
            )}

            <div className="profile-container">
                <Card className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {getInitials(profileData.fullName || user?.fullName || 'АД')}
                        </div>
                        <div className="profile-avatar-info">
                            <h2>{profileData.fullName || user?.fullName}</h2>
                            <p>{user?.role === 'ADMIN' ? 'Администратор' : user?.role === 'DISPATCHER' ? 'Диспетчер' : 'Корбар'}</p>
                        </div>
                    </div>

                    <div className="profile-form">
                        <div className="form-row">
                            <Input
                                label="Номи пурра"
                                value={profileData.fullName}
                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                fullWidth
                                required
                            />
                        </div>
                        <div className="form-row">
                            <Input
                                label="Телефон"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                fullWidth
                                required
                            />
                        </div>
                        <div className="form-row">
                            <Input
                                label="Email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                fullWidth
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <Button variant="primary" onClick={handleSave} loading={loading}>
                                Захира кардан
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card title="Маълумоти иловагӣ" className="info-card">
                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-label">🆔 ID корбар</span>
                            <span className="info-value">{user?.id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">📅 Санаи бақайдгирӣ</span>
                            <span className="info-value">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tg-TJ') : '—'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">🕐 Тағйири охирин</span>
                            <span className="info-value">
                                {user?.updatedAt ? new Date(user.updatedAt).toLocaleString('tg-TJ') : '—'}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
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
