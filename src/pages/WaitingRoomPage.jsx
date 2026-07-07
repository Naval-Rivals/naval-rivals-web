import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import { Copy, Link, Users, CircleUserRound, Loader, X, Loader2, Swords, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { ws } from "../services/websocket";
import ModalConfirmation from "../components/ui/ModalConfirmation";

function WaitingRoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const subscriptionRef = useRef(null);
  const opponentRef = useRef(null);

  const room = location.state?.room;

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
      return;
    }

    // If room already has an opponent (user joined as opponent), it might already be FULL
    if (room.opponent) {
      setOpponent(room.opponent);
    }

    // If room is already in a game state (FULL/PLACING_SHIPS), navigate to placement
    if (room.status === "PLACING_SHIPS" || room.status === "FULL") {
      // Room is full, game should have been created. We need the gameId.
      // The ROOM_READY event provides gameId, but if we joined and got FULL status,
      // we wait for ROOM_READY via WebSocket
    }

    // Connect WebSocket and subscribe to room events
    ws.connect({
      onConnect: () => {
        subscriptionRef.current = ws.subscribe(
          `/topic/room/${room.id}`,
          handleRoomEvent,
        );
      },
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      ws.disconnect();
    };
  }, []);

  function handleRoomEvent(event) {
    switch (event.event) {
      case "PLAYER_JOINED":
        setOpponent({ id: event.userId, nickname: event.nickname });
        opponentRef.current = event.nickname;
        break;
      case "ROOM_READY":
        // Both players are in, game created. Navigate to ship placement.
        navigate("/game/ship-placement", {
          state: { gameId: event.gameId, roomId: room.id, opponentNickname: event.nickname || opponentRef.current, gameMode: room.gameMode },
          replace: true,
        });
        break;
      case "PLAYER_LEFT":
        setOpponent(null);
        break;
      default:
        break;
    }
  }

  async function handleCancel() {
    setCanceling(true);
    try {
      await api.delete(`/rooms/${room.id}`);
      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  }

  function handleCopy(text, setCopied) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!room) return null;

  const roomCode = room.code;
  const shareLink = `${window.location.origin}/join/${roomCode}`;
  const isHost = room.host?.id === user?.id;
  const myNickname = user?.nickname || "Você";
  const opponentNickname = opponent?.nickname || null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {showCancelModal && (
        <ModalConfirmation
          title="Cancelar Batalha"
          description="Tem certeza que deseja cancelar? A sala será encerrada."
          confirmText="Cancelar Batalha"
          variant="danger"
          handleConfirm={handleCancel}
          handleCancel={() => setShowCancelModal(false)}
        />
      )}
      <Header minimal />
      <LayoutPage interClassName="p-4 justify-center">
        <Card className="flex flex-col items-center gap-6 w-full max-w-lg p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center animate-pulse">
                <Users size={28} className="text-orange-300" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500" />
              </span>
            </div>
            <SectionTitle className="text-xl text-center">
              {opponentNickname ? "Oponente encontrado!" : "Aguardando Oponente..."}
            </SectionTitle>
            {room.gameMode && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-poppins font-semibold uppercase tracking-wider ${
                room.gameMode === "TACTICAL"
                  ? "bg-yellow-400/10 border border-yellow-400/40 text-yellow-300"
                  : "bg-blue-300/10 border border-blue-300/40 text-blue-300"
              }`}>
                {room.gameMode === "TACTICAL" ? <Zap size={12} /> : <Swords size={12} />}
                {room.gameMode === "TACTICAL" ? "Modo Tático" : "Modo Clássico"}
              </span>
            )}
            <p className="font-poppins font-light text-white/60 text-center text-sm">
              {opponentNickname
                ? "Preparando a batalha..."
                : "Compartilhe o código ou link abaixo para convidar um amigo"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 w-full py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
                <CircleUserRound size={28} className="text-blue-300" />
              </div>
              <span className="font-poppins font-medium text-sm text-white">
                {isHost ? myNickname : opponentNickname || myNickname}
              </span>
              <span className="font-poppins text-[10px] text-green-400 uppercase tracking-wider font-semibold">
                Pronto
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="font-anybody font-extrabold text-2xl text-white/30">
                VS
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              {opponentNickname ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-orange-300 flex items-center justify-center">
                    <CircleUserRound size={28} className="text-orange-300" />
                  </div>
                  <span className="font-poppins font-medium text-sm text-white">
                    {isHost ? opponentNickname : myNickname}
                  </span>
                  <span className="font-poppins text-[10px] text-green-400 uppercase tracking-wider font-semibold">
                    Pronto
                  </span>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-white/20 flex items-center justify-center animate-pulse">
                    <Loader size={24} className="text-white/30 animate-spin" />
                  </div>
                  <span className="font-poppins font-medium text-sm text-white/40">
                    ???
                  </span>
                  <span className="font-poppins text-[10px] text-white/30 uppercase tracking-wider">
                    Aguardando...
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="font-poppins text-xs text-white/50 uppercase tracking-wider">
              Código da Batalha
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg bg-blue-dark-900 border-2 border-blue-300/40">
                <span className="font-anybody font-extrabold text-xl text-orange-300 tracking-widest select-all">
                  {roomCode}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-auto! px-3! border-blue-300/40!"
                onClick={() => handleCopy(roomCode, setCodeCopied)}
              >
                <Copy
                  size={18}
                  className={codeCopied ? "text-green-400" : "text-blue-300"}
                />
              </Button>
            </div>
            {codeCopied && (
              <span className="font-poppins text-xs text-green-400 text-center">
                Código copiado!
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="font-poppins text-xs text-white/50 uppercase tracking-wider">
              Link de Compartilhamento
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center px-4 py-3 rounded-lg bg-blue-dark-900 border-2 border-blue-300/40 overflow-hidden">
                <Link size={14} className="text-white/40 shrink-0 mr-2" />
                <span className="font-poppins text-sm text-white/70 truncate select-all">
                  {shareLink}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-auto! px-3! border-blue-300/40!"
                onClick={() => handleCopy(shareLink, setLinkCopied)}
              >
                <Copy
                  size={18}
                  className={linkCopied ? "text-green-400" : "text-blue-300"}
                />
              </Button>
            </div>
            {linkCopied && (
              <span className="font-poppins text-xs text-green-400 text-center">
                Link copiado!
              </span>
            )}
          </div>

          <Button
            variant="danger"
            className="flex items-center justify-center gap-2 border-red-500/50!"
            onClick={() => setShowCancelModal(true)}
            disabled={canceling}
          >
            {canceling ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <X size={18} />
            )}
            {canceling ? "CANCELANDO..." : "CANCELAR BATALHA"}
          </Button>
        </Card>
      </LayoutPage>
    </div>
  );
}

export default WaitingRoomPage;
