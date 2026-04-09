<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Charts.tsx</title>
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
// frontend/admin/src/components/features/Charts/Charts.tsx
import React, { useEffect, useRef } from 'react';
import './Charts.module.css';

// Барои соддагӣ, ин ҷо диаграммаҳои оддӣ бо Canvas сохта мешаванд
// Дар лоиҳаи воқеӣ метавон Chart.js ё Recharts-ро истифода кард

export interface LineChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color?: string;
        borderColor?: string;
        backgroundColor?: string;
    }[];
}

export interface BarChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color?: string;
        backgroundColor?: string;
    }[];
}

export interface PieChartData {
    labels: string[];
    data: number[];
    colors?: string[];
}

export interface LineChartProps {
    data: LineChartData;
    title?: string;
    height?: number;
    width?: number;
}

export const LineChart: React.FC&lt;LineChartProps&gt; = ({
    data,
    title,
    height = 300,
    width = 100,
}) => {
    const canvasRef = useRef&lt;HTMLCanvasElement&gt;(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'var(--bg-2, #131924)';
        ctx.fillRect(0, 0, w, h);

        if (!data.labels.length || !data.datasets[0]?.data.length) {
            ctx.fillStyle = 'var(--text-3, #5a6a8e)';
            ctx.font = '12px "DM Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Ҳеҷ маълумоте нест', w / 2, h / 2);
            return;
        }

        const values = data.datasets.flatMap(d => d.data);
        const maxValue = Math.max(...values, 1);
        const minValue = Math.min(...values, 0);
        const range = maxValue - minValue;

        const padding = { top: 20, right: 30, bottom: 40, left: 50 };
        const graphWidth = w - padding.left - padding.right;
        const graphHeight = h - padding.top - padding.bottom;

        const xStep = graphWidth / (data.labels.length - 1);
        const yScale = graphHeight / range;

        // Тори шабакавӣ
        ctx.beginPath();
        ctx.strokeStyle = 'var(--border-1, #1e2940)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (i / 5) * graphHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + graphWidth, y);
            ctx.stroke();
        }

        // Хатҳои амудӣ
        for (let i = 0; i < data.labels.length; i++) {
            const x = padding.left + i * xStep;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + graphHeight);
            ctx.stroke();
        }

        // Рангҳои пешфарз
        const defaultColors = ['#4a90ff', '#22d693', '#ff9f43', '#a78bfa', '#ff5c5c', '#22d3ee'];

        // Кашидани хатҳо
        data.datasets.forEach((dataset, idx) => {
            const color = dataset.color || dataset.borderColor || defaultColors[idx % defaultColors.length];
            const points = dataset.data.map((value, i) => ({
                x: padding.left + i * xStep,
                y: padding.top + graphHeight - (value - minValue) * yScale,
            }));

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Нуқтаҳо
            points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        });

        // Барчаспҳои X
        ctx.fillStyle = 'var(--text-2, #8696b8)';
        ctx.font = '10px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        data.labels.forEach((label, i) => {
            const x = padding.left + i * xStep;
            ctx.fillText(label, x, h - padding.bottom + 15);
        });

        // Барчаспҳои Y
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (i / 5) * range;
            const y = padding.top + graphHeight - (i / 5) * graphHeight;
            ctx.fillText(Math.round(value).toString(), padding.left - 5, y + 3);
        }

        // Сарлавҳа
        if (title) {
            ctx.fillStyle = 'var(--text-0, #f0f2f7)';
            ctx.font = '14px "DM Sans", sans-serif';
            ctx.fontWeight = '600';
            ctx.textAlign = 'center';
            ctx.fillText(title, w / 2, 20);
        }

        // Легенда
        let legendX = padding.left + 20;
        const legendY = h - 10;
        data.datasets.forEach((dataset, idx) => {
            const color = dataset.color || dataset.borderColor || defaultColors[idx % defaultColors.length];
            ctx.fillStyle = color;
            ctx.fillRect(legendX, legendY - 8, 12, 12);
            ctx.fillStyle = 'var(--text-1, #c4ccdf)';
            ctx.font = '10px "DM Sans", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(dataset.label, legendX + 16, legendY);
            legendX += ctx.measureText(dataset.label).width + 40;
        });

    }, [data, height, title]);

    return &lt;canvas ref={canvasRef} className="chart-canvas" style={{ width: '100%', height }} /&gt;
};

export interface BarChartProps {
    data: BarChartData;
    title?: string;
    height?: number;
}

export const BarChart: React.FC&lt;BarChartProps&gt; = ({
    data,
    title,
    height = 300,
}) => {
    const canvasRef = useRef&lt;HTMLCanvasElement&gt;(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'var(--bg-2, #131924)';
        ctx.fillRect(0, 0, w, h);

        if (!data.labels.length || !data.datasets[0]?.data.length) {
            ctx.fillStyle = 'var(--text-3, #5a6a8e)';
            ctx.font = '12px "DM Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Ҳеҷ маълумоте нест', w / 2, h / 2);
            return;
        }

        const allData = data.datasets.flatMap(d => d.data);
        const maxValue = Math.max(...allData, 1);
        const padding = { top: 40, right: 20, bottom: 50, left: 50 };
        const graphWidth = w - padding.left - padding.right;
        const graphHeight = h - padding.top - padding.bottom;

        const barWidth = (graphWidth / data.labels.length) * 0.7;
        const barSpacing = (graphWidth / data.labels.length) * 0.3;
        const groupSpacing = graphWidth / data.labels.length;

        const yScale = graphHeight / maxValue;
        const defaultColors = ['#4a90ff', '#22d693', '#ff9f43', '#a78bfa', '#ff5c5c'];

        // Тори шабакавӣ
        ctx.beginPath();
        ctx.strokeStyle = 'var(--border-1, #1e2940)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (i / 5) * graphHeight;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + graphWidth, y);
            ctx.stroke();
        }

        // Барчаспҳои X
        ctx.fillStyle = 'var(--text-2, #8696b8)';
        ctx.font = '10px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        data.labels.forEach((label, i) => {
            const x = padding.left + i * groupSpacing + groupSpacing / 2;
            ctx.fillText(label, x, h - padding.bottom + 15);
        });

        // Барчаспҳои Y
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = (i / 5) * maxValue;
            const y = padding.top + graphHeight - (i / 5) * graphHeight;
            ctx.fillText(Math.round(value).toString(), padding.left - 5, y + 3);
        }

        // Сарлавҳа
        if (title) {
            ctx.fillStyle = 'var(--text-0, #f0f2f7)';
            ctx.font = '14px "DM Sans", sans-serif';
            ctx.fontWeight = '600';
            ctx.textAlign = 'center';
            ctx.fillText(title, w / 2, 20);
        }

        // Кашидани сутунҳо
        data.datasets.forEach((dataset, datasetIdx) => {
            const color = dataset.color || dataset.backgroundColor || defaultColors[datasetIdx % defaultColors.length];
            const datasetCount = data.datasets.length;
            const subBarWidth = barWidth / datasetCount;
            
            dataset.data.forEach((value, i) => {
                const x = padding.left + i * groupSpacing + groupSpacing / 2 - barWidth / 2 + datasetIdx * subBarWidth;
                const barHeight = value * yScale;
                const y = padding.top + graphHeight - barHeight;
                
                ctx.fillStyle = color;
                ctx.fillRect(x, y, subBarWidth - 1, barHeight);
            });
        });

        // Легенда
        let legendX = padding.left + 20;
        const legendY = h - 10;
        data.datasets.forEach((dataset, idx) => {
            const color = dataset.color || dataset.backgroundColor || defaultColors[idx % defaultColors.length];
            ctx.fillStyle = color;
            ctx.fillRect(legendX, legendY - 8, 12, 12);
            ctx.fillStyle = 'var(--text-1, #c4ccdf)';
            ctx.font = '10px "DM Sans", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(dataset.label, legendX + 16, legendY);
            legendX += ctx.measureText(dataset.label).width + 40;
        });

    }, [data, height, title]);

    return &lt;canvas ref={canvasRef} className="chart-canvas" style={{ width: '100%', height }} /&gt;
};

export interface PieChartProps {
    data: PieChartData;
    title?: string;
    size?: number;
}

export const PieChart: React.FC&lt;PieChartProps&gt; = ({
    data,
    title,
    size = 200,
}) => {
    const canvasRef = useRef&lt;HTMLCanvasElement&gt;(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width = size;
        const h = canvas.height = size;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'var(--bg-2, #131924)';
        ctx.fillRect(0, 0, w, h);

        if (!data.data.length) {
            ctx.fillStyle = 'var(--text-3, #5a6a8e)';
            ctx.font = '12px "DM Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Ҳеҷ маълумоте нест', w / 2, h / 2);
            return;
        }

        const total = data.data.reduce((a, b) => a + b, 0);
        const colors = data.colors || ['#4a90ff', '#22d693', '#ff9f43', '#a78bfa', '#ff5c5c', '#22d3ee'];
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) / 2 - 20;
        
        let startAngle = -Math.PI / 2;
        
        for (let i = 0; i < data.data.length; i++) {
            const angle = (data.data[i] / total) * Math.PI * 2;
            const endAngle = startAngle + angle;
            
            ctx.beginPath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.fill();
            
            startAngle = endAngle;
        }
        
        // Сарлавҳа
        if (title) {
            ctx.fillStyle = 'var(--text-0, #f0f2f7)';
            ctx.font = '14px "DM Sans", sans-serif';
            ctx.fontWeight = '600';
            ctx.textAlign = 'center';
            ctx.fillText(title, w / 2, 20);
        }
        
        // Легенда
        let legendY = h - 30;
        let legendX = 20;
        for (let i = 0; i < data.labels.length; i++) {
            if (legendY > h - 10) {
                legendY = h - 30;
                legendX += 100;
            }
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(legendX, legendY - 8, 12, 12);
            ctx.fillStyle = 'var(--text-1, #c4ccdf)';
            ctx.font = '10px "DM Sans", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${data.labels[i]} (${Math.round((data.data[i] / total) * 100)}%)`, legendX + 16, legendY);
            legendY += 20;
        }
        
    }, [data, title, size]);

    return &lt;canvas ref={canvasRef} className="chart-canvas" style={{ width: size, height: size }} /&gt;
};

Charts.displayName = 'LineChart';
BarChart.displayName = 'BarChart';
PieChart.displayName = 'PieChart';

export default { LineChart, BarChart, PieChart };
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
