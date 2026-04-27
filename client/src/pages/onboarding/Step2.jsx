import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileStep2Schema, SUBJECTS } from '../../../../shared/schemas.js';
import { useAuthStore } from '../../stores/authStore';
import { userApi } from '../../lib/api';
import { ArrowRight, ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingStep2() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [selectedSubjects, setSelectedSubjects] = useState(
    user?.subjects?.map((s) => s.name) || []
  );
  const [customSubject, setCustomSubject] = useState('');

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(profileStep2Schema),
  });

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const addCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (!trimmed) return;
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubject('');
  };

  const onSubmit = async () => {
    if (selectedSubjects.length === 0) {
      toast.error('Select at least one subject');
      return;
    }
    // Set default level as Beginner for now; user will refine in step 3
    const subjects = selectedSubjects.map((name) => ({ name, level: 'Beginner' }));
    try {
      await userApi.updateMe({ subjects });
      updateProfile({ subjects });
      navigate('/onboarding/step3');
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
            <span className="font-medium text-primary-600 dark:text-primary-400">Step 2 of 3</span>
            <span className="text-gray-500 dark:text-gray-400">Subjects</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-primary-600 rounded-full transition-all" />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What do you study?</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select subjects you're interested in. You can set skill levels in the next step.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Predefined subjects */}
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${selectedSubjects.includes(subject)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Custom subject */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                className="input flex-1"
                placeholder="Add custom subject..."
              />
              <button
                type="button"
                onClick={addCustomSubject}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Selected */}
            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/onboarding/step1')}
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
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
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

