import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(
  (
    {
      type = "text",
      className = "",
      placeholder = "",
      id,
      autoComplete = "off",
      error = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          className={`bg-blue-dark-900 text-white border-3 rounded-lg w-full p-2 placeholder:font-light placeholder:text-white/40 placeholder:text-sm placeholder:tracking-wide transition-all duration-200 outline-none  focus:shadow-[0_0_8px_rgba(255,120,0,0.50)] ${isPassword ? "pr-10" : ""} ${error ? "border-red-500" : "border-blue-300"} ${className}`}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          id={id}
          autoComplete={autoComplete}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-orange-300 transition-colors cursor-pointer"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        )}
      </div>
    );
  },
);

export default Input;
