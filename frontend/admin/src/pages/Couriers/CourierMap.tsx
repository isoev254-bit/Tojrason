<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CourierMap.tsx</title>
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
// frontend/admin/src/pages/Couriers/CourierMap.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { CourierMap as CourierMapComponent, CourierLocation } from '../../components/features/CourierMap';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { usersApi, User } from '../../api/users.api';
import { couriersApi } from '../../api/couriers.api';
import './Couriers.module.css';

export const CourierMap: React.FC = () => {
    const [couriers, setCouriers] = useState&lt;CourierLocation[]&gt;([]);
    const [selectedCourier, setSelectedCourier] = useState&lt;CourierLocation | null&gt;(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchCouriers = useCallback(async () => {
        try {
            const response = await usersApi.getAllUsers({ role: 'COURIER' });
            if (response.success) {
                const courierLocations: CourierLocation[] = response.data.data.map(c => ({
                    id: c.id,
                    name: c.fullName,
                    lat: c.locationLat || 38.5598,
                    lng: c.locationLng || 68.774,
                    status: c.isAvailable ? 'online' : 'offline',
                    phone: c.phone,
                    rating: (c as any).rating || 5.0,
                }));
                setCouriers(courierLocations);
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

    // Авто-навсозии ҳар 30 сония
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchCouriers();
        }, 30000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchCouriers]);

    const handleCourierClick = (courier: CourierLocation) => {
        setSelectedCourier(courier);
    };

    const handleRefresh = () => {
        fetchCouriers();
    };

    const handleViewDetails = (courierId: string) => {
        // navigate(`/couriers/${courierId}`);
        console.log('View details:', courierId);
    };

    return (
        &lt;div className="courier-map-page"&gt;
            &lt;div className="courier-map-header"&gt;
                &lt;div&gt;
                    &lt;h1 className="courier-map-title"&gt;Харитаи курьерҳо&lt;/h1&gt;
                    &lt;p className="courier-map-subtitle"&gt;Пайгирии ҷойгиршавии воқеии курьерҳо&lt;/p&gt;
                &lt;/div&gt;
                &lt;div className="courier-map-actions"&gt;
                    &lt;Button
                        variant={autoRefresh ? 'primary' : 'ghost'}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    &gt;
                        {autoRefresh ? '⏸ Авто-навсозӣ' : '▶ Авто-навсозӣ'}
                    &lt;/Button&gt;
                    &lt;Button variant="ghost" onClick={handleRefresh}&gt;
                        🔄 Навсозӣ
                    &lt;/Button&gt;
                &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="courier-map-container"&gt;
                &lt;CourierMapComponent
                    couriers={couriers}
                    showOrders={false}
                    showSidebar={true}
                    onCourierClick={handleCourierClick}
                    height="calc(100vh - 200px)"
                /&gt;
            &lt;/div&gt;

            {selectedCourier && (
                &lt;div className="courier-map-sidebar-info"&gt;
                    &lt;Card className="courier-info-card"&gt;
                        &lt;div className="courier-info-header"&gt;
                            &lt;div className="courier-info-avatar"&gt;
                                {selectedCourier.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            &lt;/div&gt;
                            &lt;div className="courier-info-title"&gt;
                                &lt;h3&gt;{selectedCourier.name}&lt;/h3&gt;
                                &lt;div className="courier-info-status"&gt;
                                    {selectedCourier.status === 'online' ? '🟢 Онлайн' : 
                                     selectedCourier.status === 'busy' ? '🟡 Банд' : '⚫ Офлайн'}
                                &lt;/div&gt;
                            &lt;/div&gt;
                            &lt;button className="close-btn" onClick={() => setSelectedCourier(null)}&gt;✕&lt;/button&gt;
                        &lt;/div&gt;
                        &lt;div className="courier-info-details"&gt;
                            &lt;div className="info-row"&gt;
                                &lt;span className="info-label"&gt;📞 Телефон:&lt;/span&gt;
                                &lt;span className="info-value"&gt;{selectedCourier.phone || '—'}&lt;/span&gt;
                            &lt;/div&gt;
                            &lt;div className="info-row"&gt;
                                &lt;span className="info-label"&gt;⭐ Рейтинг:&lt;/span&gt;
                                &lt;span className="info-value"&gt;{selectedCourier.rating || 5.0}&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                        &lt;div className="courier-info-actions"&gt;
                            &lt;Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleViewDetails(selectedCourier.id)}
                            &gt;
                                Дидани профил
                            &lt;/Button&gt;
                        &lt;/div&gt;
                    &lt;/Card&gt;
                &lt;/div&gt;
            )}
        &lt;/div&gt;
    );
};

export default CourierMap;
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
