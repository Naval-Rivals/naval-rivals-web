import { BrowserRouter, Route, Routes } from "react-router";
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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/my-account" element={<MyAccountPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/game/rules" element={<GameRulesPage />} />
        <Route path="/game/waiting-room" element={<WaitingRoomPage />} />
        <Route path="/game/ship-placement" element={<ShipPlacementPage />} />
        <Route path="/game/play" element={<GamePage />} />
        <Route path="/game/result" element={<GameResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
