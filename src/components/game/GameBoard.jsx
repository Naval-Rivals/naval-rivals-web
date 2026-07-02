const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);

/**
 * Estilos das células por estado:
 * - empty: célula vazia (água)
 * - ship: célula com navio posicionado
 * - hit: acerto em navio inimigo
 * - miss: tiro na água (erro)
 * - sunk: navio afundado
 */
const CELL_STYLES = {
  empty: "bg-blue-dark-900/40",
  ship: "bg-green-500/30 border-green-400/30",
  hit: "bg-orange-500/40 border-orange-400/30",
  miss: "bg-white/10 border-white/20",
  sunk: "bg-red-500/30 border-red-400/30",
};

const CELL_INDICATORS = {
  empty: null,
  ship: <div className="w-4 h-4 rounded-sm bg-green-400/60" />,
  hit: <div className="w-4 h-4 rounded-full bg-orange-400" />,
  miss: <div className="w-2 h-2 rounded-full bg-white/40" />,
  sunk: <div className="w-4 h-4 rounded-sm bg-red-400/80" />,
};

/**
 * GameBoard - Tabuleiro 10x10 reutilizável para Naval Rivals
 *
 * Props:
 * - cells: objeto com chaves "A1", "B3", etc. e valores: "empty" | "ship" | "hit" | "miss" | "sunk"
 * - onCellClick: (col, row) => void (opcional)
 * - className: classes adicionais para o container (opcional)
 */
function GameBoard({ cells = {}, onCellClick, className = "" }) {
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

        {/* Grid de células */}
        <div className="flex-1 grid grid-cols-10 border border-blue-300/20 rounded-md overflow-hidden">
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
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
