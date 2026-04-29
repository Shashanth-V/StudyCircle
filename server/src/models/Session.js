import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: { type: Number, default: 4 },
  type: { type: String, enum: ['public', 'private'], default: 'public' },
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' },
  description: { type: String, default: '' },
  pomodoroWork: { type: Number, default: 25 },
  pomodoroBreak: { type: Number, default: 5 },
  sessionChat: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  totalMinutesStudied: { type: Number, default: 0 }
}, { timestamps: true });

export const Session = mongoose.model('Session', sessionSchema);
