import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  subject: { type: String, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: {
    type: String,
    enum: ['private', 'public'],
    default: 'public',
  },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true, min: 15, max: 300 },
  description: { type: String, default: '', maxlength: 500 },
  maxParticipants: { type: Number, default: 10, min: 1, max: 10 },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'ended'],
    default: 'upcoming',
  },
  pomodoroSettings: {
    workDuration: { type: Number, default: 25 },
    breakDuration: { type: Number, default: 5 },
  },
  endedAt: { type: Date },
}, { timestamps: true });

sessionSchema.index({ scheduledAt: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ host: 1 });
sessionSchema.index({ participants: 1 });

export const Session = mongoose.model('Session', sessionSchema);

