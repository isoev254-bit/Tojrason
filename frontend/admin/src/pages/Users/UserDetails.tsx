<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>UserDetails.tsx</title>
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
// frontend/admin/src/pages/Users/UserDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { UserForm, UserFormData } from './UserForm';
import { usersApi } from '../../api/users.api';
import { User } from '../../components/features/UserTable';
import './Users.module.css';

export const UserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState&lt;User | null&gt;(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await usersApi.getUserById(id);
                if (response.success) {
                    setUser(response.data);
                } else {
                    navigate('/users');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                navigate('/users');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, navigate]);

    const handleEdit = async (data: UserFormData) => {
        if (!user) return;
        setSaving(true);
        try {
            await usersApi.updateUser(user.id, {
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                role: data.role,
                isAvailable: data.isAvailable,
            });
            setUser({
                ...user,
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                role: data.role,
                isAvailable: data.isAvailable,
            });
            setEditModalOpen(false);
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await usersApi.deleteUser(user.id);
            navigate('/users');
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setSaving(false);
            setDeleteModalOpen(false);
        }
    };

    const getRoleLabel = (role: string): string => {
        switch (role) {
            case 'ADMIN': return 'Администратор';
            case 'COURIER': return 'Курьер';
            case 'DISPATCHER': return 'Диспетчер';
            default: return 'Клиент';
        }
    };

    const getRoleBadgeVariant = (role: string): 'primary' | 'success' | 'purple' | 'cyan' => {
        switch (role) {
            case 'ADMIN': return 'primary';
            case 'COURIER': return 'success';
            case 'DISPATCHER': return 'purple';
            default: return 'cyan';
        }
    };

    if (loading) {
        return (
            &lt;div className="user-details-loading"&gt;
                &lt;div className="loading-spinner"&gt;&lt;/div&gt;
                &lt;p&gt;Боркунӣ...&lt;/p&gt;
            &lt;/div&gt;
        );
    }

    if (!user) {
        return (
            &lt;div className="user-details-error"&gt;
                &lt;p&gt;Корбар ёфт нашуд&lt;/p&gt;
                &lt;Button onClick={() =&gt; navigate('/users')}&gt;Бозгашт&lt;/Button&gt;
            &lt;/div&gt;
        );
    }

    return (
        &lt;div className="user-details-page"&gt;
            &lt;div className="user-details-header"&gt;
                &lt;Button variant="ghost" onClick={() =&gt; navigate('/users')}&gt;
                    ← Бозгашт ба рӯйхат
                &lt;/Button&gt;
                &lt;div className="user-details-actions"&gt;
                    &lt;Button variant="primary" onClick={() =&gt; setEditModalOpen(true)}&gt;
                        ✏️ Таҳрир
                    &lt;/Button&gt;
                    &lt;Button variant="danger" onClick={() =&gt; setDeleteModalOpen(true)}&gt;
                        🗑️ Нест кардан
                    &lt;/Button&gt;
                &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="user-details-content"&gt;
                &lt;Card className="user-details-card"&gt;
                    &lt;div className="user-details-profile"&gt;
                        &lt;div className="user-details-avatar"&gt;
                            {user.fullName.split(' ').map(n =&gt; n[0]).join('').toUpperCase().slice(0, 2)}
                        &lt;/div&gt;
                        &lt;div className="user-details-info"&gt;
                            &lt;h1 className="user-details-name"&gt;{user.fullName}&lt;/h1&gt;
                            &lt;div className="user-details-badges"&gt;
                                &lt;Badge variant={getRoleBadgeVariant(user.role)} size="md"&gt;
                                    {getRoleLabel(user.role)}
                                &lt;/Badge&gt;
                                {user.role === 'COURIER' && (
                                    &lt;StatusBadge status={user.isAvailable ? 'online' : 'offline'} /&gt;
                                )}
                                {user.role !== 'COURIER' && (
                                    &lt;Badge variant={user.isAvailable ? 'success' : 'default'} size="md"&gt;
                                        {user.isAvailable ? 'Фаъол' : 'Ғайрифаъол'}
                                    &lt;/Badge&gt;
                                )}
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="user-details-section"&gt;
                        &lt;h3 className="section-title"&gt;Маълумоти тамос&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;📧 Email&lt;/span&gt;
                                &lt;span className="info-value"&gt;{user.email}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;📞 Телефон&lt;/span&gt;
                                &lt;span className="info-value"&gt;{user.phone}&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;div className="user-details-section"&gt;
                        &lt;h3 className="section-title"&gt;Маълумоти система&lt;/h3&gt;
                        &lt;div className="info-grid"&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;🆔 ID&lt;/span&gt;
                                &lt;span className="info-value"&gt;{user.id}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;📅 Санаи бақайдгирӣ&lt;/span&gt;
                                &lt;span className="info-value"&gt;
                                    {new Date(user.createdAt).toLocaleDateString('tg-TJ')}
                                &lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-item"&gt;
                                &lt;span className="info-label"&gt;🕐 Тағйири охирин&lt;/span&gt;
                                &lt;span className="info-value"&gt;
                                    {new Date(user.updatedAt).toLocaleDateString('tg-TJ')}
                                &lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    {user.role === 'COURIER' && user.locationLat && user.locationLng && (
                        &lt;div className="user-details-section"&gt;
                            &lt;h3 className="section-title"&gt;📍 Ҷойгиршавӣ&lt;/h3&gt;
                            &lt;div className="info-grid"&gt;
                                &lt;div className="info-item"&gt;
                                    &lt;span className="info-label"&gt;Арзиши паҳноӣ (Lat)&lt;/span&gt;
                                    &lt;span className="info-value"&gt;{user.locationLat}&lt;/span&gt;
                                &lt;/div&gt;
                                &lt;div className="info-item"&gt;
                                    &lt;span className="info-label"&gt;Арзиши дарозӣ (Lng)&lt;/span&gt;
                                    &lt;span className="info-value"&gt;{user.locationLng}&lt;/span&gt;
                                &lt;/div&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    )}
                &lt;/Card&gt;
            &lt;/div&gt;

            {/* Modal таҳрир */}
            &lt;Modal
                isOpen={editModalOpen}
                onClose={() =&gt; setEditModalOpen(false)}
                title="Таҳрири корбар"
                size="md"
            &gt;
                &lt;UserForm
                    user={user}
                    loading={saving}
                    onSubmit={handleEdit}
                    onCancel={() =&gt; setEditModalOpen(false)}
                /&gt;
            &lt;/Modal&gt;

            {/* Modal тасдиқи нест кардан */}
            &lt;Modal
                isOpen={deleteModalOpen}
                onClose={() =&gt; setDeleteModalOpen(false)}
                title="Тасдиқи нест кардан"
                size="sm"
                footer={
                    &lt;&gt;
                        &lt;Button variant="ghost" onClick={() =&gt; setDeleteModalOpen(false)}&gt;
                            Бекор
                        &lt;/Button&gt;
                        &lt;Button variant="danger" onClick={handleDelete} loading={saving}&gt;
                            Нест кардан
                        &lt;/Button&gt;
                    &lt;/&gt;
                }
            &gt;
                &lt;p&gt;Шумо боварӣ доред, ки корбари &lt;strong&gt;{user.fullName}&lt;/strong&gt; -ро нест кардан мехоҳед?&lt;/p&gt;
                &lt;p className="delete-warning"&gt;Ин амал баргардонда намешавад!&lt;/p&gt;
            &lt;/Modal&gt;
        &lt;/div&gt;
    );
};

export default UserDetails;
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
