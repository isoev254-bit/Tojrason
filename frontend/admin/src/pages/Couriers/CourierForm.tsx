<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CourierForm.tsx</title>
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
// frontend/admin/src/pages/Couriers/CourierForm.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User } from '../../api/users.api';
import './Couriers.module.css';

export type CourierFormData = {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    isAvailable: boolean;
    vehicle?: string;
    licensePlate?: string;
    experience?: string;
    city?: string;
};

export interface CourierFormProps {
    /** Маълумоти курьер барои таҳрир (агар мавҷуд бошад) */
    courier?: User | null;
    /** Ҳолати боркунӣ */
    loading?: boolean;
    /** Функсия ҳангоми тасдиқ */
    onSubmit: (data: CourierFormData) => Promise&lt;void&gt;;
    /** Функсия ҳангоми бекор */
    onCancel: () =&gt; void;
}

export const CourierForm: React.FC&lt;CourierFormProps&gt; = ({
    courier,
    loading = false,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState&lt;CourierFormData&gt;({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        isAvailable: true,
        vehicle: '',
        licensePlate: '',
        experience: '',
        city: 'Душанбе',
    });

    const [errors, setErrors] = useState&lt;Partial&lt;Record&lt;keyof CourierFormData, string&gt;&gt;&gt;({});

    useEffect(() =&gt; {
        if (courier) {
            setFormData({
                fullName: courier.fullName,
                phone: courier.phone,
                email: courier.email,
                password: '',
                isAvailable: courier.isAvailable,
                vehicle: (courier as any).vehicle || '',
                licensePlate: (courier as any).licensePlate || '',
                experience: (courier as any).experience || '',
                city: (courier as any).city || 'Душанбе',
            });
        } else {
            setFormData({
                fullName: '',
                phone: '',
                email: '',
                password: '',
                isAvailable: true,
                vehicle: '',
                licensePlate: '',
                experience: '',
                city: 'Душанбе',
            });
        }
    }, [courier]);

    const validate = (): boolean =&gt; {
        const newErrors: Partial&lt;Record&lt;keyof CourierFormData, string&gt;&gt; = {};

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

        if (!courier && (!formData.password || formData.password.length < 6)) {
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

    const vehicleOptions = [
        { value: '🏍 Мотосикл', label: '🏍 Мотосикл' },
        { value: '🚗 Мошин', label: '🚗 Мошин' },
        { value: '🚲 Велосипед', label: '🚲 Велосипед' },
        { value: '🛵 Скутер', label: '🛵 Скутер' },
    ];

    const cityOptions = [
        'Душанбе',
        'Хуҷанд',
        'Бохтар',
        'Кӯлоб',
        'Истаравшан',
        'Ваҳдат',
        'Турсунзода',
    ];

    return (
        &lt;form className="courier-form" onSubmit={handleSubmit}&gt;
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

            {!courier && (
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

            &lt;div className="form-row"&gt;
                &lt;div className="form-field"&gt;
                    &lt;label className="form-label"&gt;Воситаи нақлиёт&lt;/label&gt;
                    &lt;select
                        className="form-select"
                        value={formData.vehicle}
                        onChange={(e) =&gt; setFormData({ ...formData, vehicle: e.target.value })}
                    &gt;
                        &lt;option value=""&gt;-- Интихоб кунед --&lt;/option&gt;
                        {vehicleOptions.map(opt => (
                            &lt;option key={opt.value} value={opt.value}&gt;{opt.label}&lt;/option&gt;
                        ))}
                    &lt;/select&gt;
                &lt;/div&gt;
                &lt;div className="form-field"&gt;
                    &lt;label className="form-label"&gt;Рақами мошин&lt;/label&gt;
                    &lt;Input
                        value={formData.licensePlate || ''}
                        onChange={(e) =&gt; setFormData({ ...formData, licensePlate: e.target.value })}
                        placeholder="01 A 123 AA"
                    /&gt;
                &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="form-row"&gt;
                &lt;div className="form-field"&gt;
                    &lt;label className="form-label"&gt;Шаҳр&lt;/label&gt;
                    &lt;select
                        className="form-select"
                        value={formData.city}
                        onChange={(e) =&gt; setFormData({ ...formData, city: e.target.value })}
                    &gt;
                        {cityOptions.map(city => (
                            &lt;option key={city} value={city}&gt;{city}&lt;/option&gt;
                        ))}
                    &lt;/select&gt;
                &lt;/div&gt;
                &lt;div className="form-field"&gt;
                    &lt;label className="form-label"&gt;Таҷриба&lt;/label&gt;
                    &lt;Input
                        value={formData.experience || ''}
                        onChange={(e) =&gt; setFormData({ ...formData, experience: e.target.value })}
                        placeholder="масалан: 2 сол"
                    /&gt;
                &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="form-row"&gt;
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

            &lt;div className="form-actions"&gt;
                &lt;Button type="button" variant="ghost" onClick={onCancel}&gt;
                    Бекор
                &lt;/Button&gt;
                &lt;Button type="submit" variant="primary" loading={loading}&gt;
                    {courier ? 'Захира кардан' : 'Эҷод кардан'}
                &lt;/Button&gt;
            &lt;/div&gt;
        &lt;/form&gt;
    );
};

export default CourierForm;
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
