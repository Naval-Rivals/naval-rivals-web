function ModeTag({ icon, label }) {
  return (
    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 font-poppins text-[10px] text-white/50">
      {icon}
      {label}
    </span>
  );
}

export default ModeTag;
