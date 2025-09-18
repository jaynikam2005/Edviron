import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white' | 'gradient';
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'orbital';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  type = 'spinner',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white',
    gradient: 'text-transparent bg-gradient-to-r from-blue-600 to-purple-600',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const renderSpinner = () => {
    const baseClasses = `${sizeClasses[size]} ${colorClasses[variant]}`;

    switch (type) {
      case 'spinner':
        return (
          <div className="relative">
            <svg className={`${baseClasses} animate-spin`} fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {variant === 'gradient' && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 animate-pulse"></div>
            )}
          </div>
        );

      case 'orbital':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            {/* Central core */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
            
            {/* Orbiting rings */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-dashed animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-1 rounded-full border border-purple-600 border-dotted animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
            
            {/* Orbiting dots */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-600 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-purple-600 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={`dot-enhanced-${i}`}
                className={`w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse`} />
            <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-blue-400 rounded-full animate-ping`} />
          </div>
        );

      case 'bars':
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={`bar-enhanced-${i}`}
                className="w-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-full animate-pulse"
                style={{
                  height: `${12 + (i % 2) * 8}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.2s',
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`${textSizeClasses[size]} font-medium bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

// Full page loading overlay
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  text?: string;
  variant?: 'light' | 'dark';
}> = ({ isVisible, text = 'Loading...', variant = 'light' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      <div className={`relative p-8 rounded-lg shadow-lg ${
        variant === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-white text-gray-900'
      }`}>
        <LoadingSpinner
          size="lg"
          variant={variant === 'dark' ? 'white' : 'primary'}
          text={text}
        />
      </div>
    </div>
  );
};

// Inline loading state for buttons
export const ButtonSpinner: React.FC<{
  size?: 'sm' | 'md';
  className?: string;
}> = ({ size = 'sm', className = '' }) => {
  return (
    <LoadingSpinner
      size={size}
      variant="white"
      type="spinner"
      className={`${className}`}
    />
  );
};

// Loading skeleton for content
export const LoadingSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => {
  const lineIds = React.useMemo(() => 
    Array.from({ length: lines }, (_, i) => `skeleton-${Date.now()}-${i}`), 
    [lines]
  );

  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {lineIds.map((id) => (
        <div key={id} className="flex space-x-4">
          <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Table loading skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  const headerIds = React.useMemo(() => 
    Array.from({ length: columns }, (_, i) => `header-${Date.now()}-${i}`), 
    [columns]
  );
  
  const rowData = React.useMemo(() => 
    Array.from({ length: rows }, (_, rowIndex) => ({
      id: `row-${Date.now()}-${rowIndex}`,
      cells: Array.from({ length: columns }, (_, colIndex) => 
        `cell-${Date.now()}-${rowIndex}-${colIndex}`
      )
    })), 
    [rows, columns]
  );

  return (
    <div className={`animate-pulse ${className}`}>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {headerIds.map((id) => (
                <th key={id} className="px-6 py-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {rowData.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cellId) => (
                  <td key={cellId} className="px-6 py-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};