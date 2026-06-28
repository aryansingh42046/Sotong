import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';
import { useEffect } from 'react';
import { connectSocket } from './lib/socket.js';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WorldDetailPage from './pages/WorldDetailPage.jsx';
import WorldEditorPage from './pages/WorldEditorPage.jsx';
import AvatarSelectPage from './pages/AvatarSelectPage.jsx';
import GamePage from './pages/GamePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

const Protected = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/auth/login" replace />;
};

export default function App() {
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) connectSocket(accessToken);
  }, [accessToken]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/worlds/:id" element={<Protected><WorldDetailPage /></Protected>} />
      <Route path="/worlds/:id/edit" element={<Protected><WorldEditorPage /></Protected>} />
      <Route path="/worlds/:id/enter" element={<Protected><AvatarSelectPage /></Protected>} />
      <Route path="/worlds/:id/play" element={<Protected><GamePage /></Protected>} />
      <Route path="/profile/:id" element={<Protected><ProfilePage /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
