import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import ModalInfo from "../components/ui/ModalInfo";
import ModalConfirmation from "../components/ui/ModalConfirmation";
import Button from "../components/ui/Button";
import GameBoard from "../components/game/GameBoard";
import ExplosionEffect from "../components/game/ExplosionEffect";
import ShotEffect from "../components/game/ShotEffect";
import AbilityPanel from "../components/game/AbilityPanel";
import BattleToast from "../components/game/BattleToast";
import {
  CircleUserRound,
  Clock,
  Ship,
  Flame,
  Droplets,
  Loader2,
  WifiOff,
  Shield,
  Radar,
  Radio,
  Zap,
  LogOut,
  UserRoundX,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { ws } from "../services/websocket";
import { Helmet } from "react-helmet-async";
import Spinner from "../components/ui/Spinner";
import ShipStatusCard from "../components/game/ShipStatusCard";

const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const CELL_SIZE = 33;
const TARGETING_DURATION_MS = 1600;

function apiToCell(row, col) {
  return `${COLUMNS[row]}${col + 1}`;
}

function parseCellNotation(cell) {
  const letter = cell.charAt(0);
  const number = parseInt(cell.substring(1));
  return { col: letter, row: number };
}

function boardClickToCell(col, row) {
  return `${col}${row}`;
}

function getShipName(type) {
  const names = {
    CARRIER: "Porta-aviões",
    BATTLESHIP: "Navio-tanque",
    CRUISER: "Cruzador",
    SUBMARINE: "Submarino",
    DESTROYER: "Destroyer",
  };
  return names[type] || type;
}

function getRadarCells(col, row) {
  const colIdx = COLUMNS.indexOf(col);
  const rowIdx = row - 1;
  const cells = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const newCol = colIdx + dc;
      const newRow = rowIdx + dr;
      if (newCol >= 0 && newCol < 10 && newRow >= 0 && newRow < 10) {
        cells.push(`${COLUMNS[newCol]}${newRow + 1}`);
      }
    }
  }
  return cells;
}

function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const subscriptionsRef = useRef([]);
  const timerRef = useRef(null);
  const blockedCellRef = useRef(null);
  const shieldBlockedThisTurnRef = useRef(false);
  const empJustAppliedRef = useRef(false);

  const gameId = location.state?.gameId || sessionStorage.getItem("gameId");
  const initialFirstTurn = location.state?.firstTurn;
  const gameMode =
    location.state?.gameMode || sessionStorage.getItem("gameMode") || "CLASSIC";
  const roomId = location.state?.roomId || sessionStorage.getItem("roomId");

  const [loading, setLoading] = useState(true);
  const [myBoard, setMyBoard] = useState({});
  const [enemyBoard, setEnemyBoard] = useState({});
  const [currentTurn, setCurrentTurn] = useState(initialFirstTurn);
  const [timeLeft, setTimeLeft] = useState(60);
  const [myFleet, setMyFleet] = useState([]);
  const [myShips, setMyShips] = useState([]);
  const myShipsRef = useRef(myShips);
  const [enemySunkShips, setEnemySunkShips] = useState([]);
  const [enemyFleet, setEnemyFleet] = useState([]);
  const [opponentNickname, setOpponentNickname] = useState(
    location.state?.opponentNickname ||
      sessionStorage.getItem("opponentNickname") ||
      "Oponente",
  );
  const [activeTab, setActiveTab] = useState("enemy");
  const [disconnected, setDisconnected] = useState(false);
  const [reconnectTime, setReconnectTime] = useState(0);
  const [attackingCell, setAttackingCell] = useState(null);
  const [torpedoAvailable, setTorpedoAvailable] = useState(true);
  const [torpedoMode, setTorpedoMode] = useState(false);
  const [explosions, setExplosions] = useState([]);

  // Tactical mode state
  const [abilities, setAbilities] = useState({
    radarAvailable: true,
    shieldCharges: 2,
    shieldActive: false,
    empNavalAvailable: true,
    empDisabledTurns: 0,
  });
  const [radarMode, setRadarMode] = useState(false);
  const [radarHoverCells, setRadarHoverCells] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);

  // Shot animation state
  const [shotAnimations, setShotAnimations] = useState([]);
  const shotAnimationsRef = useRef([]);
  const pendingResultsRef = useRef([]);
  const pendingShipSunkRef = useRef([]);

  const isMyTurn = currentTurn === user?.id;
  const isTactical = gameMode === "TACTICAL";

  myShipsRef.current = myShips;
  shotAnimationsRef.current = shotAnimations;

  const hasEnemyBoardAnimation = shotAnimations.some(
    (a) => a.board === "enemy" && (a.phase === "targeting" || a.phase === "shot"),
  );

  const toastIdCounter = useRef(0);

  function addToast(message, icon, color) {
    const id = `toast-${Date.now()}-${toastIdCounter.current++}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, icon, color }]);
  }

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Shot Animation Helpers ---

  function startShotAnimation(col, row, board) {
    const id = `shot-${Date.now()}-${col}${row}`;
    const newAnim = { id, col, row, board, phase: "targeting" };
    // Update ref immediately so WebSocket callbacks can find it
    shotAnimationsRef.current = [...shotAnimationsRef.current, newAnim];
    setShotAnimations((prev) => [...prev, newAnim]);

    // After targeting duration, advance to shot phase
    setTimeout(() => {
      shotAnimationsRef.current = shotAnimationsRef.current.map((a) =>
        a.id === id ? { ...a, phase: "shot" } : a,
      );
      setShotAnimations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, phase: "shot" } : a)),
      );
    }, TARGETING_DURATION_MS);

    return id;
  }

  function completeShotAnimation(animId) {
    // Update ref immediately
    shotAnimationsRef.current = shotAnimationsRef.current.filter(
      (a) => a.id !== animId,
    );
    setShotAnimations((prev) => prev.filter((a) => a.id !== animId));

    // Reveal pending results for this animation
    const pendingIdx = pendingResultsRef.current.findIndex(
      (p) => p.animId === animId,
    );
    if (pendingIdx !== -1) {
      const pending = pendingResultsRef.current[pendingIdx];
      pendingResultsRef.current.splice(pendingIdx, 1);
      revealAttackResult(pending);
    }

    // Check for pending ship sunk
    const sunkIdx = pendingShipSunkRef.current.findIndex(
      (p) => p.animId === animId,
    );
    if (sunkIdx !== -1) {
      const sunkData = pendingShipSunkRef.current[sunkIdx];
      pendingShipSunkRef.current.splice(sunkIdx, 1);
      executeShipSunk(sunkData.payload);
    }

    // Clear attackingCell if no more animations on enemy board
    const remaining = shotAnimationsRef.current.filter(
      (a) => a.board === "enemy",
    );
    if (remaining.length === 0) {
      setAttackingCell(null);
    }
  }

  function revealAttackResult({ attackerId, col, row, hit }) {
    const cellKey = `${col}${row}`;
    if (attackerId === user?.id) {
      setEnemyBoard((prev) => {
        if (prev[cellKey] === "sunk") return prev;
        return { ...prev, [cellKey]: hit ? "hit" : "miss" };
      });
    } else {
      setMyBoard((prev) => {
        if (prev[cellKey] === "sunk") return prev;
        return { ...prev, [cellKey]: hit ? "hit" : "miss" };
      });
    }
  }

  function getTargetingCell(board) {
    const anim = shotAnimations.find(
      (a) => a.board === board && a.phase === "targeting",
    );
    return anim ? { col: anim.col, row: anim.row } : null;
  }

  function getShotEffects(board) {
    return shotAnimations.filter(
      (a) => a.board === board && a.phase === "shot",
    );
  }


  // --- Effects ---

  useEffect(() => {
    if (!gameId) {
      navigate("/", { replace: true });
      return;
    }
    sessionStorage.setItem("gameId", gameId);
    sessionStorage.setItem("gameMode", gameMode);
    if (location.state?.opponentNickname) {
      sessionStorage.setItem("opponentNickname", location.state.opponentNickname);
    }

    function handleBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    async function init() {
      // Connect WebSocket FIRST to send register ASAP (cancel reconnect timeout)
      ws.connect({
        onConnect: () => {
          ws.publish(`/app/game/${gameId}/register`);
          subscriptionsRef.current.forEach((sub) => sub?.unsubscribe());
          const subEvents = ws.subscribe(`/topic/game/${gameId}/events`, handleGameEvent);
          const subUserEvents = ws.subscribe(`/user/topic/game/${gameId}/events`, handleGameEvent);
          const subRoom = roomId ? ws.subscribe(`/topic/room/${roomId}`, handleRoomEvent) : null;
          subscriptionsRef.current = [subEvents, subUserEvents, subRoom].filter(Boolean);
        },
      });

      // Then fetch game state to rebuild boards
      try {
        const state = await api.get(`/games/${gameId}/state`);
        buildBoardFromState(state);
        if (state.currentTurn) setCurrentTurn(state.currentTurn);
      } catch (err) {
        console.error("Failed to load game state:", err);
        // If game no longer exists (finished/removed), go to home
        if (err.status === 404) {
          sessionStorage.removeItem("gameId");
          sessionStorage.removeItem("roomId");
          sessionStorage.removeItem("opponentNickname");
          sessionStorage.removeItem("gameMode");
          navigate("/", { replace: true });
          return;
        }
      } finally {
        setLoading(false);
      }
    }
    init();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      subscriptionsRef.current.forEach((sub) => sub?.unsubscribe());
      subscriptionsRef.current = [];
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameId]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (loading || disconnected) return;
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentTurn, loading, disconnected]);

  useEffect(() => {
    if (!disconnected || reconnectTime <= 0) return;
    const interval = setInterval(() => {
      setReconnectTime((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [disconnected, reconnectTime]);

  // --- Board state builder ---

  function buildBoardFromState(state) {
    const myCells = {};
    const fleet = [];
    const shipsWithPositions = [];

    for (const ship of state.myShips || []) {
      const shipPositions = ship.positions.map((p) => ({ col: COLUMNS[p.row], row: p.col + 1 }));
      const shipCellKeys = shipPositions.map((p) => `${p.col}${p.row}`);
      fleet.push({ type: ship.type, name: getShipName(ship.type), size: shipPositions.length, sunk: ship.sunk });
      shipsWithPositions.push({ type: ship.type, positions: shipPositions, sunk: ship.sunk });
      for (const cellKey of shipCellKeys) {
        myCells[cellKey] = ship.sunk ? "sunk" : "ship";
      }
    }

    for (const shot of state.myShotsReceived || []) {
      const cellKey = apiToCell(shot.position.row, shot.position.col);
      if (shot.hit) {
        if (myCells[cellKey] !== "sunk") myCells[cellKey] = "hit";
      } else {
        myCells[cellKey] = "miss";
      }
    }

    setMyBoard(myCells);
    setMyFleet(fleet);
    setMyShips(shipsWithPositions);
    if (state.torpedoAvailable !== undefined) setTorpedoAvailable(state.torpedoAvailable);
    if (state.abilities) setAbilities(state.abilities);

    const enemyCells = {};
    for (const shot of state.myShotsMade || []) {
      const cellKey = apiToCell(shot.position.row, shot.position.col);
      enemyCells[cellKey] = shot.hit ? "hit" : "miss";
    }
    setEnemyBoard(enemyCells);
    setEnemyFleet([
      { type: "CARRIER", name: "Porta-aviões", size: 5, status: "unknown" },
      { type: "BATTLESHIP", name: "Navio-tanque", size: 4, status: "unknown" },
      { type: "CRUISER", name: "Cruzador", size: 3, status: "unknown" },
      { type: "SUBMARINE", name: "Submarino", size: 3, status: "unknown" },
      { type: "DESTROYER", name: "Destroyer", size: 2, status: "unknown" },
    ]);
  }

  // --- WebSocket event handlers ---

  function handleRoomEvent(event) {
    if (event.event === "PLAYER_LEFT" && event.userId !== user?.id) setOpponentLeft(true);
  }

  function handleGameEvent(event) {
    const { payload } = event;
    switch (event.event) {
      case "ATTACK_RESULT": handleAttackResult(payload); break;
      case "TURN_CHANGE": handleTurnChange(payload); break;
      case "TURN_TIMEOUT": setAttackingCell(null); break;
      case "SHIP_SUNK": handleShipSunk(payload); break;
      case "GAME_OVER": handleGameOver(payload); break;
      case "OPPONENT_DISCONNECTED":
        if (payload.disconnectedPlayerId !== user?.id) {
          setDisconnected(true);
          setReconnectTime(payload.reconnectTimeout || 30);
        }
        break;
      case "OPPONENT_RECONNECTED":
        setDisconnected(false);
        setReconnectTime(0);
        break;
      case "SHIELD_ACTIVATED": handleShieldActivated(payload); break;
      case "SHIELD_BLOCKED": handleShieldBlocked(payload); break;
      case "RADAR_USED": handleRadarUsed(payload); break;
      case "RADAR_RESULT": handleRadarResult(payload); break;
      case "EMP_ACTIVATED": handleEmpActivated(payload); break;
      default: break;
    }
  }

  function handleTurnChange(payload) {
    // If we receive a turn change, opponent is connected
    if (disconnected) {
      setDisconnected(false);
      setReconnectTime(0);
    }
    if (payload.nextTurn !== currentTurn) {
      setActiveTab(payload.nextTurn === user?.id ? "enemy" : "my");
    }
    setCurrentTurn(payload.nextTurn);
    setTimeLeft(payload.turnTimeout || 60);
    setAttackingCell(null);
    setTorpedoMode(false);
    setRadarMode(false);
    setRadarHoverCells([]);
    blockedCellRef.current = null;
    shieldBlockedThisTurnRef.current = false;

    if (payload.nextTurn === user?.id) {
      if (empJustAppliedRef.current) {
        empJustAppliedRef.current = false;
      } else {
        setAbilities((prev) => prev.empDisabledTurns > 0 ? { ...prev, empDisabledTurns: prev.empDisabledTurns - 1 } : prev);
      }
    }
  }

  function handleAttackResult(payload) {
    const { attackerId, cell, hit } = payload;
    const { col, row } = parseCellNotation(cell);
    const cellKey = `${col}${row}`;

    // If opponent is attacking, they are clearly connected — clear disconnect overlay
    if (attackerId !== user?.id && disconnected) {
      setDisconnected(false);
      setReconnectTime(0);
    }

    if (blockedCellRef.current === cellKey || shieldBlockedThisTurnRef.current) {
      blockedCellRef.current = null;
      return;
    }

    if (attackerId === user?.id) {
      // Own attack — find targeting animation already running on enemy board
      const existingAnim = shotAnimationsRef.current.find(
        (a) => a.board === "enemy" && (a.phase === "targeting" || a.phase === "shot"),
      );
      if (existingAnim) {
        // Store result to reveal AFTER animation completes
        pendingResultsRef.current.push({ animId: existingAnim.id, attackerId, col, row, hit });
      } else {
        // No animation (edge case) — reveal immediately
        revealAttackResult({ attackerId, col, row, hit });
      }
    } else {
      // Received attack — start animation on my board, reveal after
      const animId = startShotAnimation(col, row, "my");
      pendingResultsRef.current.push({ animId, attackerId, col, row, hit });
    }
  }

  function handleShipSunk(payload) {
    const { ownerId } = payload;
    const board = ownerId === user?.id ? "my" : "enemy";

    // Find any active animation on this board
    const activeAnim = shotAnimationsRef.current.find(
      (a) => a.board === board && (a.phase === "targeting" || a.phase === "shot"),
    );

    if (activeAnim) {
      // Wait for animation to complete before showing explosion
      pendingShipSunkRef.current.push({ animId: activeAnim.id, payload });
    } else {
      executeShipSunk(payload);
    }
  }

  function executeShipSunk(payload) {
    const { ownerId, shipType, positions } = payload;
    const parsedPositions = positions.map((c) => parseCellNotation(c));
    const colIndices = parsedPositions.map((p) => COLUMNS.indexOf(p.col));
    const rowIndices = parsedPositions.map((p) => p.row - 1);
    const minCol = Math.min(...colIndices);
    const minRow = Math.min(...rowIndices);
    const maxCol = Math.max(...colIndices);
    const maxRow = Math.max(...rowIndices);

    const explosionId = `${shipType}-${Date.now()}`;
    setExplosions((prev) => [...prev, {
      id: explosionId,
      x: minCol * CELL_SIZE,
      y: minRow * CELL_SIZE,
      width: (maxCol - minCol + 1) * CELL_SIZE,
      height: (maxRow - minRow + 1) * CELL_SIZE,
      board: ownerId === user?.id ? "my" : "enemy",
    }]);

    if (ownerId === user?.id) {
      setMyFleet((prev) => prev.map((s) => s.type === shipType ? { ...s, sunk: true } : s));
      setMyShips((prev) => prev.map((s) => s.type === shipType ? { ...s, sunk: true } : s));
      const sunkCells = {};
      for (const c of positions) { const { col, row } = parseCellNotation(c); sunkCells[`${col}${row}`] = "sunk"; }
      setMyBoard((prev) => ({ ...prev, ...sunkCells }));
    } else {
      const sunkPositions = positions.map((c) => parseCellNotation(c));
      setEnemyFleet((prev) => prev.map((s) => s.type === shipType ? { ...s, status: "sunk" } : s));
      setEnemySunkShips((prev) => [...prev, { type: shipType, positions: sunkPositions, sunk: true }]);
      const sunkCells = {};
      for (const c of positions) { const { col, row } = parseCellNotation(c); sunkCells[`${col}${row}`] = "sunk"; }
      setEnemyBoard((prev) => ({ ...prev, ...sunkCells }));
    }
  }

  function handleGameOver(payload) {
    if (payload.reason === "OPPONENT_DISCONNECTED" && payload.winnerId === user?.id) {
      setOpponentLeft(true);
      return;
    }
    sessionStorage.removeItem("gameId");
    sessionStorage.removeItem("roomId");
    sessionStorage.removeItem("opponentNickname");
    sessionStorage.removeItem("gameMode");
    subscriptionsRef.current.forEach((sub) => sub?.unsubscribe());
    subscriptionsRef.current = [];
    navigate("/game/result", { state: { gameId, winnerId: payload.winnerId }, replace: true });
  }

  // --- Tactical ability handlers ---

  function handleShieldActivated(payload) {
    if (payload.playerId === user?.id) {
      setAbilities((prev) => ({ ...prev, shieldActive: true, shieldCharges: payload.remainingCharges }));
    }
  }

  function handleShieldBlocked(payload) {
    const { col, row } = parseCellNotation(payload.cell);
    const cellKey = `${col}${row}`;
    blockedCellRef.current = cellKey;
    shieldBlockedThisTurnRef.current = true;

    // Cancel any pending shot animation for this cell
    shotAnimationsRef.current = shotAnimationsRef.current.filter((a) => !(a.col === col && a.row === row));
    setShotAnimations((prev) => prev.filter((a) => !(a.col === col && a.row === row)));
    pendingResultsRef.current = pendingResultsRef.current.filter((p) => !(p.col === col && p.row === row));

    if (payload.defenderId === user?.id) {
      setMyBoard((prev) => {
        const cellState = prev[cellKey];
        if (cellState === "miss" || cellState === "hit") {
          const updated = { ...prev };
          const hasShip = myShipsRef.current.some((ship) => ship.positions.some((p) => `${p.col}${p.row}` === cellKey));
          updated[cellKey] = hasShip ? "ship" : undefined;
          if (!hasShip) delete updated[cellKey];
          return updated;
        }
        return prev;
      });
      setAbilities((prev) => ({ ...prev, shieldActive: false }));
      addToast("SEU ESCUDO BLOQUEOU O ATAQUE!", <Shield size={16} />, "blue");
    } else {
      setEnemyBoard((prev) => {
        const cellState = prev[cellKey];
        if (cellState === "miss" || cellState === "hit") { const updated = { ...prev }; delete updated[cellKey]; return updated; }
        return prev;
      });
      setAttackingCell(null);
      addToast("ESCUDO INIMIGO BLOQUEOU SEU TIRO!", <Shield size={16} />, "blue");
    }
  }

  function handleRadarUsed(payload) {
    if (payload.playerId === user?.id) { setAbilities((prev) => ({ ...prev, radarAvailable: false })); setRadarMode(false); setRadarHoverCells([]); }
    else { addToast("OPONENTE USOU RADAR", <Radar size={16} />, "green"); }
  }

  function handleRadarResult(payload) {
    if (payload.revealedCells && payload.revealedCells.length > 0) {
      const radarCells = {};
      for (const c of payload.revealedCells) { const { col, row } = parseCellNotation(c); radarCells[`${col}${row}`] = "radar"; }
      setEnemyBoard((prev) => ({ ...prev, ...radarCells }));
      addToast("RADAR: NAVIO(S) DETECTADO(S)", <Radar size={16} />, "green");
    } else {
      addToast("RADAR: NENHUM NAVIO NA ÁREA", <Radar size={16} />, "green");
    }
  }

  function handleEmpActivated(payload) {
    if (payload.targetId === user?.id) {
      empJustAppliedRef.current = true;
      setAbilities((prev) => ({ ...prev, empDisabledTurns: payload.disabledTurns }));
      addToast("EMP: HABILIDADES DESATIVADAS", <Zap size={16} />, "yellow");
    } else {
      setAbilities((prev) => ({ ...prev, empNavalAvailable: false }));
      addToast("EMP ATIVADO NO OPONENTE", <Zap size={16} />, "yellow");
    }
  }

  // --- Cell interaction handlers ---

  function handleCellClick(col, row) {
    if (!isMyTurn || attackingCell) return;
    const cellKey = `${col}${row}`;

    if (radarMode) {
      ws.publish(`/app/game/${gameId}/ability`, { ability: "RADAR", cell: boardClickToCell(col, row) });
      setAttackingCell(cellKey);
      setRadarMode(false);
      setRadarHoverCells([]);
      return;
    }

    if (enemyBoard[cellKey] && enemyBoard[cellKey] !== "radar") return;

    setAttackingCell(cellKey);
    // Start targeting animation on enemy board BEFORE sending the attack
    startShotAnimation(col, row, "enemy");

    const payload = { cell: boardClickToCell(col, row) };
    if (torpedoMode) { payload.type = "TORPEDO"; setTorpedoAvailable(false); setTorpedoMode(false); }
    ws.publish(`/app/game/${gameId}/attack`, payload);
  }

  function handleCellHover(col, row) { if (radarMode) setRadarHoverCells(getRadarCells(col, row)); }
  function handleCellLeave() { if (radarMode) setRadarHoverCells([]); }

  function handleUseAbility(ability) {
    if (!isMyTurn || abilities.empDisabledTurns > 0) return;
    switch (ability) {
      case "SHIELD":
        ws.publish(`/app/game/${gameId}/ability`, { ability: "SHIELD" });
        setAbilities((prev) => ({ ...prev, shieldActive: true, shieldCharges: prev.shieldCharges - 1 }));
        addToast("ESCUDO ATIVADO", <Shield size={16} />, "blue");
        break;
      case "EMP_NAVAL":
        ws.publish(`/app/game/${gameId}/ability`, { ability: "EMP_NAVAL" });
        setAbilities((prev) => ({ ...prev, empNavalAvailable: false }));
        setAttackingCell("emp");
        break;
      default: break;
    }
  }

  async function handleLeaveRoom() {
    if (!roomId) return;
    setLeaving(true);
    try {
      await api.delete(`/rooms/${roomId}`);
      sessionStorage.removeItem("gameId");
      sessionStorage.removeItem("roomId");
      sessionStorage.removeItem("gameMode");
      sessionStorage.removeItem("opponentNickname");
      navigate("/", { replace: true });
    } catch (err) { setLeaving(false); }
  }

  function handleToggleTorpedo() { if (torpedoAvailable) { setTorpedoMode((m) => !m); setRadarMode(false); setRadarHoverCells([]); } }
  function handleToggleRadar() { if (abilities.radarAvailable) { setRadarMode((m) => !m); setTorpedoMode(false); if (!radarMode) setRadarHoverCells([]); } }

  if (loading) return <Spinner message="Carregando batalha..." />;

  const timerFormatted = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;


  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <Helmet><title>Batalha - Naval Rivals</title></Helmet>
      <BattleToast toasts={toasts} onDismiss={dismissToast} />

      {disconnected && (
        <ModalInfo icon={<WifiOff className="w-12 h-12 text-red-400" />} title="Oponente desconectou" description="Aguardando reconexão...">
          <span className="font-anybody font-bold text-3xl text-orange-400">{reconnectTime}s</span>
        </ModalInfo>
      )}

      {showLeaveModal && (
        <ModalConfirmation title="Sair da Partida" description="Tem certeza que deseja sair? Isso contará como derrota." confirmText={leaving ? "Saindo..." : "Sair"} cancelText="Continuar" variant="danger" handleConfirm={handleLeaveRoom} handleCancel={() => setShowLeaveModal(false)} />
      )}

      {opponentLeft && (
        <ModalInfo icon={<UserRoundX className="w-12 h-12 text-red-400" />} title="Oponente saiu da partida" description="O oponente abandonou a batalha. Você venceu!">
          <Button variant="primary" className="mt-2 flex items-center justify-center gap-2" onClick={() => {
            sessionStorage.removeItem("gameId"); sessionStorage.removeItem("roomId"); sessionStorage.removeItem("opponentNickname"); sessionStorage.removeItem("gameMode");
            subscriptionsRef.current.forEach((sub) => sub?.unsubscribe()); subscriptionsRef.current = [];
            navigate("/game/result", { state: { gameId, winnerId: user?.id }, replace: true });
          }}>OK</Button>
        </ModalInfo>
      )}

      <Header minimal />
      <LayoutPage interClassName="p-4 pb-8">
        <div className="flex flex-col items-center gap-1 w-full">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest">
            {isTactical ? "Batalha Tática" : "Batalha"}
          </span>
        </div>

        {/* Players */}
        <Card className="flex items-center justify-between w-full max-w-4xl p-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
              <CircleUserRound size={18} className="text-blue-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-semibold text-xs text-white">{user?.nickname}</span>
              <div className="flex items-center gap-1">
                <span className="font-poppins text-[10px] text-white/40">Você</span>
                {isTactical && abilities.shieldActive && <Shield size={10} className="text-blue-400 animate-pulse" />}
              </div>
            </div>
          </div>
          <span className="font-anybody font-extrabold text-lg text-white/30">VS</span>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="font-poppins font-semibold text-xs text-white">{opponentNickname}</span>
              <span className="font-poppins text-[10px] text-white/40">Oponente</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-dark-900 border-2 border-orange-300 flex items-center justify-center">
              <CircleUserRound size={18} className="text-orange-300" />
            </div>
          </div>
        </Card>

        {/* Turn + Timer */}
        <Card className={`flex items-center justify-between w-full max-w-4xl p-4 ${isMyTurn ? "border-orange-400!" : "border-blue-300/30!"}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMyTurn ? "bg-orange-500/20 border border-orange-400/50 animate-pulse" : "bg-blue-300/10 border border-blue-300/30"}`}>
              <Flame size={16} className={isMyTurn ? "text-orange-400" : "text-blue-300/50"} />
            </div>
            <div className="flex flex-col">
              <span className={`font-poppins font-semibold text-sm ${isMyTurn ? "text-orange-300" : "text-blue-300/70"}`}>
                {isMyTurn ? "SUA VEZ DE ATACAR!" : "VEZ DO OPONENTE..."}
              </span>
              {isTactical && abilities.empDisabledTurns > 0 && (
                <span className="font-poppins text-[10px] text-yellow-400">⚡ EMP: {abilities.empDisabledTurns} turno(s)</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-dark-900 border border-blue-300/30">
            <Clock size={14} className="text-blue-300" />
            <span className={`font-anybody font-bold text-lg ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}>{timerFormatted}</span>
          </div>
        </Card>

        {isTactical && (
          <AbilityPanel abilities={abilities} isMyTurn={isMyTurn} onUseAbility={handleUseAbility} torpedoAvailable={torpedoAvailable} torpedoMode={torpedoMode} onToggleTorpedo={handleToggleTorpedo} radarMode={radarMode} onToggleRadar={handleToggleRadar} disabled={!!attackingCell} />
        )}

        {/* Boards */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
          {/* Enemy Board */}
          <Card className="flex flex-col gap-3 w-full md:flex-1 md:order-2 p-4 relative">
            <span className="font-poppins font-semibold text-xs text-orange-300 uppercase tracking-widest text-center">Tabuleiro Inimigo</span>
            {!isMyTurn && !hasEnemyBoardAnimation && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-orange-400/20 bg-blue-dark-900/70 backdrop-blur-md px-8 py-6">
                  <Loader2 size={34} className="text-orange-300 animate-spin" strokeWidth={2.5} />
                  <span className="font-anybody text-xl font-bold text-orange-300 animate-pulse">Aguardando oponente</span>
                </div>
              </div>
            )}
            <div className="relative">
              <GameBoard
                cells={enemyBoard}
                ships={enemySunkShips}
                onCellClick={isMyTurn ? handleCellClick : undefined}
                onCellHover={radarMode && isMyTurn ? handleCellHover : undefined}
                onCellLeave={radarMode ? handleCellLeave : undefined}
                hoverCells={radarHoverCells}
                targetingCell={getTargetingCell("enemy")}
                className={`${!isMyTurn && !hasEnemyBoardAnimation ? "blur-xs" : ""}`}
              >
                {getShotEffects("enemy").map((anim) => (
                  <ShotEffect key={anim.id} x={COLUMNS.indexOf(anim.col) * CELL_SIZE} y={(anim.row - 1) * CELL_SIZE} onComplete={() => completeShotAnimation(anim.id)} />
                ))}
                {explosions.filter((e) => e.board === "enemy").map((exp) => (
                  <ExplosionEffect key={exp.id} x={exp.x} y={exp.y} width={exp.width} height={exp.height} onComplete={() => setExplosions((prev) => prev.filter((e) => e.id !== exp.id))} />
                ))}
              </GameBoard>
            </div>
          </Card>

          {/* My Board */}
          <Card className="flex flex-col gap-3 w-full md:flex-1 p-4">
            <span className="font-poppins font-semibold text-xs text-blue-300 uppercase tracking-widest text-center">Seu Tabuleiro</span>
            <div className="relative">
              <GameBoard cells={myBoard} ships={myShips} targetingCell={getTargetingCell("my")}>
                {getShotEffects("my").map((anim) => (
                  <ShotEffect key={anim.id} x={COLUMNS.indexOf(anim.col) * CELL_SIZE} y={(anim.row - 1) * CELL_SIZE} onComplete={() => completeShotAnimation(anim.id)} />
                ))}
                {explosions.filter((e) => e.board === "my").map((exp) => (
                  <ExplosionEffect key={exp.id} x={exp.x} y={exp.y} width={exp.width} height={exp.height} onComplete={() => setExplosions((prev) => prev.filter((e) => e.id !== exp.id))} />
                ))}
              </GameBoard>
            </div>
          </Card>
        </div>

        {/* Fleet Status */}
        <Card className="flex flex-col gap-3 w-full max-w-4xl p-4">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">Sua Frota</span>
          <div className="flex flex-wrap justify-center gap-2">
            {myFleet.map((ship) => <ShipStatusCard key={ship.type} ship={ship} />)}
          </div>
        </Card>

        <Card className="flex flex-col gap-3 w-full max-w-4xl p-4">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">Frota Inimiga</span>
          <div className="flex flex-wrap justify-center gap-2">
            {enemyFleet.map((ship) => <ShipStatusCard key={ship.type} ship={ship} isEnemy />)}
          </div>
        </Card>

        {roomId && (
          <button type="button" onClick={() => setShowLeaveModal(true)} className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all font-poppins text-xs font-medium cursor-pointer">
            <LogOut size={14} /> Sair da Partida
          </button>
        )}
      </LayoutPage>
    </div>
  );
}

export default GamePage;
