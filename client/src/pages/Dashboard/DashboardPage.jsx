import { useAuthStore } from '../../stores/authStore';

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-primary-100">You're on a {user?.streak} day streak. Keep it up!</p>
        
        <div className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-primary-100">Level {Math.floor(user?.xp / 100) + 1}</span>
            <span className="text-sm font-bold">{user?.xp} XP</span>
          </div>
          <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000"
              style={{ width: `${(user?.xp % 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">XP This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{user?.weeklyXP}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">{user?.streak} 🔥</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Study Goal</h2>
          <p className="text-gray-600 dark:text-gray-300 italic">
            "{user?.studyGoal || 'No goal set yet. Update it in your profile!'}"
          </p>
        </div>
      </div>
      
    </div>
  );
}
