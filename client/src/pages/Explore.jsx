import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userApi, sessionApi } from '../lib/api';
import { Search, Users, Calendar, TrendingUp, Loader2 } from 'lucide-react';

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (activeTab === 'users' && query) {
      setIsLoading(true);
      userApi.searchUsers(query).then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.users || res.data?.data || [];
        setUsers(data);
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
    if (activeTab === 'sessions') {
      setIsLoading(true);
      sessionApi.getSessions({ public: true, status: 'upcoming' }).then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.sessions || res.data?.data || [];
        setSessions(data);
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  }, [activeTab, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search users or subjects..."
          className="input pl-10 w-full"
        />
      </form>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Users" />
        <TabButton active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} icon={<Calendar className="w-4 h-4" />} label="Public Sessions" />
        <TabButton active={activeTab === 'trending'} onClick={() => setActiveTab('trending')} icon={<TrendingUp className="w-4 h-4" />} label="Trending" />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'users' && (
            <>
              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {query ? 'No users found' : 'Search for users or subjects above'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => navigate(`/matches/${u._id}`)}
                      className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                          alt={u.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {u.subjects?.map((s) => s.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'sessions' && (
            <>
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No public sessions available
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => navigate(`/sessions/${s._id}`)}
                      className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          {s.subject}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {s.participants?.length || 0}/{s.maxParticipants}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{s.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(s.scheduledAt).toLocaleString()} · {s.duration} min
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'trending' && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Trending subjects feature coming soon
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
        ${active
          ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

