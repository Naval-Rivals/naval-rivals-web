import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import BottomNav from "../components/layout/BottomNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Swords, LogIn, Anchor, Loader2, Zap, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import logo from "../assets/logo-naval-rivals.png";
import Footer from "../components/layout/Footer";
import AlertCard from "../components/ui/AlertCard";
import Spinner from "../components/ui/Spinner";

function HomePage() {
  const [roomCode, setRoomCode] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "error" });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
      setAlert({ show: true, message: err.message || "Erro ao criar sala", type: "error" });
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
      setAlert({ show: true, message: "Digite o código da sala", type: "error" });
      return;
    }

    setJoiningRoom(true);
    try {
      const room = await api.post("/rooms/join", { code });
      if (room.gameId) {
        navigate("/game/ship-placement", {
          state: { gameId: room.gameId, roomId: room.id, opponentNickname: room.host?.nickname, gameMode: room.gameMode },
        });
      } else {
        navigate("/game/waiting-room", { state: { room } });
      }
    } catch (err) {
      setAlert({ show: true, message: err.message || "Erro ao entrar na sala", type: "error" });
    } finally {
      setJoiningRoom(false);
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {(creatingRoom || joiningRoom) && <Spinner />}
      <AlertCard
        show={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
        type={alert.type}
      >
        {alert.message}
      </AlertCard>

      <Header />
      <LayoutPage interClassName="p-4 pb-20 md:pb-8">
        <div className="flex flex-col items-center gap-3 pt-4 pb-2 w-full">
          <div className="w-28 shadow-lg rounded-2xl shadow-orange-500/40">
            <img src={logo} alt="Logo Naval Rivals" className="rounded-2xl" />
          </div>
          <h2 className="font-anybody font-extrabold text-3xl md:text-4xl text-white text-center leading-tight">
            Prepare-se para o <span className="text-orange-300">Combate</span>
          </h2>
          <p className="font-poppins font-light text-white/60 text-center text-sm max-w-md">
            Desafie outros capitães em batalhas navais épicas. Posicione sua
            frota, mire com precisão e domine os mares.
          </p>
        </div>

        <Card className="flex flex-col items-center gap-5 w-full p-6">
          <div className="flex items-center gap-2">
            <span className="font-poppins font-semibold text-white text-sm uppercase tracking-wider">
              Iniciar Batalha
            </span>
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-3">
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
              onClick={() => handleCreateRoom("CLASSIC")}
              disabled={creatingRoom}
            >
              {creatingRoom ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Swords size={18} />
              )}
              {creatingRoom ? "CRIANDO..." : "BATALHA CLÁSSICA"}
            </Button>
            <Button
              variant="secondary"
              className="flex items-center justify-center gap-2 border-yellow-400/50! text-yellow-300!"
              onClick={() => handleCreateRoom("TACTICAL")}
              disabled={creatingRoom}
            >
              {creatingRoom ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Zap size={18} />
              )}
              {creatingRoom ? "CRIANDO..." : "BATALHA TÁTICA"}
            </Button>
          </div>

          {/* Explicação dos modos */}
          <div className="flex flex-col sm:flex-row w-full gap-2">
            <div className="flex-1 flex items-start gap-2 p-3 rounded-lg bg-blue-300/5 border border-blue-300/15">
              <Swords size={14} className="text-blue-300 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-poppins font-semibold text-[11px] text-blue-300">Clássico</span>
                <span className="font-poppins text-[10px] text-white/50 leading-relaxed">
                  Batalha naval tradicional. Alterne tiros com o oponente e afunde toda a frota inimiga.
                </span>
              </div>
            </div>
            <div className="flex-1 flex items-start gap-2 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/15">
              <Zap size={14} className="text-yellow-300 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-poppins font-semibold text-[11px] text-yellow-300">Tático</span>
                <span className="font-poppins text-[10px] text-white/50 leading-relaxed">
                  Modo clássico + 4 habilidades especiais: Torpedo, Radar, Escudo e EMP Naval.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center w-full gap-3">
            <div className="flex-1 h-px bg-white/20" />
            <span className="font-poppins text-xs text-white/40 uppercase tracking-wider">
              ou entre com código
            </span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <form
            onSubmit={handleJoinRoom}
            className="flex flex-col sm:flex-row w-full gap-2"
          >
            <Input
              placeholder="Digite o código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              className="flex items-center justify-center gap-2 sm:w-auto sm:min-w-40 border-blue-300! text-blue-300!"
              disabled={joiningRoom}
            >
              {joiningRoom ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {joiningRoom ? "ENTRANDO..." : "ENTRAR"}
            </Button>
          </form>
        </Card>

        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-blue-dark-900/60 border border-white/10">
            <Anchor size={22} className="text-blue-300" />
            <span className="font-anybody font-bold text-lg text-white">5</span>
            <span className="font-poppins text-[10px] text-white/50 uppercase tracking-wide text-center">
              Navios por frota
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-blue-dark-900/60 border border-white/10">
            <Swords size={22} className="text-orange-300" />
            <span className="font-anybody font-bold text-lg text-white">
              10×10
            </span>
            <span className="font-poppins text-[10px] text-white/50 uppercase tracking-wide text-center">
              Tabuleiro
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-blue-dark-900/60 border border-white/10">
            <Users size={22} className="text-green-300" />
            <span className="font-anybody font-bold text-lg text-white">
              1v1
            </span>
            <span className="font-poppins text-[10px] text-white/50 uppercase tracking-wide text-center">
              Tempo real
            </span>
          </div>
        </div>

        <Footer />
      </LayoutPage>
      <BottomNav />
    </div>
  );
}

export default HomePage;
