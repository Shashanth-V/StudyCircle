import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useUiStore } from './stores/uiStore';
import { connectSocket, disconnectSocket } from './lib/socket';

import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OnboardingStep1 from './pages/onboarding/Step1';
import OnboardingStep2 from './pages/onboarding/Step2';
import OnboardingStep3 from './pages/onboarding/Step3';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Matches from './pages/Matches';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import ChatRoom from './pages/ChatRoom';
import Sessions from './pages/Sessions';
import CreateSession from './pages/CreateSession';
import SessionRoom from './pages/SessionRoom';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import AccountSettings from './pages/settings/Account';
import NotificationSettings from './pages/settings/Notifications';
import PrivacySettings from './pages/settings/Privacy';
import NotFound from './pages/NotFound';

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const token = useAuthStore((s) => s.token);
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    initAuth();
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [initAuth, theme]);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [token]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white' }} />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Onboarding */}
        <Route path="/onboarding/step1" element={<AuthGuard><OnboardingStep1 /></AuthGuard>} />
        <Route path="/onboarding/step2" element={<AuthGuard><OnboardingStep2 /></AuthGuard>} />
        <Route path="/onboarding/step3" element={<AuthGuard><OnboardingStep3 /></AuthGuard>} />
        {/* Protected routes */}
        <Route element={<AuthGuard><Layout /></AuthGuard>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:userId" element={<UserProfile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:chatId" element={<ChatRoom />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/create" element={<CreateSession />} />
          <Route path="/sessions/:id" element={<SessionRoom />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />}>
            <Route index element={<Navigate to="account" replace />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
