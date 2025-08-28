import { Trophy, Calendar, Tag, TrendingUp } from 'lucide-react';
import { useAchievements, useCategories } from '../hooks';
import { LoadingGrid } from '../components/ui/LoadingCard';
import { ErrorState } from '../components/ui/ErrorState';

export function Dashboard() {
  const { data: achievementsResponse, isLoading: achievementsLoading, isError: achievementsError } = useAchievements({ pageSize: 100 });
  const { data: categoriesResponse, isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  
  const achievements = achievementsResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  
  // Calculate this year's achievements
  const currentYear = new Date().getFullYear();
  const thisYearAchievements = achievements.filter(a => 
    new Date(a.startDate).getFullYear() === currentYear
  );

  // Calculate recent achievements (last 30 days)  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAchievements = achievements.filter(a => 
    new Date(a.createdAt) >= thirtyDaysAgo
  );

  const stats = [
    { 
      name: 'Total Achievements', 
      value: achievements.length.toString(), 
      icon: Trophy, 
      change: `+${recentAchievements.length} this month` 
    },
    { 
      name: 'This Year', 
      value: thisYearAchievements.length.toString(), 
      icon: Calendar, 
      change: `${Math.round((thisYearAchievements.length / Math.max(achievements.length, 1)) * 100)}% of total` 
    },
    { 
      name: 'Categories', 
      value: categories.length.toString(), 
      icon: Tag, 
      change: categories.slice(0, 2).map(c => c.name).join(', ') + (categories.length > 2 ? '...' : '')
    },
    { 
      name: 'Avg Duration', 
      value: achievements.length > 0 ? `${Math.round(achievements.reduce((sum, a) => sum + (a.durationHours || 0), 0) / achievements.length)}h` : '0h',
      icon: TrendingUp, 
      change: 'per achievement' 
    },
  ];

  if (achievementsLoading || categoriesLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your professional achievements</p>
        </div>
        <LoadingGrid count={4} />
      </div>
    );
  }

  if (achievementsError || categoriesError) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your professional achievements</p>
        </div>
        <ErrorState
          title="Failed to load dashboard data"
          message="Unable to fetch your achievements and categories."
        />
      </div>
    );
  }

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
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No achievements yet</p>
            <p className="text-sm text-gray-400">Start documenting your accomplishments!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.slice(0, 5).map((achievement, index) => {
              const category = categories.find(c => c.id === achievement.categoryId);
              const createdDate = new Date(achievement.createdAt);
              const timeAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={achievement.id} className={`flex items-center justify-between py-3 ${index < 4 ? 'border-b border-gray-200' : ''}`}>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category?.name || 'Uncategorized'} • {timeAgo === 0 ? 'Today' : timeAgo === 1 ? '1 day ago' : `${timeAgo} days ago`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {achievement.durationHours ? `${achievement.durationHours}h` : '—'}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {achievement.priority.toLowerCase()} priority
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}