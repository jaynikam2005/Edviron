import React, { useState, useEffect } from 'react';
import api from '../services/api';

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

const SchoolTransactionSearch: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sort: 'payment_time',
    order: 'desc',
  });

  // Sample school data - in a real app, this would come from an API
  const availableSchools = [
    { id: 'school_123', name: 'Delhi Public School' },
    { id: 'school_456', name: 'Kendriya Vidyalaya' },
    { id: 'school_789', name: 'St. Mary\'s Convent' },
    { id: 'demo_school_001', name: 'Demo School Primary' },
    { id: 'test_school_002', name: 'Test School Secondary' },
    { id: 'school_abc', name: 'ABC International School' },
    { id: 'school_xyz', name: 'XYZ Public School' },
  ];

  // Filter schools based on search term
  const filteredSchools = availableSchools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const fetchSchoolTransactions = React.useCallback(async () => {
    if (!selectedSchool) return;

    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/transactions/school/${selectedSchool}`, { params: filters });
      setTransactions(response?.data?.data ?? []);
      setPagination(prev => response?.data?.pagination ?? prev);
    } catch (err: unknown) {
      const respErr = err as { response?: { data?: { message?: string } } };
      setError(respErr.response?.data?.message || 'Failed to fetch school transactions');
      console.error('School transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, filters]);

  useEffect(() => {
    if (selectedSchool) {
      fetchSchoolTransactions();
    } else {
      setTransactions([]);
      setPagination({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: 10,
        has_next: false,
        has_prev: false,
      });
    }
  }, [selectedSchool, filters, fetchSchoolTransactions]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value),
    }));
  };

  const handleSchoolSelect = (school: { id: string; name: string }) => {
    setSelectedSchool(school.id);
    setSearchTerm(school.name);
    setShowDropdown(false);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(true);
    
    // If the search term exactly matches a school name or ID, auto-select it
    const exactMatch = availableSchools.find(school => 
      school.name.toLowerCase() === value.toLowerCase() ||
      school.id.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      setSelectedSchool(exactMatch.id);
    } else if (selectedSchool && !value) {
      setSelectedSchool('');
    }
  };

  const clearSelection = () => {
    setSelectedSchool('');
    setSearchTerm('');
    setShowDropdown(false);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full';
    switch (status?.toLowerCase()) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Transaction Search</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Search and view transactions for specific schools
          </p>
        </div>
      </div>

      {/* School Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="max-w-md">
          <label htmlFor="school-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search School
          </label>
          <div className="relative">
            <div className="flex">
              <div className="relative flex-1">
                <input
                  id="school-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by school name or ID..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {selectedSchool && (
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-200 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-500"
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* Dropdown */}
            {showDropdown && searchTerm && filteredSchools.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
                {filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => handleSchoolSelect(school)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">{school.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{school.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {selectedSchool && (
            <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-md dark:bg-primary-900 dark:border-primary-700">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <span className="text-primary-800 dark:text-primary-300 font-medium">
                    Selected: {availableSchools.find(s => s.id === selectedSchool)?.name}
                  </span>
                  <p className="text-primary-700 dark:text-primary-400 text-sm">
                    School ID: {selectedSchool}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSchool && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  id="sort-select"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="payment_time">Payment Time</option>
                  <option value="order_amount">Amount</option>
                  <option value="createdAt">Created Date</option>
                  <option value="status">Status</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="order-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <select
                  id="order-select"
                  value={filters.order}
                  onChange={(e) => handleFilterChange('order', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="items-per-page" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items per page
                </label>
                <select
                  id="items-per-page"
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={fetchSchoolTransactions}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
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
                Refresh Data
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {loading && transactions.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Transactions for {availableSchools.find(s => s.id === selectedSchool)?.name}
                  </h3>
                  {pagination.total_items > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Total: {pagination.total_items} transactions
                    </p>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Gateway
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              <div className="flex flex-col">
                                <span className="font-mono">{transaction.custom_order_id}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {transaction.collect_id || transaction._id}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              <div className="flex flex-col">
                                <span className="font-medium">{transaction.student_info?.name || 'N/A'}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {transaction.student_info?.email || transaction.student_info?.id || ''}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded dark:bg-gray-700 dark:text-gray-300">
                                {transaction.gateway_name || transaction.payment_mode || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              <div className="flex flex-col">
                                <span className="font-medium">₹{transaction.transaction_amount?.toLocaleString() || '0'}</span>
                                {transaction.order_amount !== transaction.transaction_amount && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Order: ₹{transaction.order_amount?.toLocaleString() || '0'}
                                  </span>
                                )}
                              </div>
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
                          <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            {loading ? 'Loading transactions...' : 'No transactions found for this school'}
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
                          onClick={() => handleFilterChange('page', pagination.current_page - 1)}
                          disabled={!pagination.has_prev}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handleFilterChange('page', pagination.current_page + 1)}
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
                              {(pagination.current_page - 1) * pagination.items_per_page + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                              {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">{pagination.total_items}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => handleFilterChange('page', pagination.current_page - 1)}
                              disabled={!pagination.has_prev}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              <span className="sr-only">Previous</span>
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                              Page {pagination.current_page} of {pagination.total_pages}
                            </span>
                            
                            <button
                              onClick={() => handleFilterChange('page', pagination.current_page + 1)}
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
              </>
            )}
          </div>
        </>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <button 
          type="button"
          className="fixed inset-0 z-0 bg-transparent border-0 cursor-default" 
          onClick={() => setShowDropdown(false)}
          aria-label="Close dropdown"
        />
      )}
    </div>
  );
};

export default SchoolTransactionSearch;