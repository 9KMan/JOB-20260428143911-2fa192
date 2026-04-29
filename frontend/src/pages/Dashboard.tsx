import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApiGet } from '../hooks/useApi';
import { TenantMetrics, UserMetrics } from '../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
}

function MetricCard({ title, value, icon, description }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tenantMetrics, isLoading: loadingTenants } = useApiGet<TenantMetrics>('/metrics/tenants');
  const { data: userMetrics, isLoading: loadingUsers } = useApiGet<UserMetrics>('/metrics/users');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome back, {user?.firstName}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tenants"
          value={loadingTenants ? '-' : tenantMetrics?.totalTenants ?? 0}
          icon="🏢"
        />
        <MetricCard
          title="Active Tenants"
          value={loadingTenants ? '-' : tenantMetrics?.activeTenants ?? 0}
          icon="✅"
        />
        <MetricCard
          title="Total Users"
          value={loadingUsers ? '-' : userMetrics?.totalUsers ?? 0}
          icon="👥"
        />
        <MetricCard
          title="New Users This Month"
          value={loadingUsers ? '-' : userMetrics?.newUsersThisMonth ?? 0}
          icon="📈"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors text-left">
              Create New Tenant
            </button>
            <button className="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors text-left">
              Add New User
            </button>
            <button className="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors text-left">
              View Analytics
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              <span className="text-gray-600">New tenant registered: Acme Corp</span>
              <span className="ml-auto text-gray-400">2h ago</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              <span className="text-gray-600">User john@example.com joined</span>
              <span className="ml-auto text-gray-400">5h ago</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              <span className="text-gray-600">Plan upgraded: Pro → Enterprise</span>
              <span className="ml-auto text-gray-400">1d ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}