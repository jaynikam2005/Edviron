import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/DashboardLayout';

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

function App() {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div></div>}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/register" 
                element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;