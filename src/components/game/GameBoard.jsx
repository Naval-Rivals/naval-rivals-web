import ShipSvg from "./ShipSvg";

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
 */
const CELL_STYLES = {
  empty: "bg-blue-dark-900/40",
  ship: "bg-green-500/10 border-green-400/20",
  hit: "bg-orange-500/40 border-orange-400/30",
  miss: "bg-white/10 border-white/20",
  sunk: "bg-red-500/10 border-red-400/20",
};

const CELL_INDICATORS = {
  empty: null,
  ship: null, // Ship SVG handles this now
  hit: <div className="w-4 h-4 rounded-full bg-orange-400 shadow-md shadow-orange-400/50" />,
  miss: <div className="w-2 h-2 rounded-full bg-white/40" />,
  sunk: null, // Ship SVG handles this
};

/**
 * GameBoard - Tabuleiro 10x10 reutilizável para Naval Rivals
 *
 * Props:
 * - cells: objeto com chaves "A1", "B3", etc. e valores: "empty" | "ship" | "hit" | "miss" | "sunk"
 * - ships: array de navios para renderizar SVGs. Formato:
 *   [{ type, positions: [{col: "A", row: 1}, ...], sunk: bool }]
 * - onCellClick: (col, row) => void (opcional)
 * - className: classes adicionais para o container (opcional)
 */
function GameBoard({ cells = {}, ships = [], onCellClick, className = "" }) {
  const getCellState = (col, row) => {
    return cells[`${col}${row}`] || "empty";
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
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
        <div className="relative flex-1">
          {/* Cells grid */}
          <div className="grid grid-cols-10 border border-blue-300/20 rounded-md overflow-hidden">
            {ROWS.map((row) =>
              COLUMNS.map((col) => {
                const state = getCellState(col, row);
                return (
                  <div
                    key={`${col}${row}`}
                    onClick={() => onCellClick?.(col, row)}
                    className={`h-[33px] border border-blue-300/10 flex items-center justify-center transition-colors cursor-pointer hover:bg-blue-300/10 ${CELL_STYLES[state] || CELL_STYLES.empty}`}
                  >
                    {CELL_INDICATORS[state]}
                  </div>
                );
              }),
            )}
          </div>

          {/* Ship SVG overlays */}
          {ships.map((ship) => (
            <ShipOverlay key={ship.type} ship={ship} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Calcula posição e orientação do navio baseado nas posições das células.
 */
function ShipOverlay({ ship }) {
  if (!ship.positions || ship.positions.length === 0) return null;

  const positions = ship.positions;
  const size = positions.length;

  // Determine orientation by checking if columns or rows change
  const firstPos = positions[0];
  const lastPos = positions[positions.length - 1];

  let orientation = "horizontal";
  if (firstPos.col === lastPos.col) {
    // Same column means vertical (rows change)
    orientation = "vertical";
  }

  // Find top-left position
  const colIndices = positions.map((p) => COLUMNS.indexOf(p.col));
  const rowIndices = positions.map((p) => p.row - 1); // 0-indexed

  const minCol = Math.min(...colIndices);
  const minRow = Math.min(...rowIndices);

  // Calculate pixel position
  const left = minCol * CELL_SIZE;
  const top = minRow * CELL_SIZE;

  // Color based on state
  const color = ship.sunk ? "#f87171" : "#4ade80"; // red-400 : green-400

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: `${left}px`, top: `${top}px` }}
    >
      <ShipSvg
        size={size}
        orientation={orientation}
        color={color}
        cellSize={CELL_SIZE}
      />
    </div>
  );
}

export default GameBoard;
