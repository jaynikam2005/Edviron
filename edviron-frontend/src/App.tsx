import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './hooks/useTheme';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const SchoolTransactions = lazy(() => import('./pages/SchoolTransactions'));
const SchoolTransactionSearch = lazy(() => import('./pages/SchoolTransactionSearch'));
const Analytics = lazy(() => import('./pages/Analytics'));
const TransactionStatus = lazy(() => import('./pages/TransactionStatus'));
const TransactionStatusForm = lazy(() => import('./pages/TransactionStatusForm'));
const Payments = lazy(() => import('./pages/Payments'));
const CreatePayment = lazy(() => import('./pages/CreatePayment'));
const Users = lazy(() => import('./pages/Users'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));

import './App.css';

// Theme-aware app wrapper
const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  // Apply theme to document with proper effect
  useEffect(() => {
    const applyTheme = () => {
      const html = document.documentElement;
      const body = document.body;
      
      // Remove existing classes
      html.classList.remove('dark', 'light');
      body.classList.remove('dark', 'light');
      
      // Add current theme classes
      if (isDark) {
        html.classList.add('dark');
        body.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
        body.setAttribute('data-theme', 'dark');
      } else {
        html.classList.add('light');
        body.classList.add('light');
        html.setAttribute('data-theme', 'light');
        body.setAttribute('data-theme', 'light');
      }
    };
    
    applyTheme();
  }, [isDark]);

  // Check if user has a valid token but require re-authentication anyway
  const hasStoredToken = !!localStorage.getItem('accessToken');
  
  // Clear any existing authentication on app load to force fresh login
  if (hasStoredToken) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Router>
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
            <div className="text-center">
              <LoadingSpinner 
                size="xl" 
                type="orbital" 
                variant="gradient" 
                text="Loading Edviron..." 
              />
              <div className="mt-8">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        }>
          <Routes>
            {/* Public Routes - Always start here */}
            <Route 
              path="/login" 
              element={<Login />} 
            />
            <Route 
              path="/register" 
              element={<Register />} 
            />
            
            {/* Protected Routes - Require authentication */}
            <Route 
              path="/" 
              element={<Navigate to="/login" replace />}
            />
            
            <Route element={<DashboardLayout />}>
              {/* Main Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Transaction Management */}
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/school" element={<SchoolTransactions />} />
              <Route path="/transactions/search" element={<SchoolTransactionSearch />} />
              <Route path="/transaction-status" element={<TransactionStatus />} />
              <Route path="/transaction-status-form" element={<TransactionStatusForm />} />
              
              {/* Payment Management */}
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/create" element={<CreatePayment />} />
              
              {/* Analytics & Reports */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              
              {/* User Management */}
              <Route path="/users" element={<Users />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}export default App;