import React from 'react';
import { Trophy, Calendar, Tag, TrendingUp } from 'lucide-react';

export function Dashboard() {
  // Mock data - will be replaced with real data later
  const stats = [
    { name: 'Total Achievements', value: '12', icon: Trophy, change: '+2 this month' },
    { name: 'This Year', value: '8', icon: Calendar, change: '+3 this quarter' },
    { name: 'Categories', value: '4', icon: Tag, change: 'Development, Leadership, etc.' },
    { name: 'Growth', value: '25%', icon: TrendingUp, change: 'vs last year' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your professional achievements</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                  <dd className="text-xs text-gray-500">{stat.change}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Implemented new authentication system
              </h3>
              <p className="text-sm text-gray-500">Development • 2 weeks ago</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">40 hours</div>
              <div className="text-xs text-gray-500">High priority</div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Led team presentation to stakeholders
              </h3>
              <p className="text-sm text-gray-500">Leadership • 1 month ago</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">8 hours</div>
              <div className="text-xs text-gray-500">Medium priority</div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Optimized database performance
              </h3>
              <p className="text-sm text-gray-500">Development • 1 month ago</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">24 hours</div>
              <div className="text-xs text-gray-500">High priority</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}