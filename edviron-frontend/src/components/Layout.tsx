import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('accessToken');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Edviron</h1>
              </Link>
              
              {isAuthenticated && (
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/transactions"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Transactions
                  </Link>
                  <Link
                    to="/payments"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Payments
                  </Link>
                  <Link
                    to="/users"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Users
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              ) : (
                <div className="space-x-2">
                  <Link to="/login" className="btn-primary">
                    Login
                  </Link>
                  <Link to="/register" className="btn-secondary">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2023 Edviron. Built with React, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;