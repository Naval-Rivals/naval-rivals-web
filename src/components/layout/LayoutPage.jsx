function LayoutPage({ children, className = "", interClassName = "" }) {
  return (
    <div
      className={`flex-1 overflow-auto bg-blue-dark bg-[radial-gradient(circle_at_8%_8%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_95%_95%,rgba(255,120,0,0.18),transparent_30%)] flex flex-col items-center ${className}`}
    >
      <div
        className={`flex w-full flex-col items-center flex-1 gap-6 max-w-250 ${interClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

export default LayoutPage;
