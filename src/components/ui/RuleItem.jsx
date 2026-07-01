function RuleItem({ number, title, description }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex items-center justify-center min-w-8 h-8 rounded-full bg-orange-500 text-white font-anybody font-bold text-sm">
        {number}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="font-poppins font-semibold text-sm text-white">
          {title}
        </span>
        <span className="font-poppins font-light text-sm text-white/60">
          {description}
        </span>
      </div>
    </div>
  );
}

export default RuleItem;
