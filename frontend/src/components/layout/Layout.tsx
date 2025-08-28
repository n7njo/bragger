import { Outlet, Link, useLocation } from 'react-router-dom';
import { Trophy, BarChart3, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Achievements', href: '/achievements', icon: Trophy },

  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <Trophy className="h-8 w-8 text-primary-600" />
            <span className="ml-3 text-xl font-bold text-gray-900">Bragger</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              Personal Achievement Tracker
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
}