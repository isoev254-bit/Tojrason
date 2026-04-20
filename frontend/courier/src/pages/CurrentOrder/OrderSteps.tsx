// Tojrason/frontend/courier/src/pages/CurrentOrder/OrderSteps.tsx
/*
 * © 2024 Тоҷрасон. Ҳамаи ҳуқуқҳо маҳфузанд.
 * Ин файл қисми нармафзори "Тоҷрасон" мебошад.
 * Истифодаи ғайриқонунии ин файл ё қисмҳои он тибқи қонунгузории Ҷумҳурии Тоҷикистон таъқиб карда мешавад.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ORDER_STATUS } from '../../utils/constants';

export interface OrderStep {
  status: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  timestamp?: string;
}

interface OrderStepsProps {
  steps: OrderStep[];
  currentStatus: string;
  orientation?: 'horizontal' | 'vertical';
  showTimestamps?: boolean;
  animated?: boolean;
}

const OrderSteps: React.FC<OrderStepsProps> = ({
  steps,
  currentStatus,
  orientation = 'vertical',
  showTimestamps = false,
  animated = true,
}) => {
  // Муайян кардани индекси қадами фаъол
  const getStepStatus = (stepStatus: string): 'completed' | 'current' | 'pending' => {
    const statusOrder = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.PICKUP,
      ORDER_STATUS.IN_TRANSIT,
      ORDER_STATUS.ARRIVING,
      ORDER_STATUS.DELIVERED,
    ];
    
    const currentIndex = statusOrder.indexOf(currentStatus as any);
    const stepIndex = statusOrder.indexOf(stepStatus as any);
    
    if (stepIndex === -1) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  // Вертикалӣ
  if (orientation === 'vertical') {
    return (
      <div className="relative">
        {/* Хати пайвасткунанда */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(step.status);
            
            return (
              <motion.div
                key={step.status}
                initial={animated ? { opacity: 0, x: -10 } : false}
                animate={animated ? { opacity: 1, x: 0 } : false}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start pl-10"
              >
                {/* Доираи қадам */}
                <div
                  className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    stepStatus === 'completed'
                      ? 'bg-green-500'
                      : stepStatus === 'current'
                      ? 'bg-emerald-500 ring-4 ring-emerald-200'
                      : 'bg-gray-200'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <motion.svg
                      initial={animated ? { scale: 0 } : false}
                      animate={animated ? { scale: 1 } : false}
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  ) : (
                    <span
                      className={`text-lg ${
                        stepStatus === 'current' ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Матни қадам */}
                <div className="flex-1 ml-3">
                  <p
                    className={`font-medium ${
                      stepStatus === 'completed' || stepStatus === 'current'
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                  )}
                  {showTimestamps && step.timestamp && stepStatus !== 'pending' && (
                    <p className="text-xs text-gray-400 mt-1">{step.timestamp}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Горизонталӣ
  return (
    <div className="relative">
      {/* Хати пайвасткунанда */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
      
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.status);
          
          return (
            <motion.div
              key={step.status}
              initial={animated ? { opacity: 0, y: 10 } : false}
              animate={animated ? { opacity: 1, y: 0 } : false}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col items-center"
            >
              {/* Доираи қадам */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  stepStatus === 'completed'
                    ? 'bg-green-500'
                    : stepStatus === 'current'
                    ? 'bg-emerald-500 ring-4 ring-emerald-200'
                    : 'bg-gray-200'
                }`}
              >
                {stepStatus === 'completed' ? (
                  <motion.svg
                    initial={animated ? { scale: 0 } : false}
                    animate={animated ? { scale: 1 } : false}
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                ) : (
                  <span
                    className={`text-sm ${
                      stepStatus === 'current' ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </span>
                )}
              </div>

              {/* Матни қадам */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium ${
                    stepStatus === 'completed' || stepStatus === 'current'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Қадамҳои пешфарз барои фармоиш
export const DEFAULT_ORDER_STEPS: OrderStep[] = [
  {
    status: ORDER_STATUS.ACCEPTED,
    label: 'Қабул',
    icon: '✅',
    description: 'Фармоиш қабул карда шуд',
  },
  {
    status: ORDER_STATUS.PICKUP,
    label: 'Гирифтан',
    icon: '📦',
    description: 'Бор гирифта шуд',
  },
  {
    status: ORDER_STATUS.IN_TRANSIT,
    label: 'Дар роҳ',
    icon: '🛵',
    description: 'Бор дар роҳ аст',
  },
  {
    status: ORDER_STATUS.ARRIVING,
    label: 'Наздик',
    icon: '🔔',
    description: 'Курйер наздик шуд',
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: 'Расонида',
    icon: '🎉',
    description: 'Бор расонида шуд',
  },
];

export default OrderSteps;
