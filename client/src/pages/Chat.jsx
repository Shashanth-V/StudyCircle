import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { MessageSquare, Loader2, Search } from 'lucide-react';

export default function Chat() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const fetchChats = useChatStore((state) => state.fetchChats);
  const isLoading = useChatStore((state) => state.isLoading);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
  );

  return (
    <div className="h-[calc(100vh-7rem)] card flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : sortedChats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No conversations yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            Match with other students to start chatting
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {sortedChats.map((chat) => {
            const otherUser = chat.participants?.find((p) => p._id !== user?._id);
            const unread = chat.unreadCount?.[user?._id] || 0;
            return (
              <div
                key={chat._id}
                onClick={() => navigate(`/chat/${chat._id}`)}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0"
              >
                <div className="relative shrink-0">
                  <img
                    src={otherUser?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || '')}&background=6366f1&color=fff`}
                    alt={otherUser?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {otherUser?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{otherUser?.name}</h3>
                    {chat.lastMessageAt && (
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {new Date(chat.lastMessageAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

