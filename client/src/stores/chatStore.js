import { create } from 'zustand';
import { chatApi } from '../lib/api';
import { useAuthStore } from './authStore';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,
  hasMore: true,
  searchQuery: '',

  setChats: (chats) => set({ chats }),

  fetchChats: async () => {
    const res = await chatApi.getChats();
    set({ chats: res.data });
    return res.data;
  },

  setActiveChat: (chat) => {
    set({ activeChat: chat, messages: [], hasMore: true });
    if (chat) {
      get().fetchMessages(chat._id);
      // Mark as read when opening chat
      chatApi.markRead(chat._id).catch(() => {});
      // Update unread count locally
      const userId = useAuthStore.getState().user?._id;
      set((state) => ({
        chats: state.chats.map((c) =>
          c._id === chat._id ? { ...c, unreadCount: { ...c.unreadCount, [userId]: 0 } } : c
        ),
      }));
    }
  },

  fetchMessages: async (chatId, page = 1, search = '') => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const res = await chatApi.getMessages(chatId, page, 50, search || undefined);
      const newMessages = res.data.messages || res.data;
      set((state) => ({
        messages: page === 1 ? newMessages : [...newMessages, ...state.messages],
        hasMore: newMessages.length === 50,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (chatId, data) => {
    const res = await chatApi.sendMessage(chatId, data);
    const msg = res.data;
    set((state) => ({
      messages: [...state.messages, msg],
      chats: state.chats.map((c) =>
        c._id === chatId
          ? {
              ...c,
              lastMessage: {
                content: msg.type === 'text' ? msg.content : `[${msg.type}]`,
                sender: msg.sender,
                type: msg.type,
                createdAt: msg.createdAt,
              },
              lastMessageAt: msg.createdAt,
            }
          : c
      ),
    }));
    return msg;
  },

  addIncomingMessage: (message) => {
    set((state) => {
      const isActive = state.activeChat?._id === message.chatId;
      const messages = isActive ? [...state.messages, message] : state.messages;
      const userId = useAuthStore.getState().user?._id;

      return {
        messages,
        chats: state.chats.map((c) => {
          if (c._id.toString() === message.chatId.toString()) {
            const currentUnread = c.unreadCount?.[userId] || 0;
            return {
              ...c,
              lastMessage: {
                content: message.type === 'text' ? message.content : `[${message.type}]`,
                sender: message.sender,
                type: message.type,
                createdAt: message.createdAt,
              },
              lastMessageAt: message.createdAt,
              unreadCount: {
                ...c.unreadCount,
                [userId]: isActive ? 0 : currentUnread + 1,
              },
            };
          }
          return c;
        }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)),
      };
    });
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, status } : m
      ),
    }));
  },

  deleteMessage: async (chatId, msgId, forEveryone = false) => {
    await chatApi.deleteMessage(chatId, msgId, forEveryone);
    if (forEveryone) {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== msgId),
      }));
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));

