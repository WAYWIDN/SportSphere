import { Routes, Route } from "react-router";

import Home from "./pages/Home.tsx";
import Venue from "./pages/Venue.tsx";
import Game from "./pages/Game.tsx";

// Auth Pages
import LoginPage from "./modules/auth/pages/LoginPage.tsx";
import RegisterPage from "./modules/auth/pages/RegisterPage.tsx";
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage.tsx";

// Coach Pages
import CoachListPage from "./modules/coach/pages/CoachListPage.tsx";
import CoachDetailPage from "./modules/coach/pages/CoachDetailPage.tsx";
import CoachDashboardPage from "./modules/coach/pages/CoachDashboardPage.tsx";
import PlayerSessionsPage from "./modules/coach/pages/PlayerSessionsPage.tsx";

// Profile Pages
import ProfilePage from "./modules/profile/pages/ProfilePage.tsx";
import UserProfileViewPage from "./modules/profile/pages/UserProfileViewPage.tsx";

// Admin Page
import AdminApplicationsPage from "./modules/admin/pages/AdminApplicationsPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coach" element={<CoachListPage />} />
      <Route path="/coaches" element={<CoachListPage />} />
      <Route path="/coach/dashboard" element={<CoachDashboardPage />} />
      <Route path="/coach/:coachId" element={<CoachDetailPage />} />
      <Route path="/my-sessions" element={<PlayerSessionsPage />} />

      <Route path="/venue" element={<Venue />} />
      <Route path="/venues" element={<Venue />} />
      <Route path="/game" element={<Game />} />
      <Route path="/games" element={<Game />} />

      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:userId" element={<UserProfileViewPage />} />
      <Route path="/admin" element={<AdminApplicationsPage />} />
      <Route path="/admin/applications" element={<AdminApplicationsPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}
