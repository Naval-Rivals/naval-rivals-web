function SectionTitle({ children, className = "" }) {
  return (
    <h2
      className={`font-anybody font-extrabold text-lg tracking-wide text-orange-300 uppercase ${className}`}
    >
      {children}
    </h2>
  );
}

export default SectionTitle;
