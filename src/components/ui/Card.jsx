function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-blue-dark rounded-2xl border-2 border-white/50 p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
