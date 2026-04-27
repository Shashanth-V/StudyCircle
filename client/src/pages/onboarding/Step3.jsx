import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileStep3Schema, SKILL_LEVELS, STUDY_STYLES, DAYS } from '../../../../shared/schemas.js';
import { useAuthStore } from '../../stores/authStore';
import { userApi } from '../../lib/api';
import { ArrowRight, ArrowLeft, Plus, X, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [availability, setAvailability] = useState(user?.availability || []);
  const [availDay, setAvailDay] = useState('Monday');
  const [availStart, setAvailStart] = useState('09:00');
  const [availEnd, setAvailEnd] = useState('17:00');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileStep3Schema),
    defaultValues: {
      studyGoal: user?.studyGoal || '',
      studyStyle: user?.studyStyle || 'mixed',
    },
  });

  const addAvailability = () => {
    if (availStart >= availEnd) {
      toast.error('End time must be after start time');
      return;
    }
    setAvailability((prev) => [...prev, { day: availDay, startTime: availStart, endTime: availEnd }]);
  };

  const removeAvailability = (index) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (availability.length === 0) {
      toast.error('Add at least one availability slot');
      return;
    }
    try {
      await userApi.updateMe({ ...data, availability });
      updateProfile({ ...data, availability });
      toast.success('Profile complete!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-primary-600 dark:text-primary-400">Step 3 of 3</span>
            <span className="text-gray-500 dark:text-gray-400">Skills & Availability</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary-600 rounded-full transition-all" />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Almost there!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Set your skill levels, availability, and study preferences.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <select
                  value={availDay}
                  onChange={(e) => setAvailDay(e.target.value)}
                  className="input w-auto"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={availStart}
                  onChange={(e) => setAvailStart(e.target.value)}
                  className="input w-auto"
                />
                <span className="self-center text-gray-400">to</span>
                <input
                  type="time"
                  value={availEnd}
                  onChange={(e) => setAvailEnd(e.target.value)}
                  className="input w-auto"
                />
                <button
                  type="button"
                  onClick={addAvailability}
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {availability.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {availability.map((slot, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium"
                    >
                      {slot.day} {slot.startTime}-{slot.endTime}
                      <button type="button" onClick={() => removeAvailability(idx)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Study style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Study Style</label>
              <div className="grid grid-cols-3 gap-2">
                {STUDY_STYLES.map((style) => (
                  <label key={style} className="cursor-pointer">
                    <input
                      type="radio"
                      value={style}
                      {...register('studyStyle')}
                      className="peer sr-only"
                    />
                    <div className="text-center px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-sm capitalize peer-checked:border-primary-600 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 peer-checked:text-primary-700 dark:peer-checked:text-primary-300 transition-colors">
                      {style.replace('-', ' ')}
                    </div>
                  </label>
                ))}
              </div>
              {errors.studyStyle && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.studyStyle.message}</p>
              )}
            </div>

            {/* Study goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Study Goal <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                {...register('studyGoal')}
                rows={2}
                className="input resize-none"
                placeholder="e.g. Prepare for GATE 2025"
              />
              {errors.studyGoal && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.studyGoal.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/onboarding/step2')}
                className="btn-secondary flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

