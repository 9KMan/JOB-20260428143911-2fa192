import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/tenants', label: 'Tenants', icon: '🏢' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="mt-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                  location.pathname === item.path ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}