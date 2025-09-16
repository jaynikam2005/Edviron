import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';

interface Transaction {
  _id: string;
  order_id: string;
  custom_order_id: string;
  school_id: string;
  trustee_id: string;
  student_info: {
    name: string;
    id: string;
    email: string;
  };
  gateway_name: string;
  order_amount: number;
  transaction_amount: number;
  payment_mode: string;
  status: string;
  payment_time?: string;
  order_created_at: string;
  collect_id: string;
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

interface FilterState {
  search: string;
  statuses: string[];
  schoolId: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

const statusOptions = [
  { value: 'success', label: 'Success', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

const Transactions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Initialize filters from URL params
  const filters = useMemo<FilterState>(() => {
    const statuses = searchParams.get('statuses')?.split(',').filter(Boolean) || [];
    return {
      search: searchParams.get('search') || '',
      statuses,
      schoolId: searchParams.get('schoolId') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      sortBy: searchParams.get('sortBy') || 'payment_time',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };
  }, [searchParams]);

  // Update URL params when filters change
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Reset page when changing filters (except page itself)
    if (!Object.hasOwn(newFilters, 'page')) {
      updatedFilters.page = 1;
    }

    const params = new URLSearchParams();
    
    if (updatedFilters.search) params.set('search', updatedFilters.search);
    if (updatedFilters.statuses.length > 0) params.set('statuses', updatedFilters.statuses.join(','));
    if (updatedFilters.schoolId) params.set('schoolId', updatedFilters.schoolId);
    if (updatedFilters.dateFrom) params.set('dateFrom', updatedFilters.dateFrom);
    if (updatedFilters.dateTo) params.set('dateTo', updatedFilters.dateTo);
    if (updatedFilters.sortBy !== 'payment_time') params.set('sortBy', updatedFilters.sortBy);
    if (updatedFilters.sortOrder !== 'desc') params.set('sortOrder', updatedFilters.sortOrder);
    if (updatedFilters.page !== 1) params.set('page', updatedFilters.page.toString());
    if (updatedFilters.limit !== 10) params.set('limit', updatedFilters.limit.toString());

    setSearchParams(params);
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]); // fetchTransactions is stable

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const apiFilters: Record<string, unknown> = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sortBy,
        order: filters.sortOrder,
      };

      if (filters.statuses.length > 0) {
        apiFilters.status = filters.statuses[0]; // API might not support multiple statuses
      }
      
      const response = await apiService.transactions.getAll(apiFilters);
      let data = response.data.data || [];
      
      // Client-side filtering for features not supported by API
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        data = data.filter((t: Transaction) => 
          t.custom_order_id?.toLowerCase().includes(searchLower) ||
          t.school_id?.toLowerCase().includes(searchLower) ||
          t.gateway_name?.toLowerCase().includes(searchLower) ||
          t.student_info?.name?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.schoolId) {
        data = data.filter((t: Transaction) => 
          t.school_id?.toLowerCase().includes(filters.schoolId.toLowerCase())
        );
      }

      if (filters.statuses.length > 1) {
        data = data.filter((t: Transaction) => 
          filters.statuses.includes(t.status?.toLowerCase())
        );
      }

      if (filters.dateFrom || filters.dateTo) {
        data = data.filter((t: Transaction) => {
          const transactionDate = new Date(t.payment_time || t.order_created_at);
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
          const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null;
          
          if (fromDate && transactionDate < fromDate) return false;
          if (toDate && transactionDate > toDate) return false;
          return true;
        });
      }

      setTransactions(data);
      setPagination(response.data.pagination || pagination);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch transactions');
      console.error('Transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    updateFilters({ sortBy: column, sortOrder: newOrder });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    updateFilters({ statuses: newStatuses });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status?.toLowerCase());
    const colorClass = statusOption ? statusOption.color : 'gray';
    
    const colorMap = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorMap[colorClass as keyof typeof colorMap]}`;
  };

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return filters.sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Advanced transaction management with filtering and search
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Search orders, schools, gateways..."
                className="input-field pl-10"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status ({filters.statuses.length} selected)
            </label>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="w-full input-field text-left flex items-center justify-between"
            >
              <span className="truncate">
                {getStatusDisplayText()}
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showStatusDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600">
                <div className="py-1">
                  {statusOptions.map((status) => (
                    <label key={status.value} className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status.value)}
                        onChange={() => handleStatusToggle(status.value)}
                        className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className={getStatusBadge(status.value)}>
                        {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* School ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              School ID
            </label>
            <input
              type="text"
              value={filters.schoolId}
              onChange={(e) => updateFilters({ schoolId: e.target.value })}
              placeholder="Filter by school ID"
              className="input-field"
            />
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Items per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => updateFilters({ limit: parseInt(e.target.value) })}
              className="input-field"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilters({ dateFrom: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilters({ dateTo: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.search || filters.statuses.length > 0 || filters.schoolId || filters.dateFrom || filters.dateTo) && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
              Search: {filters.search}
              <button
                onClick={() => updateFilters({ search: '' })}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.statuses.map(status => (
            <span key={status} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
              Status: {statusOptions.find(s => s.value === status)?.label}
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          ))}
          {filters.schoolId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
              School: {filters.schoolId}
              <button
                onClick={() => updateFilters({ schoolId: '' })}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
              Date: {filters.dateFrom || '...'} - {filters.dateTo || '...'}
              <button
                onClick={() => updateFilters({ dateFrom: '', dateTo: '' })}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('custom_order_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Order ID</span>
                    {getSortIcon('custom_order_id')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('school_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>School ID</span>
                    {getSortIcon('school_id')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('gateway_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Gateway</span>
                    {getSortIcon('gateway_name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('order_amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Order Amount</span>
                    {getSortIcon('order_amount')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('transaction_amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Transaction Amount</span>
                    {getSortIcon('transaction_amount')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('payment_time')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {getSortIcon('payment_time')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr 
                    key={transaction._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-mono">{transaction.custom_order_id}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{transaction.collect_id || transaction._id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <div className="flex flex-col">
                        <span className="font-medium">{transaction.school_id}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{transaction.trustee_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded dark:bg-gray-700 dark:text-gray-300">
                        {transaction.gateway_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <span className="font-medium">₹{transaction.order_amount?.toLocaleString() || '0'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <span className="font-medium">₹{transaction.transaction_amount?.toLocaleString() || '0'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <div className="flex flex-col">
                        <span>
                          {transaction.payment_time 
                            ? new Date(transaction.payment_time).toLocaleDateString()
                            : new Date(transaction.order_created_at).toLocaleDateString()
                          }
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.payment_time 
                            ? new Date(transaction.payment_time).toLocaleTimeString()
                            : new Date(transaction.order_created_at).toLocaleTimeString()
                          }
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {loading ? 'Loading transactions...' : 'No transactions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                  disabled={!pagination.has_prev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={() => updateFilters({ page: filters.page + 1 })}
                  disabled={!pagination.has_next}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{' '}
                    <span className="font-medium">
                      {(filters.page - 1) * filters.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(filters.page * filters.limit, pagination.total_items)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.total_items}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => updateFilters({ page: filters.page - 1 })}
                      disabled={!pagination.has_prev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const pageNum = i + Math.max(1, filters.page - 2);
                      if (pageNum > pagination.total_pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateFilters({ page: pageNum })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === filters.page
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-600 dark:text-primary-300'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => updateFilters({ page: filters.page + 1 })}
                      disabled={!pagination.has_next}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showStatusDropdown && (
        <button 
          type="button"
          className="fixed inset-0 z-0 bg-transparent border-0 cursor-default" 
          onClick={() => setShowStatusDropdown(false)}
          aria-label="Close status dropdown"
        />
      )}
    </div>
  );
};

export default Transactions;