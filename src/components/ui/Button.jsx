function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white border-orange-400",
    secondary:
      "bg-transparent hover:bg-white/10 text-orange-300 border-orange-300",
    ghost: "bg-transparent hover:bg-white/10 text-white border-transparent",
    danger: "bg-transparent hover:bg-white/10 text-red-500",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`font-poppins font-semibold text-sm tracking-wide rounded-lg border-2 px-6 py-2.5 w-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
