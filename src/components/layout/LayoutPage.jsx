function LayoutPage({ children, className = "", interClassName = "" }) {
  return (
    <div
      className={`min-h-screen bg-blue-dark bg-[radial-gradient(circle_at_8%_8%,rgba(255,255,255,0.12),transparent_25%),radial-gradient(circle_at_95%_95%,rgba(255,120,0,0.18),transparent_30%)] flex flex-col items-center ${className}`}
    >
      <div
        className={`flex w-full flex-col items-center min-h-screen p-4 gap-6 max-w-250 pb-28 lg:pb-4 ${interClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

export default LayoutPage;
