import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi, matchApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useMatchStore } from '../stores/matchStore';
import { MessageSquare, UserPlus, Shield, Loader2, Flame, Trophy, BookOpen, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matchStatus, setMatchStatus] = useState(null);
  const sendRequest = useMatchStore((state) => state.sendRequest);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      userApi.getUser(userId),
      matchApi.getMatches().catch(() => ({ data: [] })),
    ]).then(([userRes, matchRes]) => {
      setProfile(userRes.data);
      const existing = matchRes.data.find(
        (m) =>
          (m.requester._id === currentUser?._id && m.receiver._id === userId) ||
          (m.receiver._id === currentUser?._id && m.requester._id === userId)
      );
      setMatchStatus(existing);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [userId, currentUser?._id]);

  const handleConnect = async () => {
    try {
      await sendRequest(userId);
      toast.success('Request sent');
      setMatchStatus({ status: 'pending' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const isMe = currentUser?._id === userId;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
      </div>
    );
  }

  const completion = profile.getProfileCompletion?.() || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img
            src={profile.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff`}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            {profile.city && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.city}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 mt-2">{profile.bio || 'No bio yet'}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {profile.subjects?.map((s) => (
                <span key={s.name} className="px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium">
                  {s.name} · {s.level}
                </span>
              ))}
            </div>

            {!isMe && (
              <div className="flex gap-2 mt-4">
                {matchStatus?.status === 'accepted' ? (
                  <button onClick={() => navigate(`/chat`)} className="btn-primary">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </button>
                ) : matchStatus?.status === 'pending' ? (
                  <button disabled className="btn-secondary opacity-70">Request Pending</button>
                ) : (
                  <button onClick={handleConnect} className="btn-primary">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} label="Streak" value={`${profile.streak || 0}d`} />
        <StatCard icon={<Trophy className="w-5 h-5 text-yellow-500" />} label="XP" value={profile.xp || 0} />
        <StatCard icon={<BookOpen className="w-5 h-5 text-blue-500" />} label="Hours" value={`${Math.floor((profile.totalStudyMinutes || 0) / 60)}h`} />
        <StatCard icon={<Shield className="w-5 h-5 text-green-500" />} label="Sessions" value={profile.sessionsAttended || 0} />
      </div>

      {/* Availability */}
      {profile.availability?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Availability</h3>
          <div className="flex flex-wrap gap-2">
            {profile.availability.map((slot, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
                {slot.day}: {slot.startTime} - {slot.endTime}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Goal & Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profile.studyGoal && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Study Goal</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{profile.studyGoal}</p>
          </div>
        )}
        {profile.studyStyle && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Study Style</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">{profile.studyStyle.replace('-', ' ')}</p>
          </div>
        )}
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

