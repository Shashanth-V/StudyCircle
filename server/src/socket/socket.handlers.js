import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { Session } from '../models/Session.js';
import { Match } from '../models/Match.js';

/**
 * Authenticate socket connection using JWT access token
 * @param {Socket} socket
 * @returns {Promise<Object|null>} user object or null
 */
const authenticateSocket = async (socket) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    return user;
  } catch {
    return null;
  }
};

/**
 * Initialize all Socket.IO event handlers
 * @param {Server} io
 */
export const initializeSocketHandlers = (io) => {
  io.on('connection', async (socket) => {
    const user = await authenticateSocket(socket);
    if (!user) {
      socket.emit('auth_error', { message: 'Authentication failed' });
      socket.disconnect();
      return;
    }

    // Join personal room for notifications
    socket.join(`user_${user._id}`);

    // Update online status
    await User.findByIdAndUpdate(user._id, {
      isOnline: true,
      socketId: socket.id,
      lastActive: new Date(),
    });

    // Notify friends/matches about online status
    const matches = await Match.find({
      $or: [{ requester: user._id }, { receiver: user._id }],
      status: 'accepted',
    });
    const matchedUserIds = matches.map(m =>
      m.requester.toString() === user._id.toString() ? m.receiver.toString() : m.requester.toString()
    );

    matchedUserIds.forEach(uid => {
      socket.to(`user_${uid}`).emit('user_online', { userId: user._id.toString() });
    });

    // =====================
    // Chat Events
    // =====================

    socket.on('join_chat', async (chatId) => {
      const chat = await Chat.findOne({
        _id: chatId,
        participants: user._id,
      });
      if (chat) {
        socket.join(`chat_${chatId}`);
        socket.to(`chat_${chatId}`).emit('user_joined_chat', { userId: user._id.toString() });
      }
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { chatId, type, content, fileUrl, fileName } = data;

        const chat = await Chat.findOne({
          _id: chatId,
          participants: user._id,
        });

        if (!chat) return;

        const message = await Message.create({
          chatId,
          sender: user._id,
          type: type || 'text',
          content,
          fileUrl: fileUrl || '',
          fileName: fileName || '',
          status: 'sent',
        });

        // Update chat metadata
        const otherUserId = chat.participants.find(
          p => p.toString() !== user._id.toString()
        );

        chat.lastMessage = {
          content: type === 'text' ? content : `[${type}]`,
          sender: user._id,
          type: type || 'text',
          createdAt: new Date(),
        };
        chat.lastMessageAt = new Date();

        const currentUnread = chat.unreadCount.get(otherUserId.toString()) || 0;
        chat.unreadCount.set(otherUserId.toString(), currentUnread + 1);
        await chat.save();

        const populated = await Message.findById(message._id)
          .populate('sender', 'name profilePhoto');

        io.to(`chat_${chatId}`).emit('new_message', populated);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('typing_start', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        userId: user._id.toString(),
        userName: user.name,
      });
    });

    socket.on('typing_stop', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_stopped_typing', {
        chatId,
        userId: user._id.toString(),
      });
    });

    socket.on('message_read', async (data) => {
      try {
        const { chatId, messageId } = data;
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: user._id },
          status: 'read',
        });

        const chat = await Chat.findById(chatId);
        if (chat) {
          chat.unreadCount.set(user._id.toString(), 0);
          await chat.save();
        }

        io.to(`chat_${chatId}`).emit('message_status_update', {
          messageId,
          status: 'read',
          readBy: user._id.toString(),
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // =====================
    // Session Events
    // =====================

    socket.on('join_session', async (sessionId) => {
      const session = await Session.findById(sessionId);
      if (session && session.participants.some(p => p.toString() === user._id.toString())) {
        socket.join(`session_${sessionId}`);
        socket.to(`session_${sessionId}`).emit('user_joined_session', {
          userId: user._id.toString(),
          name: user.name,
        });
      }
    });

    socket.on('leave_session', (sessionId) => {
      socket.leave(`session_${sessionId}`);
      socket.to(`session_${sessionId}`).emit('user_left_session', {
        userId: user._id.toString(),
      });
    });

    socket.on('session_timer_start', (sessionId) => {
      socket.to(`session_${sessionId}`).emit('timer_started', { sessionId, startedBy: user._id.toString() });
    });

    socket.on('session_timer_pause', (sessionId) => {
      socket.to(`session_${sessionId}`).emit('timer_paused', { sessionId, pausedBy: user._id.toString() });
    });

    socket.on('session_chat_message', async (data) => {
      try {
        const { sessionId, content } = data;
        const session = await Session.findById(sessionId);
        if (!session || !session.participants.some(p => p.toString() === user._id.toString())) {
          return;
        }

        io.to(`session_${sessionId}`).emit('session_chat_message', {
          sessionId,
          sender: { _id: user._id, name: user.name, profilePhoto: user.profilePhoto },
          content,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // =====================
    // Disconnect
    // =====================

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(user._id, {
        isOnline: false,
        socketId: null,
        lastActive: new Date(),
      });

      matchedUserIds.forEach(uid => {
        socket.to(`user_${uid}`).emit('user_offline', {
          userId: user._id.toString(),
          lastSeen: new Date().toISOString(),
        });
      });
    });
  });
};

