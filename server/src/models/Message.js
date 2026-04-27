import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  content: { type: String, required: true, maxlength: 2000 },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedForEveryone: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, sender: 1 });

export const Message = mongoose.model('Message', messageSchema);

