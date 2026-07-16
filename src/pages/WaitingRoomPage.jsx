import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import {
  Copy,
  Link,
  Users,
  CircleUserRound,
  Loader,
  X,
  Loader2,
  Swords,
  Zap,
  Anchor,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { ws } from "../services/websocket";
import { motion, AnimatePresence } from "motion/react";
import ModalConfirmation from "../components/ui/ModalConfirmation";
import { Helmet } from "react-helmet-async";

function WaitingRoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [opponentFound, setOpponentFound] = useState(false);
  const [preparingBattle, setPreparingBattle] = useState(false);
  const [guestJoining, setGuestJoining] = useState(false);
  const subscriptionRef = useRef(null);
  const opponentRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const readyAtRef = useRef(null); // timestamp when guest becomes "ready" to receive ROOM_READY
  const guestJoinHandledRef = useRef(false); // prevents duplicate PLAYER_JOINED processing

  const room = location.state?.room;
  const immediateGameId = location.state?.immediateGameId;
  const leftRoomRef = useRef(false);
  const cleanupTimerRef = useRef(null);

  const GUEST_JOIN_DELAY = 1800; // ms - minimum time guest sees "entering room" state

  function processRoomReady(event) {
    leftRoomRef.current = true;
    setPreparingBattle(true);
    pendingNavigationRef.current = {
      gameId: event.gameId,
      roomId: room.id,
      opponentNickname: event.nickname || opponentRef.current,
      gameMode: room.gameMode,
    };
    setTimeout(() => {
      const navData = pendingNavigationRef.current;
      if (navData) {
        navigate("/game/ship-placement", {
          state: navData,
          replace: true,
        });
      }
    }, 2000);
  }

  function handleRoomEvent(event) {
    switch (event.event) {
      case "PLAYER_JOINED":
        // Ignore if guest join was already handled (either by mount logic or previous event)
        if (guestJoinHandledRef.current) break;
        guestJoinHandledRef.current = true;
        setOpponent({ id: event.userId, nickname: event.nickname });
        opponentRef.current = event.nickname;
        setOpponentFound(true);
        break;
      case "ROOM_READY": {
        // If guest is still in "joining" phase, delay ROOM_READY processing
        const readyAt = readyAtRef.current;
        if (readyAt) {
          const elapsed = Date.now() - readyAt;
          const remaining = GUEST_JOIN_DELAY - elapsed;
          if (remaining > 0) {
            setTimeout(() => processRoomReady(event), remaining);
          } else {
            processRoomReady(event);
          }
        } else {
          // Host flow — no joining delay needed
          processRoomReady(event);
        }
        break;
      }
      case "PLAYER_LEFT":
        guestJoinHandledRef.current = false;
        setOpponent(null);
        setOpponentFound(false);
        setPreparingBattle(false);
        pendingNavigationRef.current = null;
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
      return;
    }

    const isHost = room.host?.id === user?.id;
    const timers = []; // track all timers for cleanup

    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    // Guest joining: show "entering room" state with opponent (host) info
    if (!isHost && room.host) {
      guestJoinHandledRef.current = true;
      setGuestJoining(true);
      setOpponent(room.host);
      opponentRef.current = room.host.nickname;
      readyAtRef.current = Date.now();
      // After delay, transition to "opponent found" state
      timers.push(
        setTimeout(() => {
          setGuestJoining(false);
          setOpponentFound(true);
        }, GUEST_JOIN_DELAY),
      );

      // If game was already created (immediateGameId), queue the full transition
      if (immediateGameId) {
        leftRoomRef.current = true;
        // After joining animation completes → show "preparing battle" → navigate
        timers.push(
          setTimeout(() => {
            setPreparingBattle(true);
            pendingNavigationRef.current = {
              gameId: immediateGameId,
              roomId: room.id,
              opponentNickname: room.host?.nickname,
              gameMode: room.gameMode,
            };
            timers.push(
              setTimeout(() => {
                const navData = pendingNavigationRef.current;
                if (navData) {
                  navigate("/game/ship-placement", {
                    state: navData,
                    replace: true,
                  });
                }
              }, 2000),
            );
          }, GUEST_JOIN_DELAY + 800),
        );
      }
    } else if (room.opponent) {
      // Host already has opponent in room (reconnect scenario)
      guestJoinHandledRef.current = true;
      setOpponent(room.opponent);
      setOpponentFound(true);
    }

    function handleBeforeUnload(e) {
      if (!leftRoomRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Skip WebSocket if game is already created (guest with immediateGameId)
    // The transition queue handles navigation autonomously
    if (!immediateGameId) {
      ws.connect({
        onConnect: () => {
          subscriptionRef.current = ws.subscribe(
            `/topic/room/${room.id}`,
            handleRoomEvent,
          );
          if (isHost) {
            ws.publish(`/app/room/${room.id}/register`);
          }
        },
      });
    }

    return () => {
      // Clear all animation timers to prevent double-execution in StrictMode
      timers.forEach((t) => clearTimeout(t));
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      // Reset states for clean re-mount
      guestJoinHandledRef.current = false;
      if (isHost && !leftRoomRef.current) {
        cleanupTimerRef.current = setTimeout(() => {
          api.delete(`/rooms/${room.id}`).catch(() => {});
        }, 100);
      }
    };
  }, []);

  async function handleCancel() {
    setCanceling(true);
    leftRoomRef.current = true;
    try {
      await api.delete(`/rooms/${room.id}`);
    } catch {
      // Room might already be deleted, proceed anyway
    }
    navigate("/", { replace: true });
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

  // Determine title and subtitle based on current state
  function getTitle() {
    if (preparingBattle) return "Preparando Batalha...";
    if (opponentFound) return "Oponente encontrado!";
    if (guestJoining) return "Entrando na sala...";
    return "Aguardando Oponente...";
  }

  function getSubtitle() {
    if (preparingBattle) return "Iniciando posicionamento dos navios...";
    if (opponentFound) return `${opponentNickname} entrou na sala!`;
    if (guestJoining)
      return `Entrando na sala de ${opponentNickname || "..."}`;
    return "Compartilhe o código ou link abaixo para convidar um amigo";
  }

  function getTitleKey() {
    if (preparingBattle) return "title-preparing";
    if (opponentFound) return "title-found";
    if (guestJoining) return "title-joining";
    return "title-waiting";
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Helmet>
        <title>Sala - Naval Rivals</title>
      </Helmet>
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
          {/* Header icon + title */}
          <div className="flex flex-col items-center gap-3">
            <AnimatePresence mode="wait">
              {preparingBattle ? (
                <motion.div
                  key="preparing"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
                    <Anchor size={28} className="text-green-300" />
                  </div>
                </motion.div>
              ) : opponentFound ? (
                <motion.div
                  key="found"
                  initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
                    <Swords size={28} className="text-green-300" />
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold"
                  >
                    ✓
                  </motion.span>
                </motion.div>
              ) : guestJoining ? (
                <motion.div
                  key="joining"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-400/20 border-2 border-blue-400 flex items-center justify-center">
                    <Anchor size={28} className="text-blue-300 animate-pulse" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500" />
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center animate-pulse">
                    <Users size={28} className="text-orange-300" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500" />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={getTitleKey()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-1"
              >
                <SectionTitle className="text-xl text-center">
                  {getTitle()}
                </SectionTitle>
              </motion.div>
            </AnimatePresence>

            {room.gameMode && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-poppins font-semibold uppercase tracking-wider ${
                  room.gameMode === "TACTICAL"
                    ? "bg-yellow-400/10 border border-yellow-400/40 text-yellow-300"
                    : "bg-blue-300/10 border border-blue-300/40 text-blue-300"
                }`}
              >
                {room.gameMode === "TACTICAL" ? (
                  <Zap size={12} />
                ) : (
                  <Swords size={12} />
                )}
                {room.gameMode === "TACTICAL" ? "Modo Tático" : "Modo Clássico"}
              </span>
            )}

            <AnimatePresence mode="wait">
              <motion.p
                key={getTitleKey() + "-sub"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="font-poppins font-light text-white/60 text-center text-sm"
              >
                {getSubtitle()}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Players VS section */}
          <div className="flex items-center justify-center gap-6 w-full py-4">
            {/* Left player: always "me" */}
            <div className="flex flex-col items-center gap-2">
              <AnimatePresence mode="wait">
                {guestJoining ? (
                  <motion.div
                    key="me-joining"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
                      <CircleUserRound size={28} className="text-blue-300" />
                    </div>
                    <span className="font-poppins font-medium text-sm text-white">
                      {myNickname}
                    </span>
                    <span className="font-poppins text-[10px] text-blue-300 uppercase tracking-wider font-semibold">
                      Entrando...
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="me-ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
                      <CircleUserRound size={28} className="text-blue-300" />
                    </div>
                    <span className="font-poppins font-medium text-sm text-white">
                      {isHost ? myNickname : opponentNickname || myNickname}
                    </span>
                    <span className="font-poppins text-[10px] text-green-400 uppercase tracking-wider font-semibold">
                      Pronto
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="font-anybody font-extrabold text-2xl text-white/30">
                VS
              </span>
            </div>

            {/* Right player: opponent */}
            <div className="flex flex-col items-center gap-2">
              <AnimatePresence mode="wait">
                {guestJoining ? (
                  <motion.div
                    key="host-waiting"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-orange-300 flex items-center justify-center">
                      <CircleUserRound size={28} className="text-orange-300" />
                    </div>
                    <span className="font-poppins font-medium text-sm text-white">
                      {opponentNickname}
                    </span>
                    <span className="font-poppins text-[10px] text-green-400 uppercase tracking-wider font-semibold">
                      Pronto
                    </span>
                  </motion.div>
                ) : opponentFound ? (
                  <motion.div
                    key="opponent-avatar"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                      delay: 0.1,
                    }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-orange-300 flex items-center justify-center">
                      <CircleUserRound size={28} className="text-orange-300" />
                    </div>
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-poppins font-medium text-sm text-white"
                    >
                      {isHost ? opponentNickname : myNickname}
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="font-poppins text-[10px] text-green-400 uppercase tracking-wider font-semibold"
                    >
                      Pronto
                    </motion.span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="opponent-waiting"
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-dark-900 border-2 border-white/20 flex items-center justify-center animate-pulse">
                      <Loader
                        size={24}
                        className="text-white/30 animate-spin"
                      />
                    </div>
                    <span className="font-poppins font-medium text-sm text-white/40">
                      ???
                    </span>
                    <span className="font-poppins text-[10px] text-white/30 uppercase tracking-wider">
                      Aguardando...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Preparing battle transition overlay */}
          <AnimatePresence>
            {preparingBattle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-green-400/10 border border-green-400/30"
              >
                <Loader2
                  size={18}
                  className="text-green-300 animate-spin shrink-0"
                />
                <span className="font-poppins font-medium text-sm text-green-300">
                  Preparando batalha...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guest joining indicator */}
          <AnimatePresence>
            {guestJoining && !preparingBattle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-blue-400/10 border border-blue-400/30"
              >
                <Loader2
                  size={18}
                  className="text-blue-300 animate-spin shrink-0"
                />
                <span className="font-poppins font-medium text-sm text-blue-300">
                  Conectando à sala...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Room code section - hide during preparing state and guest joining */}
          <AnimatePresence>
            {!preparingBattle && !guestJoining && (
              <motion.div
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 w-full"
              >
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
                        className={
                          codeCopied ? "text-green-400" : "text-blue-300"
                        }
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
                      <Link
                        size={14}
                        className="text-white/40 shrink-0 mr-2"
                      />
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
                        className={
                          linkCopied ? "text-green-400" : "text-blue-300"
                        }
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
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </LayoutPage>
    </div>
  );
}

export default WaitingRoomPage;
