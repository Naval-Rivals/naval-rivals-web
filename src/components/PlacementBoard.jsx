import { useState } from "react";
import DroppableCell from "./DroppableCell";
import PlacedShipOverlay from "./PlacedShipOverlay";

function PlacementBoard({
  cellsMap,
  placedShips,
  selectedPlacedShip,
  onPlacedShipClick,
  onCellClick,
  onBackgroundClick,
  selectedFleetShip,
  placingOrientation,
  dragPreviewCells,
  FLEET,
  COLUMNS,
  ROWS,
  calculatePositions,
  hasOverlap,
}) {
  const [previewCells, setPreviewCells] = useState(null); // { cells: Set, valid: boolean }

  function handleCellHover(col, row) {
    if (!selectedFleetShip) {
      setPreviewCells(null);
      return;
    }

    const ship = FLEET.find((s) => s.type === selectedFleetShip);
    if (!ship) return;

    const positions = calculatePositions(
      col,
      row,
      ship.size,
      placingOrientation,
    );
    if (!positions) {
      // Out of bounds - show red preview for partial cells
      const partialPositions = [];
      const colIdx = COLUMNS.indexOf(col);
      for (let i = 0; i < ship.size; i++) {
        if (placingOrientation === "horizontal") {
          const newRow = row + i;
          if (newRow <= 10) partialPositions.push(`${col}${newRow}`);
        } else {
          const newColIdx = colIdx + i;
          if (newColIdx < 10)
            partialPositions.push(`${COLUMNS[newColIdx]}${row}`);
        }
      }
      setPreviewCells({ cells: new Set(partialPositions), valid: false });
      return;
    }

    const cellKeys = new Set(positions.map((p) => `${p.col}${p.row}`));
    const overlap = hasOverlap(positions, placedShips, selectedFleetShip);
    setPreviewCells({ cells: cellKeys, valid: !overlap });
  }

  function handleBoardLeave() {
    setPreviewCells(null);
  }

  // Combine hover preview and drag preview
  const activePreview = dragPreviewCells || previewCells;

  return (
    <div
      className="flex flex-col items-center w-full"
      onClick={(e) => {
        e.stopPropagation();
        onBackgroundClick();
      }}
    >
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

      <div className="flex w-full max-w-[360px]">
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

        <div className="relative flex-1" onMouseLeave={handleBoardLeave}>
          <div className="grid grid-cols-10 rounded-md overflow-hidden">
            {ROWS.map((row) =>
              COLUMNS.map((col) => {
                const cellKey = `${col}${row}`;
                const isPreview = activePreview?.cells.has(cellKey) || false;
                const isValidPreview = isPreview && activePreview?.valid;
                const isInvalidPreview = isPreview && !activePreview?.valid;

                return (
                  <DroppableCell
                    key={cellKey}
                    col={col}
                    row={row}
                    hasShip={!!cellsMap[cellKey]}
                    isPlacing={!!selectedFleetShip}
                    onCellClick={onCellClick}
                    onCellHover={handleCellHover}
                    isPreview={isValidPreview}
                    isInvalidPreview={isInvalidPreview}
                  />
                );
              }),
            )}
          </div>

          {/* Ship SVG overlays */}
          {placedShips.map((ship) => (
            <PlacedShipOverlay
              key={ship.type}
              ship={ship}
              isSelected={selectedPlacedShip === ship.type}
              onShipClick={onPlacedShipClick}
              COLUMNS={COLUMNS}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlacementBoard;
