import React from 'react';
import { useTheme } from '../hooks/useTheme';
import FinanceCard from '../components/FinanceCard';
import FinanceTable from '../components/FinanceTable';

const FinanceThemeDemo: React.FC = () => {
  const { getBackgroundClasses, getButtonClasses, getTextClasses } = useTheme();

  // Sample data for the table
  const sampleTransactions = [
    {
      id: '1',
      orderId: 'ORD001234',
      amount: 15000,
      status: 'success',
      date: '2024-01-15',
      school: 'Delhi Public School',
      paymentMode: 'UPI'
    },
    {
      id: '2',
      orderId: 'ORD001235',
      amount: 8500,
      status: 'pending',
      date: '2024-01-14',
      school: 'Ryan International',
      paymentMode: 'Credit Card'
    },
    {
      id: '3',
      orderId: 'ORD001236',
      amount: 12000,
      status: 'failed',
      date: '2024-01-13',
      school: 'DAV Public School',
      paymentMode: 'Net Banking'
    },
    {
      id: '4',
      orderId: 'ORD001237',
      amount: 25000,
      status: 'success',
      date: '2024-01-12',
      school: 'Modern School',
      paymentMode: 'UPI'
    },
  ];

  const tableColumns = [
    {
      key: 'orderId',
      label: 'Order ID',
      sortable: true,
      render: (value: unknown) => (
        <div className="font-mono text-sm font-medium">
          {String(value)}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: unknown) => (
        <div className="font-semibold text-green-600 dark:text-green-400">
          ₹{Number(value || 0).toLocaleString()}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true
    },
    {
      key: 'school',
      label: 'School',
      sortable: true
    },
    {
      key: 'paymentMode',
      label: 'Payment Mode',
      sortable: false
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: unknown) => (
        <div className="text-sm">
          {new Date(String(value)).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className={getBackgroundClasses()}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${getTextClasses('primary')} mb-2`}>
            Professional Finance Dashboard Theme
          </h1>
          <p className={`text-lg ${getTextClasses('secondary')}`}>
            Demonstrating the complete finance dashboard theme with cards, tables, and interactive components.
          </p>
        </div>

        {/* Finance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FinanceCard
            title="Total Revenue"
            value="₹2,45,000"
            subtitle="This month"
            variant="success"
            trend={{ value: "+12.5%", isPositive: true }}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />

          <FinanceCard
            title="Active Transactions"
            value="1,247"
            subtitle="Processing"
            variant="primary"
            trend={{ value: "+8.2%", isPositive: true }}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />

          <FinanceCard
            title="Failed Payments"
            value="23"
            subtitle="Need attention"
            variant="danger"
            trend={{ value: "-5.1%", isPositive: false }}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />

          <FinanceCard
            title="Success Rate"
            value="98.2%"
            subtitle="Last 30 days"
            variant="warning"
            trend={{ value: "+2.1%", isPositive: true }}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Finance Table */}
        <FinanceTable
          title="Recent Transactions"
          columns={tableColumns}
          data={sampleTransactions}
          actions={
            <div className="flex space-x-2">
              <button className={`px-3 py-1 text-xs ${getButtonClasses('primary')}`}>
                Export
              </button>
              <button className={`px-3 py-1 text-xs ${getButtonClasses('secondary')}`}>
                Filter
              </button>
            </div>
          }
        />

        {/* Theme Information */}
        <div className="mt-8">
          <FinanceCard
            title="✅ Professional Finance Dashboard Theme Complete!"
            value=""
            variant="primary"
          >
            <div className={`text-sm space-y-2 ${getTextClasses('secondary')}`}>
              <p><strong>✅ Tailwind Configuration:</strong> Custom finance colors with light/dark variants</p>
              <p><strong>✅ Theme Context:</strong> localStorage persistence with system preference detection</p>
              <p><strong>✅ Component Library:</strong> Professional FinanceCard and FinanceTable components</p>
              <p><strong>✅ Hover Effects:</strong> Ultra-smooth 600ms transitions with GPU optimization</p>
              <p><strong>✅ Status Colors:</strong> Consistent success/warning/danger styling across all components</p>
              <p><strong>✅ Professional Toggle:</strong> Animated theme switcher in navbar</p>
              <p><strong>✅ Responsive Design:</strong> Mobile-first approach with dark mode support</p>
            </div>
          </FinanceCard>
        </div>
      </div>
    </div>
  );
};

export default FinanceThemeDemo;