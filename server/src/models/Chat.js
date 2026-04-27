import mongoose from 'mongoose';

const unreadCountSchema = new mongoose.Schema({}, { strict: false });

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ],
  lastMessage: {
    content: { type: String, default: '' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    createdAt: { type: Date },
  },
  lastMessageAt: { type: Date, default: Date.now },
  unreadCount: { type: Map, of: Number, default: new Map() },
}, { timestamps: true });

// Ensure exactly 2 participants for 1-to-1 chats
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

export const Chat = mongoose.model('Chat', chatSchema);

