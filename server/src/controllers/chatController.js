import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { getIo } from '../socket/index.js';

export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name profilePhoto online lastActive')
      .sort({ lastMessageAt: -1 });

    const enriched = chats.map(chat => {
      const obj = chat.toObject();
      if (chat.unreadCount && chat.unreadCount instanceof Map) {
        obj.unreadCount = Object.fromEntries(chat.unreadCount);
      } else if (chat.unreadCount) {
        obj.unreadCount = Object.fromEntries(
          chat.unreadCount.entries ? chat.unreadCount.entries() : Object.entries(chat.unreadCount)
        );
      }
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before;

    const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const query = { chatId, deletedFor: { $ne: req.user._id } };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Mark as read logic
    if (chat.unreadCount && chat.unreadCount.get(req.user._id.toString()) > 0) {
      chat.unreadCount.set(req.user._id.toString(), 0);
      await chat.save();
    }

    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text', fileUrl, fileName } = req.body;
    
    const chat = await Chat.findOne({ _id: chatId, participants: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const message = new Message({
      chatId, sender: req.user._id, type, content, fileUrl, fileName
    });
    await message.save();

    // Update chat last message & unread count
    chat.lastMessage = { content, sender: req.user._id, type, createdAt: message.createdAt };
    chat.lastMessageAt = message.createdAt;

    chat.participants.forEach(p => {
      if (p.toString() !== req.user._id.toString()) {
        const currentCount = chat.unreadCount.get(p.toString()) || 0;
        chat.unreadCount.set(p.toString(), currentCount + 1);
      }
    });

    await chat.save();

    // Emit socket event
    const io = getIo();
    if (io) {
      const populatedMsg = await Message.findById(message._id).populate('sender', 'name profilePhoto');
      io.to(chatId).emit('new_message', populatedMsg);
    }

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const sendFileMessage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { chatId } = req.params;
    const isImage = req.file.mimetype.startsWith('image/');
    
    // For demo purposes, we will treat everything via cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'studycircle/chat_files');
    
    req.body = {
      content: req.file.originalname,
      type: isImage ? 'image' : 'file',
      fileUrl: result.url,
      fileName: req.file.originalname
    };

    next();
  } catch (error) {
    next(error);
  }
};
