import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';

interface PaymentForm {
  school_id: string;
  trustee_id: string;
  custom_order_id: string;
  order_amount: number;
  payment_mode: string;
  gateway_name: string;
  student_name: string;
  student_class: string;
  description: string;
}

const CreatePayment: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PaymentForm>({
    school_id: '',
    trustee_id: '',
    custom_order_id: '',
    order_amount: 0,
    payment_mode: '',
    gateway_name: 'edviron',
    student_name: '',
    student_class: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order_amount' ? Number(value) : value,
    }));
  };

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const orderId = `ORD_${timestamp}_${random}`;
    setFormData(prev => ({ ...prev, custom_order_id: orderId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await paymentAPI.createPayment(formData as unknown as Record<string, unknown>);
      console.log('Payment created:', response.data);
      navigate('/payments');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Payment</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Create a new payment request for student fees
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/payments')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Payments
        </button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* School Information */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  School ID *
                </label>
                <input
                  type="text"
                  id="school_id"
                  name="school_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter school ID"
                  value={formData.school_id}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="trustee_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trustee ID *
                </label>
                <input
                  type="text"
                  id="trustee_id"
                  name="trustee_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter trustee ID"
                  value={formData.trustee_id}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Order Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="custom_order_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order ID *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="custom_order_id"
                    name="custom_order_id"
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter order ID"
                    value={formData.custom_order_id}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={generateOrderId}
                    className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="order_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  id="order_amount"
                  name="order_amount"
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter amount"
                  value={formData.order_amount || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="student_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  id="student_name"
                  name="student_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter student name"
                  value={formData.student_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="student_class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class/Grade *
                </label>
                <input
                  type="text"
                  id="student_class"
                  name="student_class"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter class/grade"
                  value={formData.student_class}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Payment Configuration */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Payment Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="payment_mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Mode *
                </label>
                <select
                  id="payment_mode"
                  name="payment_mode"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.payment_mode}
                  onChange={handleChange}
                >
                  <option value="">Select payment mode</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>
              <div>
                <label htmlFor="gateway_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gateway *
                </label>
                <select
                  id="gateway_name"
                  name="gateway_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.gateway_name}
                  onChange={handleChange}
                >
                  <option value="edviron">Edviron Gateway</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="payu">PayU</option>
                  <option value="ccavenue">CCAvenue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter payment description (e.g., Tuition Fee - Q1 2024)"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/payments')}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayment;