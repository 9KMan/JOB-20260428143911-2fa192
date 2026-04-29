import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-primary-600">
              MyApp
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-gray-600">
                {user.firstName} {user.lastName}
              </span>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}