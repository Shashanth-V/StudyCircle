import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { Match } from '../models/Match.js';
import { User } from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

/**
 * Ensure two matched users have a chat document
 * @param {string} userA
 * @param {string} userB
 * @returns {Promise<Chat>}
 */
const getOrCreateChat = async (userA, userB) => {
  let chat = await Chat.findOne({
    participants: { $all: [userA, userB], $size: 2 },
  });

  if (!chat) {
    // Verify they are matched
    const match = await Match.findOne({
      $or: [
        { requester: userA, receiver: userB, status: 'accepted' },
        { requester: userB, receiver: userA, status: 'accepted' },
      ],
    });

    if (!match) {
      const error = new Error('You can only chat with matched users');
      error.statusCode = 403;
      throw error;
    }

    chat = await Chat.create({
      participants: [userA, userB],
      unreadCount: new Map([[userA, 0], [userB, 0]]),
    });
  }

  return chat;
};

/**
 * Get all chats for current user
 */
export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name profilePhoto isOnline lastActive')
      .sort({ lastMessageAt: -1 });

    const enriched = chats.map(chat => {
      const obj = chat.toObject();
      const other = obj.participants.find(p => p._id.toString() !== req.user._id.toString());
      return {
        ...obj,
        otherUser: other,
        unreadCount: obj.unreadCount?.get?.(req.user._id.toString()) || 0,
      };
    });

    res.json({ chats: enriched });
  } catch (err) {
    next(err);
  }
};

/**
 * Get messages for a chat
 */
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50, search } = req.query;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const query = { chatId, deletedFor: { $ne: req.user._id } };
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ messages: messages.reverse(), page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

/**
 * Send a message (HTTP fallback; primary is Socket.IO)
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { type, content, fileUrl } = req.body;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = await Message.create({
      chatId,
      sender: req.user._id,
      type,
      content,
      fileUrl: fileUrl || '',
      status: 'sent',
    });

    // Update chat last message
    const otherUserId = chat.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    chat.lastMessage = {
      content: type === 'text' ? content : `[${type}]`,
      sender: req.user._id,
      type,
      createdAt: new Date(),
    };
    chat.lastMessageAt = new Date();

    const currentUnread = chat.unreadCount.get(otherUserId.toString()) || 0;
    chat.unreadCount.set(otherUserId.toString(), currentUnread + 1);
    await chat.save();

    const populated = await Message.findById(message._id).populate('sender', 'name profilePhoto');

    // Emit to both users
    if (req.io) {
      req.io.to(`chat_${chatId}`).emit('new_message', populated);
    }

    res.status(201).json({ message: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload chat file attachment
 */
export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'studycircle/attachments');
    res.json({ url: result.url, name: req.file.originalname });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete message (for me / for everyone)
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { chatId, msgId } = req.params;
    const { forEveryone } = req.body;

    const message = await Message.findOne({
      _id: msgId,
      chatId,
      $or: [
        { sender: req.user._id },
        { 'chat.participants': req.user._id },
      ],
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (forEveryone && message.sender.toString() === req.user._id.toString()) {
      message.deletedForEveryone = true;
      message.content = 'This message was deleted';
      message.fileUrl = '';
    } else {
      message.deletedFor.push(req.user._id);
    }

    await message.save();

    if (req.io) {
      req.io.to(`chat_${chatId}`).emit('message_deleted', { messageId: msgId, forEveryone });
    }

    res.json({ message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark messages as read
 */
export const markMessagesRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      { chatId, sender: { $ne: req.user._id }, status: { $ne: 'read' } },
      { $addToSet: { readBy: req.user._id }, status: 'read' }
    );

    const chat = await Chat.findById(chatId);
    if (chat) {
      chat.unreadCount.set(req.user._id.toString(), 0);
      await chat.save();
    }

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    next(err);
  }
};

