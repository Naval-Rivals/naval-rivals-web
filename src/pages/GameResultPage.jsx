import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  Trophy,
  CircleUserRound,
  Clock,
  Target,
  Flame,
  Droplets,
  Home,
  Swords,
  Loader2,
  Frown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import Spinner from "../components/ui/Spinner";
import victoryAudio from "../assets/audio/victory.mp3";
import defeatAudio from "../assets/audio/defeat.mp3";
import { Helmet } from "react-helmet-async";

function formatDuration(seconds) {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function GameResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const gameId = location.state?.gameId || sessionStorage.getItem("gameId");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    if (!gameId) {
      navigate("/", { replace: true });
      return;
    }

    sessionStorage.removeItem("gameId");

    async function fetchResult() {
      try {
        const data = await api.get(`/games/${gameId}/result`);
        setResult(data);
      } catch (err) {
        setError(err.message || "Erro ao carregar resultado");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [gameId]);

  const isVictory = result?.winner?.id === user?.id;

  useEffect(() => {
    if (!result || !user) return;

    const audio = new Audio(isVictory ? victoryAudio : defeatAudio);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, [result, user, isVictory]);

  async function handlePlayAgain() {
    setCreatingRoom(true);
    try {
      const room = await api.post("/rooms");
      navigate("/game/waiting-room", { state: { room } });
    } catch {
      navigate("/");
    } finally {
      setCreatingRoom(false);
    }
  }

  if (loading) {
    return <Spinner message="Finalizando..." />;
  }

  if (error || !result) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Helmet>
          <title>Resultado - Naval Rivals</title>
        </Helmet>
        <Header />
        <LayoutPage interClassName="p-4 justify-center">
          <Card className="flex flex-col items-center gap-4 p-6 max-w-md">
            <p className="font-poppins text-red-400 text-center">
              {error || "Resultado não encontrado"}
            </p>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2"
              onClick={() => navigate("/")}
            >
              <Home size={18} />
              Voltar ao Menu
            </Button>
          </Card>
        </LayoutPage>
      </div>
    );
  }

  const myStats = isVictory ? result.winnerStats : result.loserStats;
  const opponentStats = isVictory ? result.loserStats : result.winnerStats;
  const myData = isVictory ? result.winner : result.loser;
  const opponentData = isVictory ? result.loser : result.winner;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Helmet>
        <title>Resultado - Naval Rivals</title>
      </Helmet>
      <Header />
      <LayoutPage interClassName="p-4 pb-8 justify-center">
        <Card className="flex flex-col items-center gap-6 w-full max-w-lg p-6">
          {/* Icon + Title */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isVictory
                  ? "bg-orange-500/20 border-2 border-orange-400"
                  : "bg-red-500/20 border-2 border-red-400"
              }`}
            >
              {isVictory ? (
                <Trophy size={40} className="text-orange-300" />
              ) : (
                <Frown size={40} className="text-red-300" />
              )}
            </div>
            <h2
              className={`font-anybody font-extrabold text-3xl uppercase tracking-wider ${
                isVictory ? "text-orange-300" : "text-red-300"
              }`}
            >
              {isVictory ? "Vitória!" : "Derrota..."}
            </h2>
            <p className="font-poppins font-light text-white/60 text-sm text-center">
              {isVictory
                ? "Você dominou os mares e afundou toda a frota inimiga!"
                : "Sua frota foi destruída. Tente novamente, capitão!"}
            </p>
          </div>

          {/* Scoreboard */}
          <div className="flex items-center justify-center gap-6 w-full py-3 border-y border-white/10">
            {/* You */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
                <CircleUserRound size={20} className="text-blue-300" />
              </div>
              <span className="font-poppins font-semibold text-xs text-white">
                {myData?.nickname || user?.nickname}
              </span>
              <span
                className={`font-anybody font-bold text-2xl ${
                  isVictory ? "text-green-400" : "text-red-400"
                }`}
              >
                {myStats?.shipsDestroyed || 0}
              </span>
              <span className="font-poppins text-[10px] text-white/40">
                navios afundados
              </span>
            </div>

            {/* × */}
            <span className="font-anybody font-extrabold text-xl text-white/20">
              ×
            </span>

            {/* Opponent */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-blue-dark-900 border-2 border-orange-300/50 flex items-center justify-center">
                <CircleUserRound size={20} className="text-orange-300/50" />
              </div>
              <span className="font-poppins font-semibold text-xs text-white/60">
                {opponentData?.nickname || "Oponente"}
              </span>
              <span
                className={`font-anybody font-bold text-2xl ${
                  isVictory ? "text-red-400" : "text-green-400"
                }`}
              >
                {opponentStats?.shipsDestroyed || 0}
              </span>
              <span className="font-poppins text-[10px] text-white/40">
                navios afundados
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <StatCard
              icon={<Clock size={18} className="text-blue-300" />}
              label="Tempo de Batalha"
              value={formatDuration(result.durationSeconds)}
            />
            <StatCard
              icon={<Target size={18} className="text-white/70" />}
              label="Tiros Totais"
              value={myStats?.shots || 0}
            />
            <StatCard
              icon={<Flame size={18} className="text-orange-400" />}
              label="Acertos"
              value={myStats?.hits || 0}
            />
            <StatCard
              icon={<Droplets size={18} className="text-blue-300/70" />}
              label="Erros"
              value={myStats?.misses || 0}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
              onClick={handlePlayAgain}
              disabled={creatingRoom}
            >
              {creatingRoom ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Swords size={18} />
              )}
              {creatingRoom ? "CRIANDO SALA..." : "JOGAR NOVAMENTE"}
            </Button>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2"
              onClick={() => navigate("/")}
            >
              <Home size={18} />
              VOLTAR AO MENU
            </Button>
          </div>
        </Card>
      </LayoutPage>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-dark-900/60 border border-white/10">
      {icon}
      <span className="font-anybody font-bold text-lg text-white">{value}</span>
      <span className="font-poppins text-[10px] text-white/50 uppercase tracking-wide text-center">
        {label}
      </span>
    </div>
  );
}

export default GameResultPage;
