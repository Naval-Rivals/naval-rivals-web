import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import ModalInfo from "../components/ui/ModalInfo";
import GameBoard from "../components/game/GameBoard";
import ExplosionEffect from "../components/game/ExplosionEffect";
import {
  CircleUserRound,
  Clock,
  Ship,
  Flame,
  Droplets,
  Loader2,
  Wifi,
  WifiOff,
  Rocket,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { ws } from "../services/websocket";

// Convert API position {row, col} to board cell notation
// API row 0-9 = letters A-J, API col 0-9 = numbers 1-10
const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function apiToCell(row, col) {
  return `${COLUMNS[row]}${col + 1}`;
}

// Convert cell notation "A1" to {col: "A", row: 1} for GameBoard
function parseCellNotation(cell) {
  const letter = cell.charAt(0);
  const number = parseInt(cell.substring(1));
  return { col: letter, row: number };
}

// Convert GameBoard click (col letter, row number) to cell notation for API
function boardClickToCell(col, row) {
  return `${col}${row}`;
}

function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const subscriptionRef = useRef(null);
  const timerRef = useRef(null);

  const gameId = location.state?.gameId || sessionStorage.getItem("gameId");
  const initialFirstTurn = location.state?.firstTurn;

  const [loading, setLoading] = useState(true);
  const [myBoard, setMyBoard] = useState({});
  const [enemyBoard, setEnemyBoard] = useState({});
  const [currentTurn, setCurrentTurn] = useState(initialFirstTurn);
  const [timeLeft, setTimeLeft] = useState(60);
  const [myFleet, setMyFleet] = useState([]);
  const [myShips, setMyShips] = useState([]);
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

  const isMyTurn = currentTurn === user?.id;

  // Fetch game state and connect WebSocket
  useEffect(() => {
    if (!gameId) {
      navigate("/", { replace: true });
      return;
    }

    sessionStorage.setItem("gameId", gameId);
    if (location.state?.opponentNickname) {
      sessionStorage.setItem(
        "opponentNickname",
        location.state.opponentNickname,
      );
    }

    // Warn user before leaving during active game
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

  function buildBoardFromState(state) {
    // Build my board: ships + shots received
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

    // Override with shots received
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

    // Set torpedo availability
    if (state.torpedoAvailable !== undefined) {
      setTorpedoAvailable(state.torpedoAvailable);
    }

    // Build enemy board: shots made
    const enemyCells = {};
    for (const shot of state.myShotsMade || []) {
      const cellKey = apiToCell(shot.position.row, shot.position.col);
      enemyCells[cellKey] = shot.hit ? "hit" : "miss";
    }
    setEnemyBoard(enemyCells);

    // Initialize enemy fleet as unknown
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

    switch (event.event) {
      case "ATTACK_RESULT":
        handleAttackResult(payload);
        break;
      case "TURN_CHANGE":
        // Auto-switch tab on mobile when turn changes to a different player
        if (payload.nextTurn !== currentTurn) {
          if (payload.nextTurn === user?.id) {
            setActiveTab("enemy"); // My turn: show enemy board to attack
          } else {
            setActiveTab("my"); // Opponent's turn: show my board to watch
          }
        }
        setCurrentTurn(payload.nextTurn);
        setTimeLeft(payload.turnTimeout || 60);
        setAttackingCell(null);
        setTorpedoMode(false);
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
      default:
        break;
    }
  }

  function handleAttackResult(payload) {
    const { attackerId, cell, hit } = payload;
    const { col, row } = parseCellNotation(cell);
    const cellKey = `${col}${row}`;

    if (attackerId === user?.id) {
      // My attack on enemy board - don't overwrite "sunk" cells
      setEnemyBoard((prev) => {
        if (prev[cellKey] === "sunk") return prev;
        return { ...prev, [cellKey]: hit ? "hit" : "miss" };
      });
    } else {
      // Enemy attack on my board - don't overwrite "sunk" cells
      setMyBoard((prev) => {
        if (prev[cellKey] === "sunk") return prev;
        return { ...prev, [cellKey]: hit ? "hit" : "miss" };
      });
    }
  }

  function handleShipSunk(payload) {
    const { ownerId, shipType, positions } = payload;

    // Trigger explosion animation positioned over the sunk ship
    const parsedPositions = positions.map((cellNotation) => parseCellNotation(cellNotation));
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
      // My ship was sunk
      setMyFleet((prev) =>
        prev.map((s) => (s.type === shipType ? { ...s, sunk: true } : s)),
      );
      setMyShips((prev) =>
        prev.map((s) => (s.type === shipType ? { ...s, sunk: true } : s)),
      );
      // Mark cells as sunk on my board (all at once)
      const sunkCells = {};
      for (const cellNotation of positions) {
        const { col, row } = parseCellNotation(cellNotation);
        sunkCells[`${col}${row}`] = "sunk";
      }
      setMyBoard((prev) => ({ ...prev, ...sunkCells }));
    } else {
      // Enemy ship was sunk
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
      // Mark cells as sunk on enemy board
      // Mark cells as sunk on enemy board (all at once)
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
    // Disconnect WebSocket immediately to prevent reconnect attempts
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

  function handleCellClick(col, row) {
    if (!isMyTurn || attackingCell) return;

    const cellKey = `${col}${row}`;
    // Don't attack cells already attacked
    if (enemyBoard[cellKey]) return;

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

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header minimal />
        <LayoutPage interClassName="p-4 justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            <p className="font-poppins text-white/70">Carregando batalha...</p>
          </div>
        </LayoutPage>
      </div>
    );
  }

  const timerFormatted = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
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
            Batalha
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
              <span className="font-poppins text-[10px] text-white/40">
                Você
              </span>
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
              <span className="font-poppins text-[10px] text-white/40">
                Oponente
              </span>
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
            <span
              className={`font-poppins font-semibold text-sm ${
                isMyTurn ? "text-orange-300" : "text-blue-300/70"
              }`}
            >
              {isMyTurn ? "SUA VEZ DE ATACAR!" : "VEZ DO OPONENTE..."}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-dark-900 border border-blue-300/30">
            <Clock size={14} className="text-blue-300" />
            <span
              className={`font-anybody font-bold text-lg ${
                timeLeft <= 10 ? "text-red-400" : "text-white"
              }`}
            >
              {timerFormatted}
            </span>
          </div>
        </Card>

        {/* Torpedo button */}
        {isMyTurn && (
          <div className="flex items-center justify-center w-full max-w-4xl">
            <button
              onClick={() => torpedoAvailable && setTorpedoMode((m) => !m)}
              disabled={!torpedoAvailable}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-poppins font-semibold text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                torpedoMode
                  ? "bg-red-500/20 border-red-400 text-red-300 ring-2 ring-red-400/50 shadow-lg shadow-red-500/20"
                  : "bg-blue-dark-900/60 border-blue-300/30 text-white/70 hover:border-orange-400/50 hover:text-white"
              }`}
            >
              {/* <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <ellipse cx="10" cy="10" rx="3" ry="2" fill="currentColor" opacity="0.6" />
                <rect x="2" y="9" width="8" height="2" rx="1" fill="currentColor" opacity="0.8" />
                <polygon points="13,8 18,10 13,12" fill="currentColor" opacity="0.9" />
                <line x1="1" y1="8" x2="3" y2="10" stroke="currentColor" strokeWidth="1.2" />
                <line x1="1" y1="12" x2="3" y2="10" stroke="currentColor" strokeWidth="1.2" />
              </svg> */}
              <Rocket size={22} />
              {torpedoMode
                ? "TORPEDO ATIVO!"
                : torpedoAvailable
                  ? "USAR TORPEDO"
                  : "TORPEDO USADO"}
            </button>
            {torpedoMode && (
              <span className="ml-3 font-poppins text-xs text-red-300 animate-pulse">
                Clique numa célula para disparar o torpedo
              </span>
            )}
          </div>
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
                {explosions.filter((e) => e.board === "my").map((exp) => (
                  <ExplosionEffect
                    key={exp.id}
                    x={exp.x}
                    y={exp.y}
                    width={exp.width}
                    height={exp.height}
                    onComplete={() => setExplosions((prev) => prev.filter((e) => e.id !== exp.id))}
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
              >
                {explosions.filter((e) => e.board === "enemy").map((exp) => (
                  <ExplosionEffect
                    key={exp.id}
                    x={exp.x}
                    y={exp.y}
                    width={exp.width}
                    height={exp.height}
                    onComplete={() => setExplosions((prev) => prev.filter((e) => e.id !== exp.id))}
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

export default GamePage;
