import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import ModalInfo from "../components/ui/ModalInfo";
import GameBoard from "../components/game/GameBoard";
import ExplosionEffect from "../components/game/ExplosionEffect";
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
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { ws } from "../services/websocket";
import { Helmet } from "react-helmet-async";
import Spinner from "../components/ui/Spinner";

const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

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
  const subscriptionRef = useRef(null);
  const timerRef = useRef(null);
  const blockedCellRef = useRef(null); // tracks cell blocked by shield (stores cellKey)
  const shieldBlockedThisTurnRef = useRef(false); // flag to track if shield blocked in current turn
  const empJustAppliedRef = useRef(false); // prevents decrement on the same turn EMP is applied

  const gameId = location.state?.gameId || sessionStorage.getItem("gameId");
  const initialFirstTurn = location.state?.firstTurn;
  const gameMode =
    location.state?.gameMode || sessionStorage.getItem("gameMode") || "CLASSIC";

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

  const isMyTurn = currentTurn === user?.id;
  const isTactical = gameMode === "TACTICAL";

  // Keep ref in sync for use in WebSocket callbacks (avoids stale closure)
  myShipsRef.current = myShips;

  let toastIdCounter = useRef(0);

  function addToast(message, icon, color) {
    const id = `toast-${Date.now()}-${toastIdCounter.current++}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, icon, color }]);
  }

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch game state and connect WebSocket
  useEffect(() => {
    if (!gameId) {
      navigate("/", { replace: true });
      return;
    }

    sessionStorage.setItem("gameId", gameId);
    sessionStorage.setItem("gameMode", gameMode);
    if (location.state?.opponentNickname) {
      sessionStorage.setItem(
        "opponentNickname",
        location.state.opponentNickname,
      );
    }

    function handleBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    async function init() {
      try {
        const state = await api.get(`/games/${gameId}/state`);
        buildBoardFromState(state);
        if (state.currentTurn) {
          setCurrentTurn(state.currentTurn);
        }
      } catch (err) {
        console.error("Failed to load game state:", err);
      } finally {
        setLoading(false);
      }

      ws.connect({
        onConnect: () => {
          ws.publish(`/app/game/${gameId}/register`);
          subscriptionRef.current = ws.subscribe(
            `/topic/game/${gameId}/events`,
            handleGameEvent,
          );
          // Subscribe to private events (e.g., RADAR_RESULT)
          ws.subscribe(`/user/topic/game/${gameId}/events`, handleGameEvent);
        },
      });
    }

    init();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      ws.disconnect();
    };
  }, [gameId]);

  // Timer countdown
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (loading || disconnected) return;

    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentTurn, loading, disconnected]);

  // Reconnect countdown
  useEffect(() => {
    if (!disconnected || reconnectTime <= 0) return;

    const interval = setInterval(() => {
      setReconnectTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [disconnected, reconnectTime]);

  function buildBoardFromState(state) {
    const myCells = {};
    const fleet = [];
    const shipsWithPositions = [];

    for (const ship of state.myShips || []) {
      const shipPositions = ship.positions.map((p) => ({
        col: COLUMNS[p.row],
        row: p.col + 1,
      }));
      const shipCellKeys = shipPositions.map((p) => `${p.col}${p.row}`);

      fleet.push({
        type: ship.type,
        name: getShipName(ship.type),
        size: shipPositions.length,
        sunk: ship.sunk,
      });

      shipsWithPositions.push({
        type: ship.type,
        positions: shipPositions,
        sunk: ship.sunk,
      });

      for (const cellKey of shipCellKeys) {
        myCells[cellKey] = ship.sunk ? "sunk" : "ship";
      }
    }

    for (const shot of state.myShotsReceived || []) {
      const cellKey = apiToCell(shot.position.row, shot.position.col);
      if (shot.hit) {
        const shipAtCell = myCells[cellKey];
        if (shipAtCell !== "sunk") {
          myCells[cellKey] = "hit";
        }
      } else {
        myCells[cellKey] = "miss";
      }
    }

    setMyBoard(myCells);
    setMyFleet(fleet);
    setMyShips(shipsWithPositions);

    if (state.torpedoAvailable !== undefined) {
      setTorpedoAvailable(state.torpedoAvailable);
    }

    // Load tactical abilities
    if (state.abilities) {
      setAbilities(state.abilities);
    }

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

  function handleGameEvent(event) {
    const { payload } = event;
    console.log("[GameEvent]", event.event, payload);

    switch (event.event) {
      case "ATTACK_RESULT":
        handleAttackResult(payload);
        break;
      case "TURN_CHANGE":
        handleTurnChange(payload);
        break;
      case "TURN_TIMEOUT":
        setAttackingCell(null);
        break;
      case "SHIP_SUNK":
        handleShipSunk(payload);
        break;
      case "GAME_OVER":
        handleGameOver(payload);
        break;
      case "OPPONENT_DISCONNECTED":
        setDisconnected(true);
        setReconnectTime(payload.reconnectTimeout || 30);
        break;
      case "OPPONENT_RECONNECTED":
        setDisconnected(false);
        setReconnectTime(0);
        break;
      // Tactical events
      case "SHIELD_ACTIVATED":
        handleShieldActivated(payload);
        break;
      case "SHIELD_BLOCKED":
        handleShieldBlocked(payload);
        break;
      case "RADAR_USED":
        handleRadarUsed(payload);
        break;
      case "RADAR_RESULT":
        handleRadarResult(payload);
        break;
      case "EMP_ACTIVATED":
        handleEmpActivated(payload);
        break;
      default:
        break;
    }
  }

  function handleTurnChange(payload) {
    if (payload.nextTurn !== currentTurn) {
      if (payload.nextTurn === user?.id) {
        setActiveTab("enemy");
      } else {
        setActiveTab("my");
      }
    }
    setCurrentTurn(payload.nextTurn);
    setTimeLeft(payload.turnTimeout || 60);
    setAttackingCell(null);
    setTorpedoMode(false);
    setRadarMode(false);
    setRadarHoverCells([]);
    blockedCellRef.current = null;
    shieldBlockedThisTurnRef.current = false;

    // Decrement EMP if it's now my turn and I'm affected
    if (payload.nextTurn === user?.id) {
      if (empJustAppliedRef.current) {
        // Skip decrement on the turn EMP was just applied (this is the first affected turn)
        empJustAppliedRef.current = false;
      } else {
        setAbilities((prev) => {
          if (prev.empDisabledTurns > 0) {
            return { ...prev, empDisabledTurns: prev.empDisabledTurns - 1 };
          }
          return prev;
        });
      }
    }
  }

  function handleAttackResult(payload) {
    const { attackerId, cell, hit } = payload;
    const { col, row } = parseCellNotation(cell);
    const cellKey = `${col}${row}`;

    // If this cell was blocked by shield, ignore the ATTACK_RESULT
    if (blockedCellRef.current === cellKey || shieldBlockedThisTurnRef.current) {
      console.log("[Shield] ATTACK_RESULT ignored (shield blocked)", cellKey);
      blockedCellRef.current = null;
      return;
    }

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

  function handleShipSunk(payload) {
    const { ownerId, shipType, positions } = payload;

    const parsedPositions = positions.map((cellNotation) =>
      parseCellNotation(cellNotation),
    );
    const colIndices = parsedPositions.map((p) => COLUMNS.indexOf(p.col));
    const rowIndices = parsedPositions.map((p) => p.row - 1);
    const minCol = Math.min(...colIndices);
    const minRow = Math.min(...rowIndices);
    const maxCol = Math.max(...colIndices);
    const maxRow = Math.max(...rowIndices);
    const cellSize = 33;

    const explosionId = `${shipType}-${Date.now()}`;
    const explosion = {
      id: explosionId,
      x: minCol * cellSize,
      y: minRow * cellSize,
      width: (maxCol - minCol + 1) * cellSize,
      height: (maxRow - minRow + 1) * cellSize,
      board: ownerId === user?.id ? "my" : "enemy",
    };
    setExplosions((prev) => [...prev, explosion]);

    if (ownerId === user?.id) {
      setMyFleet((prev) =>
        prev.map((s) => (s.type === shipType ? { ...s, sunk: true } : s)),
      );
      setMyShips((prev) =>
        prev.map((s) => (s.type === shipType ? { ...s, sunk: true } : s)),
      );
      const sunkCells = {};
      for (const cellNotation of positions) {
        const { col, row } = parseCellNotation(cellNotation);
        sunkCells[`${col}${row}`] = "sunk";
      }
      setMyBoard((prev) => ({ ...prev, ...sunkCells }));
    } else {
      const sunkPositions = positions.map((cellNotation) => {
        const { col, row } = parseCellNotation(cellNotation);
        return { col, row };
      });

      setEnemyFleet((prev) =>
        prev.map((s) => (s.type === shipType ? { ...s, status: "sunk" } : s)),
      );
      setEnemySunkShips((prev) => [
        ...prev,
        { type: shipType, positions: sunkPositions, sunk: true },
      ]);
      const sunkCells = {};
      for (const cellNotation of positions) {
        const { col, row } = parseCellNotation(cellNotation);
        sunkCells[`${col}${row}`] = "sunk";
      }
      setEnemyBoard((prev) => ({ ...prev, ...sunkCells }));
    }
  }

  function handleGameOver(payload) {
    sessionStorage.removeItem("gameId");
    sessionStorage.removeItem("opponentNickname");
    sessionStorage.removeItem("gameMode");
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    ws.disconnect();
    navigate("/game/result", {
      state: { gameId, winnerId: payload.winnerId },
      replace: true,
    });
  }

  // --- Tactical ability handlers ---

  function handleShieldActivated(payload) {
    if (payload.playerId === user?.id) {
      // Sincroniza com o servidor (o toast já foi exibido no optimistic update)
      setAbilities((prev) => ({
        ...prev,
        shieldActive: true,
        shieldCharges: payload.remainingCharges,
      }));
    }
    // Se do oponente, não mostrar nada — o jogador não deve saber
  }

  function handleShieldBlocked(payload) {
    console.log("[Shield] SHIELD_BLOCKED received", payload);
    const { col, row } = parseCellNotation(payload.cell);
    const cellKey = `${col}${row}`;

    // Mark cell as blocked so ATTACK_RESULT (if it arrives later) will be ignored
    blockedCellRef.current = cellKey;
    shieldBlockedThisTurnRef.current = true;

    if (payload.defenderId === user?.id) {
      // My shield blocked opponent's attack — revert any miss/hit mark on my board
      setMyBoard((prev) => {
        const cellState = prev[cellKey];
        if (cellState === "miss" || cellState === "hit") {
          const updated = { ...prev };
          // Check if there's a ship at this cell to restore it
          const hasShip = myShipsRef.current.some((ship) =>
            ship.positions.some((p) => `${p.col}${p.row}` === cellKey),
          );
          if (hasShip) {
            updated[cellKey] = "ship";
          } else {
            delete updated[cellKey];
          }
          return updated;
        }
        return prev;
      });
      setAbilities((prev) => ({ ...prev, shieldActive: false }));
      addToast("SEU ESCUDO BLOQUEOU O ATAQUE!", <Shield size={16} />, "blue");
    } else {
      // My shot was blocked by opponent's shield — revert miss mark on enemy board
      setEnemyBoard((prev) => {
        const cellState = prev[cellKey];
        if (cellState === "miss" || cellState === "hit") {
          const updated = { ...prev };
          delete updated[cellKey];
          return updated;
        }
        return prev;
      });
      setAttackingCell(null);
      addToast(
        "ESCUDO INIMIGO BLOQUEOU SEU TIRO!",
        <Shield size={16} />,
        "blue",
      );
    }
  }

  function handleRadarUsed(payload) {
    if (payload.playerId === user?.id) {
      // Own radar usage acknowledged - mark ability as used, clear radar mode
      setAbilities((prev) => ({ ...prev, radarAvailable: false }));
      setRadarMode(false);
      setRadarHoverCells([]);
    } else {
      // Opponent used radar - notify
      addToast("OPONENTE USOU RADAR", <Radar size={16} />, "green");
    }
  }

  function handleRadarResult(payload) {
    // Private event: only the radar user receives this with revealed cells
    if (payload.revealedCells && payload.revealedCells.length > 0) {
      const radarCells = {};
      for (const cellNotation of payload.revealedCells) {
        const { col, row } = parseCellNotation(cellNotation);
        const cellKey = `${col}${row}`;
        radarCells[cellKey] = "radar";
      }
      setEnemyBoard((prev) => ({ ...prev, ...radarCells }));
      addToast("RADAR: NAVIO(S) DETECTADO(S)", <Radar size={16} />, "green");
    } else {
      addToast("RADAR: NENHUM NAVIO NA ÁREA", <Radar size={16} />, "green");
    }
  }

  function handleEmpActivated(payload) {
    if (payload.targetId === user?.id) {
      empJustAppliedRef.current = true;
      setAbilities((prev) => ({
        ...prev,
        empDisabledTurns: payload.disabledTurns,
      }));
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

    // Radar mode: send radar ability
    if (radarMode) {
      const cell = boardClickToCell(col, row);
      ws.publish(`/app/game/${gameId}/ability`, { ability: "RADAR", cell });
      setAttackingCell(cellKey);
      setRadarMode(false);
      setRadarHoverCells([]);
      return;
    }

    // Don't attack cells already attacked
    if (enemyBoard[cellKey] && enemyBoard[cellKey] !== "radar") return;

    const cell = boardClickToCell(col, row);
    setAttackingCell(cellKey);

    const payload = { cell };
    if (torpedoMode) {
      payload.type = "TORPEDO";
      setTorpedoAvailable(false);
      setTorpedoMode(false);
    }

    ws.publish(`/app/game/${gameId}/attack`, payload);
  }

  function handleCellHover(col, row) {
    if (!radarMode) return;
    const cells = getRadarCells(col, row);
    setRadarHoverCells(cells);
  }

  function handleCellLeave() {
    if (radarMode) {
      setRadarHoverCells([]);
    }
  }

  // --- Ability usage ---

  function handleUseAbility(ability) {
    if (!isMyTurn || abilities.empDisabledTurns > 0) return;

    switch (ability) {
      case "SHIELD":
        ws.publish(`/app/game/${gameId}/ability`, { ability: "SHIELD" });
        // Optimistic update
        setAbilities((prev) => ({
          ...prev,
          shieldActive: true,
          shieldCharges: prev.shieldCharges - 1,
        }));
        addToast("ESCUDO ATIVADO", <Shield size={16} />, "blue");
        break;
      case "EMP_NAVAL":
        ws.publish(`/app/game/${gameId}/ability`, { ability: "EMP_NAVAL" });
        setAbilities((prev) => ({ ...prev, empNavalAvailable: false }));
        setAttackingCell("emp"); // Mark as action taken this turn
        break;
      default:
        break;
    }
  }

  function handleToggleTorpedo() {
    if (torpedoAvailable) {
      setTorpedoMode((m) => !m);
      setRadarMode(false);
      setRadarHoverCells([]);
    }
  }

  function handleToggleRadar() {
    if (abilities.radarAvailable) {
      setRadarMode((m) => !m);
      setTorpedoMode(false);
      if (!radarMode) {
        setRadarHoverCells([]);
      }
    }
  }

  if (loading) {
    return <Spinner message="Carregando batalha..." />;
  }

  const timerFormatted = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <Helmet>
        <title>Batalha - Naval Rivals</title>
      </Helmet>
      {/* Battle Toasts */}
      <BattleToast toasts={toasts} onDismiss={dismissToast} />

      {/* Disconnect overlay */}
      {disconnected && (
        <ModalInfo
          icon={<WifiOff className="w-12 h-12 text-red-400" />}
          title="Oponente desconectou"
          description="Aguardando reconexão..."
        >
          <span className="font-anybody font-bold text-3xl text-orange-400">
            {reconnectTime}s
          </span>
        </ModalInfo>
      )}

      <Header minimal />
      <LayoutPage interClassName="p-4 pb-8">
        {/* Title */}
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
              <span className="font-poppins font-semibold text-xs text-white">
                {user?.nickname}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-poppins text-[10px] text-white/40">
                  Você
                </span>
                {isTactical && abilities.shieldActive && (
                  <Shield size={10} className="text-blue-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <span className="font-anybody font-extrabold text-lg text-white/30">
            VS
          </span>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="font-poppins font-semibold text-xs text-white">
                {opponentNickname}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-poppins text-[10px] text-white/40">
                  Oponente
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-dark-900 border-2 border-orange-300 flex items-center justify-center">
              <CircleUserRound size={18} className="text-orange-300" />
            </div>
          </div>
        </Card>

        {/* Turn + Timer */}
        <Card
          className={`flex items-center justify-between w-full max-w-4xl p-4 ${
            isMyTurn ? "border-orange-400!" : "border-blue-300/30!"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isMyTurn
                  ? "bg-orange-500/20 border border-orange-400/50 animate-pulse"
                  : "bg-blue-300/10 border border-blue-300/30"
              }`}
            >
              <Flame
                size={16}
                className={isMyTurn ? "text-orange-400" : "text-blue-300/50"}
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-poppins font-semibold text-sm ${isMyTurn ? "text-orange-300" : "text-blue-300/70"}`}
              >
                {isMyTurn ? "SUA VEZ DE ATACAR!" : "VEZ DO OPONENTE..."}
              </span>
              {isTactical && abilities.empDisabledTurns > 0 && (
                <span className="font-poppins text-[10px] text-yellow-400">
                  ⚡ EMP: {abilities.empDisabledTurns} turno(s)
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-dark-900 border border-blue-300/30">
            <Clock size={14} className="text-blue-300" />
            <span
              className={`font-anybody font-bold text-lg ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}
            >
              {timerFormatted}
            </span>
          </div>
        </Card>

        {/* Ability Panel (Tactical mode only) */}
        {isTactical && (
          <AbilityPanel
            abilities={abilities}
            isMyTurn={isMyTurn}
            onUseAbility={handleUseAbility}
            torpedoAvailable={torpedoAvailable}
            torpedoMode={torpedoMode}
            onToggleTorpedo={handleToggleTorpedo}
            radarMode={radarMode}
            onToggleRadar={handleToggleRadar}
            disabled={!!attackingCell}
          />
        )}

        {/* Mobile toggle */}
        <div className="flex md:hidden w-full max-w-4xl">
          <button
            onClick={() => setActiveTab("enemy")}
            className={`flex-1 py-2.5 font-poppins font-semibold text-sm text-center rounded-l-lg border-2 transition-colors cursor-pointer ${
              activeTab === "enemy"
                ? "bg-orange-500/20 border-orange-400 text-orange-300"
                : "bg-blue-dark-900/60 border-white/20 text-white/50"
            }`}
          >
            TABULEIRO INIMIGO
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 py-2.5 font-poppins font-semibold text-sm text-center rounded-r-lg border-2 border-l-0 transition-colors cursor-pointer ${
              activeTab === "my"
                ? "bg-blue-300/20 border-blue-300 text-blue-300"
                : "bg-blue-dark-900/60 border-white/20 text-white/50"
            }`}
          >
            SEU TABULEIRO
          </button>
        </div>

        {/* Boards */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
          {/* My Board */}
          <Card
            className={`flex flex-col gap-3 w-full md:flex-1 p-4 ${
              activeTab !== "my" ? "hidden md:flex" : "flex"
            }`}
          >
            <span className="font-poppins font-semibold text-xs text-blue-300 uppercase tracking-widest text-center hidden md:block">
              Seu Tabuleiro
            </span>
            <div className="relative">
              <GameBoard cells={myBoard} ships={myShips}>
                {explosions
                  .filter((e) => e.board === "my")
                  .map((exp) => (
                    <ExplosionEffect
                      key={exp.id}
                      x={exp.x}
                      y={exp.y}
                      width={exp.width}
                      height={exp.height}
                      onComplete={() =>
                        setExplosions((prev) =>
                          prev.filter((e) => e.id !== exp.id),
                        )
                      }
                    />
                  ))}
              </GameBoard>
            </div>
          </Card>

          {/* Enemy Board */}
          <Card
            className={`flex flex-col gap-3 w-full md:flex-1 p-4 ${
              activeTab !== "enemy" ? "hidden md:flex" : "flex"
            }`}
          >
            <span className="font-poppins font-semibold text-xs text-orange-300 uppercase tracking-widest text-center hidden md:block">
              Tabuleiro Inimigo
            </span>
            <div className="relative">
              <GameBoard
                cells={enemyBoard}
                ships={enemySunkShips}
                onCellClick={isMyTurn ? handleCellClick : undefined}
                onCellHover={
                  radarMode && isMyTurn ? handleCellHover : undefined
                }
                onCellLeave={radarMode ? handleCellLeave : undefined}
                hoverCells={radarHoverCells}
              >
                {explosions
                  .filter((e) => e.board === "enemy")
                  .map((exp) => (
                    <ExplosionEffect
                      key={exp.id}
                      x={exp.x}
                      y={exp.y}
                      width={exp.width}
                      height={exp.height}
                      onComplete={() =>
                        setExplosions((prev) =>
                          prev.filter((e) => e.id !== exp.id),
                        )
                      }
                    />
                  ))}
              </GameBoard>
            </div>
          </Card>
        </div>

        {/* Fleet Status */}
        <Card className="flex flex-col gap-3 w-full max-w-4xl p-4">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">
            Sua Frota
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {myFleet.map((ship) => (
              <ShipStatusCard key={ship.type} ship={ship} />
            ))}
          </div>
        </Card>

        {/* Enemy Fleet Status */}
        <Card className="flex flex-col gap-3 w-full max-w-4xl p-4">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">
            Frota Inimiga
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {enemyFleet.map((ship) => (
              <ShipStatusCard key={ship.type} ship={ship} isEnemy />
            ))}
          </div>
        </Card>
      </LayoutPage>
    </div>
  );
}

function ShipStatusCard({ ship, isEnemy = false }) {
  const isSunk = ship.sunk || ship.status === "sunk";
  const isUnknown = ship.status === "unknown";

  let borderColor = "border-green-400/40 text-green-400";
  let label = "Intacto";
  let icon = <Ship size={16} />;

  if (isSunk) {
    borderColor = "border-red-400/40 text-red-400 opacity-50";
    label = "Afundado";
    icon = <Droplets size={16} />;
  } else if (isUnknown) {
    borderColor = "border-white/20 text-white/50";
    label = "???";
    icon = <Ship size={16} />;
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-dark-900/60 border ${borderColor}`}
    >
      <span className={borderColor}>{icon}</span>
      <div className="flex flex-col">
        <span className="font-poppins font-medium text-[11px] text-white">
          {ship.name || getShipName(ship.type)}
        </span>
        <span className={`font-poppins text-[9px] ${borderColor}`}>
          {isSunk ? "Afundado ✕" : label}
        </span>
      </div>
    </div>
  );
}

export default GamePage;
