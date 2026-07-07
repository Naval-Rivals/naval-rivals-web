const ABILITY_COLORS = {
  red: {
    base: "border-red-400/30 text-red-300/70",
    hover: "hover:border-red-400/60 hover:text-red-300",
    active:
      "border-red-400 text-red-300 bg-red-400/10 ring-2 ring-red-400/30 shadow-lg shadow-red-500/10",
    disabled: "border-white/10 text-white/30",
  },
  green: {
    base: "border-green-400/30 text-green-300/70",
    hover: "hover:border-green-400/60 hover:text-green-300",
    active:
      "border-green-400 text-green-300 bg-green-400/10 ring-2 ring-green-400/30 shadow-lg shadow-green-500/10",
    disabled: "border-white/10 text-white/30",
  },
  blue: {
    base: "border-blue-400/30 text-blue-300/70",
    hover: "hover:border-blue-400/60 hover:text-blue-300",
    active:
      "border-blue-400 text-blue-300 bg-blue-400/10 ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/10 animate-pulse",
    disabled: "border-white/10 text-white/30",
  },
  yellow: {
    base: "border-yellow-400/30 text-yellow-300/70",
    hover: "hover:border-yellow-400/60 hover:text-yellow-300",
    active:
      "border-yellow-400 text-yellow-300 bg-yellow-400/10 ring-2 ring-yellow-400/30 shadow-lg shadow-yellow-500/10",
    disabled: "border-white/10 text-white/30",
  },
};

function AbilityButton({
  icon,
  label,
  sublabel,
  color,
  active,
  disabled,
  onClick,
}) {
  const colors = ABILITY_COLORS[color] || ABILITY_COLORS.yellow;

  let className =
    "flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all cursor-pointer ";
  if (disabled) {
    className += colors.disabled + " opacity-50 cursor-not-allowed";
  } else if (active) {
    className += colors.active;
  } else {
    className += colors.base + " " + colors.hover;
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
    >
      {icon}
      <span className="font-poppins font-semibold text-[11px]">{label}</span>
      <span className="font-poppins text-[9px] opacity-70">{sublabel}</span>
    </button>
  );
}

export default AbilityButton;
