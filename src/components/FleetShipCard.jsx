import { Ship, Trash2 } from "lucide-react";

function FleetShipCard({ ship, placed, selected, onClick, onRemove }) {
  return (
    <div
      onClick={placed ? undefined : onClick}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
        placed
          ? "bg-green-500/10 border-green-400/40"
          : selected
            ? "bg-orange-500/20 border-orange-400 ring-2 ring-orange-400/50"
            : "bg-blue-dark-900/60 border-blue-300/20 cursor-pointer hover:border-orange-400/50"
      }`}
    >
      {/* Trash button to remove ship from board */}
      {placed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(ship.type);
          }}
          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-500/10 border border-red-400/30 text-red-400 hover:bg-red-500/30 hover:border-red-400/60 transition-all"
          title={`Remover ${ship.name} do tabuleiro`}
        >
          <Trash2 size={12} />
        </button>
      )}
      <Ship
        size={22}
        className={
          placed
            ? "text-green-400"
            : selected
              ? "text-orange-400"
              : "text-orange-300"
        }
      />
      <span className="font-poppins font-medium text-xs text-white text-center">
        {ship.name} ({ship.size})
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: ship.size }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full border ${
              placed
                ? "bg-green-400/70 border-green-300/50"
                : selected
                  ? "bg-orange-400 border-orange-300"
                  : "bg-orange-400/70 border-orange-300/50"
            }`}
          />
        ))}
      </div>
      {placed && (
        <span className="font-poppins text-[10px] text-green-400 uppercase">
          No tabuleiro ✓
        </span>
      )}
      {selected && !placed && (
        <span className="font-poppins text-[10px] text-orange-400 uppercase">
          Selecionado
        </span>
      )}
    </div>
  );
}

export default FleetShipCard;
