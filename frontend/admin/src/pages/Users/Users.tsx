<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Users.tsx</title>
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
// frontend/admin/src/pages/Users/Users.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { UserTable, User } from '../../components/features/UserTable';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { usersApi } from '../../api/users.api';
import { useAuth } from '../../hooks/useAuth';
import './Users.module.css';

type UserRole = 'CLIENT' | 'COURIER' | 'ADMIN' | 'DISPATCHER';

export const Users: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState&lt;User[]&gt;([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState&lt;User | null&gt;(null);
    const [filters, setFilters] = useState({
        role: '' as UserRole | '',
        isAvailable: '' as boolean | '',
        search: '',
    });

    // Формаи таҳрир
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        role: 'CLIENT' as UserRole,
        isAvailable: true,
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await usersApi.getAllUsers({
                role: filters.role || undefined,
                isAvailable: filters.isAvailable !== '' ? filters.isAvailable : undefined,
                search: filters.search || undefined,
            });
            if (response.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            role: user.role as UserRole,
            isAvailable: user.isAvailable,
        });
        setModalOpen(true);
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Шумо боварӣ доред, ки корбари ${user.fullName} -ро нест кардан мехоҳед?`)) {
            return;
        }
        try {
            await usersApi.deleteUser(user.id);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await usersApi.updateUser(user.id, { isAvailable: !user.isAvailable });
            fetchUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.phone || !formData.email) {
            alert('Лутфан ҳамаи майдонҳои ҳатмиро пур кунед');
            return;
        }

        try {
            if (editingUser) {
                await usersApi.updateUser(editingUser.id, {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    role: formData.role,
                    isAvailable: formData.isAvailable,
                });
            }
            setModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setFormData({
            fullName: '',
            phone: '',
            email: '',
            role: 'CLIENT',
            isAvailable: true,
        });
        setModalOpen(true);
    };

    const roleOptions = [
        { value: 'CLIENT', label: 'Клиент' },
        { value: 'COURIER', label: 'Курьер' },
        { value: 'DISPATCHER', label: 'Диспетчер' },
        { value: 'ADMIN', label: 'Администратор' },
    ];

    return (
        &lt;div className="users-page"&gt;
            &lt;div className="users-header"&gt;
                &lt;div&gt;
                    &lt;h1 className="users-title"&gt;Идоракунии корбарон&lt;/h1&gt;
                    &lt;p className="users-subtitle"&gt;Ҷустуҷӯ, таҳрир ва идоракунии ҳамаи корбарони система&lt;/p&gt;
                &lt;/div&gt;
                &lt;Button variant="primary" onClick={handleCreateUser}&gt;
                    + Корбари нав
                &lt;/Button&gt;
            &lt;/div&gt;

            &lt;Card className="users-filters"&gt;
                &lt;div className="filters-row"&gt;
                    &lt;Input
                        placeholder="Ҷустуҷӯ..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="filter-search"
                    /&gt;
                    &lt;select
                        className="filter-select"
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole | '' })}
                    &gt;
                        &lt;option value=""&gt;Ҳамаи нақшҳо&lt;/option&gt;
                        {roleOptions.map(opt => (
                            &lt;option key={opt.value} value={opt.value}&gt;{opt.label}&lt;/option&gt;
                        ))}
                    &lt;/select&gt;
                    &lt;select
                        className="filter-select"
                        value={filters.isAvailable === '' ? '' : String(filters.isAvailable)}
                        onChange={(e) =&gt; {
                            const val = e.target.value;
                            setFilters({
                                ...filters,
                                isAvailable: val === '' ? '' : val === 'true',
                            });
                        }}
                    &gt;
                        &lt;option value=""&gt;Ҳамаи ҳолатҳо&lt;/option&gt;
                        &lt;option value="true"&gt;Фаъол&lt;/option&gt;
                        &lt;option value="false"&gt;Ғайрифаъол&lt;/option&gt;
                    &lt;/select&gt;
                    &lt;Button variant="ghost" onClick={() =&gt; setFilters({ role: '', isAvailable: '', search: '' })}&gt;
                        Тоза кардан
                    &lt;/Button&gt;
                &lt;/div&gt;
            &lt;/Card&gt;

            &lt;UserTable
                data={users}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            /&gt;

            &lt;Modal
                isOpen={modalOpen}
                onClose={() =&gt; setModalOpen(false)}
                title={editingUser ? 'Таҳрири корбар' : 'Эҷоди корбари нав'}
                size="md"
                footer={
                    &lt;&gt;
                        &lt;Button variant="ghost" onClick={() =&gt; setModalOpen(false)}&gt;
                            Бекор
                        &lt;/Button&gt;
                        &lt;Button variant="primary" onClick={handleSubmit}&gt;
                            {editingUser ? 'Захира кардан' : 'Эҷод кардан'}
                        &lt;/Button&gt;
                    &lt;/&gt;
                }
            &gt;
                &lt;div className="user-form"&gt;
                    &lt;Input
                        label="Номи пурра"
                        value={formData.fullName}
                        onChange={(e) =&gt; setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Номи пурра"
                        required
                    /&gt;
                    &lt;Input
                        label="Телефон"
                        value={formData.phone}
                        onChange={(e) =&gt; setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+992 9X XXX XXXX"
                        required
                    /&gt;
                    &lt;Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =&gt; setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        required
                    /&gt;
                    &lt;div className="form-row"&gt;
                        &lt;div className="form-field"&gt;
                            &lt;label className="form-label"&gt;Нақш&lt;/label&gt;
                            &lt;select
                                className="form-select"
                                value={formData.role}
                                onChange={(e) =&gt; setFormData({ ...formData, role: e.target.value as UserRole })}
                            &gt;
                                {roleOptions.map(opt => (
                                    &lt;option key={opt.value} value={opt.value}&gt;{opt.label}&lt;/option&gt;
                                ))}
                            &lt;/select&gt;
                        &lt;/div&gt;
                        &lt;div className="form-field"&gt;
                            &lt;label className="form-label"&gt;Ҳолат&lt;/label&gt;
                            &lt;select
                                className="form-select"
                                value={String(formData.isAvailable)}
                                onChange={(e) =&gt; setFormData({ ...formData, isAvailable: e.target.value === 'true' })}
                            &gt;
                                &lt;option value="true"&gt;Фаъол&lt;/option&gt;
                                &lt;option value="false"&gt;Ғайрифаъол&lt;/option&gt;
                            &lt;/select&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/Modal&gt;
        &lt;/div&gt;
    );
};

export default Users;
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
