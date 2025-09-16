import React, { useState } from 'react';
import { apiService } from '../services/api';

interface TransactionStatusData {
  custom_order_id: string;
  status: string;
  order_amount?: number;
  transaction_amount?: number;
  payment_mode?: string;
  payment_time?: string;
  error_message?: string;
  last_updated: string;
}

const TransactionStatusForm: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter a valid order ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTransactionStatus(null);
      setSearched(false);
      
      const response = await apiService.transactions.getStatus(orderId.trim());
      setTransactionStatus(response.data);
      setSearched(true);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 404) {
        setError('Transaction not found. Please check the order ID and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch transaction status');
      }
      setSearched(true);
      console.error('Transaction status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOrderId('');
    setTransactionStatus(null);
    setError('');
    setSearched(false);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex px-3 py-1 text-sm font-semibold rounded-full';
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return (
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Status Lookup</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Enter a custom order ID to check the current transaction status
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Order ID
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter custom order ID (e.g., ORD_1694123456789_001)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  disabled={loading}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !orderId.trim()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Check Status
                  </>
                )}
              </button>
              {(transactionStatus || error || searched) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter the complete custom order ID to retrieve transaction status information
            </p>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900 dark:border-red-700">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 dark:text-red-300 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Transaction Status Card */}
      {transactionStatus && (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Card Header */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Status</h2>
              <span className={getStatusBadge(transactionStatus.status)}>
                {transactionStatus.status || 'Unknown'}
              </span>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="px-6 py-6">
            <div className="flex items-start mb-6">
              <div className="flex-shrink-0 mr-4">
                {getStatusIcon(transactionStatus.status)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {transactionStatus.status === 'success' && 'Payment Completed Successfully'}
                  {transactionStatus.status === 'pending' && 'Payment is Being Processed'}
                  {transactionStatus.status === 'failed' && 'Payment Failed'}
                  {!['success', 'pending', 'failed'].includes(transactionStatus.status?.toLowerCase()) && 'Transaction Status'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Order ID: <span className="font-mono font-medium">{transactionStatus.custom_order_id}</span>
                </p>
                
                {/* Status-specific messages */}
                {transactionStatus.status === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 dark:bg-green-900 dark:border-green-700">
                    <p className="text-green-800 dark:text-green-300 text-sm">
                      ✅ Your payment has been processed successfully. You should receive a confirmation shortly.
                    </p>
                  </div>
                )}
                
                {transactionStatus.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900 dark:border-yellow-700">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                      ⏳ Your payment is currently being processed. Please wait for confirmation.
                    </p>
                  </div>
                )}
                
                {transactionStatus.status === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900 dark:border-red-700">
                    <p className="text-red-800 dark:text-red-300 text-sm">
                      ❌ Payment failed. Please try again or contact support if the issue persists.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Transaction Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Order Amount</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {transactionStatus.order_amount ? `₹${transactionStatus.order_amount.toLocaleString()}` : 'N/A'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Transaction Amount</dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {transactionStatus.transaction_amount ? `₹${transactionStatus.transaction_amount.toLocaleString()}` : 'N/A'}
                  </dd>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Mode</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {transactionStatus.payment_mode || 'N/A'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Time</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {transactionStatus.payment_time 
                      ? new Date(transactionStatus.payment_time).toLocaleString()
                      : 'N/A'
                    }
                  </dd>
                </div>
              </div>
            </div>
            
            {/* Error Message (if any) */}
            {transactionStatus.error_message && (
              <div className="mt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900 dark:border-red-700">
                  <dt className="text-sm font-medium text-red-500 dark:text-red-400 mb-2">Error Details</dt>
                  <dd className="text-sm text-red-700 dark:text-red-300">
                    {transactionStatus.error_message}
                  </dd>
                </div>
              </div>
            )}
            
            {/* Last Updated */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date(transactionStatus.last_updated).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searched && !transactionStatus && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center dark:bg-gray-800 dark:border-gray-700">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Transaction Found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't find a transaction with the provided order ID. Please verify the ID and try again.
          </p>
        </div>
      )}

      {/* Quick Examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-700">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Sample Order IDs</h4>
            <p className="text-blue-700 dark:text-blue-400 text-sm mb-3">
              Try these sample order IDs to test the functionality:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setOrderId('ORD_1694123456789_001')}
                className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                ORD_1694123456789_001
              </button>
              <button
                onClick={() => setOrderId('ORD_1694123456789_002')}
                className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                ORD_1694123456789_002
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatusForm;