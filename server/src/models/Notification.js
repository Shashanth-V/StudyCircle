import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['match_request', 'match_accepted', 'new_message', 'study_session_invite', 'session_started', 'badge_earned'],
    required: true,
  },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refId: { type: mongoose.Schema.Types.ObjectId }, // ID of related document (match, message, session)
  refModel: { type: String, enum: ['Match', 'Message', 'Session', 'Badge'] },
  title: { type: String, required: true },
  body: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);

