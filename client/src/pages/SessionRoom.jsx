import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';
import { joinSession, leaveSession, emitSessionChatMessage, emitTimerStart, emitTimerPause, getSocket } from '../lib/socket';
import { ArrowLeft, Users, Clock, Play, Pause, Send, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SessionRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const activeSession = useSessionStore((state) => state.activeSession);
  const getSession = useSessionStore((state) => state.getSession);
  const joinSessionApi = useSessionStore((state) => state.joinSession);
  const leaveSessionApi = useSessionStore((state) => state.leaveSession);
  const [sessionChat, setSessionChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [timer, setTimer] = useState({ minutes: 25, seconds: 0, isRunning: false, isBreak: false });
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    getSession(id).then(() => setIsLoading(false));
    joinSession(id);

    return () => {
      leaveSession(id);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, getSession]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleSessionChat = (data) => {
      setSessionChat((prev) => [...prev, data]);
    };

    const handleTimerStart = () => {
      startTimer();
    };

    const handleTimerPause = () => {
      pauseTimer();
    };

    socket.on('session_chat_message', handleSessionChat);
    socket.on('timer_started', handleTimerStart);
    socket.on('timer_paused', handleTimerPause);

    return () => {
      socket.off('session_chat_message', handleSessionChat);
      socket.off('timer_started', handleTimerStart);
      socket.off('timer_paused', handleTimerPause);
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        // Timer done - switch mode
        return {
          minutes: prev.isBreak ? 25 : 5,
          seconds: 0,
          isRunning: false,
          isBreak: !prev.isBreak,
        };
      });
    }, 1000);
    setTimer((prev) => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer((prev) => ({ ...prev, isRunning: false }));
  };

  const handleJoin = async () => {
    try {
      await joinSessionApi(id);
      toast.success('Joined session');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveSessionApi(id);
      toast.success('Left session');
      navigate('/sessions');
    } catch (err) {
      toast.error('Failed to leave');
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    emitSessionChatMessage({ sessionId: id, content: chatInput.trim() });
    setChatInput('');
  };

  const isParticipant = activeSession?.participants?.some((p) => p._id === user?._id || p === user?._id);
  const isHost = activeSession?.host?._id === user?._id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Session not found</p>
        <button onClick={() => navigate('/sessions')} className="btn-primary mt-4">Back to sessions</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sessions')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{activeSession.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeSession.subject} · Hosted by {activeSession.host?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isParticipant ? (
            <button onClick={handleJoin} className="btn-primary">Join Session</button>
          ) : (
            <button onClick={handleLeave} className="btn-secondary">Leave</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer */}
          {isParticipant && (
            <div className="card p-6 text-center">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {timer.isBreak ? 'Break Time' : 'Focus Time'}
                </span>
              </div>
              <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-6">
                {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
              </div>
              <div className="flex justify-center gap-3">
                {!timer.isRunning ? (
                  <button
                    onClick={() => {
                      emitTimerStart(id);
                      startTimer();
                    }}
                    className="btn-primary"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      emitTimerPause(id);
                      pauseTimer();
                    }}
                    className="btn-secondary"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Session chat */}
          {isParticipant && (
            <div className="card flex flex-col h-96">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm text-gray-900 dark:text-white">Session Chat</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                {sessionChat.length === 0 ? (
                  <p className="text-center text-sm text-gray-400">No messages yet</p>
                ) : (
                  sessionChat.map((msg, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium text-primary-600 dark:text-primary-400">{msg.sender?.name}:</span>{' '}
                      <span className="text-gray-700 dark:text-gray-300">{msg.content}</span>
                      <span className="text-xs text-gray-400 ml-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendChat} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="input flex-1 text-sm"
                />
                <button type="submit" disabled={!chatInput.trim()} className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {new Date(activeSession.scheduledAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {activeSession.duration} minutes
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                {activeSession.participants?.length || 0} / {activeSession.maxParticipants} participants
              </div>
            </div>
            {activeSession.description && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{activeSession.description}</p>
            )}
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Participants</h3>
            <div className="space-y-2">
              {activeSession.participants?.map((p) => (
                <div key={p._id || p} className="flex items-center gap-2">
                  <img
                    src={p.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || '')}&background=6366f1&color=fff`}
                    alt={p.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{p.name}</span>
                  {p._id === activeSession.host?._id && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
                      Host
                    </span>
                  )}
                </div>
              )) || <p className="text-sm text-gray-400">No participants yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

