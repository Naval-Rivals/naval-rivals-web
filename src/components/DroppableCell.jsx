import { useDroppable } from "@dnd-kit/react";

function DroppableCell({
  col,
  row,
  hasShip,
  isPlacing,
  onCellClick,
  onCellHover,
  isPreview,
  isInvalidPreview,
}) {
  const { ref, isDropTarget } = useDroppable({ id: `cell-${col}-${row}` });

  function handleClick(e) {
    e.stopPropagation();
    if (isPlacing && !hasShip) {
      onCellClick(col, row);
    }
  }

  function handleMouseEnter() {
    if (isPlacing) {
      onCellHover(col, row);
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`h-[33px] border flex items-center justify-center transition-colors ${
        isDropTarget
          ? "bg-orange-400/30 border-orange-400/50"
          : isPreview
            ? "bg-orange-400/35 border-orange-400/60"
            : isInvalidPreview
              ? "bg-red-400/30 border-red-400/50"
              : hasShip
                ? "bg-green-500/10 border-green-400/20"
                : isPlacing
                  ? "bg-blue-dark-900/40 border-blue-300/10 cursor-crosshair"
                  : "bg-blue-dark-900/40 border-blue-300/10 hover:bg-blue-300/10"
      }`}
    />
  );
}

export default DroppableCell;
