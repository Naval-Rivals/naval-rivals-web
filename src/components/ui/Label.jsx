function Label({ children, htmlFor, className = "", required = false }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`font-poppins text-sm font-semibold text-blue-300 tracking-wide ${className}`}
    >
      {children}
      {required && <span className="text-orange-400 ml-0.5">*</span>}
    </label>
  );
}

export default Label;
