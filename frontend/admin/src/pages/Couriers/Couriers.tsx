<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Couriers.tsx</title>
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
// frontend/admin/src/pages/Couriers/Couriers.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, StatusBadge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { usersApi, User } from '../../api/users.api';
import { couriersApi } from '../../api/couriers.api';
import './Couriers.module.css';

export const Couriers: React.FC = () => {
    const navigate = useNavigate();
    const [couriers, setCouriers] = useState&lt;User[]&gt;([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
    const [stats, setStats] = useState({
        total: 0,
        online: 0,
        offline: 0,
        busy: 0,
    });

    const fetchCouriers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await usersApi.getAllUsers({ role: 'COURIER' });
            if (response.success) {
                setCouriers(response.data.data);
                // Ҳисоб кардани омор
                const online = response.data.data.filter(c => c.isAvailable).length;
                const offline = response.data.data.filter(c => !c.isAvailable).length;
                setStats({
                    total: response.data.data.length,
                    online,
                    offline,
                    busy: 0, // Баъдан бояд аз маълумоти фармоишҳо гирифта шавад
                });
            }
        } catch (error) {
            console.error('Error fetching couriers:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCouriers();
    }, [fetchCouriers]);

    const handleCourierClick = (courierId: string) => {
        navigate(`/couriers/${courierId}`);
    };

    const handleToggleStatus = async (courier: User) => {
        try {
            await usersApi.updateUser(courier.id, { isAvailable: !courier.isAvailable });
            fetchCouriers();
        } catch (error) {
            console.error('Error toggling courier status:', error);
        }
    };

    const filteredCouriers = couriers.filter(courier => {
        if (searchTerm && !courier.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !courier.phone.includes(searchTerm)) {
            return false;
        }
        if (filterStatus === 'online' && !courier.isAvailable) return false;
        if (filterStatus === 'offline' && courier.isAvailable) return false;
        return true;
    });

    const getInitials = (name: string): string => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        &lt;div className="couriers-page"&gt;
            &lt;div className="couriers-header"&gt;
                &lt;div&gt;
                    &lt;h1 className="couriers-title"&gt;Курерҳо&lt;/h1&gt;
                    &lt;p className="couriers-subtitle"&gt;Идоракунии ҳамаи курьерҳои система&lt;/p&gt;
                &lt;/div&gt;
                &lt;Button variant="primary" onClick={() =&gt; navigate('/hiring')}&gt;
                    + Курери нав
                &lt;/Button&gt;
            &lt;/div&gt;

            {/* Статистика */}
            &lt;div className="couriers-stats"&gt;
                &lt;div className="stat-card"&gt;
                    &lt;div className="stat-value"&gt;{stats.total}&lt;/div&gt;
                    &lt;div className="stat-label"&gt;Ҳамаи курьерҳо&lt;/div&gt;
                &lt;/div&gt;
                &lt;div className="stat-card success"&gt;
                    &lt;div className="stat-value"&gt;{stats.online}&lt;/div&gt;
                    &lt;div className="stat-label"&gt;Онлайн&lt;/div&gt;
                &lt;/div&gt;
                &lt;div className="stat-card warning"&gt;
                    &lt;div className="stat-value"&gt;{stats.busy}&lt;/div&gt;
                    &lt;div className="stat-label"&gt;Банд&lt;/div&gt;
                &lt;/div&gt;
                &lt;div className="stat-card default"&gt;
                    &lt;div className="stat-value"&gt;{stats.offline}&lt;/div&gt;
                    &lt;div className="stat-label"&gt;Офлайн&lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;

            {/* Филтрҳо */}
            &lt;Card className="couriers-filters"&gt;
                &lt;div className="filters-row"&gt;
                    &lt;Input
                        placeholder="Ҷустуҷӯ (ном ё телефон)..."
                        value={searchTerm}
                        onChange={(e) =&gt; setSearchTerm(e.target.value)}
                        className="filter-search"
                    /&gt;
                    &lt;div className="filter-buttons"&gt;
                        &lt;button
                            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() =&gt; setFilterStatus('all')}
                        &gt;
                            Ҳама
                        &lt;/button&gt;
                        &lt;button
                            className={`filter-btn ${filterStatus === 'online' ? 'active' : ''}`}
                            onClick={() =&gt; setFilterStatus('online')}
                        &gt;
                            🟢 Онлайн
                        &lt;/button&gt;
                        &lt;button
                            className={`filter-btn ${filterStatus === 'offline' ? 'active' : ''}`}
                            onClick={() =&gt; setFilterStatus('offline')}
                        &gt;
                            ⚫ Офлайн
                        &lt;/button&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/Card&gt;

            {/* Рӯйхати курьерҳо */}
            &lt;div className="couriers-grid"&gt;
                {loading ? (
                    &lt;div className="loading-state"&gt;
                        &lt;div className="spinner"&gt;&lt;/div&gt;
                        &lt;p&gt;Боркунӣ...&lt;/p&gt;
                    &lt;/div&gt;
                ) : filteredCouriers.length === 0 ? (
                    &lt;div className="empty-state"&gt;
                        &lt;p&gt;Ҳеҷ курьере ёфт нашуд&lt;/p&gt;
                    &lt;/div&gt;
                ) : (
                    filteredCouriers.map(courier => (
                        &lt;div
                            key={courier.id}
                            className="courier-card"
                            onClick={() =&gt; handleCourierClick(courier.id)}
                        &gt;
                            &lt;div className="courier-card-header"&gt;
                                &lt;div className="courier-avatar"&gt;
                                    {getInitials(courier.fullName)}
                                &lt;/div&gt;
                                &lt;div className="courier-status"&gt;
                                    {courier.isAvailable ? (
                                        &lt;StatusBadge status="online" showDot /&gt;
                                    ) : (
                                        &lt;StatusBadge status="offline" showDot /&gt;
                                    )}
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;div className="courier-card-body"&gt;
                                &lt;h3 className="courier-name"&gt;{courier.fullName}&lt;/h3&gt;
                                &lt;p className="courier-phone"&gt;📞 {courier.phone}&lt;/p&gt;
                                &lt;p className="courier-email"&gt;✉️ {courier.email}&lt;/p&gt;
                            &lt;/div&gt;
                            &lt;div className="courier-card-footer"&gt;
                                &lt;Button
                                    size="sm"
                                    variant={courier.isAvailable ? 'warning' : 'success'}
                                    onClick={(e) =&gt; {
                                        e.stopPropagation();
                                        handleToggleStatus(courier);
                                    }}
                                &gt;
                                    {courier.isAvailable ? 'Хомӯш кардан' : 'Фаъол кардан'}
                                &lt;/Button&gt;
                                &lt;Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) =&gt; {
                                        e.stopPropagation();
                                        navigate(`/couriers/${courier.id}`);
                                    }}
                                &gt;
                                    Тафсилот
                                &lt;/Button&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    ))
                )}
            &lt;/div&gt;
        &lt;/div&gt;
    );
};

export default Couriers;
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
