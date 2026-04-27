import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSessionSchema, SUBJECTS } from '../../../shared/schemas.js';
import { useSessionStore } from '../stores/sessionStore';
import { ArrowLeft, Loader2, Calendar, Clock, Users, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateSession() {
  const navigate = useNavigate();
  const createSession = useSessionStore((state) => state.createSession);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      type: 'public',
      maxParticipants: 5,
      duration: 60,
      pomodoroSettings: { workDuration: 25, breakDuration: 5 },
    },
  });

  const sessionType = watch('type');

  const onSubmit = async (data) => {
    try {
      const session = await createSession(data);
      toast.success('Session created!');
      navigate(`/sessions/${session._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create session');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/sessions')}
        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sessions
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Study Session</h1>

      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              {...register('title')}
              className="input"
              placeholder="e.g. DSA Problem Solving"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <select {...register('subject')} className="input">
              <option value="">Select a subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.subject && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.subject.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Date & Time
              </label>
              <input
                type="datetime-local"
                {...register('scheduledAt')}
                className="input"
              />
              {errors.scheduledAt && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.scheduledAt.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                {...register('duration', { valueAsNumber: true })}
                className="input"
                min={15}
                max={300}
              />
              {errors.duration && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.duration.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Users className="w-3.5 h-3.5 inline mr-1" />
                Max Participants
              </label>
              <input
                type="number"
                {...register('maxParticipants', { valueAsNumber: true })}
                className="input"
                min={1}
                max={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Type</label>
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" value="public" {...register('type')} className="peer sr-only" />
                  <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 peer-checked:border-primary-600 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 text-sm transition-colors">
                    <Globe className="w-4 h-4" />
                    Public
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" value="private" {...register('type')} className="peer sr-only" />
                  <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 peer-checked:border-primary-600 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 text-sm transition-colors">
                    <Lock className="w-4 h-4" />
                    Private
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input resize-none"
              placeholder="What will you study?"
            />
          </div>

          {/* Pomodoro settings */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Pomodoro Timer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Work (min)</label>
                <input
                  type="number"
                  {...register('pomodoroSettings.workDuration', { valueAsNumber: true })}
                  className="input"
                  min={1}
                  max={60}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Break (min)</label>
                <input
                  type="number"
                  {...register('pomodoroSettings.breakDuration', { valueAsNumber: true })}
                  className="input"
                  min={1}
                  max={30}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/sessions')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

