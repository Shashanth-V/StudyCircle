import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMatchStore } from '../stores/matchStore';
import { useChatStore } from '../stores/chatStore';
import { useSessionStore } from '../stores/sessionStore';
import { Flame, Clock, Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const suggestions = useMatchStore((state) => state.suggestions);
  const fetchSuggestions = useMatchStore((state) => state.fetchSuggestions);
  const chats = useChatStore((state) => state.chats);
  const fetchChats = useChatStore((state) => state.fetchChats);
  const sessions = useSessionStore((state) => state.sessions);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);

  useEffect(() => {
    fetchSuggestions();
    fetchChats();
    fetchSessions({ upcoming: true, limit: 3 });
  }, [fetchSuggestions, fetchChats, fetchSessions]);

  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming').slice(0, 3);
  const recentChats = [...chats].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)).slice(0, 3);
  const topMatches = suggestions.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Keep the momentum going. You're doing great!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
              <p className="font-bold text-orange-700 dark:text-orange-300">{user?.streak || 0} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
              <p className="font-bold text-primary-700 dark:text-primary-300">{user?.xp || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          label="Study Hours"
          value={`${Math.floor((user?.totalStudyMinutes || 0) / 60)}h`}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-green-500" />}
          label="Sessions This Week"
          value={sessions.filter(s => {
            const d = new Date(s.scheduledAt);
            const now = new Date();
            const diff = (now - d) / (1000 * 60 * 60 * 24);
            return diff <= 7;
          }).length}
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-purple-500" />}
          label="Active Matches"
          value={useMatchStore.getState().matches?.length || 0}
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5 text-pink-500" />}
          label="Unread Messages"
          value={chats.reduce((sum, c) => sum + (c.unreadCount?.[user?._id] || 0), 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h2>
            <button onClick={() => navigate('/sessions')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              View all
            </button>
          </div>
          {upcomingSessions.length === 0 ? (
            <EmptyState message="No upcoming sessions" action="Create one" onAction={() => navigate('/sessions/create')} />
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s) => (
                <div
                  key={s._id}
                  onClick={() => navigate(`/sessions/${s._id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{s.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(s.scheduledAt).toLocaleString()} · {s.duration} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested matches */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Suggested Matches</h2>
            <button onClick={() => navigate('/matches')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Browse all
            </button>
          </div>
          {topMatches.length === 0 ? (
            <EmptyState message="No suggestions yet" />
          ) : (
            <div className="space-y-3">
              {topMatches.map((u) => (
                <div
                  key={u._id}
                  onClick={() => navigate(`/matches/${u._id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <img
                    src={u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {u.subjects?.map((s) => s.name).join(', ')}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 shrink-0">
                    {u.matchScore || 0}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent chats */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Chats</h2>
            <button onClick={() => navigate('/chat')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              View all
            </button>
          </div>
          {recentChats.length === 0 ? (
            <EmptyState message="No chats yet" action="Find matches" onAction={() => navigate('/matches')} />
          ) : (
            <div className="space-y-3">
              {recentChats.map((c) => {
                const otherUser = c.participants?.find((p) => p._id !== user?._id);
                return (
                  <div
                    key={c._id}
                    onClick={() => navigate(`/chat/${c._id}`)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <img
                      src={otherUser?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || '')}&background=6366f1&color=fff`}
                      alt={otherUser?.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{otherUser?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {c.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {(c.unreadCount?.[user?._id] || 0) > 0 && (
                      <span className="w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {c.unreadCount[user._id]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity feed placeholder */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Feed</h2>
          <div className="space-y-3">
            <ActivityItem text={`You earned ${user?.xp || 0} XP this week`} time="Just now" />
            <ActivityItem text="Complete your profile to get better matches" time="Earlier" />
            <ActivityItem text="Join a study session to start earning streaks" time="Today" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ message, action, onAction }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {action && (
        <button onClick={onAction} className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
          {action}
        </button>
      )}
    </div>
  );
}

function ActivityItem({ text, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-primary-400 mt-2 shrink-0" />
      <div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}

