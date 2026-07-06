import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import MyAccountPage from "../pages/MyAccountPage";
import RankingPage from "../pages/RankingPage";
import AboutUsPage from "../pages/AboutUsPage";
import GameRulesPage from "../pages/GameRulesPage";
import WaitingRoomPage from "../pages/WaitingRoomPage";
import ShipPlacementPage from "../pages/ShipPlacementPage";
import GamePage from "../pages/GamePage";
import GameResultPage from "../pages/GameResultPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/game/rules" element={<GameRulesPage />} />

        {/* Rotas protegidas */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/my-account" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
        <Route path="/game/waiting-room" element={<ProtectedRoute><WaitingRoomPage /></ProtectedRoute>} />
        <Route path="/game/ship-placement" element={<ProtectedRoute><ShipPlacementPage /></ProtectedRoute>} />
        <Route path="/game/play" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/game/result" element={<ProtectedRoute><GameResultPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
