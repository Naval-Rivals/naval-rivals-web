import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LobbyPanel from "../components/game/LobbyPanel";
import {
  Swords,
  LogIn,
  Loader2,
  Zap,
  ArrowRight,
  Hash,
  Brain,
  Target,
  Gamepad2,
  Shield,
  Compass,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import logo from "../assets/logo-naval-rivals.png";
import Footer from "../components/layout/Footer";
import AlertCard from "../components/ui/AlertCard";
import Spinner from "../components/ui/Spinner";
import { Helmet } from "react-helmet-async";
import ModeTag from "../components/ui/ModeTag";

function HomePage() {
  const [roomCode, setRoomCode] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Lobby state
  const [lobbyRooms, setLobbyRooms] = useState([]);
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const [joiningCode, setJoiningCode] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      const rooms = await api.get("/rooms");
      const filtered = (rooms || []).filter(
        (room) => room.host?.id !== user?.id,
      );
      setLobbyRooms(filtered);
    } catch (err) {
      console.error("Failed to fetch lobby rooms:", err);
    }
  }, [user?.id]);

  // Fetch rooms + subscribe to lobby SSE for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    setLobbyLoading(true);
    fetchRooms().finally(() => setLobbyLoading(false));

    const baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:8080";
    const eventSource = new EventSource(`${baseUrl}/lobby/events`);

    eventSource.addEventListener("LOBBY_UPDATED", () => {
      fetchRooms();
    });

    eventSource.onerror = () => {
      // EventSource reconnects automatically — no manual logic needed
      console.warn("SSE lobby connection lost, reconnecting...");
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated, fetchRooms]);

  async function handleCreateRoom(gameMode) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setCreatingRoom(true);
    try {
      const room = await api.post("/rooms", { gameMode });
      navigate("/game/waiting-room", { state: { room } });
    } catch (err) {
      setAlert({
        show: true,
        message: err.message || "Erro ao criar sala",
        type: "error",
      });
    } finally {
      setCreatingRoom(false);
    }
  }

  async function handleJoinRoom(e) {
    e?.preventDefault?.();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const code = roomCode.trim().toUpperCase();
    if (!code) {
      setAlert({
        show: true,
        message: "Digite o código da sala",
        type: "error",
      });
      return;
    }

    setJoiningRoom(true);
    try {
      const room = await api.post("/rooms/join", { code });
      navigateToRoom(room);
    } catch (err) {
      setAlert({
        show: true,
        message: err.message || "Erro ao entrar na sala",
        type: "error",
      });
    } finally {
      setJoiningRoom(false);
    }
  }

  async function handleJoinFromLobby(code) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setJoiningCode(code);
    try {
      const room = await api.post("/rooms/join", { code });
      navigateToRoom(room);
    } catch (err) {
      setAlert({
        show: true,
        message: err.message || "Erro ao entrar na sala",
        type: "error",
      });
    } finally {
      setJoiningCode(null);
    }
  }

  function navigateToRoom(room) {
    if (room.gameId) {
      // Guest joined and game was already created — go through WaitingRoom for transition
      navigate("/game/waiting-room", {
        state: {
          room,
          immediateGameId: room.gameId,
        },
      });
    } else {
      navigate("/game/waiting-room", { state: { room } });
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <Helmet>
        <title>Home - Naval Rivals</title>
      </Helmet>
      {(creatingRoom || joiningRoom) && <Spinner message="Iniciando..." />}
      <AlertCard
        show={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
        type={alert.type}
      >
        {alert.message}
      </AlertCard>

      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-8">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center gap-3 pt-6 pb-6 w-full overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-24 md:w-28 drop-shadow-[0_0_20px_rgba(255,120,0,0.4)]">
            <img src={logo} alt="Logo Naval Rivals" className="rounded-2xl" />
          </div>

          <h2 className="font-anybody font-extrabold text-3xl md:text-4xl text-white text-center leading-tight">
            PREPARE-SE PARA O
          </h2>
          <h2 className="font-anybody font-extrabold text-4xl md:text-5xl text-orange-300 text-center leading-none -mt-2">
            COMBATE
          </h2>

          {/* Decorative divider */}
          {/* <div className="flex items-center gap-2 mt-1">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-orange-400/60" />
            <Sparkles size={14} className="text-orange-400/60" />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-orange-400/60" />
          </div> */}

          {/* <p className="font-poppins text-white/50 text-center text-sm max-w-xs">
            Escolha seu modo de batalha e mostre suas habilidades no mar!
          </p> */}
        </section>

        {/* Battle Mode Selection */}
        <section className="w-full">
          <Card className="flex flex-col items-center gap-6 w-full p-5 md:p-6">
            {/* Section title with decorative lines */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-orange-400/40" />
              <span className="font-poppins font-bold text-xs text-white/70 uppercase tracking-[0.2em]">
                Escolha seu modo de batalha
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-orange-400/40" />
            </div>

            {/* Mode cards */}
            <div className="flex flex-col md:flex-row w-full gap-4">
              {/* Classic Mode Card */}
              <div className="relative flex-1 flex flex-col rounded-xl border-2 border-orange-400/30 bg-blue-dark-900/80 overflow-hidden">
                {/* Recommended badge */}
                <div className="absolute top-0 right-0 z-10">
                  <span className="px-2.5 py-1  bg-orange-500 font-poppins font-bold text-[10px] text-white uppercase tracking-wide ">
                    Recomendado
                  </span>
                </div>

                <div className="flex items-start gap-4 p-5">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-orange-500/10 border-2 border-orange-400/40 flex items-center justify-center shrink-0">
                    <Swords size={24} className="text-orange-300" />
                  </div>
                  {/* Info */}
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-anybody font-extrabold text-base text-white leading-tight">
                      BATALHA
                    </span>
                    <span className="font-anybody font-extrabold text-base text-orange-300 leading-tight -mt-0.5">
                      CLÁSSICA
                    </span>
                    <p className="font-poppins text-[11px] text-white/50 leading-relaxed mt-1">
                      A batalha naval tradicional. Afunde toda a frota inimiga
                      para vencer.
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 px-5 pb-4">
                  <ModeTag icon={<Brain size={10} />} label="Pura Estratégia" />
                  <ModeTag icon={<Target size={10} />} label="Posicionamento" />
                  <ModeTag
                    icon={<Gamepad2 size={10} />}
                    label="Diversão Clássica"
                  />
                </div>

                {/* CTA Button */}
                <div className="px-5 pb-5 mt-auto">
                  <button
                    onClick={() => handleCreateRoom("CLASSIC")}
                    disabled={creatingRoom}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 font-poppins font-bold text-sm text-white uppercase tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                  >
                    {creatingRoom ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        JOGAR CLÁSSICO
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tactical Mode Card */}
              <div className="relative flex-1 flex flex-col rounded-xl border-2 border-blue-300/30 bg-blue-dark-900/80 overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-blue-300/10 border-2 border-blue-300/40 flex items-center justify-center shrink-0">
                    <Zap size={24} className="text-blue-300" />
                  </div>
                  {/* Info */}
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-anybody font-extrabold text-base text-white leading-tight">
                      BATALHA
                    </span>
                    <span className="font-anybody font-extrabold text-base text-blue-300 leading-tight -mt-0.5">
                      TÁTICA
                    </span>
                    <p className="font-poppins text-[11px] text-white/50 leading-relaxed mt-1">
                      Modo clássico com habilidades especiais que adicionam
                      estratégia extra ao combate.
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 px-5 pb-4">
                  <ModeTag icon={<Zap size={10} />} label="4 Habilidades" />
                  <ModeTag
                    icon={<Shield size={10} />}
                    label="Poderes Especiais"
                  />
                  <ModeTag
                    icon={<Compass size={10} />}
                    label="Mais Estratégia"
                  />
                </div>

                {/* CTA Button */}
                <div className="px-5 pb-5 mt-auto">
                  <button
                    onClick={() => handleCreateRoom("TACTICAL")}
                    disabled={creatingRoom}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-blue-300/20 hover:bg-blue-300/30 border border-blue-300/50 font-poppins font-bold text-sm text-blue-200 uppercase tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingRoom ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        JOGAR TÁTICO
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center w-full gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-poppins font-semibold text-[11px] text-white/40 uppercase tracking-widest">
                Ou entre com um código de sala
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Join by code */}
            <form
              onSubmit={handleJoinRoom}
              className="flex flex-col sm:flex-row w-full gap-3"
            >
              <div className="relative flex-1">
                <Hash
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  placeholder="Digite o código da sala"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full bg-blue-dark-900 text-white border-2 border-white/15 rounded-lg py-2.5 pl-9 pr-4 placeholder:text-white/30 placeholder:text-sm focus:border-orange-400/50 focus:shadow-[0_0_8px_rgba(255,120,0,0.3)] outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={joiningRoom}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border-2 border-white/20 hover:border-orange-400/50 hover:bg-orange-500/10 text-white/70 hover:text-orange-300 font-poppins font-semibold text-sm uppercase tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joiningRoom ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                {joiningRoom ? "ENTRANDO..." : "ENTRAR NA SALA"}
              </button>
            </form>
          </Card>
        </section>

        {/* Lobby - Available rooms */}
        {isAuthenticated && (
          <section className="w-full">
            <LobbyPanel
              rooms={lobbyRooms}
              onJoinRoom={handleJoinFromLobby}
              joiningCode={joiningCode}
              loading={lobbyLoading}
            />
          </section>
        )}

        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

export default HomePage;
