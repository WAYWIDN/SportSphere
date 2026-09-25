import { Routes, Route } from "react-router";

import Home from "./pages/Home.tsx";
import Venue from "./pages/Venue.tsx";
import Coach from "./pages/Coach.tsx";
import Game from "./pages/Game.tsx";

// Auth Pages
import LoginPage from "./modules/auth/pages/LoginPage.tsx";
import RegisterPage from "./modules/auth/pages/RegisterPage.tsx";
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coach" element={<Coach />} />
      <Route path="/venue" element={<Venue />} />
      <Route path="/game" element={<Game />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}
