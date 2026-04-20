// Tojrason/frontend/courier/src/pages/Stats/EarningsChart.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import { courierApi } from '../../api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Period = 'today' | 'week' | 'month' | 'year';
type ChartType = 'line' | 'bar';

interface EarningsData {
  period: string;
  totalEarnings: number;
  baseEarnings: number;
  tips: number;
  bonuses: number;
  deductions: number;
  breakdown: Array<{
    date: string;
    orderId: string;
    amount: number;
    type: 'delivery' | 'tip' | 'bonus' | 'deduction';
    description?: string;
  }>;
}

interface EarningsChartProps {
  initialPeriod?: Period;
  showControls?: boolean;
  height?: number;
  onPeriodChange?: (period: Period) => void;
}

const EarningsChart: React.FC<EarningsChartProps> = ({
  initialPeriod = 'week',
  showControls = true,
  height = 300,
  onPeriodChange,
}) => {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [chartData, setChartData] = useState<ChartData<'line' | 'bar'> | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Боргирии маълумот
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await courierApi.getEarnings(period as any);
        setEarningsData(data);
        
        const preparedData = prepareChartData(data, period);
        setChartData(preparedData);
        
        onPeriodChange?.(period);
      } catch (error) {
        console.error('Failed to fetch earnings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, onPeriodChange]);

  // Тайёр кардани маълумот барои график
  const prepareChartData = (data: EarningsData, period: Period): ChartData<'line' | 'bar'> => {
    const sortedBreakdown = [...data.breakdown]
      .filter(item => item.type === 'delivery' || item.type === 'tip' || item.type === 'bonus')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Гурӯҳбандӣ аз рӯи сана
    const groupedData: Record<string, number> = {};
    
    sortedBreakdown.forEach(item => {
      let key: string;
      const date = new Date(item.date);
      
      switch (period) {
        case 'today':
          key = date.getHours() + ':00';
          break;
        case 'week':
          const days = ['Якш', 'Душ', 'Сеш', 'Чор', 'Пан', 'Ҷум', 'Шан'];
          key = days[date.getDay()];
          break;
        case 'month':
          key = date.getDate().toString();
          break;
        case 'year':
          const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
          key = months[date.getMonth()];
          break;
      }
      
      groupedData[key] = (groupedData[key] || 0) + item.amount;
    });

    const labels = Object.keys(groupedData);
    const values = Object.values(groupedData);

    return {
      labels,
      datasets: [
        {
          label: 'Даромад',
          data: values,
          backgroundColor: chartType === 'bar' 
            ? 'rgba(16, 185, 129, 0.7)' 
            : 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10B981',
          borderWidth: 2,
          fill: chartType === 'line',
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  // Ҳисобкунии омори иловагӣ
  const stats = useMemo(() => {
    if (!earningsData) return null;

    const deliveries = earningsData.breakdown.filter(item => item.type === 'delivery');
    const avgEarning = deliveries.length > 0 
      ? earningsData.baseEarnings / deliveries.length 
      : 0;

    return {
      avgEarning,
      deliveries: deliveries.length,
      tips: earningsData.tips,
      bonuses: earningsData.bonuses,
    };
  }, [earningsData]);

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#D1D5DB',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatPrice(context.parsed.y);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => formatPrice(value as number),
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
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
            <h3 className="font-semibold text-gray-900">Динамикаи даромад</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded-lg transition-colors ${
                  chartType === 'line' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-lg transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Интихоби давра */}
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'today' && 'Имрӯз'}
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
        {chartData && (
          chartType === 'line' 
            ? <Line data={chartData as any} options={chartOptions} />
            : <Bar data={chartData as any} options={chartOptions} />
        )}
      </div>

      {/* Омори иловагӣ */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">Миёна</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(stats.avgEarning)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Фармоишҳо</p>
              <p className="text-sm font-semibold text-gray-900">
                {stats.deliveries}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Анъом</p>
              <p className="text-sm font-semibold text-amber-600">
                {formatPrice(stats.tips)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Бонус</p>
              <p className="text-sm font-semibold text-purple-600">
                {formatPrice(stats.bonuses)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ҷузъиёти муфассал */}
      {earningsData && (
        <div className="mt-4">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span className="font-medium">Ҷузъиёти даромад</span>
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
              {earningsData.breakdown.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.type === 'delivery' ? 'bg-emerald-100 text-emerald-600' :
                      item.type === 'tip' ? 'bg-amber-100 text-amber-600' :
                      item.type === 'bonus' ? 'bg-purple-100 text-purple-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <span className="text-xs">
                        {item.type === 'delivery' ? '📦' :
                         item.type === 'tip' ? '💰' :
                         item.type === 'bonus' ? '🎁' : '📉'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{formatDate(item.date, { hour: '2-digit', minute: '2-digit' })}</p>
                      {item.description && (
                        <p className="text-sm text-gray-700">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <p className={`font-medium ${
                    item.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {item.amount > 0 ? '+' : ''}{formatPrice(item.amount)}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </Card>
  );
};

export default EarningsChart;
