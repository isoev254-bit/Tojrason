<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>UserForm.tsx</title>
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
// frontend/admin/src/pages/Users/UserForm.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User } from '../../components/features/UserTable';
import './Users.module.css';

export type UserRole = 'CLIENT' | 'COURIER' | 'ADMIN' | 'DISPATCHER';

export interface UserFormProps {
    /** Маълумоти корбар барои таҳрир (агар мавҷуд бошад) */
    user?: User | null;
    /** Ҳолати боркунӣ */
    loading?: boolean;
    /** Функсия ҳангоми тасдиқ */
    onSubmit: (data: UserFormData) => Promise&lt;void&gt;;
    /** Функсия ҳангоми бекор */
    onCancel: () =&gt; void;
}

export interface UserFormData {
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    isAvailable: boolean;
    password?: string;
}

export const UserForm: React.FC&lt;UserFormProps&gt; = ({
    user,
    loading = false,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState&lt;UserFormData&gt;({
        fullName: '',
        phone: '',
        email: '',
        role: 'CLIENT',
        isAvailable: true,
        password: '',
    });

    const [errors, setErrors] = useState&lt;Partial&lt;Record&lt;keyof UserFormData, string&gt;&gt;&gt;({});

    useEffect(() =&gt; {
        if (user) {
            setFormData({
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                role: user.role as UserRole,
                isAvailable: user.isAvailable,
                password: '',
            });
        } else {
            setFormData({
                fullName: '',
                phone: '',
                email: '',
                role: 'CLIENT',
                isAvailable: true,
                password: '',
            });
        }
    }, [user]);

    const validate = (): boolean =&gt; {
        const newErrors: Partial&lt;Record&lt;keyof UserFormData, string&gt;&gt; = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Номи пурра ҳатмист';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Ном бояд ҳадди ақал 2 ҳарф дошта бошад';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Рақами телефон ҳатмист';
        } else if (!/^\+?[0-9]{9,15}$/.test(formData.phone)) {
            newErrors.phone = 'Рақами телефон нодуруст аст';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email ҳатмист';
        } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email нодуруст аст';
        }

        if (!user && (!formData.password || formData.password.length < 6)) {
            newErrors.password = 'Парол бояд ҳадди ақал 6 рамз дошта бошад';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) =&gt; {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit(formData);
    };

    const roleOptions = [
        { value: 'CLIENT', label: 'Клиент' },
        { value: 'COURIER', label: 'Курьер' },
        { value: 'DISPATCHER', label: 'Диспетчер' },
        { value: 'ADMIN', label: 'Администратор' },
    ];

    return (
        &lt;form className="user-form" onSubmit={handleSubmit}&gt;
            &lt;Input
                label="Номи пурра"
                value={formData.fullName}
                onChange={(e) =&gt; setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Номи пурра"
                error={errors.fullName}
                required
                fullWidth
            /&gt;

            &lt;Input
                label="Телефон"
                value={formData.phone}
                onChange={(e) =&gt; setFormData({ ...formData, phone: e.target.value })}
                placeholder="+992 9X XXX XXXX"
                error={errors.phone}
                required
                fullWidth
            /&gt;

            &lt;Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =&gt; setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                error={errors.email}
                required
                fullWidth
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

            {!user && (
                &lt;Input
                    label="Парол"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) =&gt; setFormData({ ...formData, password: e.target.value })}
                    placeholder="********"
                    error={errors.password}
                    helper="Парол бояд ҳадди ақал 6 рамз дошта бошад"
                    required
                    fullWidth
                /&gt;
            )}

            &lt;div className="form-actions"&gt;
                &lt;Button type="button" variant="ghost" onClick={onCancel}&gt;
                    Бекор
                &lt;/Button&gt;
                &lt;Button type="submit" variant="primary" loading={loading}&gt;
                    {user ? 'Захира кардан' : 'Эҷод кардан'}
                &lt;/Button&gt;
            &lt;/div&gt;
        &lt;/form&gt;
    );
};

export default UserForm;
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
