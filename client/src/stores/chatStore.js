import { create } from 'zustand';
import * as chatsApi from '../api/chats';

export const useChatStore = create((set, get) => ({
  chats: [],
  messages: {}, // { chatId: [messages] }
  activeChat: null,
  typingUsers: {}, // { chatId: [userIds] }

  fetchChats: async () => {
    const res = await chatsApi.getChats();
    set({ chats: res.data });
  },

  fetchMessages: async (chatId) => {
    const res = await chatsApi.getMessages(chatId);
    set(state => ({
      messages: { ...state.messages, [chatId]: res.data }
    }));
  },

  sendMessage: async (chatId, content) => {
    const res = await chatsApi.sendMessage(chatId, { content });
    set(state => {
      const chatMsgs = state.messages[chatId] || [];
      return {
        messages: { ...state.messages, [chatId]: [...chatMsgs, res.data] }
      };
    });
    // refresh chats for lastMessage update
    await get().fetchChats();
  },

  setActiveChat: (chatId) => set({ activeChat: chatId }),

  receiveSocketMessage: (message) => {
    const chatId = message.chatId;
    set(state => {
      const chatMsgs = state.messages[chatId] || [];
      return {
        messages: { ...state.messages, [chatId]: [...chatMsgs, message] }
      };
    });
    get().fetchChats();
  }
}));
