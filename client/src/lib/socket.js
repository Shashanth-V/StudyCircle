import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const joinChat = (chatId) => {
  socket?.emit('join_chat', chatId);
};

export const leaveChat = (chatId) => {
  socket?.emit('leave_chat', chatId);
};

export const sendSocketMessage = (data) => {
  socket?.emit('send_message', data);
};

export const emitTypingStart = (chatId) => {
  socket?.emit('typing_start', chatId);
};

export const emitTypingStop = (chatId) => {
  socket?.emit('typing_stop', chatId);
};

export const emitMessageRead = (data) => {
  socket?.emit('message_read', data);
};

export const joinSession = (sessionId) => {
  socket?.emit('join_session', sessionId);
};

export const leaveSession = (sessionId) => {
  socket?.emit('leave_session', sessionId);
};

export const emitSessionChatMessage = (data) => {
  socket?.emit('session_chat_message', data);
};

export const emitTimerStart = (sessionId) => {
  socket?.emit('session_timer_start', sessionId);
};

export const emitTimerPause = (sessionId) => {
  socket?.emit('session_timer_pause', sessionId);
};

