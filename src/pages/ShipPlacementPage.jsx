import { useState, useEffect, useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useDraggable } from "@dnd-kit/react";
import { useDroppable } from "@dnd-kit/react";
import Header from "../components/layout/Header";
import LayoutPage from "../components/layout/LayoutPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  Check,
  CircleUserRound,
  Ship,
  RotateCw,
  Loader2,
  CircleCheckBig,
  Loader,
  Trash2,
  UserRoundX,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import ShipSvg from "../components/game/ShipSvg";
import GameBoard from "../components/game/GameBoard";
import { ws } from "../services/websocket";
import AlertCard from "../components/ui/AlertCard";
import ModalInfo from "../components/ui/ModalInfo";

const FLEET = [
  { type: "CARRIER", name: "Porta-aviões", size: 5 },
  { type: "BATTLESHIP", name: "Navio-tanque", size: 4 },
  { type: "CRUISER", name: "Cruzador", size: 3 },
  { type: "SUBMARINE", name: "Submarino", size: 3 },
  { type: "DESTROYER", name: "Destroyer", size: 2 },
];

const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);
const CELL_SIZE = 33;

function boardToApi(col, row) {
  return { row: COLUMNS.indexOf(col), col: row - 1 };
}

function calculatePositions(startCol, startRow, size, orientation) {
  const positions = [];
  const colIdx = COLUMNS.indexOf(startCol);

  for (let i = 0; i < size; i++) {
    if (orientation === "horizontal") {
      const newRow = startRow + i;
      if (newRow > 10) return null;
      positions.push({ col: startCol, row: newRow });
    } else {
      const newColIdx = colIdx + i;
      if (newColIdx >= 10) return null;
      positions.push({ col: COLUMNS[newColIdx], row: startRow });
    }
  }
  return positions;
}

function hasOverlap(positions, placedShips, excludeType = null) {
  const occupiedCells = new Set();
  for (const ship of placedShips) {
    if (ship.type === excludeType) continue;
    for (const pos of ship.positions) {
      occupiedCells.add(`${pos.col}${pos.row}`);
    }
  }
  return positions.some((pos) => occupiedCells.has(`${pos.col}${pos.row}`));
}

function getShipOrientation(ship) {
  if (!ship.positions || ship.positions.length < 2) return "horizontal";
  if (ship.positions[0].col !== ship.positions[1].col) return "vertical";
  return "horizontal";
}


function ShipPlacementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const subscriptionRef = useRef(null);

  const gameId = location.state?.gameId;
  const roomId = location.state?.roomId;
  const [placedShips, setPlacedShips] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "error" });
  const [opponentNickname, setOpponentNickname] = useState(location.state?.opponentNickname || "");

  // Selection state: which ship from fleet is selected to place, or which placed ship is selected
  const [selectedFleetShip, setSelectedFleetShip] = useState(null); // ship type from fleet
  const [selectedPlacedShip, setSelectedPlacedShip] = useState(null); // ship type on board
  const [placingOrientation, setPlacingOrientation] = useState("horizontal"); // orientation for placing from fleet

  useEffect(() => {
    if (!gameId) {
      navigate("/", { replace: true });
      return;
    }
    sessionStorage.setItem("gameId", gameId);

    function handleBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    ws.connect({
      onConnect: () => {
        ws.publish(`/app/game/${gameId}/register`);
        subscriptionRef.current = ws.subscribe(
          `/topic/game/${gameId}/placement`,
          handlePlacementEvent,
        );
        // Subscribe to game events for disconnect/game over
        ws.subscribe(`/topic/game/${gameId}/events`, handleGameEvent);
        // Also subscribe to room events to detect opponent leaving
        if (roomId) {
          ws.subscribe(`/topic/room/${roomId}`, handleRoomEvent);
        }
      },
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      ws.disconnect();
    };
  }, [gameId]);

  function handlePlacementEvent(event) {
    switch (event.event) {
      case "OPPONENT_READY":
        setOpponentReady(true);
        break;
      case "GAME_STARTED":
        navigate("/game/play", {
          state: {
            gameId: event.gameId,
            firstTurn: event.firstTurn,
            turnTimeout: event.turnTimeout,
            opponentNickname: location.state?.opponentNickname,
          },
          replace: true,
        });
        break;
    }
  }

  function handleRoomEvent(event) {
    if (event.event === "PLAYER_LEFT") {
      setOpponentLeft(true);
    }
  }

  function handleGameEvent(event) {
    if (event.event === "OPPONENT_DISCONNECTED" || event.event === "GAME_OVER") {
      setOpponentLeft(true);
    }
  }

  // Click on a fleet ship to select it for placing
  function handleFleetShipClick(shipType) {
    setSelectedPlacedShip(null);
    setSelectedFleetShip((prev) => (prev === shipType ? null : shipType));
  }

  // Toggle orientation while selecting from fleet
  function togglePlacingOrientation() {
    setPlacingOrientation((o) => (o === "horizontal" ? "vertical" : "horizontal"));
  }

  // Click on a board cell to place the selected fleet ship
  function handleCellClick(col, row) {
    if (!selectedFleetShip) return;

    const ship = FLEET.find((s) => s.type === selectedFleetShip);
    if (!ship) return;

    const positions = calculatePositions(col, row, ship.size, placingOrientation);
    if (!positions) {
      setAlert({ show: true, message: "Navio fora dos limites do tabuleiro", type: "error" });
      return;
    }
    if (hasOverlap(positions, placedShips, selectedFleetShip)) {
      setAlert({ show: true, message: "Posição ocupada por outro navio", type: "error" });
      return;
    }

    setPlacedShips((prev) => {
      const filtered = prev.filter((s) => s.type !== selectedFleetShip);
      return [...filtered, { type: selectedFleetShip, positions }];
    });
    setSelectedFleetShip(null);
  }

  // Click on a placed ship on the board to select it for options
  function handlePlacedShipClick(shipType) {
    setSelectedFleetShip(null);
    setSelectedPlacedShip((prev) => (prev === shipType ? null : shipType));
  }

  // Rotate selected placed ship
  function handleRotatePlacedShip() {
    if (!selectedPlacedShip) return;
    const placed = placedShips.find((s) => s.type === selectedPlacedShip);
    if (!placed) return;

    const ship = FLEET.find((s) => s.type === selectedPlacedShip);
    const currentOrient = getShipOrientation(placed);
    const newOrient = currentOrient === "horizontal" ? "vertical" : "horizontal";

    const startCol = placed.positions[0].col;
    const startRow = placed.positions[0].row;
    const newPositions = calculatePositions(startCol, startRow, ship.size, newOrient);

    if (!newPositions) {
      setAlert({ show: true, message: "Não é possível girar aqui: fora dos limites", type: "error" });
      return;
    }
    if (hasOverlap(newPositions, placedShips, selectedPlacedShip)) {
      setAlert({ show: true, message: "Não é possível girar aqui: posição ocupada", type: "error" });
      return;
    }

    setPlacedShips((prev) =>
      prev.map((s) => (s.type === selectedPlacedShip ? { ...s, positions: newPositions } : s)),
    );
  }

  // Remove placed ship back to fleet
  function removeShip(shipType) {
    setPlacedShips((prev) => prev.filter((s) => s.type !== shipType));
    setSelectedPlacedShip(null);
  }

  // Drag placed ship to reposition
  function handleDragEnd(event) {
    if (event.canceled) return;
    const { source, target } = event.operation;
    if (!target || !source) return;

    const shipType = source.id;
    const ship = FLEET.find((s) => s.type === shipType);
    if (!ship) return;

    const targetParts = target.id.split("-");
    if (targetParts[0] !== "cell") return;
    const targetCol = targetParts[1];
    const targetRow = parseInt(targetParts[2]);

    // Keep current orientation of the placed ship
    const placed = placedShips.find((s) => s.type === shipType);
    const orient = placed ? getShipOrientation(placed) : "horizontal";

    const positions = calculatePositions(targetCol, targetRow, ship.size, orient);
    if (!positions) {
      setAlert({ show: true, message: "Navio fora dos limites do tabuleiro", type: "error" });
      return;
    }
    if (hasOverlap(positions, placedShips, shipType)) {
      setAlert({ show: true, message: "Posição ocupada por outro navio", type: "error" });
      return;
    }

    setPlacedShips((prev) => {
      const filtered = prev.filter((s) => s.type !== shipType);
      return [...filtered, { type: shipType, positions }];
    });
    setSelectedPlacedShip(null);
  }

  function handleDragStart() {
    setSelectedFleetShip(null);
    setSelectedPlacedShip(null);
  }

  // Deselect everything
  function handleBackgroundClick() {
    setSelectedFleetShip(null);
    setSelectedPlacedShip(null);
  }

  async function handleSubmit() {
    if (placedShips.length !== 5) {
      setAlert({ show: true, message: "Posicione todos os 5 navios", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const ships = placedShips.map((ship) => ({
        type: ship.type,
        positions: ship.positions.map((pos) => boardToApi(pos.col, pos.row)),
      }));
      await api.post(`/games/${gameId}/ships`, { ships });
      setConfirmed(true);
    } catch (err) {
      setAlert({ show: true, message: err.message || "Erro ao posicionar navios", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  // Build cells maps
  const cellsMap = {};
  const boardCells = {};
  for (const ship of placedShips) {
    for (const pos of ship.positions) {
      cellsMap[`${pos.col}${pos.row}`] = ship.type;
      boardCells[`${pos.col}${pos.row}`] = "ship";
    }
  }

  const placedTypes = new Set(placedShips.map((s) => s.type));
  const allPlaced = placedShips.length === 5;
  const selectedPlacedData = selectedPlacedShip ? FLEET.find((s) => s.type === selectedPlacedShip) : null;
  const selectedFleetData = selectedFleetShip ? FLEET.find((s) => s.type === selectedFleetShip) : null;

  if (!gameId) return null;


  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <AlertCard show={alert.show} onClose={() => setAlert({ ...alert, show: false })} type={alert.type}>
        {alert.message}
      </AlertCard>

      {opponentLeft && (
        <ModalInfo
          icon={<UserRoundX className="w-12 h-12 text-red-400" />}
          title="Oponente saiu da partida"
          description="O oponente abandonou a batalha. A partida foi cancelada."
        >
          <Button
            variant="primary"
            className="mt-2 flex items-center justify-center gap-2"
            onClick={() => navigate("/", { replace: true })}
          >
            Voltar ao Menu
          </Button>
        </ModalInfo>
      )}

      <Header minimal />
      <LayoutPage interClassName="p-4 pb-8">
        <div className="flex flex-col items-center gap-1 w-full">
          <h2 className="font-anybody font-extrabold text-2xl md:text-3xl text-white text-center">
            Posicione seus <span className="text-orange-300">navios</span>
          </h2>
        </div>

        {/* Battle Status */}
        <Card className="flex flex-col gap-3 w-full max-w-4xl p-5">
          <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">
            Status da Batalha
          </span>
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-3 p-3 rounded-lg bg-blue-dark-900/60 border ${confirmed ? "border-green-500/30" : "border-blue-300/20"}`}>
              {confirmed ? <CircleCheckBig size={22} className="text-green-400 shrink-0" /> : <Ship size={22} className="text-blue-300 shrink-0" />}
              <div className="flex flex-col">
                <span className={`font-poppins font-semibold text-sm ${confirmed ? "text-green-400" : "text-blue-300"}`}>VOCÊ</span>
                <span className="font-poppins text-xs text-white/60">
                  {confirmed ? "Pronto! Aguardando oponente..." : `${placedShips.length}/5 navios posicionados`}
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg bg-blue-dark-900/60 border ${opponentReady ? "border-green-500/30" : "border-blue-300/20"}`}>
              {opponentReady ? <CircleCheckBig size={22} className="text-green-400 shrink-0" /> : <Loader size={22} className="text-blue-300 shrink-0 animate-spin" />}
              <div className="flex flex-col">
                <span className={`font-poppins font-semibold text-sm ${opponentReady ? "text-green-400" : "text-blue-300"}`}>OPONENTE</span>
                <span className="font-poppins text-xs text-white/60">{opponentReady ? "Pronto!" : "Posicionando..."}</span>
              </div>
            </div>
          </div>
        </Card>

        {confirmed ? (
          <Card className="flex flex-col items-center gap-6 w-full max-w-4xl p-8">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
              <Check size={36} className="text-green-400" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-anybody font-extrabold text-xl text-green-400">Navios Posicionados!</h3>
              <p className="font-poppins text-sm text-white/60 text-center">Aguardando o oponente finalizar o posicionamento...</p>
            </div>
            <div className="flex items-center gap-3">
              <Loader size={20} className="text-orange-300 animate-spin" />
              <span className="font-poppins text-sm text-orange-300">Preparando batalha...</span>
            </div>
            <div className="w-full max-w-sm opacity-70">
              <GameBoard cells={boardCells} ships={placedShips.map((s) => ({ ...s, sunk: false }))} />
            </div>
          </Card>
        ) : (


        <DragDropProvider onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
            {/* Board */}
            <Card className="flex flex-col gap-4 w-full md:flex-1 p-5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-dark-900 border-2 border-blue-300 flex items-center justify-center">
                    <CircleUserRound size={20} className="text-blue-300" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-blue-dark" />
                </div>
                <div className="flex flex-col">
                  <span className="font-poppins font-semibold text-sm text-orange-300">Você</span>
                  <span className="font-poppins text-xs text-white/50">{user?.nickname}</span>
                </div>
              </div>

              {/* Board */}
              <PlacementBoard
                cellsMap={cellsMap}
                placedShips={placedShips}
                selectedPlacedShip={selectedPlacedShip}
                onPlacedShipClick={handlePlacedShipClick}
                onCellClick={handleCellClick}
                onBackgroundClick={handleBackgroundClick}
                selectedFleetShip={selectedFleetShip}
              />

              {/* Placing orientation (visible when fleet ship selected) */}
              {selectedFleetShip && (
                <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-blue-dark-900/60 border border-orange-400/40">
                  <span className="font-poppins text-xs text-white/70">
                    Posicionando: <strong className="text-orange-300">{selectedFleetData?.name}</strong>
                  </span>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3! py-1.5! text-xs! border-blue-300/40!"
                    onClick={togglePlacingOrientation}
                  >
                    <RotateCw size={14} className="text-blue-300" />
                    {placingOrientation === "horizontal" ? "Vertical ↓" : "Horizontal →"}
                  </Button>
                  <span className="font-poppins text-[10px] text-white/40">
                    Clique numa célula para posicionar
                  </span>
                </div>
              )}

              {/* Placed ship options (visible when placed ship selected) */}
              {selectedPlacedShip && (
                <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-blue-dark-900/60 border border-orange-400/40">
                  <span className="font-poppins text-xs text-white/70 mr-2">
                    {selectedPlacedData?.name}
                  </span>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3! py-1.5! text-xs! border-blue-300/40!"
                    onClick={handleRotatePlacedShip}
                  >
                    <RotateCw size={14} className="text-blue-300" />
                    Girar
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3! py-1.5! text-xs! border-red-400/40! text-red-400!"
                    onClick={() => removeShip(selectedPlacedShip)}
                  >
                    <Trash2 size={14} />
                    Retirar
                  </Button>
                </div>
              )}

              {/* Submit */}
              <Button
                variant="primary"
                className="flex items-center justify-center gap-2 max-w-xs mx-auto"
                onClick={handleSubmit}
                disabled={!allPlaced || submitting}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {submitting ? "ENVIANDO..." : "PRONTO"}
              </Button>
            </Card>

            {/* Fleet panel */}
            <Card className="flex flex-col gap-4 w-full md:w-64 p-5">
              <span className="font-poppins font-semibold text-xs text-white/50 uppercase tracking-widest text-center">
                Frota
              </span>
              <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                {FLEET.map((ship) => (
                  <FleetShipCard
                    key={ship.type}
                    ship={ship}
                    placed={placedTypes.has(ship.type)}
                    selected={selectedFleetShip === ship.type}
                    onClick={() => handleFleetShipClick(ship.type)}
                  />
                ))}
              </div>
            </Card>
          </div>
        </DragDropProvider>
        )}
      </LayoutPage>
    </div>
  );
}


function FleetShipCard({ ship, placed, selected, onClick }) {
  return (
    <div
      onClick={placed ? undefined : onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
        placed
          ? "bg-green-500/10 border-green-400/40 opacity-60"
          : selected
            ? "bg-orange-500/20 border-orange-400 ring-2 ring-orange-400/50"
            : "bg-blue-dark-900/60 border-blue-300/20 cursor-pointer hover:border-orange-400/50"
      }`}
    >
      <Ship size={22} className={placed ? "text-green-400" : selected ? "text-orange-400" : "text-orange-300"} />
      <span className="font-poppins font-medium text-xs text-white text-center">
        {ship.name} ({ship.size})
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: ship.size }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full border ${
              placed ? "bg-green-400/70 border-green-300/50"
              : selected ? "bg-orange-400 border-orange-300"
              : "bg-orange-400/70 border-orange-300/50"
            }`}
          />
        ))}
      </div>
      {placed && <span className="font-poppins text-[10px] text-green-400 uppercase">No tabuleiro ✓</span>}
      {selected && !placed && <span className="font-poppins text-[10px] text-orange-400 uppercase">Selecionado</span>}
    </div>
  );
}

function PlacementBoard({ cellsMap, placedShips, selectedPlacedShip, onPlacedShipClick, onCellClick, onBackgroundClick, selectedFleetShip }) {
  return (
    <div className="flex flex-col items-center w-full" onClick={(e) => { e.stopPropagation(); onBackgroundClick(); }}>
      <div className="flex w-full max-w-[360px]">
        <div className="w-6" />
        <div className="flex-1 grid grid-cols-10">
          {COLUMNS.map((col) => (
            <span key={col} className="text-center font-poppins text-[10px] text-blue-300/70 font-semibold pb-1">{col}</span>
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-[360px]">
        <div className="flex flex-col">
          {ROWS.map((row) => (
            <div key={row} className="h-[33px] flex items-center justify-center w-6">
              <span className="font-poppins text-[10px] text-blue-300/70 font-semibold">{row}</span>
            </div>
          ))}
        </div>

        <div className="relative flex-1">
          <div className="grid grid-cols-10 border border-blue-300/20 rounded-md overflow-hidden">
            {ROWS.map((row) =>
              COLUMNS.map((col) => (
                <DroppableCell
                  key={`${col}${row}`}
                  col={col}
                  row={row}
                  hasShip={!!cellsMap[`${col}${row}`]}
                  isPlacing={!!selectedFleetShip}
                  onCellClick={onCellClick}
                />
              )),
            )}
          </div>

          {/* Ship SVG overlays */}
          {placedShips.map((ship) => (
            <PlacedShipOverlay
              key={ship.type}
              ship={ship}
              isSelected={selectedPlacedShip === ship.type}
              onShipClick={onPlacedShipClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DroppableCell({ col, row, hasShip, isPlacing, onCellClick }) {
  const { ref, isDropTarget } = useDroppable({ id: `cell-${col}-${row}` });

  function handleClick(e) {
    e.stopPropagation();
    if (isPlacing && !hasShip) {
      onCellClick(col, row);
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`h-[33px] border border-blue-300/10 flex items-center justify-center transition-colors ${
        isDropTarget
          ? "bg-orange-400/30 border-orange-400/50"
          : hasShip
            ? "bg-green-500/10 border-green-400/20"
            : isPlacing
              ? "bg-blue-dark-900/40 hover:bg-orange-400/20 cursor-crosshair"
              : "bg-blue-dark-900/40 hover:bg-blue-300/10"
      }`}
    />
  );
}

function PlacedShipOverlay({ ship, isSelected, onShipClick }) {
  const { ref, isDragging } = useDraggable({ id: ship.type });

  if (!ship.positions || ship.positions.length === 0) return null;

  const positions = ship.positions;
  const size = positions.length;

  let orientation = "horizontal";
  if (size > 1 && positions[0].col === positions[1].col) {
    // Same column letter, rows change = visually vertical (goes down)
    orientation = "vertical";
  }

  const colIndices = positions.map((p) => COLUMNS.indexOf(p.col));
  const rowIndices = positions.map((p) => p.row - 1);
  const minCol = Math.min(...colIndices);
  const minRow = Math.min(...rowIndices);

  const left = minCol * CELL_SIZE;
  const top = minRow * CELL_SIZE;

  function handleClick(e) {
    e.stopPropagation();
    onShipClick(ship.type);
  }

  return (
    <div
      ref={ref}
      className={`absolute cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${isSelected ? "drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]" : "hover:drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]"}`}
      style={{ left: `${left}px`, top: `${top}px` }}
      onClick={handleClick}
    >
      <ShipSvg
        size={size}
        orientation={orientation}
        color={isSelected ? "#fb923c" : "#4ade80"}
        cellSize={CELL_SIZE}
      />
    </div>
  );
}

export default ShipPlacementPage;
