import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function AuthGuard({ children, requireAuth = true }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // 1. Not logged in but trying to access a protected route
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in logic
  if (isAuthenticated) {
    // If not verified, only allow them on the verify-email page
    if (!user?.isVerified) {
      if (location.pathname === '/verify-email') return children;
      return <Navigate to="/verify-email" replace />;
    }

    // If verified but not onboarded, only allow them on the onboarding pages
    if (!user?.onboardingComplete) {
      if (location.pathname.startsWith('/onboarding')) return children;
      return <Navigate to="/onboarding/step1" replace />;
    }

    // If fully setup, prevent them from accessing guest pages (login, signup, verify, onboarding)
    if (!requireAuth || location.pathname === '/verify-email' || location.pathname.startsWith('/onboarding')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
