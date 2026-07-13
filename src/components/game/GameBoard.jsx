import ShipSvg from "./ShipSvg";
import { Skull } from "lucide-react";

const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);

const CELL_SIZE = 33;

/**
 * Estilos das células por estado:
 * - empty: célula vazia (água)
 * - ship: célula com navio posicionado (usado quando não há ships overlay)
 * - hit: acerto em navio inimigo
 * - miss: tiro na água (erro)
 * - sunk: navio afundado
 * - radar: célula revelada por radar (navio detectado)
 */
const CELL_STYLES = {
  empty: "bg-blue-dark-900/40",
  ship: "bg-green-500/10 border-green-400/20",
  hit: "bg-orange-500/40 border-orange-400/30",
  miss: "bg-white/10 border-white/20",
  sunk: "bg-red-500/10 border-red-400/20",
  radar: "bg-green-400/20 border-green-400/30",
};

const CELL_INDICATORS = {
  empty: null,
  ship: null,
  hit: (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="4" fill="#fb923c" />
      <line x1="9" y1="1" x2="9" y2="4" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="14" x2="9" y2="17" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="9" x2="4" y2="9" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="9" x2="17" y2="9" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
      <line x1="3.5" y1="3.5" x2="5.5" y2="5.5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12.5" y1="12.5" x2="14.5" y2="14.5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14.5" y1="3.5" x2="12.5" y2="5.5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="12.5" x2="3.5" y2="14.5" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  miss: (
    <svg width="12" height="12" viewBox="0 0 12 12" className="opacity-50">
      <line x1="2" y1="2" x2="10" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="2" x2="2" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  sunk: null,
  radar: (
    <svg width="14" height="14" viewBox="0 0 14 14" className="opacity-80">
      <circle cx="7" cy="7" r="3" fill="none" stroke="#4ade80" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="1.5" fill="#4ade80" />
    </svg>
  ),
};

// Targeting animation constants
const TARGETING_STAGGER_MS = 60; // ms delay per cell distance
const TARGETING_CELL_DURATION_MS = 250; // how long each cell stays lit

/**
 * GameBoard - Tabuleiro 10x10 reutilizável para Naval Rivals
 *
 * Props:
 * - cells: objeto com chaves "A1", "B3", etc. e valores: "empty" | "ship" | "hit" | "miss" | "sunk" | "radar"
 * - ships: array de navios para renderizar SVGs. Formato:
 *   [{ type, positions: [{col: "A", row: 1}, ...], sunk: bool }]
 * - onCellClick: (col, row) => void (opcional)
 * - onCellHover: (col, row) => void (opcional) - para radar preview
 * - onCellLeave: () => void (opcional) - para limpar hover
 * - hoverCells: Set ou array de cellKeys para highlight temporário (radar preview)
 * - targetingCell: { col, row } | null - célula alvo para animação de mira convergente
 * - className: classes adicionais para o container (opcional)
 */
function GameBoard({
  cells = {},
  ships = [],
  onCellClick,
  onCellHover,
  onCellLeave,
  hoverCells,
  targetingCell,
  className = "",
  children,
}) {
  const hoverSet = hoverCells instanceof Set ? hoverCells : new Set(hoverCells || []);

  const getCellState = (col, row) => {
    return cells[`${col}${row}`] || "empty";
  };

  // Calculate targeting info for a cell
  const getTargetingInfo = (col, row) => {
    if (!targetingCell) return null;

    const targetColIdx = COLUMNS.indexOf(targetingCell.col);
    const targetRowIdx = targetingCell.row - 1;
    const colIdx = COLUMNS.indexOf(col);
    const rowIdx = row - 1;

    const isTargetCell = col === targetingCell.col && row === targetingCell.row;
    const isSameCol = col === targetingCell.col;
    const isSameRow = row === targetingCell.row;

    if (!isTargetCell && !isSameCol && !isSameRow) return null;

    // Calculate distance from target (used for stagger delay)
    let distance;
    if (isTargetCell) {
      distance = 0;
    } else if (isSameCol) {
      distance = Math.abs(rowIdx - targetRowIdx);
    } else {
      distance = Math.abs(colIdx - targetColIdx);
    }

    // Invert: furthest cells animate first (converging inward)
    const maxDistance = 9;
    const invertedDelay = (maxDistance - distance) * TARGETING_STAGGER_MS;

    return { isTargetCell, distance, delay: invertedDelay };
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* Targeting CSS keyframes */}
      {targetingCell && (
        <style>{`
          @keyframes targeting-converge {
            0% { background-color: transparent; }
            20% { background-color: rgba(239, 68, 68, 0.5); }
            60% { background-color: rgba(239, 68, 68, 0.4); }
            100% { background-color: rgba(239, 68, 68, 0); }
          }
          @keyframes targeting-center {
            0% { background-color: transparent; box-shadow: none; }
            40% { background-color: rgba(239, 68, 68, 0.6); box-shadow: 0 0 12px rgba(239, 68, 68, 0.8); }
            70% { background-color: rgba(239, 68, 68, 0.8); box-shadow: 0 0 20px rgba(239, 68, 68, 1); }
            100% { background-color: rgba(239, 68, 68, 0.6); box-shadow: 0 0 16px rgba(239, 68, 68, 0.9); }
          }
        `}</style>
      )}

      {/* Header - Letras das colunas */}
      <div className="flex w-full max-w-[360px]">
        <div className="w-6" />
        <div className="flex-1 grid grid-cols-10">
          {COLUMNS.map((col) => (
            <span
              key={col}
              className="text-center font-poppins text-[10px] text-blue-300/70 font-semibold pb-1"
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* Grid + Números das linhas */}
      <div className="flex w-full max-w-[360px]">
        {/* Números das linhas */}
        <div className="flex flex-col">
          {ROWS.map((row) => (
            <div
              key={row}
              className="h-[33px] flex items-center justify-center w-6"
            >
              <span className="font-poppins text-[10px] text-blue-300/70 font-semibold">
                {row}
              </span>
            </div>
          ))}
        </div>

        {/* Grid de células com overlay de navios */}
        <div
          className="relative flex-1"
          onMouseLeave={() => onCellLeave?.()}
        >
          {/* Cells grid */}
          <div className="grid grid-cols-10 rounded-md overflow-hidden">
            {ROWS.map((row) =>
              COLUMNS.map((col) => {
                const state = getCellState(col, row);
                const cellKey = `${col}${row}`;
                const isHovered = hoverSet.has(cellKey);
                const targeting = getTargetingInfo(col, row);

                // Build targeting style
                let targetingStyle = {};
                let targetingClass = "";
                if (targeting) {
                  if (targeting.isTargetCell) {
                    targetingStyle = {
                      animation: `targeting-center ${TARGETING_CELL_DURATION_MS + 200}ms ease-in ${targeting.delay}ms forwards`,
                    };
                    targetingClass = "z-10";
                  } else {
                    targetingStyle = {
                      animation: `targeting-converge ${TARGETING_CELL_DURATION_MS}ms ease-out ${targeting.delay}ms forwards`,
                    };
                  }
                }

                return (
                  <div
                    key={cellKey}
                    onClick={() => onCellClick?.(col, row)}
                    onMouseEnter={() => onCellHover?.(col, row)}
                    className={`h-[33px] border border-blue-300/10 flex items-center justify-center transition-colors cursor-pointer hover:bg-blue-300/10 ${CELL_STYLES[state] || CELL_STYLES.empty} ${
                      isHovered ? "bg-green-400/25! border-green-400/40!" : ""
                    } ${targetingClass}`}
                    style={targetingStyle}
                  >
                    {CELL_INDICATORS[state]}
                  </div>
                );
              }),
            )}
          </div>

          {/* Ship SVG overlays */}
          {ships.map((ship) => (
            <ShipOverlay key={`ship-${ship.type}`} ship={ship} />
          ))}

          {/* Skull overlays */}
          {ships
            .filter((ship) => ship.sunk)
            .map((ship) => (
              <SkullOverlay key={`skull-${ship.type}`} ship={ship} />
            ))}

          {/* Extra content (e.g. explosions, shot effects) */}
          {children}
        </div>
      </div>
    </div>
  );
}

function getShipBounds(ship) {
  const positions = ship.positions;
  const first = positions[0];
  const last = positions[positions.length - 1];
  const vertical = first.col === last.col;
  const cols = positions.map((p) => COLUMNS.indexOf(p.col));
  const rows = positions.map((p) => p.row - 1);
  const minCol = Math.min(...cols);
  const minRow = Math.min(...rows);
  const size = positions.length;
  return {
    vertical,
    minCol,
    minRow,
    size,
    widthPct: (vertical ? 1 : size) * 10,
    heightPct: (vertical ? size : 1) * 10,
    leftPct: minCol * 10,
    topPct: minRow * 10,
  };
}

function SkullOverlay({ ship }) {
  if (!ship.positions?.length) return null;

  const b = getShipBounds(ship);
  const leftPct = b.leftPct + b.widthPct / 2;
  const topPct = b.topPct + b.heightPct / 2;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <Skull
        size={22}
        className="text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.9)]"
      />
    </div>
  );
}

/**
 * Calcula posição e orientação do navio baseado nas posições das células.
 */
function ShipOverlay({ ship }) {
  if (!ship.positions?.length) return null;

  const { size, vertical, leftPct, topPct, widthPct, heightPct } =
    getShipBounds(ship);
  const orientation = vertical ? "vertical" : "horizontal";

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
      }}
    >
      <ShipSvg
        size={size}
        orientation={orientation}
        color={ship.sunk ? "#f87171" : "#4ade80"}
        cellSize={CELL_SIZE}
      />
    </div>
  );
}

export default GameBoard;
