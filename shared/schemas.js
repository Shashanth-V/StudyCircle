/**
 * Shared Zod schemas for StudyCircle
 * Used by both frontend and backend
 */

import { z } from 'zod';

// =====================
// Enums / Constants
// =====================
export const SUBJECTS = [
  'DSA', 'Java', 'Python', 'AI/ML', 'Web Dev', 'DBMS', 'OS', 'Networks',
  'Math', 'Physics', 'Chemistry', 'Biology'
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const STUDY_STYLES = ['solo-focus', 'collaborative', 'mixed'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MATCH_STATUSES = ['pending', 'accepted', 'declined', 'blocked'];
export const MESSAGE_TYPES = ['text', 'image', 'file'];
export const MESSAGE_STATUSES = ['sent', 'delivered', 'read'];
export const SESSION_TYPES = ['private', 'public'];
export const SESSION_STATUSES = ['upcoming', 'live', 'ended'];
export const NOTIFICATION_TYPES = [
  'match_request', 'match_accepted', 'new_message',
  'study_session_invite', 'session_started', 'badge_earned'
];

// =====================
// Auth Schemas
// =====================
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

// =====================
// Profile Schemas
// =====================
export const availabilitySlotSchema = z.object({
  day: z.enum(DAYS),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
}).refine(data => data.startTime < data.endTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  level: z.enum(SKILL_LEVELS),
});

export const profileStep1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  bio: z.string().max(200, 'Bio must be under 200 characters').optional(),
});

export const profileStep2Schema = z.object({
  subjects: z.array(subjectSchema).min(1, 'Select at least one subject'),
});

export const profileStep3Schema = z.object({
  availability: z.array(availabilitySlotSchema).min(1, 'Add at least one availability slot'),
  studyGoal: z.string().max(300).optional(),
  studyStyle: z.enum(STUDY_STYLES),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
  subjects: z.array(subjectSchema).optional(),
  availability: z.array(availabilitySlotSchema).optional(),
  studyGoal: z.string().max(300).optional(),
  studyStyle: z.enum(STUDY_STYLES).optional(),
  city: z.string().max(100).optional(),
  profilePhoto: z.string().url().optional().or(z.literal('')),
});

// =====================
// Match Schemas
// =====================
export const matchRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const matchActionSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
});

// =====================
// Chat / Message Schemas
// =====================
export const sendMessageSchema = z.object({
  chatId: z.string().min(1),
  type: z.enum(MESSAGE_TYPES).default('text'),
  content: z.string().min(1, 'Message cannot be empty').max(2000),
  fileUrl: z.string().url().optional(),
});

export const messageReadSchema = z.object({
  chatId: z.string().min(1),
  messageId: z.string().min(1),
});

// =====================
// Session Schemas
// =====================
export const createSessionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  subject: z.string().min(1, 'Subject is required'),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(15).max(300, 'Duration must be between 15 and 300 minutes'),
  maxParticipants: z.number().min(1).max(10),
  description: z.string().max(500).optional(),
  type: z.enum(SESSION_TYPES).default('public'),
  pomodoroSettings: z.object({
    workDuration: z.number().min(1).max(60).default(25),
    breakDuration: z.number().min(1).max(30).default(5),
  }).optional(),
});

// =====================
// Settings Schemas
// =====================
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
});

export const notificationPrefsSchema = z.object({
  emailMatchRequest: z.boolean().default(true),
  emailMessage: z.boolean().default(true),
  emailSessionInvite: z.boolean().default(true),
  inAppMatchRequest: z.boolean().default(true),
  inAppMessage: z.boolean().default(true),
  inAppSessionInvite: z.boolean().default(true),
});

export const privacySettingsSchema = z.object({
  showOnlineStatus: z.boolean().default(true),
  showLastSeen: z.boolean().default(true),
  profileVisibility: z.enum(['public', 'matched-only']).default('public'),
});

