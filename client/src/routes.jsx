import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import AuthGuard from './components/ui/AuthGuard';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import OnboardingLayout from './pages/Onboarding/OnboardingLayout';
import Step1 from './pages/Onboarding/Step1';
import Step2 from './pages/Onboarding/Step2';
import Step3 from './pages/Onboarding/Step3';
import MatchesPage from './pages/Matches/MatchesPage';
import ChatPage from './pages/Chat/ChatPage';
import SessionsPage from './pages/Sessions/SessionsPage';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';

const router = createBrowserRouter([
  { path: '/login', element: <AuthGuard requireAuth={false}><LoginPage /></AuthGuard> },
  { path: '/signup', element: <AuthGuard requireAuth={false}><SignupPage /></AuthGuard> },
  { path: '/verify-email', element: <AuthGuard requireAuth={false}><VerifyEmailPage /></AuthGuard> },
  { path: '/forgot-password', element: <AuthGuard requireAuth={false}><ForgotPasswordPage /></AuthGuard> },
  { path: '/reset-password/:token', element: <AuthGuard requireAuth={false}><ResetPasswordPage /></AuthGuard> },
  {
    path: '/onboarding',
    element: <AuthGuard><OnboardingLayout /></AuthGuard>,
    children: [
      { path: 'step1', element: <Step1 /> },
      { path: 'step2', element: <Step2 /> },
      { path: 'step3', element: <Step3 /> },
      { index: true, element: <Navigate to="step1" replace /> }
    ]
  },
  {
    path: '/',
    element: <AuthGuard><AppLayout /></AuthGuard>,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'matches', element: <MatchesPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { index: true, element: <Navigate to="/dashboard" replace /> }
    ]
  }
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
