import { Routes, Route } from "react-router";

import Home from "./pages/Home.tsx";
import VenueListPage from "./modules/venue-owner/pages/VenueListPage.tsx";
import VenueDetailPage from "./modules/venue-owner/pages/VenueDetailPage.tsx";
import SubvenueDetailPage from "./modules/venue-owner/pages/SubvenueDetailPage.tsx";

// Auth Pages
import LoginPage from "./modules/auth/pages/LoginPage.tsx";
import RegisterPage from "./modules/auth/pages/RegisterPage.tsx";
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage.tsx";

// Coach Pages
import CoachListPage from "./modules/coach/pages/CoachListPage.tsx";
import CoachDetailPage from "./modules/coach/pages/CoachDetailPage.tsx";
import CoachDashboardPage from "./modules/coach/pages/CoachDashboardPage.tsx";

// Profile Pages
import ProfilePage from "./modules/profile/pages/ProfilePage.tsx";
import UserProfileViewPage from "./modules/profile/pages/UserProfileViewPage.tsx";

// Admin Page
import AdminApplicationsPage from "./modules/admin/pages/AdminApplicationsPage.tsx";
import VenueOwnerDashboardPage from "./modules/venue-owner/pages/VenueOwnerDashboardPage.tsx";
import VenueBookingRequestsPage from "./modules/venue-owner/pages/VenueBookingRequestsPage.tsx";

// Game Pages
import GameListPage from "./modules/game/pages/GameListPage.tsx";
import GameDetailPage from "./modules/game/pages/GameDetailPage.tsx";

// Session Page
import SessionsPage from "./modules/session/pages/SessionsPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coach" element={<CoachListPage />} />
      <Route path="/coaches" element={<CoachListPage />} />
      <Route path="/coach/dashboard" element={<CoachDashboardPage />} />
      <Route path="/coach/:coachId" element={<CoachDetailPage />} />

      <Route path="/venues" element={<VenueListPage />} />
      <Route path="/venues/:venueId" element={<VenueDetailPage />} />
      <Route
        path="/venues/:venueId/subvenues/:subvenueId"
        element={<SubvenueDetailPage />}
      />
      <Route path="/venue-owner" element={<VenueOwnerDashboardPage />} />
      <Route path="/my-bookings" element={<VenueBookingRequestsPage />} />

      <Route path="/game" element={<GameListPage />} />
      <Route path="/games" element={<GameListPage />} />
      <Route path="/games/:gameId" element={<GameDetailPage />} />
      <Route path="/my-games" element={<GameListPage defaultTab="my-games" />} />

      <Route path="/sessions" element={<SessionsPage />} />
      <Route path="/my-sessions" element={<SessionsPage />} />

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
