import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import SchoolTransactions from './pages/SchoolTransactions';
import SchoolTransactionSearch from './pages/SchoolTransactionSearch';
import TransactionStatus from './pages/TransactionStatus';
import TransactionStatusForm from './pages/TransactionStatusForm';
import Analytics from './pages/Analytics';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('accessToken');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Home Component
const Home: React.FC = () => {
  const isAuthenticated = localStorage.getItem('accessToken');
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="px-4 py-12 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Edviron Payment Gateway
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A comprehensive payment processing platform with real-time transaction management,
          webhook processing, and advanced analytics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
             <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Processing</h3>
            <p className="text-gray-600">Secure and fast payment processing with multiple gateway support</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
            <p className="text-gray-600">Comprehensive transaction analytics and reporting dashboard</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Webhook Management</h3>
            <p className="text-gray-600">Real-time webhook processing and status updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other routes

const Payments: React.FC = () => (
  <div className="px-4 py-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Payments</h1>
    <div className="card">
      <p className="text-gray-600">Payment creation interface coming soon...</p>
    </div>
  </div>
);

const Users: React.FC = () => (
  <div className="px-4 py-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Users</h1>
    <div className="card">
      <p className="text-gray-600">User management interface coming soon...</p>
    </div>
  </div>
);

const Register: React.FC = () => (
  <div className="px-4 py-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Register</h1>
    <div className="card">
      <p className="text-gray-600">User registration interface coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public routes with basic layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
            
            {/* Protected routes with dashboard layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="transactions/school" element={<SchoolTransactions />} />
              <Route path="school-search" element={<SchoolTransactionSearch />} />
              <Route path="transaction-status" element={<TransactionStatus />} />
              <Route path="status-lookup" element={<TransactionStatusForm />} />
              <Route path="payments" element={<Payments />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
