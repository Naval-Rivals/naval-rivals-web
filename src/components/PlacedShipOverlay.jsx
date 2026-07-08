import { useDraggable } from "@dnd-kit/react";
import ShipSvg from "./game/ShipSvg";

function PlacedShipOverlay({ ship, isSelected, onShipClick, COLUMNS }) {
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

  // Use percentage positioning (10% per cell in a 10x10 grid)
  const leftPct = minCol * 10;
  const topPct = minRow * 10;
  const widthPct = (orientation === "vertical" ? 1 : size) * 10;
  const heightPct = (orientation === "vertical" ? size : 1) * 10;

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
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
      }}
      onClick={handleClick}
    >
      <ShipSvg
        size={size}
        orientation={orientation}
        color={isSelected ? "#fb923c" : "#4ade80"}
        cellSize={33}
      />
    </div>
  );
}

export default PlacedShipOverlay;
