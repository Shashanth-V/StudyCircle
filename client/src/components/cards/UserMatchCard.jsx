import React from 'react';

export default function UserMatchCard({ suggestion, onRequest }) {
  const { user, score, mutualSubjects } = suggestion;

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 40) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5 flex flex-col h-full">
      <div className="flex items-start gap-4">
        <img
          src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
        />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{user.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            {user.city || 'Remote'}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-md border font-bold text-sm ${getScoreColor(score)}`}>
          {score}%
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[40px]">
        {user.bio || 'No bio provided'}
      </p>

      <div className="mt-4 flex-1">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Shared Subjects</p>
        <div className="flex flex-wrap gap-2">
          {mutualSubjects.length > 0 ? mutualSubjects.map(sub => (
            <span key={sub} className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium border border-primary-100 dark:border-primary-800/50">
              {sub}
            </span>
          )) : <span className="text-sm text-gray-400">None</span>}
        </div>
      </div>

      <button
        onClick={() => onRequest(user._id)}
        className="mt-6 w-full py-2 bg-gray-900 hover:bg-gray-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
      >
        Connect
      </button>
    </div>
  );
}
