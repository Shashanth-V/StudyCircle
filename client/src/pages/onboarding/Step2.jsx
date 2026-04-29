import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { SUBJECTS } from '../../../../shared/schemas.js';
import { updateMe } from '../../api/users';
import { useAuthStore } from '../../stores/authStore';

export default function Step2() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState(user?.subjects || []);

  const toggleSubject = (name) => {
    if (selectedSubjects.find(s => s.name === name)) {
      setSelectedSubjects(selectedSubjects.filter(s => s.name !== name));
    } else {
      setSelectedSubjects([...selectedSubjects, { name, level: 'Beginner' }]);
    }
  };

  const setLevel = (name, level) => {
    setSelectedSubjects(selectedSubjects.map(s => s.name === name ? { ...s, level } : s));
  };

  const onSubmit = async () => {
    if (selectedSubjects.length === 0) return toast.error('Please select at least one subject');
    setLoading(true);
    try {
      const res = await updateMe({ subjects: selectedSubjects });
      setUser(res.data);
      navigate('/onboarding/step3');
    } catch (err) {
      toast.error('Failed to save subjects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step 2: Study Subjects</h2>
        <p className="text-gray-500 dark:text-gray-400">What are you learning? Select subjects and your current skill level.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SUBJECTS.map(subject => {
          const isSelected = selectedSubjects.find(s => s.name === subject);
          return (
            <div
              key={subject}
              onClick={() => toggleSubject(subject)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                isSelected 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <p className={`font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>{subject}</p>
              
              {isSelected && (
                <div className="mt-3 flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => setLevel(subject, level)}
                      className={`text-xs px-2 py-1 rounded-full ${isSelected.level === level ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/onboarding/step1')}
          className="py-2 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || selectedSubjects.length === 0}
          className="py-2 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
