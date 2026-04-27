import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchStore } from '../stores/matchStore';
import { useAuthStore } from '../stores/authStore';
import { Users, UserCheck, UserX, Loader2, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Matches() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const suggestions = useMatchStore((state) => state.suggestions);
  const matches = useMatchStore((state) => state.matches);
  const requests = useMatchStore((state) => state.requests);
  const fetchSuggestions = useMatchStore((state) => state.fetchSuggestions);
  const fetchMatches = useMatchStore((state) => state.fetchMatches);
  const sendRequest = useMatchStore((state) => state.sendRequest);
  const acceptRequest = useMatchStore((state) => state.acceptRequest);
  const declineRequest = useMatchStore((state) => state.declineRequest);
  const isLoading = useMatchStore((state) => state.isLoading);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    if (activeTab === 'suggestions') fetchSuggestions();
    else fetchMatches();
  }, [activeTab, fetchSuggestions, fetchMatches]);

  const filteredSuggestions = filterSubject
    ? suggestions.filter((s) => s.subjects?.some((sub) => sub.name.toLowerCase().includes(filterSubject.toLowerCase())))
    : suggestions;

  const handleSendRequest = async (userId) => {
    try {
      await sendRequest(userId);
      toast.success('Match request sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAccept = async (matchId) => {
    try {
      await acceptRequest(matchId);
      toast.success('Match accepted');
    } catch (err) {
      toast.error('Failed to accept');
    }
  };

  const handleDecline = async (matchId) => {
    try {
      await declineRequest(matchId);
      toast.success('Request declined');
    } catch (err) {
      toast.error('Failed to decline');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Matches</h1>
        {activeTab === 'suggestions' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              placeholder="Filter by subject..."
              className="input pl-9 w-full sm:w-64"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabButton active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} icon={<Users className="w-4 h-4" />} label="Suggestions" count={suggestions.length} />
        <TabButton active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} icon={<UserCheck className="w-4 h-4" />} label="Connections" count={matches.length} />
        <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon={<UserX className="w-4 h-4" />} label="Requests" count={requests.received.length} />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'suggestions' && (
            <>
              {filteredSuggestions.length === 0 ? (
                <EmptyState message="No suggestions found. Try adjusting your filters or check back later." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSuggestions.map((u) => (
                    <UserCard
                      key={u._id}
                      user={u}
                      matchScore={u.matchScore}
                      actions={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendRequest(u._id);
                          }}
                          className="btn-primary text-sm py-1.5"
                        >
                          Connect
                        </button>
                      }
                      onClick={() => navigate(`/matches/${u._id}`)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'connections' && (
            <>
              {matches.length === 0 ? (
                <EmptyState message="No connections yet. Browse suggestions to find study buddies." action="Browse" onAction={() => setActiveTab('suggestions')} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.map((m) => {
                    const otherUser = m.requester._id === user?._id ? m.receiver : m.requester;
                    return (
                      <UserCard
                        key={m._id}
                        user={otherUser}
                        matchScore={m.matchScore}
                        onClick={() => navigate(`/matches/${otherUser._id}`)}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              {requests.received.length === 0 ? (
                <EmptyState message="No pending requests" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests.received.map((m) => (
                    <UserCard
                      key={m._id}
                      user={m.requester}
                      matchScore={m.matchScore}
                      actions={
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(m._id);
                            }}
                            className="btn-primary text-sm py-1.5 flex-1"
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecline(m._id);
                            }}
                            className="btn-secondary text-sm py-1.5 flex-1"
                          >
                            Decline
                          </button>
                        </div>
                      }
                      onClick={() => navigate(`/matches/${m.requester._id}`)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function UserCard({ user, matchScore, actions, onClick }) {
  return (
    <div onClick={onClick} className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <img
          src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
          alt={user.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        {matchScore > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold">
            {matchScore}%
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
        {user.bio || `${user.studyStyle || 'Collaborative'} learner`}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {user.subjects?.slice(0, 3).map((s) => (
          <span key={s.name} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {s.name}
          </span>
        ))}
      </div>
      {actions && <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">{actions}</div>}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }) {
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
      {count > 0 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState({ message, action, onAction }) {
  return (
    <div className="text-center py-16 card">
      <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
      {action && (
        <button onClick={onAction} className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
          {action}
        </button>
      )}
    </div>
  );
}

