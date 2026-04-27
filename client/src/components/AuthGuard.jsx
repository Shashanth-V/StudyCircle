import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Protects routes by checking authentication status.
 * Redirects unauthenticated users to login.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if profile is incomplete and redirect to onboarding
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const profileComplete = user?.subjects?.length > 0 && user?.availability?.length > 0 && user?.studyStyle;

  if (!profileComplete && !isOnboardingRoute) {
    return <Navigate to="/onboarding/step1" replace />;
  }

  if (profileComplete && isOnboardingRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

