import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface FinanceCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  children?: React.ReactNode;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'primary',
  children
}) => {
  const { getCardClasses, getTextClasses } = useTheme();

  const variantStyles = {
    primary: 'border-l-blue-500 dark:border-l-blue-400',
    success: 'border-l-green-500 dark:border-l-green-400',
    warning: 'border-l-yellow-500 dark:border-l-yellow-400',
    danger: 'border-l-red-500 dark:border-l-red-400',
  };

  const iconColors = {
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className={`${getCardClasses()} border-l-4 ${variantStyles[variant]} p-6 ultra-smooth-transition hover:shadow-finance-hover-light dark:hover:shadow-finance-hover-dark hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${iconColors[variant]}`}>
                {icon}
              </div>
            )}
            <div>
              <p className={`text-sm font-medium ${getTextClasses('secondary')}`}>
                {title}
              </p>
              <p className={`text-2xl font-bold ${getTextClasses('primary')} mt-1`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subtitle && (
                <p className={`text-sm ${getTextClasses('secondary')} mt-1`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {trend && (
            <div className="flex items-center mt-4 space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend.isPositive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <svg 
                  className={`w-3 h-3 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>{trend.value}</span>
              </div>
              <span className={`text-xs ${getTextClasses('secondary')}`}>
                vs last period
              </span>
            </div>
          )}
        </div>
      </div>
      
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {children}
        </div>
      )}
    </div>
  );
};

export default FinanceCard;