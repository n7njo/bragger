import React from 'react';
import { Plus, Search, Filter, Trophy } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Achievements() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
            <p className="mt-2 text-gray-600">Manage your professional accomplishments</p>
          </div>
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search achievements..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock Achievement Cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="mb-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sample Achievement {i}
                </h3>
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  Development
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                This is a sample achievement description that showcases the work accomplished
                and its impact on the project or organization.
              </p>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Jan 2024 - Mar 2024</span>
              <span>40 hours</span>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                React
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                TypeScript
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                Leadership
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (when no achievements exist) */}
      {false && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
          <p className="text-gray-500 mb-6">
            Start documenting your professional accomplishments to build your success story.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Achievement
          </Button>
        </div>
      )}
    </div>
  );
}