import { useEffect, useState } from 'react';
import { leaderboardApi } from '../lib/api';
import { Trophy, Medal, Loader2, Flame } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    leaderboardApi.getWeekly().then((res) => {
      setLeaders(res.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">{index + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Top learners this week by XP</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-500 dark:text-gray-400">No data yet. Start studying to earn XP!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {leaders.map((user, index) => (
              <div
                key={user._id}
                className={`flex items-center gap-4 p-4 ${index < 3 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}
              >
                <div className="w-8 flex justify-center">{getRankIcon(index)}</div>
                <img
                  src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {user.streak || 0} day streak
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600 dark:text-primary-400">{user.weeklyXP || user.xp || 0} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

