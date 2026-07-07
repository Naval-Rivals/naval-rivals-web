function HelpItem({ icon, name, desc, meta }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-white/3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col">
        <span className="font-poppins font-semibold text-[11px] text-white/80">
          {name}
        </span>
        <span className="font-poppins text-[10px] text-white/50 leading-snug">
          {desc}
        </span>
        <span className="font-poppins text-[9px] text-white/30 mt-0.5">
          {meta}
        </span>
      </div>
    </div>
  );
}

export default HelpItem;
