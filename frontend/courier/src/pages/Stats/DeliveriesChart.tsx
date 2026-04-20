// Tojrason/frontend/courier/src/pages/Stats/DeliveriesChart.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { courierApi } from '../../api';
import { formatDistance } from '../../utils/formatDistance';
import { formatDate } from '../../utils/formatDate';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Period = 'week' | 'month' | 'year';

interface DeliveriesData {
  period: string;
  totalDeliveries: number;
  totalDistance: number;
  totalTime: number;
  breakdown: Array<{
    date: string;
    deliveries: number;
    distance: number;
    time: number;
  }>;
}

interface DeliveriesChartProps {
  initialPeriod?: Period;
  showControls?: boolean;
  height?: number;
  onPeriodChange?: (period: Period) => void;
}

const DeliveriesChart: React.FC<DeliveriesChartProps> = ({
  initialPeriod = 'week',
  showControls = true,
  height = 300,
  onPeriodChange,
}) => {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveriesData, setDeliveriesData] = useState<DeliveriesData | null>(null);
  const [chartData, setChartData] = useState<ChartData<'bar'> | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Боргирии маълумот
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Дар ин ҷо API барои гирифтани омори фармоишҳо даъват мешавад
        // Барои ҳозир маълумоти намунавӣ истифода мешавад
        const mockData: DeliveriesData = {
          period,
          totalDeliveries: period === 'week' ? 42 : period === 'month' ? 156 : 1247,
          totalDistance: period === 'week' ? 156.8 : period === 'month' ? 587.3 : 4521.5,
          totalTime: period === 'week' ? 28.5 : period === 'month' ? 112.8 : 876.2,
          breakdown: generateMockBreakdown(period),
        };
        
        setDeliveriesData(mockData);
        const preparedData = prepareChartData(mockData);
        setChartData(preparedData);
        
        onPeriodChange?.(period);
      } catch (error) {
        console.error('Failed to fetch deliveries data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, onPeriodChange]);

  // Тавлиди маълумоти намунавӣ
  const generateMockBreakdown = (period: Period): DeliveriesData['breakdown'] => {
    const result: DeliveriesData['breakdown'] = [];
    const now = new Date();
    
    let count: number;
    switch (period) {
      case 'week':
        count = 7;
        break;
      case 'month':
        count = 30;
        break;
      case 'year':
        count = 12;
        break;
    }

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      
      if (period === 'week') {
        date.setDate(date.getDate() - i);
      } else if (period === 'month') {
        date.setDate(date.getDate() - i);
      } else {
        date.setMonth(date.getMonth() - i);
      }

      result.push({
        date: date.toISOString(),
        deliveries: Math.floor(Math.random() * 15) + 5,
        distance: Math.floor(Math.random() * 50) + 20,
        time: Math.floor(Math.random() * 8) + 4,
      });
    }

    return result;
  };

  // Тайёр кардани маълумот барои график
  const prepareChartData = (data: DeliveriesData): ChartData<'bar'> => {
    let labels: string[];
    
    switch (period) {
      case 'week':
        const days = ['Якш', 'Душ', 'Сеш', 'Чор', 'Пан', 'Ҷум', 'Шан'];
        labels = data.breakdown.map(item => {
          const date = new Date(item.date);
          return days[date.getDay()];
        });
        break;
      case 'month':
        labels = data.breakdown.map(item => {
          const date = new Date(item.date);
          return date.getDate().toString();
        });
        break;
      case 'year':
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        labels = data.breakdown.map(item => {
          const date = new Date(item.date);
          return months[date.getMonth()];
        });
        break;
    }

    const deliveries = data.breakdown.map(item => item.deliveries);
    const distances = data.breakdown.map(item => item.distance);

    return {
      labels,
      datasets: [
        {
          label: 'Фармоишҳо',
          data: deliveries,
          backgroundColor: '#3B82F6',
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        },
        {
          label: 'Масофа (км)',
          data: distances,
          backgroundColor: '#10B981',
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        },
      ],
    };
  };

  // Ҳисобкунии омори иловагӣ
  const stats = useMemo(() => {
    if (!deliveriesData) return null;

    const avgDeliveries = period === 'week' 
      ? deliveriesData.totalDeliveries / 7 
      : period === 'month' 
        ? deliveriesData.totalDeliveries / 30 
        : deliveriesData.totalDeliveries / 365;

    const avgDistance = deliveriesData.totalDistance / deliveriesData.totalDeliveries;

    return {
      avgDeliveries,
      avgDistance,
      totalDeliveries: deliveriesData.totalDeliveries,
      totalDistance: deliveriesData.totalDistance,
      totalTime: deliveriesData.totalTime,
    };
  }, [deliveriesData, period]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#D1D5DB',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center" style={{ height }}>
          <Loader size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      {/* Контролҳо */}
      {showControls && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Динамикаи фармоишҳо</h3>
          </div>

          {/* Интихоби давра */}
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'week' && 'Ҳафта'}
                {p === 'month' && 'Моҳ'}
                {p === 'year' && 'Сол'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* График */}
      <div style={{ height }}>
        {chartData && <Bar data={chartData} options={chartOptions} />}
      </div>

      {/* Омори иловагӣ */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Ҳамаи фармоишҳо</p>
              <p className="text-2xl font-bold text-blue-700">{stats.totalDeliveries}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-emerald-600 mb-1">Масофаи умумӣ</p>
              <p className="text-2xl font-bold text-emerald-700">{formatDistance(stats.totalDistance)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">Миёна дар як рӯз</p>
              <p className="text-sm font-semibold text-gray-900">
                {stats.avgDeliveries.toFixed(1)} фармоиш
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Масофаи миёна</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDistance(stats.avgDistance)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Вақти умумӣ</p>
              <p className="text-sm font-semibold text-gray-900">
                {stats.totalTime.toFixed(1)} соат
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ҷузъиёти муфассал */}
      {deliveriesData && (
        <div className="mt-4">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span className="font-medium">Ҷузъиёти фармоишҳо</span>
            <svg 
              className={`w-5 h-5 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1 max-h-64 overflow-y-auto"
            >
              {deliveriesData.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <span className="text-sm font-medium">{item.deliveries}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {formatDate(item.date, { month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistance(item.distance)} • {item.time} соат
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.deliveries} фармоиш</p>
                    <p className="text-xs text-gray-500">
                      миёна: {formatDistance(item.distance / item.deliveries)}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </Card>
  );
};

export default DeliveriesChart;
