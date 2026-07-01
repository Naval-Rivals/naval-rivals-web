function InfoCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-dark-900 border border-blue-300/30 flex-1 min-w-40">
      <span className="text-orange-300">{icon}</span>
      <span className="font-poppins font-semibold text-sm text-white text-center">
        {title}
      </span>
      <span className="font-poppins font-light text-xs text-white/60 text-center">
        {description}
      </span>
    </div>
  );
}

export default InfoCard;
