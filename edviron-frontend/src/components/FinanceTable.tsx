import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface TableColumn {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface FinanceTableProps {
  title?: string;
  columns: TableColumn[];
  data: Record<string, unknown>[];
  loading?: boolean;
  emptyMessage?: string;
  actions?: React.ReactNode;
  statusKey?: string; // Key for status-based row styling
}

const FinanceTable: React.FC<FinanceTableProps> = ({
  title,
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  actions,
  statusKey = 'status'
}) => {
  const { getCardClasses, getTextClasses } = useTheme();

  const getStatusClasses = (status: unknown) => {
    const statusStr = String(status || '').toLowerCase();
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (statusStr) {
      case 'success':
      case 'completed':
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'failed':
      case 'error':
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'pending':
      case 'processing':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  const getRowClasses = (row: Record<string, unknown>) => {
    const status = String(row[statusKey] || '').toLowerCase();
    const borderClass = (() => {
      if (status === 'success' || status === 'completed' || status === 'paid') {
        return 'hover:border-l-green-500';
      } else if (status === 'failed' || status === 'error' || status === 'cancelled') {
        return 'hover:border-l-red-500';
      } else if (status === 'pending' || status === 'processing') {
        return 'hover:border-l-yellow-500';
      } else {
        return 'hover:border-l-blue-500';
      }
    })();
    
    return `group hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-l-transparent ${borderClass} ultra-smooth-transition cursor-pointer`;
  };

  if (loading) {
    return (
      <div className={getCardClasses()}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-5"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getCardClasses()}>
      {/* Header */}
      {(title || actions) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          {title && (
            <h3 className={`text-lg font-semibold ${getTextClasses('primary')}`}>
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.className || ''}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className={`text-sm ${getTextClasses('secondary')}`}>
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = row.id || row._id || `row-${index}`;
                return (
                  <tr 
                    key={String(rowId)}
                    className={getRowClasses(row)}
                    style={{
                      animation: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.animation = 'ultra-transaction-hover 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.animation = '';
                    }}
                  >
                    {columns.map((column) => {
                      const cellValue = row[column.key];
                      const renderContent = () => {
                        if (column.render) {
                          return column.render(cellValue, row);
                        } else if (column.key === statusKey) {
                          return (
                            <span className={getStatusClasses(cellValue)}>
                              {String(cellValue || '')}
                            </span>
                          );
                        } else {
                          return (
                            <div className={`text-sm transition-all duration-600 ease-out group-hover:translate-x-2 group-hover:scale-105 ${getTextClasses('primary')}`}>
                              {String(cellValue || '')}
                            </div>
                          );
                        }
                      };

                      return (
                        <td key={column.key} className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}>
                          {renderContent()}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceTable;