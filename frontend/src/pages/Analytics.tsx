import React, { useState } from 'react';
import { useApiGet } from '../hooks/useApi';

type TimeRange = '7d' | '30d' | '90d';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  retention: number;
  dailyActiveUsers: { date: string; count: number }[];
  signupsByDay: { date: string; count: number }[];
  userGrowth: number;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const { data, isLoading, error } = useApiGet<AnalyticsData>('/analytics', { range: timeRange });

  if (isLoading) {
    return <div className="text-gray-600">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading analytics</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{data?.totalUsers ?? 0}</p>
          <p className="text-xs text-green-600 mt-2">
            ↑ {data?.userGrowth ?? 0}% from last period
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{data?.activeUsers ?? 0}</p>
          <p className="text-xs text-gray-400 mt-2">
            {data && data.totalUsers ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0}% of total
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">New Signups</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{data?.newSignups ?? 0}</p>
          <p className="text-xs text-gray-400 mt-2">In selected period</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Retention Rate</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{data?.retention ?? 0}%</p>
          <p className="text-xs text-gray-400 mt-2">Monthly average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Active Users</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {data?.dailyActiveUsers?.map((item, index) => {
              const maxCount = Math.max(...(data.dailyActiveUsers?.map((d) => d.count) ?? [1]));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${item.date}: ${item.count}`}
                  ></div>
                  <span className="text-xs text-gray-400 mt-1 rotate-45 origin-top-left">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Signups by Day</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {data?.signupsByDay?.map((item, index) => {
              const maxCount = Math.max(...(data.signupsByDay?.map((d) => d.count) ?? [1]));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${item.date}: ${item.count}`}
                  ></div>
                  <span className="text-xs text-gray-400 mt-1 rotate-45 origin-top-left">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}