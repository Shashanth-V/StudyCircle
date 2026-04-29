import { useEffect, useState } from 'react';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import { Users, Clock, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { sessions, fetchSessions, joinSession } = useSessionStore();
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (activeTab === 'upcoming') {
      fetchSessions({ status: 'upcoming' });
    } else if (activeTab === 'live') {
      fetchSessions({ status: 'live' });
    } else if (activeTab === 'mine') {
      fetchSessions({ mine: true });
    }
  }, [activeTab, fetchSessions]);

  const handleJoin = async (id) => {
    try {
      await joinSession(id);
      toast.success('Joined session!');
      fetchSessions({ status: activeTab === 'mine' ? undefined : activeTab, mine: activeTab === 'mine' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Sessions</h1>
          <p className="text-gray-500 dark:text-gray-400">Join or host group study sessions</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Create Session
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {[
          { id: 'upcoming', label: 'Upcoming Public' },
          { id: 'live', label: 'Live Now' },
          { id: 'mine', label: 'My Sessions' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length > 0 ? (
          sessions.map(session => {
            const isParticipant = session.participants.some(p => p._id === user._id || p === user._id);
            
            return (
              <div key={session._id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium border border-primary-100 dark:border-primary-800/50">
                    {session.subject}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    session.status === 'live' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' :
                    session.status === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {session.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">{session.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">{session.description || 'No description provided'}</p>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(session.scheduledAt), 'MMM d, h:mm a')} ({session.durationMinutes}m)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>{session.participants.length} / {session.maxParticipants} joined</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  {isParticipant ? (
                    <button className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" /> Enter Room
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoin(session._id)}
                      disabled={session.participants.length >= session.maxParticipants}
                      className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {session.participants.length >= session.maxParticipants ? 'Full' : 'Join Session'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="col-span-full text-center py-12 text-gray-500">No sessions found.</p>
        )}
      </div>
    </div>
  );
}
