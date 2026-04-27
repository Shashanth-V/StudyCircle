import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { Calendar, Plus, Clock, Users, Loader2 } from 'lucide-react';

export default function Sessions() {
  const navigate = useNavigate();
  const sessions = useSessionStore((state) => state.sessions);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const isLoading = useSessionStore((state) => state.isLoading);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const upcoming = sessions.filter((s) => s.status === 'upcoming');
  const live = sessions.filter((s) => s.status === 'live');
  const ended = sessions.filter((s) => s.status === 'ended');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Sessions</h1>
        <button onClick={() => navigate('/sessions/create')} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </button>
      </div>

      {/* Live sessions */}
      {live.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3">Live Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map((s) => (
              <SessionCard key={s._id} session={s} onClick={() => navigate(`/sessions/${s._id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">Upcoming</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState message="No upcoming sessions" action="Create a session" onAction={() => navigate('/sessions/create')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((s) => (
              <SessionCard key={s._id} session={s} onClick={() => navigate(`/sessions/${s._id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {ended.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Past Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ended.slice(0, 6).map((s) => (
              <SessionCard key={s._id} session={s} onClick={() => navigate(`/sessions/${s._id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onClick }) {
  const statusColors = {
    upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    live: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    ended: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  };

  return (
    <div onClick={onClick} className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[session.status]}`}>
          {session.status}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {session.type}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{session.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{session.subject}</p>
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(session.scheduledAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {session.duration} min
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {session.participants?.length || 0}/{session.maxParticipants}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message, action, onAction }) {
  return (
    <div className="text-center py-12 card">
      <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
      {action && (
        <button onClick={onAction} className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
          {action}
        </button>
      )}
    </div>
  );
}

