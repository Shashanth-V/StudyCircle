import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { chatApi } from '../lib/api';
import { joinChat, leaveChat, sendSocketMessage, emitTypingStart, emitTypingStop, emitMessageRead, getSocket } from '../lib/socket';
import { ArrowLeft, Send, Paperclip, Smile, MoreVertical, Loader2, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatRoom() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const messages = useChatStore((state) => state.messages);
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const addIncomingMessage = useChatStore((state) => state.addIncomingMessage);
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus);
  const activeChat = useChatStore((state) => state.activeChat);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    chatApi.getChats()
      .then((res) => {
        const chat = res.data.find((c) => c._id === chatId);
        if (chat) {
          setActiveChat(chat);
          joinChat(chatId);
        } else {
          toast.error('Chat not found');
          navigate('/chat');
        }
      })
      .catch(() => {
        toast.error('Failed to load chat');
        navigate('/chat');
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      leaveChat(chatId);
      setActiveChat(null);
    };
  }, [chatId, setActiveChat, navigate]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      addIncomingMessage(msg);
      if (msg.sender._id !== user?._id && msg.chatId === chatId) {
        emitMessageRead({ chatId, messageId: msg._id });
      }
    };

    const handleStatusUpdate = ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    };

    const handleTyping = () => setOtherTyping(true);
    const handleStopped = () => setOtherTyping(false);

    socket.on('new_message', handleNewMessage);
    socket.on('message_status_update', handleStatusUpdate);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopped);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_status_update', handleStatusUpdate);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopped);
    };
  }, [chatId, user, addIncomingMessage, updateMessageStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendSocketMessage({ chatId, type: 'text', content: input.trim() });
    setInput('');
    emitTypingStop(chatId);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      emitTypingStart(chatId);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingStop(chatId);
    }, 2000);
  };

  const otherUser = activeChat?.participants?.find((p) => p._id !== user?._id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] card flex flex-col -m-4 md:-m-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button onClick={() => navigate('/chat')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <img
          src={otherUser?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || '')}&background=6366f1&color=fff`}
          alt={otherUser?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-white truncate">{otherUser?.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {otherTyping ? 'typing...' : otherUser?.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`
                    max-w-[75%] px-4 py-2 rounded-2xl text-sm
                    ${isMe
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                    }
                  `}
                >
                  <p>{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                    <span className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : msg.status === 'delivered' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3 opacity-50" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="input flex-1"
          />
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

