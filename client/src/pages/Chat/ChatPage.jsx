import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import { Send, Image, Paperclip } from 'lucide-react';

export default function ChatPage() {
  const { chats, messages, activeChat, fetchChats, fetchMessages, sendMessage, setActiveChat } = useChatStore();
  const user = useAuthStore(s => s.user);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (activeChat && !messages[activeChat]) {
      fetchMessages(activeChat);
    }
  }, [activeChat, fetchMessages, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    sendMessage(activeChat, input.trim());
    setInput('');
  };

  const currentChat = chats.find(c => c._id === activeChat);
  const chatMessages = messages[activeChat] || [];
  const otherParticipant = currentChat?.participants.find(p => p._id !== user._id);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      
      {/* Sidebar List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">No conversations yet.</p>
          ) : (
            chats.map(chat => {
              const partner = chat.participants.find(p => p._id !== user._id);
              const unread = chat.unreadCount?.[user._id] || 0;
              const isActive = activeChat === chat._id;
              
              return (
                <div 
                  key={chat._id} 
                  onClick={() => setActiveChat(chat._id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 ${isActive ? 'bg-primary-50 dark:bg-gray-700' : 'hover:bg-white dark:hover:bg-gray-800'}`}
                >
                  <img src={partner?.profilePhoto || `https://ui-avatars.com/api/?name=${partner?.name}`} className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-600" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
                        {partner?.name}
                      </h4>
                      {chat.lastMessageAt && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                          {format(new Date(chat.lastMessageAt), 'MMM d')}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${unread > 0 ? 'font-semibold text-gray-900 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      {chat.lastMessage?.content || 'Started a conversation'}
                    </p>
                  </div>
                  {unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {unread}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Window */}
      <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-gray-900`}>
        {activeChat ? (
          <>
            {/* Window Header */}
            <div className="h-16 px-6 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-gray-500">
                ←
              </button>
              <img src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}`} className="w-10 h-10 rounded-full" alt="" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{otherParticipant?.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{otherParticipant?.online ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map(msg => {
                const isMine = msg.sender === user._id || msg.sender?._id === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-primary-200' : 'text-gray-500'}`}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Image className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 rounded-full dark:text-white"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim()}
                  className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 opacity-50" />
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>

    </div>
  );
}
