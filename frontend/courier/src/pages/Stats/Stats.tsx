// Tojrason/frontend/courier/src/pages/Stats/Stats.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import { useAuth } from '../../hooks/useAuth';
import { courierApi } from '../../api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDistance } from '../../utils/formatDistance';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';

// Сабти компонентҳои Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Period = 'today' | 'week' | 'month' | 'total';

interface StatsData {
  today: {
    deliveries: number;
    earnings: number;
    distance: number;
    hoursWorked: number;
  };
  week: {
    deliveries: number;
    earnings: number;
    distance: number;
    hoursWorked: number;
  };
  month: {
    deliveries: number;
    earnings: number;
    distance: number;
    hoursWorked: number;
  };
  total: {
    deliveries: number;
    earnings: number;
    distance: number;
    rating: number;
  };
}

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
    type: string;
    description?: string;
  }>;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
}

const Stats: React.FC = () => {
  const navigate = useNavigate();
  const { courier } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  const [earningsChartData, setEarningsChartData] = useState<ChartData | null>(null);
  const [deliveriesChartData, setDeliveriesChartData] = useState<ChartData | null>(null);
  const [ratingData, setRatingData] = useState<{ average: number; breakdown: Record<number, number> } | null>(null);

  // Боргирии омор
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [statsData, earningsData, ratingData] = await Promise.all([
          courierApi.getStats(),
          courierApi.getEarnings(selectedPeriod),
          courierApi.getRating(),
        ]);

        setStats(statsData);
        setEarnings(earningsData);
        setRatingData(ratingData);

        // Тайёр кардани маълумот барои графики даромад
        const earningsChart = prepareEarningsChart(earningsData);
        setEarningsChartData(earningsChart);

        // Тайёр кардани маълумот барои графики фармоишҳо
        const deliveriesChart = prepareDeliveriesChart(statsData);
        setDeliveriesChartData(deliveriesChart);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedPeriod]);

  // Тайёр кардани графики даромад
  const prepareEarningsChart = (data: EarningsData): ChartData => {
    const sortedBreakdown = [...data.breakdown].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedBreakdown.map(item => formatDate(item.date, { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Даромад',
          data: sortedBreakdown.map(item => item.amount),
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10B981',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Тайёр кардани графики фармоишҳо
  const prepareDeliveriesChart = (data: StatsData): ChartData => {
    // Ин ҷо маълумоти ҳаррӯзаи фармоишҳо лозим аст
    // Барои ҳозир маълумоти намунавӣ истифода мешавад
    const days = ['Душ', 'Сеш', 'Чор', 'Пан', 'Ҷум', 'Шан', 'Якш'];
    
    return {
      labels: days,
      datasets: [
        {
          label: 'Фармоишҳо',
          data: [5, 7, 4, 8, 6, 9, 3],
          backgroundColor: '#3B82F6',
          borderColor: '#2563EB',
        },
      ],
    };
  };

  // Тайёр кардани маълумот барои Doughnut (тақсимоти даромад)
  const prepareEarningsBreakdownChart = (): ChartData => {
    if (!earnings) return { labels: [], datasets: [] };

    return {
      labels: ['Даромади асосӣ', 'Анъом', 'Бонусҳо', 'Тарҳҳо'],
      datasets: [
        {
          label: 'Тақсимоти даромад',
          data: [
            earnings.baseEarnings,
            earnings.tips,
            earnings.bonuses,
            earnings.deductions,
          ],
          backgroundColor: ['#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
        },
      ],
    };
  };

  // Тайёр кардани маълумот барои Doughnut (рейтинг)
  const prepareRatingChart = (): ChartData => {
    if (!ratingData) return { labels: [], datasets: [] };

    return {
      labels: ['1 ситора', '2 ситора', '3 ситора', '4 ситора', '5 ситора'],
      datasets: [
        {
          label: 'Тақсимоти рейтинг',
          data: [
            ratingData.breakdown[1] || 0,
            ratingData.breakdown[2] || 0,
            ratingData.breakdown[3] || 0,
            ratingData.breakdown[4] || 0,
            ratingData.breakdown[5] || 0,
          ],
          backgroundColor: ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#059669'],
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Сарлавҳа */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Омор</h1>
        <button
          onClick={() => navigate('/earnings')}
          className="text-emerald-600 text-sm font-medium hover:underline"
        >
          Тафсилоти даромад →
        </button>
      </div>

      {/* Интихоби давра */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['today', 'week', 'month', 'total'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedPeriod === period
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {period === 'today' && 'Имрӯз'}
            {period === 'week' && 'Ҳафта'}
            {period === 'month' && 'Моҳ'}
            {period === 'total' && 'Ҳамагӣ'}
          </button>
        ))}
      </div>

      {/* Корти асосии омор */}
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="p-4">
              <p className="text-sm text-gray-500">Даромад</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPrice(stats[selectedPeriod].earnings)}
              </p>
              {selectedPeriod === 'week' && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatPrice(stats.today.earnings)} имрӯз
                </p>
              )}
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-500">Фармоишҳо</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats[selectedPeriod].deliveries}
              </p>
              {selectedPeriod === 'week' && (
                <p className="text-xs text-gray-400 mt-1">
                  {stats.today.deliveries} имрӯз
                </p>
              )}
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-500">Масофа</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatDistance(stats[selectedPeriod].distance)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-500">Соати корӣ</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats[selectedPeriod].hoursWorked.toFixed(1)} соат
              </p>
            </Card>
          </div>

          {/* Рейтинг */}
          {ratingData && (
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Рейтинги шумо</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-900">
                      {ratingData.average.toFixed(1)}
                    </p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xl ${
                            star <= Math.round(ratingData.average)
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">
                  {ratingData.totalReviews} шарҳ
                </Badge>
              </div>
            </Card>
          )}

          {/* Графики даромад */}
          {earningsChartData && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Динамикаи даромад</h3>
              <div className="h-48">
                <Line data={earningsChartData} options={chartOptions} />
              </div>
            </Card>
          )}

          {/* Графики фармоишҳо */}
          {deliveriesChartData && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Фармоишҳо дар як ҳафта</h3>
              <div className="h-48">
                <Bar data={deliveriesChartData} options={chartOptions} />
              </div>
            </Card>
          )}

          {/* Тақсимоти даромад ва рейтинг */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {earnings && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Тақсимоти даромад</h3>
                <div className="h-40">
                  <Doughnut 
                    data={prepareEarningsBreakdownChart()} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }} 
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                      Асосӣ
                    </span>
                    <span>{formatPrice(earnings.baseEarnings)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mr-1" />
                      Анъом
                    </span>
                    <span>{formatPrice(earnings.tips)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-purple-500 mr-1" />
                      Бонус
                    </span>
                    <span>{formatPrice(earnings.bonuses)}</span>
                  </div>
                </div>
              </Card>
            )}

            {ratingData && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Тақсимоти рейтинг</h3>
                <div className="h-40">
                  <Doughnut 
                    data={prepareRatingChart()} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }} 
                  />
                </div>
                <div className="mt-3 space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center justify-between text-xs">
                      <span className="flex items-center">
                        <span className="text-yellow-500 mr-1">{star}★</span>
                      </span>
                      <span>{ratingData.breakdown[star] || 0}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Таърихи пардохтҳои охирин */}
          {earnings && earnings.breakdown.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Пардохтҳои охирин</h3>
              <div className="space-y-2">
                {earnings.breakdown.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.type === 'delivery' ? 'bg-emerald-100 text-emerald-600' :
                        item.type === 'tip' ? 'bg-amber-100 text-amber-600' :
                        item.type === 'bonus' ? 'bg-purple-100 text-purple-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {item.type === 'delivery' ? '📦' :
                         item.type === 'tip' ? '💰' :
                         item.type === 'bonus' ? '🎁' : '📉'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.type === 'delivery' ? 'Расонидан' :
                           item.type === 'tip' ? 'Анъом' :
                           item.type === 'bonus' ? 'Бонус' : 'Тарҳ'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                      </div>
                    </div>
                    <p className={`font-medium ${
                      item.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {item.amount > 0 ? '+' : ''}{formatPrice(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Stats;
