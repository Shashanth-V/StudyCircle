import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateMe } from '../../api/users';
import { useAuthStore } from '../../stores/authStore';
import { DAYS } from '../../../../shared/schemas.js';

export default function Step3() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(user?.availability || []);
  const [studyGoal, setStudyGoal] = useState(user?.studyGoal || '');
  const [studyStyle, setStudyStyle] = useState(user?.studyStyle || 'mixed');
  const [city, setCity] = useState(user?.city || '');

  const toggleAvailability = (day, timeStr) => {
    // Simple mock availability toggle (morning/afternoon/evening per day)
    // Full implementation would be a complex grid
    const exists = availability.find(a => a.day === day && a.startTime === timeStr);
    if (exists) {
      setAvailability(availability.filter(a => !(a.day === day && a.startTime === timeStr)));
    } else {
      setAvailability([...availability, { day, startTime: timeStr, endTime: timeStr }]);
    }
  };

  const onSubmit = async () => {
    if (availability.length === 0) return toast.error('Please add at least one availability slot');
    setLoading(true);
    try {
      const res = await updateMe({ 
        availability, studyGoal, studyStyle, city, onboardingComplete: true 
      });
      setUser(res.data);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step 3: Availability & Style</h2>
        <p className="text-gray-500 dark:text-gray-400">When and how do you like to study?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weekly Availability</label>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(day => (
            <div key={day} className="text-center space-y-1">
              <p className="text-xs font-semibold text-gray-500">{day.substring(0,3)}</p>
              {['Morning', 'Afternoon', 'Evening'].map(time => (
                <div
                  key={`${day}-${time}`}
                  onClick={() => toggleAvailability(day, time)}
                  className={`h-8 rounded cursor-pointer ${
                    availability.find(a => a.day === day && a.startTime === time) 
                    ? 'bg-primary-500' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={`${day} ${time}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Goal</label>
        <input
          type="text"
          value={studyGoal}
          onChange={(e) => setStudyGoal(e.target.value)}
          placeholder="e.g., Prepare for finals, learn Spanish"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Style</label>
        <div className="grid grid-cols-3 gap-3">
          {['solo-focus', 'collaborative', 'mixed'].map(style => (
            <button
              key={style}
              onClick={() => setStudyStyle(style)}
              className={`p-3 rounded-lg border-2 capitalize font-medium text-sm transition-colors ${
                studyStyle === style 
                ? 'border-primary-500 text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-300' 
                : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              {style.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City (Optional)</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="For local matching"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/onboarding/step2')}
          className="py-2 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || availability.length === 0}
          className="py-2 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}
