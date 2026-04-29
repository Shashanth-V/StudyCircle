import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export default function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.userId);
    console.log(`User connected: ${socket.userId}`);

    socket.on('join_chat', ({ chatId }) => {
      socket.join(chatId);
    });

    socket.on('typing_start', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', { userId: socket.userId, chatId });
    });

    socket.on('typing_stop', ({ chatId }) => {
      socket.to(chatId).emit('user_stopped_typing', { userId: socket.userId, chatId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

export const getIo = () => io;
