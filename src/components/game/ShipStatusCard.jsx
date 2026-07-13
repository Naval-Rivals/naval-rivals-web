import { Droplets, Ship } from "lucide-react";

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

function ShipStatusCard({ ship }) {
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

export default ShipStatusCard;
