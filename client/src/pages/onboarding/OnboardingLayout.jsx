import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function OnboardingLayout() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  if (user?.onboardingComplete) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
